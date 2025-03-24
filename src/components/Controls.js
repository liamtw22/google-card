// src/components/Controls.js
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module';
import { MIN_BRIGHTNESS, MAX_BRIGHTNESS, LONG_PRESS_TIMEOUT } from '../constants';
import { sharedStyles } from '../styles/SharedStyles';

export class Controls extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      showOverlay: { type: Boolean },
      isOverlayVisible: { type: Boolean },
      isOverlayTransitioning: { type: Boolean },
      showBrightnessCard: { type: Boolean },
      isBrightnessCardVisible: { type: Boolean },
      isBrightnessCardTransitioning: { type: Boolean },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      isDraggingBrightness: { type: Boolean }
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .controls-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 1000;
          touch-action: none;
        }

        .overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: var(--overlay-height);
          background-color: var(--overlay-background);
          -webkit-backdrop-filter: blur(var(--background-blur));
          backdrop-filter: blur(var(--background-blur));
          color: var(--control-text-color);
          box-sizing: border-box;
          transform: translateY(calc(100% + 20px));
          opacity: 0;
          transition: none;
          z-index: 1001;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          pointer-events: auto;
          touch-action: none;
          will-change: transform, opacity;
        }

        .overlay.transitioning {
          transition: 
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .overlay.show {
          transform: translateY(0);
          opacity: 1;
        }

        .icon-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: auto;
        }

        .icon-row {
          display: flex;
          justify-content: space-evenly; /* Ensures icons are spaced evenly */
          align-items: center;
          width: 95%;
          pointer-events: auto;
        }

        .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--control-text-color);
          padding: 10px;
          border-radius: 50%;
          transition: 
            background-color 0.2s ease,
            transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          touch-action: none;
          width: 60px;
          height: 60px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .icon-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .icon-button:active {
          background-color: rgba(0, 0, 0, 0.2);
          transform: scale(0.95);
        }

        .brightness-card {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 70px;
          background-color: var(--overlay-background);
          -webkit-backdrop-filter: blur(var(--background-blur));
          backdrop-filter: blur(var(--background-blur));
          color: var(--control-text-color);
          border-radius: 20px;
          padding: 40px 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1002;
          transform: translateY(calc(100% + 20px));
          opacity: 0;
          transition: none;
          pointer-events: auto;
          touch-action: none;
          will-change: transform, opacity;
        }

        .brightness-card.transitioning {
          transition: 
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .brightness-card.show {
          transform: translateY(0);
          opacity: 1;
        }

        .brightness-control {
          display: flex;
          align-items: center;
          width: 100%;
          pointer-events: auto;
          height: 100%;
        }

        .brightness-dots-container {
          flex-grow: 1;
          margin-right: 10px;
          padding: 0 10px;
          pointer-events: auto;
        }

        .brightness-dots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
          pointer-events: auto;
          touch-action: none;
          padding: 10px 0;
        }

        .brightness-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--brightness-dot-color);
          transition: 
            background-color 0.2s ease,
            transform 0.2s ease;
          cursor: pointer;
          pointer-events: auto;
        }

        .brightness-dot:hover {
          transform: scale(1.2);
        }

        .brightness-dot.active {
          background-color: var(--brightness-dot-active);
        }

        .brightness-value {
          min-width: 60px;
          text-align: right;
          font-size: 40px;
          color: var(--control-text-color);
          font-weight: 300;
          margin-right: 20px;
          pointer-events: none;
          font-family: 'Rubik', sans-serif;
        }

        iconify-icon {
          font-size: 50px;
          width: 50px;
          height: 50px;
          display: block;
          color: var(--control-text-color);
          pointer-events: none;
        }

        /* iOS specific adjustments */
        @supports (-webkit-touch-callout: none) {
          .controls-container {
            padding-bottom: env(safe-area-inset-bottom, 0);
          }

          .overlay {
            padding-bottom: env(safe-area-inset-bottom, 0);
            height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
          }

          .brightness-card {
            padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
            margin-bottom: env(safe-area-inset-bottom, 0);
          }
        }

        /* PWA standalone mode adjustments */
        @media (display-mode: standalone) {
          .controls-container {
            padding-bottom: env(safe-area-inset-bottom, 0);
          }

          .overlay {
            padding-bottom: env(safe-area-inset-bottom, 0);
            height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
          }

          .brightness-card {
            padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
            margin-bottom: env(safe-area-inset-bottom, 0);
          }
        }
      `
    ];
  }

  constructor() {
    super();
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
    
    // Bind methods to preserve 'this' context
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDragStart = this.handleBrightnessDragStart.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleBrightnessDragEnd = this.handleBrightnessDragEnd.bind(this);
    this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this);
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
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
    
    // Add global event listeners
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

  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    
    return html`
      <div
        class="brightness-card ${this.isBrightnessCardVisible ? 'show' : ''} ${this.isBrightnessCardTransitioning ? 'transitioning' : ''}"
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
        class="overlay ${this.isOverlayVisible ? 'show' : ''} ${this.isOverlayTransitioning ? 'transitioning' : ''}"
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
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ''}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ''}
      </div>
    `;
  }
}
customElements.define('controls', Controls);
