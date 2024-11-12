// src/components/Controls.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { controlsStyles } from '../styles/ControlsStyles';
import { sharedStyles } from '../styles/SharedStyles';
import {
  OVERLAY_DISMISS_TIMEOUT,
  LONG_PRESS_TIMEOUT,
  BRIGHTNESS_DEBOUNCE_DELAY,
  BRIGHTNESS_STABILIZE_DELAY,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  SWIPE_THRESHOLD,
  DEFAULT_SENSOR_UPDATE_DELAY,
} from '../constants';

export class Controls extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      showOverlay: { type: Boolean },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      touchStartY: { type: Number },
      lastBrightnessUpdateTime: { type: Number },
    };
  }

  static get styles() {
    return [controlsStyles, sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  initializeProperties() {
    this.showOverlay = false;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.brightness = 128;
    this.visualBrightness = 128;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.touchStartY = 0;
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.brightnessUpdateTimer = null;
    this.brightnessStabilizeTimer = null;
    this.longPressTimer = null;
  }

  firstUpdated() {
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  handleTouchStart(event) {
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    if (this.showBrightnessCard || this.showOverlay) {
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    const deltaY = this.touchStartY - event.changedTouches[0].clientY;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
      if (deltaY > 0 && !this.showBrightnessCard) {
        this.showOverlay = true;
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
  }

  startOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  startBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  dismissOverlay() {
    this.showOverlay = false;
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.dispatchEvent(new CustomEvent('overlayToggle', {
      detail: false,
      bubbles: true,
      composed: true,
    }));
  }

  toggleBrightnessCard() {
    if (!this.showBrightnessCard) {
      this.showOverlay = false;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = true;
      this.dispatchEvent(new CustomEvent('overlayToggle', {
        detail: false,
        bubbles: true,
        composed: true,
      }));
      this.dispatchEvent(new CustomEvent('brightnessCardToggle', {
        detail: true,
        bubbles: true,
        composed: true,
      }));
      this.startBrightnessCardDismissTimer();
    } else {
      this.dismissBrightnessCard();
    }
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }
    this.dispatchEvent(new CustomEvent('brightnessCardToggle', {
      detail: false,
      bubbles: true,
      composed: true,
    }));
  }

  async handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    await this.updateBrightnessValue(newBrightness * 25.5);
  }

  async handleBrightnessDrag(e) {
    e.stopPropagation();
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    await this.updateBrightnessValue(newValue * 25.5);
  }

  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
    this.dispatchEvent(new CustomEvent('brightnessChange', {
      detail: this.visualBrightness,
      bubbles: true,
      composed: true,
    }));

    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);

    this.brightnessUpdateTimer = setTimeout(async () => {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
        this.requestUpdate();
      }, BRIGHTNESS_STABILIZE_DELAY);
    }, BRIGHTNESS_DEBOUNCE_DELAY);
  }

  async setBrightness(value) {
    const internalValue = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: internalValue,
        },
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors',
      });

      await new Promise(resolve => setTimeout(resolve, DEFAULT_SENSOR_UPDATE_DELAY));
      
      this.brightness = internalValue;
    } catch (error) {
      console.error('Error setting brightness:', error);
      this.visualBrightness = this.brightness;
    }

    this.startBrightnessCardDismissTimer();
  }

  handleSettingsIconTouchStart = (e) => {
    e.stopPropagation();
    this.longPressTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('debugToggle', {
        bubbles: true,
        composed: true,
      }));
    }, LONG_PRESS_TIMEOUT);
  }

  handleSettingsIconTouchEnd = (e) => {
    e.stopPropagation();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
      <div class="controls-container">
        ${!this.showBrightnessCard ? this.renderOverlay() : ''}
        ${this.renderBrightnessCard()}
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
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon
                icon="material-symbols-light:do-not-disturb-on-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>
            </button>
            <button
              class="icon-button"
              @touchstart="${this.handleSettingsIconTouchStart}"
              @touchend="${this.handleSettingsIconTouchEnd}"
              @touchcancel="${this.handleSettingsIconTouchEnd}"
            >
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
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                (value) => html`
                  <div
                    class="brightness-dot ${value <= brightnessDisplayValue ? 'active' : ''}"
                    data-value="${value}"
                  ></div>
                `
              )}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('google-controls', Controls);
