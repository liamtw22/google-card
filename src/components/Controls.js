// src/components/Controls.js
import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
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
  DEFAULT_SENSOR_UPDATE_DELAY
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
      lastBrightnessUpdateTime: { type: Number }
    };
  }

  static get styles() {
    return [controlsStyles, sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.setupEventListeners();
  }

  initializeProperties() {
    this.showOverlay = false;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.brightness = 128;
    this.visualBrightness = 128;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
  }

  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
  }

  clearAllTimers() {
    this.clearOverlayDismissTimer();
    this.clearBrightnessCardDismissTimer();
    if (this.brightnessUpdateTimer) {
      clearTimeout(this.brightnessUpdateTimer);
    }
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  // Touch Event Handlers
  handleTouchStart(event) {
    event.preventDefault();
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    event.preventDefault();
  }

  handleTouchEnd(event) {
    const deltaY = this.touchStartY - event.changedTouches[0].clientY;

    if (deltaY > SWIPE_THRESHOLD && !this.showBrightnessCard) {
      this.showOverlay = true;
      this.dispatchEvent(new CustomEvent('overlayToggle', { detail: true }));
      this.startOverlayDismissTimer();
    } else if (deltaY < -SWIPE_THRESHOLD) {
      this.showBrightnessCard ? this.dismissBrightnessCard() : this.dismissOverlay();
    }
  }

  // Timer Management
  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, OVERLAY_DISMISS_TIMEOUT);
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
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }

  // UI State Management
  dismissOverlay() {
    this.showOverlay = false;
    this.clearOverlayDismissTimer();
    this.dispatchEvent(new CustomEvent('overlayToggle', { detail: false }));
  }

  toggleBrightnessCard() {
    if (!this.showBrightnessCard) {
      this.showOverlay = false;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = true;
      this.dispatchEvent(new CustomEvent('overlayToggle', { detail: false }));
      this.dispatchEvent(new CustomEvent('brightnessCardToggle', { detail: true }));
      this.startBrightnessCardDismissTimer();
    } else {
      this.dismissBrightnessCard();
    }
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    this.clearBrightnessCardDismissTimer();
    this.dispatchEvent(new CustomEvent('brightnessCardToggle', { detail: false }));
  }

  // Brightness Control
  async handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    await this.updateBrightnessValue(newBrightness * 25.5);
  }

  async handleBrightnessDrag(e) {
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
    this.dispatchEvent(new CustomEvent('brightnessChange', { detail: this.visualBrightness }));

    if (this.brightnessUpdateTimer) {
      clearTimeout(this.brightnessUpdateTimer);
    }
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }

    this.brightnessUpdateTimer = setTimeout(async () => {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
      }, BRIGHTNESS_STABILIZE_DELAY);
      
    }, BRIGHTNESS_DEBOUNCE_DELAY);
  }

  async setBrightness(value) {
    const internalValue = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: internalValue
        }
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });

      await new Promise(resolve => setTimeout(resolve, DEFAULT_SENSOR_UPDATE_DELAY));

      this.brightness = internalValue;
    } catch (error) {
      console.error('Error setting brightness:', error);
      this.visualBrightness = this.brightness;
    }

    this.startBrightnessCardDismissTimer();
  }

  // Debug Toggle
  handleSettingsIconTouchStart() {
    this.longPressTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('debugToggle'));
    }, LONG_PRESS_TIMEOUT);
  }

  handleSettingsIconTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  // Render Methods
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
           style="transition: ${this.brightnessCardTransition};">
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

  render() {
    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">
      ${!this.showBrightnessCard ? this.renderOverlay() : ''}
      ${this.renderBrightnessCard()}
    `;
  }
}

customElements.define('google-controls', Controls);
