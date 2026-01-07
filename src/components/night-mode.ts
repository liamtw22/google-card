// src/components/night-mode.ts

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../types';
import { GoogleCardConfig, NightModeSource } from '../types/card-config';
import { sharedStyles } from '../styles/shared-styles';

@customElement('night-mode')
export class NightMode extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: GoogleCardConfig;
  @property({ type: String }) public currentTime = '';
  @property({ type: Number }) public brightness = 0;
  @property({ type: Boolean }) public isInNightMode = false;
  @property({ type: Number }) public previousBrightness = 128;
  @property({ type: String }) public nightModeSource: NightModeSource = null;

  @state() private _isTransitioning = false;
  @state() private _error: string | null = null;
  @state() private _animationActive = false;

  private _timeUpdateInterval?: number;

  static styles = [
    sharedStyles,
    css`
      .night-mode {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 5;
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .night-mode.animate-entry {
        animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes slideInFromLeft {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }

      .night-time {
        color: white;
        font-size: 35vw;
        font-weight: 400;
        font-family: 'Product Sans Regular', sans-serif;
      }

      .night-hint {
        position: absolute;
        bottom: 40px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 14px;
        font-weight: 400;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._updateTime();
    this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1000);

    // Trigger entry animation
    this._animationActive = true;
    setTimeout(() => {
      this._animationActive = false;
    }, 300);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timeUpdateInterval) {
      clearInterval(this._timeUpdateInterval);
    }
  }

  private _updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/\s?(AM|PM)$/i, '');
    this.requestUpdate();
  }

  private _handleTap(): void {
    this.dispatchEvent(
      new CustomEvent('nightModeExit', {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    const nightModeClasses = [
      'night-mode',
      this._animationActive ? 'animate-entry' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div
        class="${nightModeClasses}"
        @click=${this._handleTap}
        @touchstart=${this._handleTap}
      >
        <div class="night-time">${this.currentTime}</div>
        <div class="night-hint">Tap to wake</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'night-mode': NightMode;
  }
}
