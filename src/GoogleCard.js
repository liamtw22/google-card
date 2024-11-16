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
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      isNightMode: { type: Boolean },
      currentTime: { type: String },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number },
      touchStartY: { type: Number },
      debugTouchInfo: { type: Object },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .touch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `
    ];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }

  initializeProperties() {
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.isNightMode = false;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.brightness = DEFAULT_CONFIG.brightness || 128;
    this.visualBrightness = this.brightness;
    this.previousBrightness = this.brightness;
    this.isInNightMode = false;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.touchStartY = 0;
    this.debugTouchInfo = {
      touchStartY: 0,
      currentY: 0,
      deltaY: 0,
      lastSwipeDirection: 'none',
      swipeCount: 0,
    };

    // Initialize screen size and time
    this.updateScreenSize();
    this.updateTime();
    this.startTimeUpdates();
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
  }

  firstUpdated() {
    super.firstUpdated();
    
    // Add event listeners to the touch container
    const touchContainer = this.shadowRoot.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      touchContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      touchContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    // Add overlay toggle listener
    this.addEventListener('overlayToggle', this.handleOverlayToggle);
    this.addEventListener('brightnessCardToggle', this.handleBrightnessCardToggle);
    this.addEventListener('brightnessChange', this.handleBrightnessChange);
    this.addEventListener('debugToggle', this.handleDebugToggle);
    this.addEventListener('nightModeExit', this.handleNightModeExit);

    window.addEventListener('resize', this.boundUpdateScreenSize);
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateNightMode();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    const touchContainer = this.shadowRoot.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      touchContainer.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      touchContainer.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    this.removeEventListener('overlayToggle', this.handleOverlayToggle);
    this.removeEventListener('brightnessCardToggle', this.handleBrightnessCardToggle);
    this.removeEventListener('brightnessChange', this.handleBrightnessChange);
    this.removeEventListener('debugToggle', this.handleDebugToggle);
    this.removeEventListener('nightModeExit', this.handleNightModeExit);

    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.clearTimers();
  }

  clearTimers() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  handleTouchStart(event) {
    console.log('Touch Start');
    if (event.touches.length === 1) {
      this.touchStartY = event.touches[0].clientY;
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
    console.log('Touch Move');
    if (event.touches.length === 1) {
      const currentY = event.touches[0].clientY;
      const deltaY = this.touchStartY - currentY;
      this.debugTouchInfo = {
        ...this.debugTouchInfo,
        currentY,
        deltaY,
      };
      this.requestUpdate();
    }
    if (this.showBrightnessCard || this.showOverlay) {
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    console.log('Touch End');
    if (event.changedTouches.length === 1) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY;
      
      if (Math.abs(deltaY) > 50) {
        console.log('Swipe detected:', deltaY > 0 ? 'up' : 'down');
        this.debugTouchInfo = {
          ...this.debugTouchInfo,
          lastSwipeDirection: deltaY > 0 ? 'up' : 'down',
          swipeCount: this.debugTouchInfo.swipeCount + 1,
          deltaY,
        };

        if (deltaY > 0 && !this.showBrightnessCard) {
          console.log('Showing overlay');
          this.showOverlay = true;
          this.requestUpdate();
          this.dispatchEvent(new CustomEvent('overlayToggle', {
            detail: true,
            bubbles: true,
            composed: true,
          }));
          this.startOverlayDismissTimer();
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

  handleOverlayToggle = (event) => {
    this.showOverlay = event.detail;
    this.requestUpdate();
  }

  handleBrightnessCardToggle = (event) => {
    this.showBrightnessCard = event.detail;
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.requestUpdate();
  }

  handleBrightnessChange = async (event) => {
    await this.updateBrightnessValue(event.detail);
  }

  handleDebugToggle = () => {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleNightModeExit = () => {
    this.isNightMode = false;
    this.requestUpdate();
  }

  startTimeUpdates() {
    this.updateTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  startOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, 10000); // OVERLAY_DISMISS_TIMEOUT
  }

  dismissOverlay() {
    this.showOverlay = false;
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('overlayToggle', {
      detail: false,
      bubbles: true,
      composed: true,
    }));
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    this.dispatchEvent(new CustomEvent('brightnessCardToggle', {
      detail: false,
      bubbles: true,
      composed: true,
    }));
    this.requestUpdate();
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/\s?[AP]M/, '');
  }

  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));
    
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }

    try {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
        this.requestUpdate();
      }, 2000);
    } catch (error) {
      console.error('Error updating brightness:', error);
      this.visualBrightness = this.brightness;
    }
  }

  async setBrightness(value) {
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

  updateNightMode() {
    if (!this.hass?.states['sensor.liam_room_display_light_sensor']) return;

    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    const shouldBeInNightMode = parseInt(lightSensor.state) === 0;

    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode);
    }
  }

  async handleNightModeTransition(newNightMode) {
    if (newNightMode) {
      await this.enterNightMode();
    } else {
      await this.exitNightMode();
    }
    
    this.isInNightMode = newNightMode;
    this.isNightMode = newNightMode;
    this.requestUpdate();
  }

  async enterNightMode() {
    this.previousBrightness = this.brightness;
    await this.toggleAutoBrightness(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.setBrightness(1);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.toggleAutoBrightness(true);
  }

  async exitNightMode() {
    await this.toggleAutoBrightness(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.setBrightness(this.previousBrightness);
  }

  async toggleAutoBrightness(enabled) {
    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_auto_screen_brightness',
      data: {
        command: enabled ? 'turn_on' : 'turn_off'
      }
    });
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
      }
    }
  }

  renderSwipeDebugOverlay() {
    return html`
      <div style="
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
      ">
        <div>Start Y: ${this.debugTouchInfo.touchStartY.toFixed(1)}</div>
        <div>Current Y: ${this.debugTouchInfo.currentY.toFixed(1)}</div>
        <div>Delta Y: ${this.debugTouchInfo.deltaY.toFixed(1)}</div>
        <div>Last Swipe: ${this.debugTouchInfo.lastSwipeDirection}</div>
        <div>Swipe Count: ${this.debugTouchInfo.swipeCount}</div>
        <div>Overlay Shown: ${this.showOverlay}</div>
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
        <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
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
        .showBrightnessCard=${this.showBrightnessCard}
        .brightnessCardTransition=${this.brightnessCardTransition}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
      ></google-controls>
    `;

    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
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

export { GoogleCard };
