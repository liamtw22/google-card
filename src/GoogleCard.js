// src/GoogleCard.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from './styles/shared.js';
import './components/BackgroundRotator.js';
import './components/WeatherDisplay.js';
import './components/NightMode.js';
import './components/Controls.js';
import { DEFAULT_CONFIG } from './constants.js';
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

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
      longPressTimer: { type: Number },
      screenWidth: { type: Number },
      screenHeight: { type: Number }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }

  initializeProperties() {
    // Properties initialization
    this.error = null;
    this.debugInfo = {};
    this.showDebugInfo = false;
    this.isNightMode = false;
    this.brightness = 128;
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
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  bindMethods() {
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleScreenSizeUpdate = this.handleScreenSizeUpdate.bind(this);
    this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this);
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo = {
      config: this.config,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
    this.addEventListener('screen-size-update', this.handleScreenSizeUpdate);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.removeEventListener('screen-size-update', this.handleScreenSizeUpdate);
    this.clearAllTimers();
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.debugInfo = {
      ...this.debugInfo,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight
    };
    this.requestUpdate();
  }

  handleScreenSizeUpdate(e) {
    this.screenWidth = e.detail.width;
    this.screenHeight = e.detail.height;
    this.debugInfo = {
      ...this.debugInfo,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight
    };
    this.requestUpdate();
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

  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
        this.updateBrightness();
      }
    }
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

  handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    this.updateBrightnessValue(newValue * 25.5);
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

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  renderDebugInfo() {
    if (!this.showDebugInfo) return null;
    
    return html`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
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

  renderOverlay() {
    return html`
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${this.toggleBrightnessCard}">
              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>
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
          font-family: var(--font-family-primary);
          font-weight: var(--font-weight-regular);
        }

        .debug-info {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: var(--spacing-4);
          border-radius: var(--border-radius-lg);
          font-size: var(--font-size-sm);
          z-index: var(--z-index-overlay);
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
        }

        .debug-info h2,
        .debug-info h3 {
          margin-bottom: var(--spacing-2);
        }

        .debug-info p {
          margin-bottom: var(--spacing-1);
        }

        .debug-info pre {
          margin-top: var(--spacing-2);
          white-space: pre-wrap;
          word-break: break-all;
        }

        .overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: var(--overlay-height);
          background-color: var(--color-background-translucent);
          color: var(--color-text);
          box-sizing: border-box;
          transition: transform var(--transition-duration-normal) var(--transition-timing-default);
          transform: translateY(100%);
          z-index: var(--z-index-floating);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top-left-radius: var(--border-radius-lg);
          border-top-right-radius: var(--border-radius-lg);
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
          color: var(--color-text);
          padding: var(--spacing-2);
          border-radius: 50%;
          transition: background-color var(--transition-duration-fast) var(--transition-timing-default);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background-color: var(--color-overlay);
        }

        iconify-icon {
          font-size: 50px;
          display: block;
          width: 50px;
          height: 50px;
        }

        .brightness-card {
          position: fixed;
          bottom: var(--spacing-5);
          left: var(--spacing-5);
          right: var(--spacing-5);
          background-color: var(--color-background-translucent);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-10) var(--spacing-5);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-index-floating);
          transform: translateY(calc(100% + var(--spacing-5)));
          transition: transform var(--transition-duration-normal) var(--transition-timing-default);
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
          margin-right: var(--spacing-2);
          padding: 0 var(--spacing-2);
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
          background-color: var(--color-border);
          transition: all var(--transition-duration-fast) var(--transition-timing-default);
          cursor: pointer;
        }

        .brightness-dot.active {
          background-color: var(--color-text);
          transform: scale(1.1);
        }

        .brightness-value {
          min-width: 60px;
          text-align: right;
          font-size: var(--font-size-3xl);
          color: var(--color-text);
          font-weight: var(--font-weight-light);
          margin-right: var(--spacing-5);
        }

        @media (max-width: 768px) {
          .icon-row {
            width: 95%;
          }

          .brightness-card {
            bottom: var(--spacing-2);
            left: var(--spacing-2);
            right: var(--spacing-2);
            padding: var(--spacing-8) var(--spacing-4);
          }

          .brightness-value {
            font-size: var(--font-size-2xl);
            min-width: 50px;
            margin-right: var(--spacing-4);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .overlay,
          .brightness-card,
          .brightness-dot {
            transition: none;
          }
        }
      `
    ];
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
      <background-rotator 
        .config="${this.config}"
        .hass="${this.hass}"
        @screen-size-update="${this.handleScreenSizeUpdate}"
      ></background-rotator>
      <weather-display .hass="${this.hass}"></weather-display>
      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
      ${!this.showBrightnessCard ? this.renderOverlay() : ''}
      ${this.renderBrightnessCard()}
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
  documentationURL: 'https://github.com/liamtw22/google-card'
});
