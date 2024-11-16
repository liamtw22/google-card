// src/components/Controls.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";
import { controlsStyles } from '../styles/ControlsStyles';
import { sharedStyles } from '../styles/SharedStyles';
import {
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  LONG_PRESS_TIMEOUT
} from '../constants';

export class Controls extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      showOverlay: { type: Boolean },
      isOverlayVisible: { type: Boolean },
      isOverlayTransitioning: { type: Boolean },
      showBrightnessCard: { type: Boolean },
      isBrightnessCardVisible: { type: Boolean },
      isBrightnessCardTransitioning: { type: Boolean },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      longPressTimer: { type: Object }
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
    this.isOverlayVisible = false;
    this.isOverlayTransitioning = false;
    this.showBrightnessCard = false;
    this.isBrightnessCardVisible = false;
    this.isBrightnessCardTransitioning = false;
    this.brightness = 128;
    this.visualBrightness = 128;
    this.isAdjustingBrightness = false;
    this.longPressTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

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
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    this.updateBrightnessValue(newValue * 25.5);
  }

  updateBrightnessValue(value) {
    this.dispatchEvent(new CustomEvent('brightnessChange', {
      detail: Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value))),
      bubbles: true,
      composed: true,
    }));
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

  classMap(classes) {
    return Object.entries(classes)
      .filter(([_, value]) => Boolean(value))
      .map(([className]) => className)
      .join(' ');
  }

  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    
    return html`
      <div
        class="brightness-card ${this.classMap({
          'show': this.isBrightnessCardVisible,
          'transitioning': this.isBrightnessCardTransitioning
        })}"
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

  renderOverlay() {
    return html`
      <div 
        class="overlay ${this.classMap({
          'show': this.isOverlayVisible,
          'transitioning': this.isOverlayTransitioning
        })}"
        @click="${(e) => e.stopPropagation()}"
      >
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

  render() {
    return html`
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ''}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ''}
      </div>
    `;
  }
}

customElements.define('google-controls', Controls);
