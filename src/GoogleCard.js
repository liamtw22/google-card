// src/GoogleCard.js
import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { DEFAULT_CONFIG, MIN_BRIGHTNESS } from './constants';
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
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 20px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80%;
          overflow: auto;
          z-index: 9999;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .debug-info h2 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #fff;
          text-align: center;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }
        
        .debug-info h3 {
          margin-top: 15px;
          margin-bottom: 10px;
          color: #76d275;
          border-bottom: 1px dotted #444;
          padding-bottom: 5px;
        }
        
        .debug-info h4 {
          margin-top: 15px;
          margin-bottom: 5px;
          color: #80deea;
        }

        .debug-info p {
          margin: 5px 0;
          line-height: 1.3;
        }

        .debug-info button {
          background: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 5px;
          padding: 5px 10px;
          margin: 0 2px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          transition: background 0.2s;
        }
        
        .debug-info button:hover {
          background: #444;
        }
        
        .debug-info button:active {
          background: #222;
        }

        .debug-info pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          background: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 5px;
          font-size: 11px;
          margin: 5px 0;
        }
        
        .debug-info ul {
          margin: 5px 0;
          padding-left: 20px;
        }
        
        .debug-info li {
          margin: 3px 0;
        }
        
        /* Style for strong tags */
        .debug-info strong {
          color: #ffab40;
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
    this.debugActiveTab = 'main'; // For the tabbed debug view
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
    this.nightModeSource = null; // Can be 'sensor' or 'manual'
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
      const velocityY = Math.abs(deltaY) / deltaTime;
      const velocityX = Math.abs(deltaX) / deltaTime;
      
      this.debugTouchInfo = {
        ...this.debugTouchInfo,
        deltaY,
        deltaX,
        velocityY: velocityY.toFixed(2),
        velocityX: velocityX.toFixed(2),
        screenWidth: window.innerWidth,
        touchStartX: this.touchStartX,
        swipeCount: this.debugTouchInfo.swipeCount + 1,
      };
      
      // If in manually activated night mode, any touch/tap should exit night mode
      if (this.isNightMode && this.nightModeSource === 'manual') {
        // Only minor movements should count as taps, not full swipes
        if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) {
          this.debugTouchInfo.lastSwipeDirection = 'tap';
          this.handleNightModeTransition(false);
          return;
        }
      }
      
      // Check for horizontal swipe from left to right (for night mode toggle)
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > 50 && 
          velocityX > 0.2 && 
          this.touchStartX < window.innerWidth * 0.2 && // Started from the left edge (20% of screen)
          deltaX < 0) { // Left to right swipe (negative deltaX)
        
        this.debugTouchInfo.lastSwipeDirection = 'right-edge';
        
        // Toggle night mode with manual source
        if (!this.isNightMode) {
          this.handleNightModeTransition(true, 'manual');
        }
      }
      // Check for vertical swipe
      else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && velocityY > 0.2) {
        this.debugTouchInfo.lastSwipeDirection = deltaY > 0 ? 'up' : 'down';

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
      // Error handling without console log
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
      // Error handling without console log
      throw error;
    }
  }

  async handleNightModeTransition(newNightMode, source = 'sensor') {
    if (newNightMode === this.isInNightMode && this.nightModeSource === source) return;
    
    // Log for debugging removed for linting
    
    try {
      if (newNightMode) {
        await this.enterNightMode();
        this.nightModeSource = source;
      } else {
        await this.exitNightMode();
        this.nightModeSource = null;
      }
      
      this.isInNightMode = newNightMode;
      this.isNightMode = newNightMode;
      
      // Update the night-mode component if it exists
      const nightModeComponent = this.shadowRoot.querySelector('night-mode');
      if (nightModeComponent) {
        nightModeComponent.isInNightMode = newNightMode;
        nightModeComponent.previousBrightness = this.previousBrightness;
        nightModeComponent.nightModeSource = this.nightModeSource;
      }
      
      this.requestUpdate();
    } catch (error) {
      // Log error but remove console statement for linting
      // Restore previous state on error
      this.isInNightMode = !newNightMode;
      this.isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  async enterNightMode() {
    // Save current brightness, but only if it's not already saved and reasonable
    if (!this.isInNightMode && this.brightness > MIN_BRIGHTNESS) {
      this.previousBrightness = this.brightness;
      // Console log removed for linting
    }
    
    try {
      // Disable auto brightness first
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Set to minimum brightness
      await this.setBrightness(MIN_BRIGHTNESS);
      
      // Don't re-enable auto brightness, keep it disabled while in night mode
      // This helps prevent flickering or auto-adjustments during night mode
    } catch (error) {
      // Console log removed for linting
      throw error;
    }
  }

  async exitNightMode() {
    try {
      // Ensure auto-brightness is disabled
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Restore previous brightness or use a reasonable default
      const restoreBrightness = (this.previousBrightness && this.previousBrightness > MIN_BRIGHTNESS) 
        ? this.previousBrightness 
        : 128;
      
      // Console log removed for linting
      await this.setBrightness(restoreBrightness);
      
      // Re-enable auto brightness after restoring brightness
      await new Promise(resolve => setTimeout(resolve, 200));
      await this.toggleAutoBrightness(true);
    } catch (error) {
      // Console log removed for linting
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
      // Error handling without console log
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
      // Console log warning removed for linting
      return;
    }

    const sensorState = lightSensor.state;
    if (sensorState === 'unavailable' || sensorState === 'unknown') {
      // Console log warning removed for linting
      return;
    }

    const shouldBeInNightMode = parseInt(sensorState) === 0;
    
    // If night mode was manually activated, don't let sensor readings deactivate it
    if (this.isInNightMode && this.nightModeSource === 'manual') {
      // Keep night mode on regardless of sensor
      return;
    }
    
    // Otherwise, follow sensor readings for automatic night mode
    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode, 'sensor');
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

  renderDebugInfo() {
    if (!this.showDebugInfo) return '';
    
    // Get background rotator and weather data without storing in unused variables
    const backgroundRotator = this.shadowRoot.querySelector('background-rotator');
    const weatherClock = this.shadowRoot.querySelector('weather-clock');
    
    return html`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
        <div style="display: flex; justify-content: space-between;">
          <button @click="${() => this.handleDebugTabClick('main')}">Main</button>
          <button @click="${() => this.handleDebugTabClick('touch')}">Touch</button>
          <button @click="${() => this.handleDebugTabClick('background')}">Background</button>
          <button @click="${() => this.handleDebugTabClick('weather')}">Weather</button>
          <button @click="${() => this.handleDebugTabClick('config')}">Config</button>
        </div>
        <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">
          ${this.renderDebugTab()}
        </div>
      </div>
    `;
  }
  
  handleDebugTabClick(tab) {
    this.debugActiveTab = tab;
    this.requestUpdate();
  }
  
  renderDebugTab() {
    if (!this.debugActiveTab) {
      this.debugActiveTab = 'main';
    }
    
    switch (this.debugActiveTab) {
      case 'main':
        return this.renderMainDebugInfo();
      case 'touch':
        return this.renderTouchDebugInfo();
      case 'background':
        return this.renderBackgroundDebugInfo();
      case 'weather':
        return this.renderWeatherDebugInfo();
      case 'config':
        return this.renderConfigDebugInfo();
      default:
        return this.renderMainDebugInfo();
    }
  }
  
  renderMainDebugInfo() {
    return html`
      <h3>Main Information</h3>
      <p><strong>Screen Width:</strong> ${this.screenWidth}px</p>
      <p><strong>Screen Height:</strong> ${this.screenHeight}px</p>
      <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio}</p>
      
      <h4>Night Mode:</h4>
      <p><strong>Night Mode:</strong> ${this.isNightMode ? 'Active' : 'Inactive'}</p>
      <p><strong>Is In Night Mode:</strong> ${this.isInNightMode ? 'Yes' : 'No'}</p>
      <p><strong>Night Mode Source:</strong> ${this.nightModeSource || 'None'}</p>
      <p><small>${this.nightModeSource === 'sensor' ? 
        'Sensor-activated night mode will turn off when room brightens' : 
        this.nightModeSource === 'manual' ? 
        'Manually-activated night mode will turn off when screen is tapped' : 
        ''}</small></p>
      
      <h4>Brightness:</h4>
      <p><strong>Current Brightness:</strong> ${this.brightness}</p>
      <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
      <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
      <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness ? 'Yes' : 'No'}</p>
      <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
      
      <h4>UI States:</h4>
      <p><strong>Show Overlay:</strong> ${this.showOverlay ? 'Yes' : 'No'}</p>
      <p><strong>Overlay Visible:</strong> ${this.isOverlayVisible ? 'Yes' : 'No'}</p>
      <p><strong>Overlay Transitioning:</strong> ${this.isOverlayTransitioning ? 'Yes' : 'No'}</p>
      <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard ? 'Yes' : 'No'}</p>
      <p><strong>Brightness Card Visible:</strong> ${this.isBrightnessCardVisible ? 'Yes' : 'No'}</p>
      <p><strong>Brightness Card Transitioning:</strong> ${this.isBrightnessCardTransitioning ? 'Yes' : 'No'}</p>
    `;
  }
  
  renderTouchDebugInfo() {
    return html`
      <h3>Touch Information</h3>
      <p><strong>Last Swipe Direction:</strong> ${this.debugTouchInfo.lastSwipeDirection || 'None'}</p>
      <p><strong>Swipe Count:</strong> ${this.debugTouchInfo.swipeCount || 0}</p>
      <p><strong>Touch Start X:</strong> ${this.debugTouchInfo.touchStartX?.toFixed(1) || 0}px</p>
      <p><strong>Touch Start Y:</strong> ${this.debugTouchInfo.touchStartY?.toFixed(1) || 0}px</p>
      <p><strong>Current Y:</strong> ${this.debugTouchInfo.currentY?.toFixed(1) || 0}px</p>
      <p><strong>Delta X:</strong> ${this.debugTouchInfo.deltaX?.toFixed(1) || 0}px</p>
      <p><strong>Delta Y:</strong> ${this.debugTouchInfo.deltaY?.toFixed(1) || 0}px</p>
      <p><strong>Velocity X:</strong> ${this.debugTouchInfo.velocityX || 0}px/ms</p>
      <p><strong>Velocity Y:</strong> ${this.debugTouchInfo.velocityY || 0}px/ms</p>
      <p><strong>Gesture Instructions:</strong></p>
      <ul>
        <li>Swipe up from bottom: Show overlay controls</li>
        <li>Swipe down: Dismiss overlay/controls</li>
        <li>Swipe right from left edge: Activate manual night mode</li>
        <li>Tap screen: Turn off manual night mode</li>
      </ul>
      
      <h4>Night Mode Behavior:</h4>
      <ul>
        <li><strong>Manual Night Mode:</strong> Activated by swiping from left edge. Can only be dismissed by tapping screen. Ignores room brightness.</li>
        <li><strong>Sensor Night Mode:</strong> Activated when room is dark. Automatically deactivates when room brightens.</li>
      </ul>
    `;
  }
  
  renderBackgroundDebugInfo() {
    // Get background rotator debug info if possible
    const backgroundRotator = this.shadowRoot.querySelector('background-rotator');
    let imageA = 'Not available';
    let imageB = 'Not available';
    let imageList = [];
    
    if (backgroundRotator) {
      imageA = backgroundRotator.imageA;
      imageB = backgroundRotator.imageB;
      imageList = backgroundRotator.imageList || [];
    }
    
    return html`
      <h3>Background Information</h3>
      <p><strong>Current Image Index:</strong> ${backgroundRotator?.currentImageIndex || -1}</p>
      <p><strong>Image List Length:</strong> ${imageList.length}</p>
      <p><strong>Active Image:</strong> ${backgroundRotator?.activeImage || 'None'}</p>
      <p><strong>Is Transitioning:</strong> ${backgroundRotator?.isTransitioning ? 'Yes' : 'No'}</p>
      <p><strong>Source Type:</strong> ${backgroundRotator?.getImageSourceType?.() || 'unknown'}</p>
      <p><strong>Error:</strong> ${backgroundRotator?.error || 'None'}</p>
      
      <h4>Image A:</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">${imageA}</div>
      
      <h4>Image B:</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">${imageB}</div>
      
      <h4>Image List (first 3):</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">
        ${imageList.slice(0, 3).map(url => html`<div>${url}</div>`)}
        ${imageList.length > 3 ? html`<div>...and ${imageList.length - 3} more</div>` : ''}
      </div>
    `;
  }
  
  renderWeatherDebugInfo() {
    // Get weather clock debug info if possible
    const weatherClock = this.shadowRoot.querySelector('weather-clock');
    
    return html`
      <h3>Weather Information</h3>
      <p><strong>Date:</strong> ${weatherClock?.date || 'N/A'}</p>
      <p><strong>Time:</strong> ${weatherClock?.time || 'N/A'}</p>
      <p><strong>Temperature:</strong> ${weatherClock?.temperature || 'N/A'}</p>
      <p><strong>Weather Icon:</strong> ${weatherClock?.weatherIcon || 'N/A'}</p>
      <p><strong>AQI:</strong> ${weatherClock?.aqi || 'N/A'}</p>
      <p><strong>Weather Entity:</strong> ${weatherClock?.weatherEntity || 'N/A'}</p>
      <p><strong>AQI Entity:</strong> ${weatherClock?.aqiEntity || 'N/A'}</p>
      <p><strong>Error:</strong> ${weatherClock?.error || 'None'}</p>
      
      <div style="margin-top: 15px;">
        <h4>Light Sensor:</h4>
        <p>The Google Card uses the light sensor to determine night mode.</p>
        <p><strong>Sensor Entity:</strong> sensor.liam_room_display_light_sensor</p>
        <p><strong>Current Value:</strong> ${this.hass?.states['sensor.liam_room_display_light_sensor']?.state || 'N/A'}</p>
        <p><small>Night mode activates when sensor value is 0</small></p>
      </div>
    `;
  }
  
  renderConfigDebugInfo() {
    return html`
      <h3>Configuration</h3>
      <pre style="font-size: 11px; overflow: auto; max-height: 300px;">${JSON.stringify(this.config, null, 2)}</pre>
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
        .nightModeSource=${this.nightModeSource}
        @nightModeExit=${this.handleNightModeExit}
      ></night-mode>
    ` : html`
      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
        .showDebugInfo=${false} <!-- Never show component's own debug, we use consolidated view -->
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
