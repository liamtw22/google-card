// src/GoogleCard.js
import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { DEFAULT_CONFIG } from './constants';
import { sharedStyles } from './styles/SharedStyles';
import './components/BackgroundRotator';
import './components/Controls';
import './components/NightMode';
import './components/WeatherClock';

export class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      showDebugInfo: { type: Boolean },
      showOverlay: { type: Boolean },
      isOverlayVisible: { type: Boolean },
      isOverlayTransitioning: { type: Boolean },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      isBrightnessCardVisible: { type: Boolean },
      isBrightnessCardTransitioning: { type: Boolean },
      isNightMode: { type: Boolean },
      currentTime: { type: String },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number },
      touchStartY: { type: Number },
      touchStartTime: { type: Number },
      touchStartX: { type: Number },
      debugTouchInfo: { type: Object },
      brightnessUpdateQueue: { type: Array },
      isProcessingBrightnessUpdate: { type: Boolean },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        .touch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          touch-action: none;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .debug-info {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 12px;
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
          z-index: 9999;
        }

        .debug-info h2 {
          margin-top: 0;
          color: #fff;
        }

        .debug-info pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .swipe-debug-overlay {
          position: fixed;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 12px;
          z-index: 9999;
          pointer-events: none;
        }
      `
    ];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.brightnessUpdateQueue = [];
    this.isProcessingBrightnessUpdate = false;
  }

  initializeProperties() {
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.isOverlayVisible = false;
    this.isOverlayTransitioning = false;
    this.isNightMode = false;
    this.showBrightnessCard = false;
    this.isBrightnessCardVisible = false;
    this.isBrightnessCardTransitioning = false;
    this.brightness = DEFAULT_CONFIG.brightness || 128;
    this.visualBrightness = this.brightness;
    this.previousBrightness = this.brightness;
    this.isInNightMode = false;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchStartTime = 0;
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.brightnessStabilizeTimer = null;
    this.timeUpdateInterval = null;
    this.debugTouchInfo = {
      touchStartY: 0,
      currentY: 0,
      deltaY: 0,
      lastSwipeDirection: 'none',
      swipeCount: 0,
    };

    this.updateScreenSize();
    this.updateTime();
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error('You need to define an image_url');
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      sensor_update_delay: config.sensor_update_delay || DEFAULT_CONFIG.sensor_update_delay
    };

    this.showDebugInfo = this.config.show_debug;
    
    // Set CSS variables based on config
    this.updateCssVariables();
  }
  
  updateCssVariables() {
    if (!this.config) return;
    
    // Set crossfade time variable for background transitions
    this.style.setProperty('--crossfade-time', `${this.config.crossfade_time || 3}s`);
    
    // Any other global CSS variables can be set here
  }

  connectedCallback() {
    super.connectedCallback();
    this.startTimeUpdates();
    // Delay initial night mode check to ensure hass is available
    setTimeout(() => this.updateNightMode(), 1000);
    window.addEventListener('resize', this.boundUpdateScreenSize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    
    const touchContainer = this.shadowRoot?.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.removeEventListener('touchstart', this.handleTouchStart);
      touchContainer.removeEventListener('touchmove', this.handleTouchMove);
      touchContainer.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  firstUpdated() {
    super.firstUpdated();
    
    const touchContainer = this.shadowRoot.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      touchContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      touchContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }

  startTimeUpdates() {
    this.updateTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/\s?[AP]M/, '');
  }

  handleTouchStart(event) {
    if (event.touches.length === 1) {
      this.touchStartY = event.touches[0].clientY;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartTime = Date.now();
      this.debugTouchInfo = {
        ...this.debugTouchInfo,
        touchStartY: this.touchStartY,
        currentY: this.touchStartY,
        deltaY: 0,
      };
      this.requestUpdate();
    }
  }

  handleTouchMove(event) {
    if (event.touches.length === 1) {
      const currentY = event.touches[0].clientY;
      const deltaY = this.touchStartY - currentY;
      this.debugTouchInfo = {
        ...this.debugTouchInfo,
        currentY,
        deltaY,
      };
      
      // Prevent default scroll behavior only when showing UI overlays
      if (this.showBrightnessCard || this.showOverlay) {
        event.preventDefault();
      }
      
      this.requestUpdate();
    }
  }

  handleTouchEnd(event) {
    if (event.changedTouches.length === 1) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY;
      const deltaX = this.touchStartX - event.changedTouches[0].clientX;
      const deltaTime = Date.now() - this.touchStartTime;
      const velocity = Math.abs(deltaY) / deltaTime;
      
      // Ensure we're detecting a vertical swipe, not a horizontal one
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && velocity > 0.2) {
        this.debugTouchInfo = {
          ...this.debugTouchInfo,
          lastSwipeDirection: deltaY > 0 ? 'up' : 'down',
          swipeCount: this.debugTouchInfo.swipeCount + 1,
          deltaY,
        };

        if (deltaY > 0 && !this.showBrightnessCard && !this.showOverlay) {
          // Swipe up - show overlay
          this.handleOverlayToggle(true);
        } else if (deltaY < 0) {
          if (this.showBrightnessCard) {
            this.dismissBrightnessCard();
          } else if (this.showOverlay) {
            this.dismissOverlay();
          }
        }
      }
      
      this.requestUpdate();
    }
  }

  handleOverlayToggle(shouldShow = true) {
    if (shouldShow && !this.showOverlay) {
      this.showOverlay = true;
      this.isOverlayTransitioning = true;
      
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isOverlayVisible = true;
          this.startOverlayDismissTimer();
          this.requestUpdate();

          setTimeout(() => {
            this.isOverlayTransitioning = false;
            this.requestUpdate();
          }, 300);
        });
      });
    } else if (!shouldShow && this.showOverlay) {
      this.dismissOverlay();
    }
  }

  startOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, 10000);
  }

  startBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, 10000);
  }

  dismissOverlay() {
    if (this.isOverlayTransitioning) return;
    
    this.isOverlayTransitioning = true;
    this.isOverlayVisible = false;
    
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }

    requestAnimationFrame(() => {
      this.requestUpdate();
      setTimeout(() => {
        this.showOverlay = false;
        this.isOverlayTransitioning = false;
        this.requestUpdate();
      }, 300);
    });
  }

  dismissBrightnessCard() {
    if (this.isBrightnessCardTransitioning) return;
    
    this.isBrightnessCardTransitioning = true;
    this.isBrightnessCardVisible = false;
    
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }

    requestAnimationFrame(() => {
      this.requestUpdate();
      setTimeout(() => {
        this.showBrightnessCard = false;
        this.isBrightnessCardTransitioning = false;
        this.requestUpdate();
      }, 300);
    });
  }

  // Implement a queue-based approach to prevent rapid brightness updates
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));
    
    // Add to update queue
    this.brightnessUpdateQueue.push(value);
    
    // Start processing if not already in progress
    if (!this.isProcessingBrightnessUpdate) {
      this.processBrightnessUpdateQueue();
    }
    
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }
    
    this.brightnessStabilizeTimer = setTimeout(() => {
      this.isAdjustingBrightness = false;
      this.requestUpdate();
    }, 2000);
  }

  async processBrightnessUpdateQueue() {
    if (this.brightnessUpdateQueue.length === 0) {
      this.isProcessingBrightnessUpdate = false;
      return;
    }
    
    this.isProcessingBrightnessUpdate = true;
    
    // Take the last value in the queue to skip intermediate values
    const lastValue = this.brightnessUpdateQueue[this.brightnessUpdateQueue.length - 1];
    this.brightnessUpdateQueue = [];
    
    try {
      await this.setBrightness(lastValue);
      this.lastBrightnessUpdateTime = Date.now();
    } catch (error) {
      console.error('Error updating brightness:', error);
      this.visualBrightness = this.brightness;
    }
    
    // Process remaining updates after a short delay to prevent rapid updates
    setTimeout(() => this.processBrightnessUpdateQueue(), 250);
  }

  async setBrightness(value) {
    if (!this.hass) return;
    
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: brightness
        }
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });

      await new Promise(resolve => setTimeout(resolve, this.config.sensor_update_delay));
      
      this.brightness = brightness;
      if (!this.isNightMode) {
        this.previousBrightness = brightness;
      }
    } catch (error) {
      console.error('Error setting brightness:', error);
      throw error;
    }
  }

  async handleNightModeTransition(newNightMode) {
    if (newNightMode === this.isInNightMode) return;
    
    try {
      if (newNightMode) {
        await this.enterNightMode();
      } else {
        await this.exitNightMode();
      }
      
      this.isInNightMode = newNightMode;
      this.isNightMode = newNightMode;
      this.requestUpdate();
    } catch (error) {
      console.error('Error during night mode transition:', error);
      // Restore previous state on error
      this.isInNightMode = !newNightMode;
      this.isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  async enterNightMode() {
    this.previousBrightness = this.brightness;
    try {
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.setBrightness(1);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.toggleAutoBrightness(true);
    } catch (error) {
      console.error('Error entering night mode:', error);
      throw error;
    }
  }

  async exitNightMode() {
    try {
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.setBrightness(this.previousBrightness || 128);
    } catch (error) {
      console.error('Error exiting night mode:', error);
      throw error;
    }
  }

  async toggleAutoBrightness(enabled) {
    if (!this.hass) return;
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_auto_screen_brightness',
        data: {
          command: enabled ? 'turn_on' : 'turn_off'
        }
      });
    } catch (error) {
      console.error('Error toggling auto brightness:', error);
      throw error;
    }
  }

  handleBrightnessCardToggle = (event) => {
    const shouldShow = event.detail;
    
    if (shouldShow && !this.showBrightnessCard) {
      // Hide overlay first if showing
      if (this.showOverlay) {
        this.isOverlayVisible = false;
        this.showOverlay = false;
        this.isOverlayTransitioning = false;
        
        if (this.overlayDismissTimer) {
          clearTimeout(this.overlayDismissTimer);
        }
      }

      // Then show brightness card
      this.showBrightnessCard = true;
      this.isBrightnessCardTransitioning = true;
      
      requestAnimationFrame(() => {
        this.isBrightnessCardVisible = true;
        this.startBrightnessCardDismissTimer();
        this.requestUpdate();
        
        setTimeout(() => {
          this.isBrightnessCardTransitioning = false;
          this.requestUpdate();
        }, 300);
      });
    } else if (!shouldShow && this.showBrightnessCard) {
      this.dismissBrightnessCard();
    }
  }

  handleBrightnessChange = async (event) => {
    await this.updateBrightnessValue(event.detail);
    // Reset dismiss timer when user interacts with brightness
    this.startBrightnessCardDismissTimer();
  }

  handleDebugToggle = () => {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleNightModeExit = () => {
    this.isNightMode = false;
    this.requestUpdate();
  }

  updateNightMode() {
    if (!this.hass) return;
    
    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    if (!lightSensor) {
      console.warn('Light sensor not found: sensor.liam_room_display_light_sensor');
      return;
    }

    const sensorState = lightSensor.state;
    if (sensorState === 'unavailable' || sensorState === 'unknown') {
      console.warn('Light sensor state is unavailable or unknown');
      return;
    }

    const shouldBeInNightMode = parseInt(sensorState) === 0;
    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode);
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
      }
    }
  }

  renderSwipeDebugOverlay() {
    if (!this.showDebugInfo) return '';

    return html`
      <div class="swipe-debug-overlay">
        <div>Start Y: ${this.debugTouchInfo.touchStartY.toFixed(1)}</div>
        <div>Current Y: ${this.debugTouchInfo.currentY.toFixed(1)}</div>
        <div>Delta Y: ${this.debugTouchInfo.deltaY.toFixed(1)}</div>
        <div>Last Swipe: ${this.debugTouchInfo.lastSwipeDirection}</div>
        <div>Swipe Count: ${this.debugTouchInfo.swipeCount}</div>
        <div>Overlay Shown: ${this.showOverlay}</div>
        <div>Overlay Visible: ${this.isOverlayVisible}</div>
        <div>Overlay Transitioning: ${this.isOverlayTransitioning}</div>
        <div>Brightness Card Shown: ${this.showBrightnessCard}</div>
        <div>Brightness Card Visible: ${this.isBrightnessCardVisible}</div>
        <div>Brightness Card Transitioning: ${this.isBrightnessCardTransitioning}</div>
      </div>
    `;
  }

  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Show Overlay:</strong> ${this.showOverlay}</p>
        <p><strong>Overlay Visible:</strong> ${this.isOverlayVisible}</p>
        <p><strong>Overlay Transitioning:</strong> ${this.isOverlayTransitioning}</p>
        <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard}</p>
        <p><strong>Brightness Card Visible:</strong> ${this.isBrightnessCardVisible}</p>
        <p><strong>Brightness Card Transitioning:</strong> ${this.isBrightnessCardTransitioning}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
        <h3>Touch Info:</h3>
        <pre>${JSON.stringify(this.debugTouchInfo, null, 2)}</pre>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }

  render() {
    const mainContent = this.isNightMode ? html`
      <night-mode 
        .currentTime=${this.currentTime}
        .hass=${this.hass}
        .brightness=${this.brightness}
        .previousBrightness=${this.previousBrightness}
        .isInNightMode=${this.isInNightMode}
        @nightModeExit=${this.handleNightModeExit}
      ></night-mode>
    ` : html`
      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
        .showDebugInfo=${this.showDebugInfo}
      ></background-rotator>

      <weather-clock 
        .hass=${this.hass}
      ></weather-clock>

      <google-controls
        .hass=${this.hass}
        .showOverlay=${this.showOverlay}
        .isOverlayVisible=${this.isOverlayVisible}
        .isOverlayTransitioning=${this.isOverlayTransitioning}
        .showBrightnessCard=${this.showBrightnessCard}
        .isBrightnessCardVisible=${this.isBrightnessCardVisible}
        .isBrightnessCardTransitioning=${this.isBrightnessCardTransitioning}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
        @overlayToggle=${this.handleOverlayToggle}
        @brightnessCardToggle=${this.handleBrightnessCardToggle}
        @brightnessChange=${this.handleBrightnessChange}
        @debugToggle=${this.handleDebugToggle}
      ></google-controls>
    `;

    return html`
      <!-- Import all required fonts -->
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap" rel="stylesheet">
      
      <!-- Fallback font style for Product Sans -->
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src: local('Product Sans'), local('Product Sans Regular'), local('ProductSans-Regular'), url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2) format('woff2');
          font-weight: 400;
          font-style: normal;
        }
      </style>
      
      <div class="touch-container">
        <div class="content-wrapper">
          ${mainContent}
          ${this.renderSwipeDebugOverlay()}
          ${this.showDebugInfo ? this.renderDebugInfo() : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('google-card', GoogleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: 'A Google Nest Hub-inspired card for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/liamtw22/google-card',
});
