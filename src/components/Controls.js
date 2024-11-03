// src/components/Controls.js
import { LitElement, html } from 'lit-element';
import { controlsStyles } from '../styles/controls.js';
import { TIMING, BRIGHTNESS, VOLUME, UI } from '../constants.js';

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
      longPressTimer: { type: Number },
    };
  }

  constructor() {
    super();
    this.initializeProperties();
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
    return controlsStyles;
  }

  // Timer Management
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

  // Brightness Control Methods
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(
      BRIGHTNESS.MIN,
      Math.min(BRIGHTNESS.MAX, Math.round(value)),
    );

    try {
      await this.setBrightness(value);
      this.startBrightnessCardDismissTimer();
    } catch (error) {
      this.handleError('Failed to update brightness', error);
      this.visualBrightness = this.brightness;
    }

    this.requestUpdate();
  }

  async setBrightness(value) {
    if (!this.hass) {
      throw new Error('Home Assistant not available');
    }

    const brightnessValue = Math.max(
      BRIGHTNESS.MIN,
      Math.min(BRIGHTNESS.MAX, Math.round(value)),
    );

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

  // Volume Control Methods
  async updateVolumeValue(value) {
    this.isAdjustingVolume = true;
    this.visualVolume = Math.max(
      VOLUME.MIN,
      Math.min(VOLUME.MAX, Math.round(value)),
    );

    try {
      await this.setVolume(value);
      this.startVolumeCardDismissTimer();
    } catch (error) {
      this.handleError('Failed to update volume', error);
      this.visualVolume = this.volume;
    }

    this.requestUpdate();
  }

  async setVolume(value) {
    if (!this.hass) {
      throw new Error('Home Assistant not available');
    }

    const volumeValue = Math.max(
      VOLUME.MIN,
      Math.min(VOLUME.MAX, Math.round(value)),
    );

    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_volume_level',
      data: {
        media_stream: 'system_stream',
        command: volumeValue,
      },
    });

    // Play test sound
    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_play_sound',
      data: {
        sound: 'volume_change',
      },
    });

    this.volume = volumeValue;
    this.emitVolumeChange(volumeValue);
  }

  // Event Handlers
  handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(newBrightness * (BRIGHTNESS.MAX / BRIGHTNESS.DOTS));
  }

  handleVolumeChange(e) {
    const clickedDot = e.target.closest('.volume-dot');
    if (!clickedDot) return;

    const newVolume = parseInt(clickedDot.dataset.value);
    this.updateVolumeValue(newVolume * (VOLUME.MAX / VOLUME.DOTS));
  }

  async handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * BRIGHTNESS.DOTS);
    await this.updateBrightnessValue(newValue * (BRIGHTNESS.MAX / BRIGHTNESS.DOTS));
  }

  async handleVolumeDrag(e) {
    const container = this.shadowRoot.querySelector('.volume-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * VOLUME.DOTS);
    await this.updateVolumeValue(newValue * (VOLUME.MAX / VOLUME.DOTS));
  }

  // Touch Event Handlers
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

  // Settings Icon Long Press Handler
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

  // UI State Management
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

  // Event Emitters
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

  // Error Handling
  handleError(message, error) {
    console.error(message, error);
    this.error = message;
    this.requestUpdate();

    // Emit error event
    const errorEvent = new CustomEvent('control-error', {
      detail: { error: message },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(errorEvent);
  }

  // Render Methods
  renderOverlay() {
    return html`
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${this.toggleBrightnessCard}">
              <iconify-icon
                icon="material-symbols-light:sunny-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button" @click="${this.toggleVolumeCard}">
              <iconify-icon
                icon="material-symbols-light:volume-up-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon
                icon="material-symbols-light:do-not-disturb-on-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon
                icon="material-symbols-light:alarm-add-outline-rounded"
              ></iconify-icon>
            </button>
            <button
              class="icon-button"
              @touchstart="${this.handleSettingsIconTouchStart}"
              @touchend="${this.handleSettingsIconTouchEnd}"
              @touchcancel="${this.handleSettingsIconTouchEnd}"
            >
              <iconify-icon
                icon="material-symbols-light:settings-outline-rounded"
              ></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderBrightnessCard() {
    const brightnessDisplayValue = Math.round(
      this.visualBrightness / (BRIGHTNESS.MAX / BRIGHTNESS.DOTS),
    );

    return html`
      <div
        class="brightness-card ${this.showBrightnessCard ? 'show' : ''}"
        style="transition: ${this.brightnessCardTransition};"
      >
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div
              class="brightness-dots"
              @click="${this.handleBrightnessChange}"
              @mousedown="${this.handleBrightnessDrag}"
              @mousemove="${(e) => e.buttons === 1 && this.handleBrightnessDrag(e)}"
              @touchstart="${this.handleBrightnessDrag}"
              @touchmove="${this.handleBrightnessDrag}"
            >
              ${[...Array(BRIGHTNESS.DOTS)].map(
                (_, i) => html`
                  <div
                    class="brightness-dot ${i < brightnessDisplayValue ? 'active' : ''}"
                    data-value="${i + 1}"
                  ></div>
                `,
              )}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }

  renderVolumeCard() {
    const volumeDisplayValue = Math.round(
      this.visualVolume / (VOLUME.MAX / VOLUME.DOTS),
    );

    return html`
      <div
        class="volume-card ${this.showVolumeCard ? 'show' : ''}"
        style="transition: ${this.volumeCardTransition};"
      >
        <div class="volume-control">
          <div class="volume-dots-container">
            <div
              class="volume-dots"
              @click="${this.handleVolumeChange}"
              @mousedown="${this.handleVolumeDrag}"
              @mousemove="${(e) => e.buttons === 1 && this.handleVolumeDrag(e)}"
              @touchstart="${this.handleVolumeDrag}"
              @touchmove="${this.handleVolumeDrag}"
            >
              ${[...Array(VOLUME.DOTS)].map(
                (_, i) => html`
                  <div
                    class="volume-dot ${i < volumeDisplayValue ? 'active' : ''}"
                    data-value="${i + 1}"
                  ></div>
                `,
              )}
            </div>
          </div>
          <span class="volume-value">${volumeDisplayValue}</span>
        </div>
      </div>
    `;
  }

  renderError() {
    if (!this.error) return null;
    return html`<div class="error-message">${this.error}</div>`;
  }

  render() {
    return html`
      <div
        class="controls-container"
        @touchstart="${this.handleTouchStart}"
        @touchmove="${this.handleTouchMove}"
        @touchend="${this.handleTouchEnd}"
      >
        ${this.renderError()}
        ${!this.showBrightnessCard && !this.showVolumeCard
          ? this.renderOverlay()
          : ''}
        ${this.renderBrightnessCard()}
        ${this.renderVolumeCard()}
      </div>
    `;
  }

  // Public Methods
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

  // Cleanup method
  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
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
}

customElements.define('google-controls', Controls);
