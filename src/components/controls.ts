// src/components/controls.ts

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../types';
import { GoogleCardConfig } from '../types/card-config';
import { sharedStyles } from '../styles/shared-styles';
import { 
  LONG_PRESS_TIMEOUT, 
  MIN_BRIGHTNESS, 
  MAX_BRIGHTNESS 
} from '../constants';

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
        pointer-events: auto;
        touch-action: none;
      }

      .overlay.transitioning {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .overlay.visible {
        transform: translateY(0);
        opacity: 1;
      }

      .overlay-content {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        padding: 0 20px;
      }

      .control-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 10px;
        border-radius: 12px;
        transition: background-color 0.2s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }

      .control-item:active {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .control-icon {
        width: 32px;
        height: 32px;
        color: var(--control-text-color);
      }

      .control-label {
        font-size: 12px;
        color: var(--control-text-color);
      }

      .brightness-card {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(calc(100% + 40px));
        width: 90%;
        max-width: 400px;
        background-color: var(--overlay-background);
        -webkit-backdrop-filter: blur(var(--background-blur));
        backdrop-filter: blur(var(--background-blur));
        border-radius: 20px;
        padding: 24px;
        box-sizing: border-box;
        opacity: 0;
        transition: none;
        z-index: 1002;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
        touch-action: none;
      }

      .brightness-card.transitioning {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .brightness-card.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .brightness-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .brightness-icon {
        width: 24px;
        height: 24px;
        color: var(--control-text-color);
      }

      .brightness-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--control-text-color);
      }

      .brightness-dots {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        touch-action: none;
        cursor: pointer;
      }

      .brightness-dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--brightness-dot-color);
        transition: background-color 0.2s ease, transform 0.1s ease;
      }

      .brightness-dot.active {
        background-color: var(--brightness-dot-active);
      }

      .brightness-dot:active {
        transform: scale(1.2);
      }

      .brightness-value {
        text-align: center;
        margin-top: 12px;
        font-size: 14px;
        color: var(--control-text-color);
        opacity: 0.7;
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

  private _handleBrightnessInteraction(e: MouseEvent | TouchEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX =
      e instanceof TouchEvent
        ? e.touches[0]?.clientX || (e as TouchEvent).changedTouches[0]?.clientX
        : e.clientX;

    if (clientX === undefined) return;

    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = relativeX / rect.width;

    // Map to 0-10 scale then convert to 0-255
    const dotValue = Math.round(percentage * 10);
    const newBrightness = Math.round(dotValue * 25.5);

    // Set as user-defined brightness
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
        .catch((err) => {
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
      <div class="controls-container">
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
      <div class="${overlayClasses}">
        <div class="overlay-content">
          <div
            class="control-item"
            @click=${this._toggleBrightnessCard}
            @touchstart=${this._toggleBrightnessCard}
          >
            <iconify-icon
              class="control-icon"
              icon="mdi:brightness-6"
            ></iconify-icon>
            <span class="control-label">Brightness</span>
          </div>
          <div
            class="control-item"
            @mousedown=${this._handleSettingsLongPressStart}
            @mouseup=${this._handleSettingsLongPressEnd}
            @mouseleave=${this._handleSettingsLongPressEnd}
            @touchstart=${this._handleSettingsLongPressStart}
            @touchend=${this._handleSettingsLongPressEnd}
            @touchcancel=${this._handleSettingsLongPressEnd}
          >
            <iconify-icon
              class="control-icon"
              icon="mdi:cog"
            ></iconify-icon>
            <span class="control-label">Settings</span>
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
      <div class="${brightnessClasses}">
        <div class="brightness-header">
          <iconify-icon
            class="brightness-icon"
            icon="mdi:brightness-6"
          ></iconify-icon>
          <span class="brightness-title">Display Brightness</span>
        </div>
        <div
          class="brightness-dots"
          @click=${this._handleBrightnessInteraction}
          @touchstart=${this._handleBrightnessInteraction}
          @touchmove=${this._handleBrightnessInteraction}
        >
          ${Array.from({ length: 11 }, (_, i) => {
            const isActive = i <= displayValue;
            return html`
              <div class="brightness-dot ${isActive ? 'active' : ''}"></div>
            `;
          })}
        </div>
        <div class="brightness-value">${displayValue}/10</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'google-controls': Controls;
  }
}
