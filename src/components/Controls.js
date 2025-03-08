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
      longPressTimer: { type: Object },
      isDraggingBrightness: { type: Boolean }
    };
  }

  static get styles() {
    return [controlsStyles, sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
    
    // Bind methods to preserve 'this' context
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDragStart = this.handleBrightnessDragStart.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleBrightnessDragEnd = this.handleBrightnessDragEnd.bind(this);
    this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this);
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
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
    this.isDraggingBrightness = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
    this.removeBrightnessDragListeners();
  }

  updated(changedProperties) {
    // Update visualBrightness when brightness changes from external sources
    if (changedProperties.has('brightness') && !this.isAdjustingBrightness) {
      this.visualBrightness = this.brightness;
    }
  }

  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(newBrightness * 25.5);
  }

  handleBrightnessDragStart(e) {
    e.stopPropagation();
    this.isDraggingBrightness = true;
    
    // Add global event listeners for mousemove and mouseup/touchend
    document.addEventListener('mousemove', this.handleBrightnessDrag);
    document.addEventListener('mouseup', this.handleBrightnessDragEnd);
    document.addEventListener('touchmove', this.handleBrightnessDrag, { passive: false });
    document.addEventListener('touchend', this.handleBrightnessDragEnd);
    
    // Process the first drag event
    this.handleBrightnessDrag(e);
  }

  handleBrightnessDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.isDraggingBrightness) return;
    
    const container = this.shadowRoot.querySelector('.brightness-dots');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.type.includes('touch') 
      ? (e.touches[0]?.clientX || e.changedTouches[0]?.clientX) 
      : e.clientX;
      
    if (clientX === undefined) return;
    
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    
    // Limit to range 1-10
    const cappedValue = Math.max(1, Math.min(10, newValue));
    this.updateBrightnessValue(cappedValue * 25.5);
  }

  handleBrightnessDragEnd(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    this.isDraggingBrightness = false;
    this.removeBrightnessDragListeners();
  }

  removeBrightnessDragListeners() {
    document.removeEventListener('mousemove', this.handleBrightnessDrag);
    document.removeEventListener('mouseup', this.handleBrightnessDragEnd);
    document.removeEventListener('touchmove', this.handleBrightnessDrag);
    document.removeEventListener('touchend', this.handleBrightnessDragEnd);
  }

  updateBrightnessValue(value) {
    this.visualBrightness = value;
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

  handleSettingsIconTouchStart(e) {
    e.stopPropagation();
    // Clear any existing timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    // Set new timer for long press
    this.longPressTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('debugToggle', {
        bubbles: true,
        composed: true,
      }));
      this.longPressTimer = null;
    }, LONG_PRESS_TIMEOUT);
  }

  handleSettingsIconTouchEnd(e) {
    e.stopPropagation();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  handleOverlayToggle(shouldShow) {
    this.dispatchEvent(new CustomEvent('overlayToggle', {
      detail: shouldShow,
      bubbles: true,
      composed: true,
    }));
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
              @mousedown="${this.handleBrightnessDragStart}"
              @touchstart="${this.handleBrightnessDragStart}"
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
              @mousedown="${this.handleSettingsIconTouchStart}"
              @mouseup="${this.handleSettingsIconTouchEnd}"
              @mouseleave="${this.handleSettingsIconTouchEnd}"
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
