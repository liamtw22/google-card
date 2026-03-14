// src/components/controls.ts

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../types';
import { GoogleCardConfig } from '../types/card-config';
import { sharedStyles } from '../styles/shared-styles';
import { LONG_PRESS_TIMEOUT, MIN_BRIGHTNESS, MAX_BRIGHTNESS } from '../constants';

// Import iconify for icons
import 'https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js';

@customElement('google-controls')
export class Controls extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: GoogleCardConfig;
  @property({ type: Boolean }) public showOverlay = false;
  @property({ type: Boolean }) public isOverlayVisible = false;
  @property({ type: Boolean }) public isOverlayTransitioning = false;
  @property({ type: Boolean }) public showBrightnessCard = false;
  @property({ type: Boolean }) public isBrightnessCardVisible = false;
  @property({ type: Boolean }) public isBrightnessCardTransitioning = false;
  @property({ type: Number }) public brightness = 128;
  @property({ type: Number }) public visualBrightness = 128;
  @property({ type: Boolean }) public isAdjustingBrightness = false;

  @state() private _longPressTimer?: number;
  @state() private _userSetBrightness?: number;
  @state() private _hasUserSetBrightness = false;

  static styles = [
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

      .overlay.visible {
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
        justify-content: space-evenly;
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
        height: 50px;
        background-color: var(--overlay-background);
        -webkit-backdrop-filter: blur(var(--background-blur));
        backdrop-filter: blur(var(--background-blur));
        color: var(--control-text-color);
        border-radius: 20px;
        padding: 25px 25px;
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

      .brightness-card.visible {
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
        cursor: pointer;
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
        font-size: 36px;
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

      /* Explicit dark mode support */
      :host([data-theme='dark']) {
        --overlay-background: rgba(32, 33, 36, 0.95);
        --control-text-color: #ffffff;
        --brightness-dot-color: #5f6368;
        --brightness-dot-active: #ffffff;
      }
    `,
  ];

  private _handleSettingsLongPressStart(): void {
    this._longPressTimer = window.setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('debugToggle', {
          detail: true,
          bubbles: true,
          composed: true,
        })
      );
    }, LONG_PRESS_TIMEOUT);
  }

  private _handleSettingsLongPressEnd(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = undefined;
    }
  }

  private _handleBrightnessClick(e: MouseEvent): void {
    e.stopPropagation();
    const clickedDot = (e.target as HTMLElement).closest('.brightness-dot') as HTMLElement | null;
    if (!clickedDot) return;

    const dotValue = parseInt(clickedDot.dataset.value || '0');
    const newBrightness = Math.round(dotValue * 25.5);

    this._userSetBrightness = newBrightness;
    this._hasUserSetBrightness = true;
    this._updateBrightnessValue(newBrightness);
  }

  private _handleBrightnessDrag(e: MouseEvent | TouchEvent): void {
    e.stopPropagation();
    if (e.type.includes('touch')) {
      (e as Event).preventDefault();
    }

    const container = this.shadowRoot?.querySelector('.brightness-dots') as HTMLElement | null;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX =
      e instanceof TouchEvent
        ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX
        : (e as MouseEvent).clientX;

    if (clientX === undefined) return;

    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = relativeX / rect.width;
    const dotValue = Math.round(percentage * 10);
    const newBrightness = Math.round(dotValue * 25.5);

    this._userSetBrightness = newBrightness;
    this._hasUserSetBrightness = true;
    this._updateBrightnessValue(newBrightness);
  }

  private _updateBrightnessValue(value: number): void {
    const brightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));

    // Update local visual state immediately
    this.visualBrightness = brightness;

    // Update the Home Assistant entity
    if (this.hass && this.config.brightness_control_entity) {
      this.hass
        .callService('number', 'set_value', {
          entity_id: this.config.brightness_control_entity,
          value: brightness,
        })
        .catch((err: Error) => {
          console.error('Error updating brightness:', err);
        });
    }

    // Dispatch events for parent components
    this.dispatchEvent(
      new CustomEvent('brightnessChange', {
        detail: brightness,
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent('brightnessChangeComplete', {
        detail: brightness,
        bubbles: true,
        composed: true,
      })
    );

    this.requestUpdate();
  }

  private _getBrightnessDisplayValue(): number {
    return Math.round(this.visualBrightness / 25.5);
  }

  private _toggleBrightnessCard(e?: Event): void {
    if (e) {
      e.stopPropagation();
    }

    this.dispatchEvent(
      new CustomEvent('brightnessCardToggle', {
        detail: !this.showBrightnessCard,
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls-container" @touchstart=${(e: Event) => e.stopPropagation()}>
        ${this.showOverlay ? this._renderOverlay() : nothing}
        ${this.showBrightnessCard ? this._renderBrightnessCard() : nothing}
      </div>
    `;
  }

  private _renderOverlay(): TemplateResult {
    const overlayClasses = [
      'overlay',
      this.isOverlayTransitioning ? 'transitioning' : '',
      this.isOverlayVisible ? 'visible' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${overlayClasses}" @click=${(e: Event) => e.stopPropagation()}>
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click=${(e: Event) => this._toggleBrightnessCard(e)}>
              <iconify-icon
                icon="material-symbols-light:sunny-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button">
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
              @touchstart=${() => this._handleSettingsLongPressStart()}
              @touchend=${() => this._handleSettingsLongPressEnd()}
              @touchcancel=${() => this._handleSettingsLongPressEnd()}
              @mousedown=${() => this._handleSettingsLongPressStart()}
              @mouseup=${() => this._handleSettingsLongPressEnd()}
              @mouseleave=${() => this._handleSettingsLongPressEnd()}
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

  private _renderBrightnessCard(): TemplateResult {
    const brightnessClasses = [
      'brightness-card',
      this.isBrightnessCardTransitioning ? 'transitioning' : '',
      this.isBrightnessCardVisible ? 'visible' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const displayValue = this._getBrightnessDisplayValue();

    return html`
      <div class="${brightnessClasses}" @click=${(e: Event) => e.stopPropagation()}>
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div
              class="brightness-dots"
              @click=${(e: MouseEvent) => this._handleBrightnessClick(e)}
              @mousedown=${(e: MouseEvent) => this._handleBrightnessDrag(e)}
              @mousemove=${(e: MouseEvent) => {
                if (e.buttons === 1) this._handleBrightnessDrag(e);
              }}
              @touchstart=${(e: TouchEvent) => this._handleBrightnessDrag(e)}
              @touchmove=${(e: TouchEvent) => this._handleBrightnessDrag(e)}
            >
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                (value) => html`
                  <div
                    class="brightness-dot ${value <= displayValue && displayValue !== 0
                      ? 'active'
                      : ''}"
                    data-value="${value}"
                  ></div>
                `
              )}
            </div>
          </div>
          <span class="brightness-value">${displayValue}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'google-controls': Controls;
  }
}
