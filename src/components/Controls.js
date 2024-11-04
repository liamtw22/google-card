// src/components/Controls.js
import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { TIMING, BRIGHTNESS, VOLUME, UI, ENTITIES } from '../constants.js';
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

export class Controls extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      volume: { type: Number },
      visualVolume: { type: Number },
      showVolumeCard: { type: Boolean },
      volumeCardTransition: { type: String },
      showOverlay: { type: Boolean },
      isAdjustingBrightness: { type: Boolean },
      isAdjustingVolume: { type: Boolean },
      error: { type: String },
      touchStartY: { type: Number },
      longPressTimer: { type: Number }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }

  bindMethods() {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleVolumeDrag = this.handleVolumeDrag.bind(this);
  }

  initializeProperties() {
    // Control values
    this.brightness = BRIGHTNESS.DEFAULT;
    this.visualBrightness = BRIGHTNESS.DEFAULT;
    this.volume = VOLUME.DEFAULT;
    this.visualVolume = VOLUME.DEFAULT;

    // UI states
    this.showOverlay = false;
    this.showBrightnessCard = false;
    this.showVolumeCard = false;
    this.brightnessCardTransition = 'none';
    this.volumeCardTransition = 'none';

    // State flags
    this.isAdjustingBrightness = false;
    this.isAdjustingVolume = false;

    // Touch handling
    this.touchStartY = null;
    this.longPressTimer = null;

    // Timers
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.volumeCardDismissTimer = null;

    // Error handling
    this.error = null;
  }

  static get styles() {
    return css`
      :host {
        --overlay-height: 120px;
        --icon-size: 50px;
        --border-radius: 20px;
        --transition-timing: 0.3s ease-in-out;
        font-family: 'Product Sans Regular', 'Rubik', sans-serif;
      }

      .controls-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
        touch-action: none;
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
        transition: transform var(--transition-timing);
        transform: translateY(100%);
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-top-left-radius: var(--border-radius);
        border-top-right-radius: var(--border-radius);
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
        font-size: var(--icon-size);
        display: block;
        width: var(--icon-size);
        height: var(--icon-size);
      }

      .control-card {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: var(--border-radius);
        padding: 40px 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        transform: translateY(calc(100% + 20px));
        transition: transform var(--transition-timing);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        max-width: 600px;
        margin: 0 auto;
      }

      .control-card.show {
        transform: translateY(0);
      }

      .control-container {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .dots-container {
        flex-grow: 1;
        margin-right: 10px;
        padding: 0 10px;
      }

      .dots {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 30px;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #d1d1d1;
        transition: background-color 0.2s ease, transform 0.2s ease;
        cursor: pointer;
      }

      .dot.active {
        background-color: #333;
        transform: scale(1.1);
      }

      .value-display {
        min-width: 60px;
        text-align: right;
        font-size: 40px;
        color: black;
        font-weight: 300;
        margin-right: 20px;
      }

      .error-message {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 59, 48, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1002;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      @media (prefers-color-scheme: dark) {
        .overlay,
        .control-card {
          background-color: rgba(30, 30, 30, 0.95);
        }

        .icon-button {
          color: white;
        }

        .dot {
          background-color: #666;
        }

        .dot.active {
          background-color: white;
        }

        .value-display {
          color: white;
        }
      }

      @media (max-width: 768px) {
        .icon-row {
          width: 95%;
        }

        .control-card {
          bottom: 10px;
          left: 10px;
          right: 10px;
          padding: 30px 15px;
        }

        .value-display {
          font-size: 32px;
          min-width: 50px;
          margin-right: 15px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .overlay,
        .control-card,
        .dot {
          transition: none;
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.clearAllTimers();
  }

  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }

  cleanupEventListeners() {
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  clearAllTimers() {
    this.clearOverlayDismissTimer();
    this.clearBrightnessCardDismissTimer();
    this.clearVolumeCardDismissTimer();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, TIMING.OVERLAY_DISMISS_TIMEOUT);
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
    }, TIMING.OVERLAY_DISMISS_TIMEOUT);
  }

  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }

  startVolumeCardDismissTimer() {
    this.clearVolumeCardDismissTimer();
    this.volumeCardDismissTimer = setTimeout(() => {
      this.dismissVolumeCard();
    }, TIMING.OVERLAY_DISMISS_TIMEOUT);
  }

  clearVolumeCardDismissTimer() {
    if (this.volumeCardDismissTimer) {
      clearTimeout(this.volumeCardDismissTimer);
      this.volumeCardDismissTimer = null;
    }
  }

  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(BRIGHTNESS.MIN, Math.min(BRIGHTNESS.MAX, Math.round(value)));

    try {
      await this.setBrightness(value);
      this.startBrightnessCardDismissTimer();
    } catch (error) {
      this.handleError('Failed to update brightness', error);
      this.visualBrightness = this.brightness;
    }

    this.requestUpdate();
  }

  async updateVolumeValue(value) {
    this.isAdjustingVolume = true;
    this.visualVolume = Math.max(VOLUME.MIN, Math.min(VOLUME.MAX, Math.round(value)));

    try {
      await this.setVolume(value);
      this.startVolumeCardDismissTimer();
    } catch (error) {
      this.handleError('Failed to update volume', error);
      this.visualVolume = this.volume;
    }

    this.requestUpdate();
  }

  async setBrightness(value) {
    if (!this.hass) {
      throw new Error('Home Assistant not available');
    }

    const brightnessValue = Math.max(BRIGHTNESS.MIN, Math.min(BRIGHTNESS.MAX, Math.round(value)));

    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_screen_brightness_level',
      data: { command: brightnessValue },
    });

    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_update_sensors',
    });

    this.brightness = brightnessValue;
    this.emitBrightnessChange(brightnessValue);
  }

  async setVolume(value) {
    if (!this.hass) {
      throw new Error('Home Assistant not available');
    }

    const volumeValue = Math.max(VOLUME.MIN, Math.min(VOLUME.MAX, Math.round(value)));

    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_volume_level',
      data: {
        media_stream: 'system_stream',
        command: volumeValue,
      },
    });

    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_play_sound',
      data: {
        sound: 'volume_change',
      },
    });

    this.volume = volumeValue;
    this.emitVolumeChange(volumeValue);
  }

  handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(newBrightness * (BRIGHTNESS.MAX / BRIGHTNESS.DOTS));
  }

  handleVolumeChange(e) {
    const clickedDot = e.target.closest('.dot');
    if (!clickedDot) return;

    const newVolume = parseInt(clickedDot.dataset.value);
    this.updateVolumeValue(newVolume * (VOLUME.MAX / VOLUME.DOTS));
  }

  handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * BRIGHTNESS.DOTS);
    this.updateBrightnessValue(newValue * (BRIGHTNESS.MAX / BRIGHTNESS.DOTS));
  }

  handleVolumeDrag(e) {
    const container = this.shadowRoot.querySelector('.dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * VOLUME.DOTS);
    this.updateVolumeValue(newValue * (VOLUME.MAX / VOLUME.DOTS));
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.touchStartY) return;
    e.preventDefault();

    const deltaY = this.touchStartY - e.touches[0].clientY;
    if (Math.abs(deltaY) > UI.SWIPE_THRESHOLD) {
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

  handleSettingsIconTouchStart() {
    this.longPressTimer = setTimeout(() => {
      this.emitDebugToggle();
    }, TIMING.LONG_PRESS_TIMEOUT);
  }

  handleSettingsIconTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
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

  dismissVolumeCard() {
    this.volumeCardTransition = 'transform 0.3s ease-in-out';
    this.showVolumeCard = false;
    this.clearVolumeCardDismissTimer();
    this.requestUpdate();
  }

  dismissAllCards() {
    this.dismissOverlay();
    this.dismissBrightnessCard();
    this.dismissVolumeCard();
  }

  toggleBrightnessCard() {
    if (!this.showBrightnessCard) {
      this.showOverlay = false;
      this.showVolumeCard = false;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = true;
      this.startBrightnessCardDismissTimer();
    } else {
      this.dismissBrightnessCard();
    }
    this.requestUpdate();
  }

  toggleVolumeCard() {
    if (!this.showVolumeCard) {
      this.showOverlay = false;
      this.showBrightnessCard = false;
      this.volumeCardTransition = 'none';
      this.showVolumeCard = true;
      this.startVolumeCardDismissTimer();
    } else {
      this.dismissVolumeCard();
    }
    this.requestUpdate();
  }

  emitBrightnessChange(value) {
    const event = new CustomEvent('brightness-change', {
      detail: { brightness: value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  emitVolumeChange(value) {
    const event = new CustomEvent('volume-change', {
      detail: { volume: value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  emitDebugToggle() {
    const event = new CustomEvent('debug-toggle', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  handleError(message, error) {
    console.error(message, error);
    this.error = message;
    this.requestUpdate();

    const errorEvent = new CustomEvent('control-error', {
      detail: { error: message },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(errorEvent);
  }

  renderOverlay() {
    return html`
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${this.toggleBrightnessCard}">
              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button" @click="${this.toggleVolumeCard}">
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

  renderControlCard(type) {
    const isVolume = type === 'volume';
    const value = isVolume ? this.visualVolume : this.visualBrightness;
    const max = isVolume ? VOLUME.MAX : BRIGHTNESS.MAX;
    const dots = isVolume ? VOLUME.DOTS : BRIGHTNESS.DOTS;
    const displayValue = Math.round(value / (max / dots));
    const show = isVolume ? this.showVolumeCard : this.showBrightnessCard;
    const transition = isVolume ? this.volumeCardTransition : this.brightnessCardTransition;
    const handler = isVolume ? this.handleVolumeChange : this.handleBrightnessChange;
    const dragHandler = isVolume ? this.handleVolumeDrag : this.handleBrightnessDrag;

    return html`
      <div class="control-card ${show ? 'show' : ''}" 
           style="transition: ${transition}">
        <div class="control-container">
          <div class="dots-container">
            <div class="dots" 
                 @click="${handler}"
                 @mousedown="${dragHandler}"
                 @mousemove="${(e) => e.buttons === 1 && dragHandler(e)}"
                 @touchstart="${dragHandler}"
                 @touchmove="${dragHandler}">
              ${[...Array(dots)].map((_, i) => html`
                <div class="dot ${i < displayValue ? 'active' : ''}" 
                     data-value="${i + 1}">
                </div>
              `)}
            </div>
          </div>
          <span class="value-display">${displayValue}</span>
        </div>
      </div>
    `;
  }

  renderError() {
    return this.error ? html`<div class="error-message">${this.error}</div>` : null;
  }

  render() {
    return html`
      <div class="controls-container">
        ${this.renderError()}
        ${!this.showBrightnessCard && !this.showVolumeCard ? this.renderOverlay() : ''}
        ${this.showBrightnessCard ? this.renderControlCard('brightness') : ''}
        ${this.showVolumeCard ? this.renderControlCard('volume') : ''}
      </div>
    `;
  }

  // Public methods for external control
  setBrightnessValue(value) {
    this.brightness = value;
    this.visualBrightness = value;
    this.requestUpdate();
  }

  setVolumeValue(value) {
    this.volume = value;
    this.visualVolume = value;
    this.requestUpdate();
  }

  showBrightnessAdjustment() {
    this.toggleBrightnessCard();
  }

  showVolumeAdjustment() {
    this.toggleVolumeCard();
  }

  hideAllControls() {
    this.dismissAllCards();
  }
}

customElements.define('google-controls', Controls);
