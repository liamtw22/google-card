// src/components/Controls.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";
import { controlsStyles } from '../styles/ControlsStyles';
import { sharedStyles } from '../styles/SharedStyles';
import {
  BRIGHTNESS_DEBOUNCE_DELAY,
  BRIGHTNESS_STABILIZE_DELAY,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  DEFAULT_SENSOR_UPDATE_DELAY,
  LONG_PRESS_TIMEOUT
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
      lastBrightnessUpdateTime: { type: Number },
    };
  }

  static get styles() {
    return [controlsStyles, sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.showOverlay = false;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.brightness = 128;
    this.visualBrightness = 128;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.brightnessUpdateTimer = null;
    this.brightnessStabilizeTimer = null;
    this.longPressTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
  }

  clearAllTimers() {
    if (this.brightnessUpdateTimer) clearTimeout(this.brightnessUpdateTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  // Brightness Control Handlers
  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(newBrightness * 25.5);
  }

  handleBrightnessDrag(e) {
    e.stopPropagation();
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    this.updateBrightnessValue(newValue * 25.5);
  }

  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
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

    this.dispatchEvent(new CustomEvent('brightnessChange', {
      detail: this.visualBrightness,
      bubbles: true,
      composed: true,
    }));
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
      this.requestUpdate();
    } catch (error) {
      console.error('Error setting brightness:', error);
      this.visualBrightness = this.brightness;
    }
  }

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  toggleBrightnessCard(e) {
    if (e) {
      e.stopPropagation();
    }
    
    this.dispatchEvent(new CustomEvent('brightnessCardToggle', {
      detail: !this.showBrightnessCard,
      bubbles: true,
      composed: true,
    }));
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

  render() {
    return html`
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ''}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ''}
      </div>
    `;
  }

  renderOverlay() {
    return html`
      <div class="overlay show" @click="${(e) => e.stopPropagation()}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${(e) => this.toggleBrightnessCard(e)}">
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
        class="brightness-card show"
        style="transition: ${this.brightnessCardTransition};"
        @click="${(e) => e.stopPropagation()}"
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
