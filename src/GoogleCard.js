// src/GoogleCard.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";
import { sharedStyles } from './styles/shared.js';
import './components/BackgroundRotator.js';
import './components/WeatherDisplay.js';
import './components/NightMode.js';
import './components/Controls.js';
import { DEFAULT_CONFIG } from './constants.js';

export class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      error: { type: String },
      debugInfo: { type: Object },
      showDebugInfo: { type: Boolean },
      isNightMode: { type: Boolean },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      showOverlay: { type: Boolean },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number },
      previousBrightness: { type: Number },
      touchStartY: { type: Number },
      longPressTimer: { type: Number }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    // Bind methods
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
  }

  initializeProperties() {
    this.error = null;
    this.debugInfo = {};
    this.showDebugInfo = false;
    this.isNightMode = false;
    this.brightness = 128; // Default brightness
    this.visualBrightness = 128;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.showOverlay = false;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.previousBrightness = 128;
    this.touchStartY = null;
    this.longPressTimer = null;
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.brightnessUpdateTimer = null;
    this.brightnessStabilizeTimer = null;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          --crossfade-time: 3s;
          --overlay-height: 120px;
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          font-family: "Product Sans Regular", sans-serif;
          font-weight: 400;
        }

        weather-display {
          position: fixed;
          bottom: 30px;
          left: 30px;
          z-index: 2;
        }

        .overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: var(--overlay-height);
          background-color: rgba(255, 255, 255, 0.95);
          color: #333;
          box-sizing: border-box;
          transition: transform 0.3s ease-in-out;
          transform: translateY(100%);
          z-index: 4;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .overlay.show {
          transform: translateY(0);
        }

        .icon-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .icon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 85%;
          max-width: 500px;
        }

        .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #333;
          padding: 10px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        iconify-icon {
          font-size: 50px;
          display: block;
          width: 50px;
          height: 50px;
        }

        .brightness-card {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 3;
          transform: translateY(calc(100% + 20px));
          transition: transform 0.3s ease-in-out;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          max-width: 600px;
          margin: 0 auto;
        }

        .brightness-card.show {
          transform: translateY(0);
        }

        .brightness-control {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .brightness-dots-container {
          flex-grow: 1;
          margin-right: 10px;
          padding: 0 10px;
        }

        .brightness-dots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
        }

        .brightness-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #d1d1d1;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }

        .brightness-dot.active {
          background-color: #333;
          transform: scale(1.1);
        }

        .brightness-value {
          min-width: 60px;
          text-align: right;
          font-size: 40px;
          color: black;
          font-weight: 300;
          margin-right: 20px;
        }

        .debug-info {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 16px;
          font-size: 14px;
          z-index: 10;
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .icon-row {
            width: 95%;
          }

          .brightness-card {
            bottom: 10px;
            left: 10px;
            right: 10px;
            padding: 30px 15px;
          }

          .brightness-value {
            font-size: 32px;
            min-width: 50px;
            margin-right: 15px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .overlay,
          .brightness-card {
            background-color: rgba(30, 30, 30, 0.95);
          }

          .icon-button {
            color: white;
          }

          .brightness-dot {
            background-color: #666;
          }

          .brightness-dot.active {
            background-color: white;
          }

          .brightness-value {
            color: white;
          }
        }
      `
    ];
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.clearAllTimers();
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) { // 2 seconds stabilization delay
        this.updateNightMode();
        this.updateBrightness();
      }
    }
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
  }

  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));

    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);

    this.brightnessUpdateTimer = setTimeout(async () => {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
        this.requestUpdate();
      }, 2000);
    }, 250);
  }

  async setBrightness(value) {
    const brightnessValue = Math.max(1, Math.min(255, Math.round(value)));
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: { command: brightnessValue }
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });

      this.brightness = brightnessValue;
      if (!this.isNightMode) {
        this.previousBrightness = brightnessValue;
      }
    } catch (error) {
      console.error('Error setting brightness:', error);
      this.visualBrightness = this.brightness;
    }

    this.startBrightnessCardDismissTimer();
  }

  updateNightMode() {
    if (!this.hass?.states['sensor.liam_room_display_light_sensor']) return;

    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    const newNightMode = parseInt(lightSensor.state) === 0;
    
    if (newNightMode !== this.isNightMode) {
      this.handleNightModeTransition(newNightMode);
    }
  }

  async handleNightModeTransition(newNightMode) {
    if (newNightMode) {
      this.previousBrightness = this.brightness;
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.setBrightness(1);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.toggleAutoBrightness(true);
    } else {
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.setBrightness(this.previousBrightness);
    }
    
    this.isNightMode = newNightMode;
  }

  async toggleAutoBrightness(enabled) {
    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_auto_screen_brightness',
      data: { command: enabled ? 'turn_on' : 'turn_off' }
    });
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.touchStartY) return;
    e.preventDefault();

    const deltaY = this.touchStartY - e.touches[0].clientY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        this.showOverlay = true;
        this.startOverlayDismissTimer();
      } else {
        this.dismissAllCards();
      }
      this.touchStartY = null;
    }
  }

  handleTouchEnd() {
    this.touchStartY = null;
  }

  handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(newBrightness * 25.5);
  }

  async handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    await this.updateBrightnessValue(newValue * 25.5);
  }

  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, 10000);
  }

  clearOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
      this.overlayDismissTimer = null;
    }
  }

  startBrightnessCardDismissTimer() {
    this.clearBrightnessCardDismissTimer();
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, 10000);
  }

  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }

  dismissOverlay() {
    this.showOverlay = false;
    this.clearOverlayDismissTimer();
    this.requestUpdate();
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    this.clearBrightnessCardDismissTimer();
    this.requestUpdate();
  }

  dismissAllCards() {
    this.dismissOverlay();
    this.dismissBrightnessCard();
  }

  toggleBrightnessCard() {
    if (!this.showBrightnessCard) {
      this.showOverlay = false;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = true;
      this.startBrightnessCardDismissTimer();
    } else {
      this.dismissBrightnessCard();
    }
    this.requestUpdate();
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleSettingsIconTouchStart() {
    this.longPressTimer = setTimeout(() => {
      this.toggleDebugInfo();
    }, 1000);
  }

  handleSettingsIconTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  renderOverlay() {
    return html`
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${this.toggleBrightnessCard}">
              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button"
              @touchstart="${this.handleSettingsIconTouchStart}"
              @touchend="${this.handleSettingsIconTouchEnd}"
              @touchcancel="${this.handleSettingsIconTouchEnd}">
              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html`
      <div class="brightness-card ${this.showBrightnessCard ? 'show' : ''}" 
           style="transition: ${this.brightnessCardTransition}">
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div class="brightness-dots" 
                 @click="${this.handleBrightnessChange}"
                 @mousedown="${this.handleBrightnessDrag}"
                 @mousemove="${e => e.buttons === 1 && this.handleBrightnessDrag(e)}"
                 @touchstart="${this.handleBrightnessDrag}"
                 @touchmove="${this.handleBrightnessDrag}">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => html`
                <div class="brightness-dot ${value <= brightnessDisplayValue ? 'active' : ''}" 
                     data-value="${value}">
                </div>
              `)}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }

  renderDebugInfo() {
    if (!this.showDebugInfo) return null;
    
    return html`
      <div class="debug-info">
        <h2>Background Card Debug Info</h2>
        <h3>Background Card Version: 23</h3>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
        <p><strong>Error:</strong> ${this.error}</p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }

  render() {
    if (this.isNightMode) {
      return html`<night-mode .currentTime="${new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/\s?[AP]M/, '')}"></night-mode>`;
    }

    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">
      <background-rotator .config="${this.config}"></background-rotator>
      <weather-display .hass="${this.hass}"></weather-display>
      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
      ${!this.showBrightnessCard ? this.renderOverlay() : ''}
      ${this.renderBrightnessCard()}
    `;
  }
}

customElements.define('google-card', GoogleCard);

// Register the custom card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: 'A Google Nest Hub-inspired card for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/liamtw22/google-card'
});
