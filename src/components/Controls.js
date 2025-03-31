// src/components/Controls.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

import { LONG_PRESS_TIMEOUT, MIN_BRIGHTNESS, MAX_BRIGHTNESS } from '../constants';
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
      longPressTimer: { type: Object },
      userSetBrightness: { type: Number }, // Track the brightness value set by the user
      hasUserSetBrightness: { type: Boolean }, // Flag to check if user has set a value
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
          height: 50px; /* Reduced from 70px */
          background-color: var(--overlay-background);
          -webkit-backdrop-filter: blur(var(--background-blur));
          backdrop-filter: blur(var(--background-blur));
          color: var(--control-text-color);
          border-radius: 20px;
          padding: 25px 25px; /* Reduced from 40px 20px */
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
          font-size: 36px; /* Slightly reduced from 40px */
          color: var(--control-text-color);
          font-weight: 300;
          margin-right: 20px;
          pointer-events: none;
          font-family: 'Product Sans Regular', sans-serif;
        }

        iconify-icon {
          font-size: 50px;
          width: 50px;
          height: 50px;
          display: block !important;
          color: var(--control-text-color) !important;
          pointer-events: none;
          fill: currentColor;
          visibility: visible !important;
          opacity: 1 !important;
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
            padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
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
            padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
            margin-bottom: env(safe-area-inset-bottom, 0);
          }
        }

        /* Added explicit dark mode support */
        :host([data-theme="dark"]) {
          --overlay-background: rgba(32, 33, 36, 0.95);
          --control-text-color: #ffffff;
          --brightness-dot-color: #5f6368;
          --brightness-dot-active: #ffffff;
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
    this.userSetBrightness = null; // Initialize user brightness to null
    this.hasUserSetBrightness = false; // Initialize flag to false
    
    // Bind methods to preserve 'this' context
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this);
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
  }

  firstUpdated() {
    // Force a re-render to ensure dark mode styles are applied
    this.requestUpdate();
    
    // Apply theme attribute for better dark mode detection
    this.syncDarkMode();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
  }

  updated(changedProperties) {
    // Update from the entity if needed
    if (changedProperties.has('hass') && this.hass) {
      this.updateFromEntity();
    }
    
    // Ensure proper dark mode
    this.syncDarkMode();
  }
  
  // New method to sync dark mode state
  syncDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      this.shadowRoot.host.setAttribute('data-theme', 'dark');
    } else {
      this.shadowRoot.host.setAttribute('data-theme', 'light');
    }
  }
  
  // Update from entity only in specific conditions
  updateFromEntity() {
    const brightnessEntity = 'number.liam_display_screen_brightness';
    if (!this.hass.states[brightnessEntity]) return;
    
    // Get the sensor brightness value
    const entityValue = parseFloat(this.hass.states[brightnessEntity].state);
    if (isNaN(entityValue)) return;
    
    // Only update internally tracked brightness
    this.brightness = entityValue;
    
    // Check if we should update visual brightness
    if (!this.hasUserSetBrightness) {
      // No user set brightness yet, just use the sensor value
      this.visualBrightness = entityValue;
    } else {
      // User has set brightness before, check if sensor matches
      const userSetDisplayValue = Math.round(this.userSetBrightness / 25.5);
      const sensorDisplayValue = Math.round(entityValue / 25.5);
      
      // Only update visual if sensor now matches the user-set value (on 0-10 scale)
      if (userSetDisplayValue === sensorDisplayValue) {
        this.visualBrightness = entityValue;
        // Reset user flags since sensor is now in sync
        this.hasUserSetBrightness = false;
        this.userSetBrightness = null;
      }
    }
    
    this.requestUpdate();
  }

  // Updated brightness change handler with user tracking
  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const dotValue = parseInt(clickedDot.dataset.value);
    
    // Convert from 1-10 scale to 0-255 scale
    const newBrightness = Math.round(dotValue * 25.5);
    
    // Set as user-defined brightness
    this.userSetBrightness = newBrightness;
    this.hasUserSetBrightness = true;
    
    // Update the brightness value
    this.updateBrightnessValue(newBrightness);
  }

  // Updated drag handler to track user values
  handleBrightnessDrag(e) {
    e.stopPropagation();
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    const container = this.shadowRoot.querySelector('.brightness-dots');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.type.includes('touch') 
      ? (e.touches[0]?.clientX || e.changedTouches[0]?.clientX) 
      : e.clientX;
      
    if (clientX === undefined) return;
    
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = relativeX / rect.width;
    
    // Map to 0-10 scale then convert to 0-255
    const dotValue = Math.round(percentage * 10);
    const newBrightness = Math.round(dotValue * 25.5);
    
    // Set as user-defined brightness
    this.userSetBrightness = newBrightness;
    this.hasUserSetBrightness = true;
    
    // Update the value
    this.isAdjustingBrightness = true;
    this.updateBrightnessValue(newBrightness);
    
    // Reset adjustment flag after a delay
    setTimeout(() => {
      this.isAdjustingBrightness = false;
    }, 300);
  }

  // Updated value update for better handling
  updateBrightnessValue(value) {
    // Ensure the value is within brightness range
    const brightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
    // Update local visual state immediately
    this.visualBrightness = brightness;
    
    // Update the Home Assistant entity
    if (this.hass) {
      this.hass.callService('number', 'set_value', {
        entity_id: 'number.liam_display_screen_brightness',
        value: brightness
      }).catch(err => {
        console.error('Error updating brightness:', err);
      });
    }
    
    // Dispatch the events for parent components
    this.dispatchEvent(new CustomEvent('brightnessChange', {
      detail: brightness,
      bubbles: true,
      composed: true,
    }));
    
    this.dispatchEvent(new CustomEvent('brightnessChangeComplete', {
      detail: brightness,
      bubbles: true,
      composed: true,
    }));
    
    this.requestUpdate();
  }

  // Get the brightness value for display (0-10 scale)
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

  // Render 10 dots without filling any when brightness is 0
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
              @mousedown="${this.handleBrightnessDrag}"
              @mousemove="${(e) => e.buttons === 1 && this.handleBrightnessDrag(e)}"
              @touchstart="${this.handleBrightnessDrag}"
              @touchmove="${this.handleBrightnessDrag}"
            >
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                (value) => html`
                  <div
                    class="brightness-dot ${value <= brightnessDisplayValue && brightnessDisplayValue !== 0 ? 'active' : ''}"
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
    // Ensure proper dark mode application
    this.syncDarkMode();
    
    return html`
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ''}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ''}
      </div>
    `;
  }
}
customElements.define('google-controls', Controls);
