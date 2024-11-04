// src/components/NightMode.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from '../styles/shared.js';
import { TIME_FORMAT_OPTIONS, BRIGHTNESS, TIMING } from '../constants.js';

export class NightMode extends LitElement {
  static get properties() {
    return {
      currentTime: { type: String },
      brightness: { type: Number },
      isAnimating: { type: Boolean },
      error: { type: String },
      touchStartY: { type: Number },
      updateTimer: { type: Object },
      fadeTimer: { type: Object }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }

  initializeProperties() {
    this.currentTime = this.formatTime(new Date());
    this.brightness = BRIGHTNESS.NIGHT_MODE;
    this.isAnimating = false;
    this.error = null;
    this.touchStartY = null;
    this.updateTimer = null;
    this.fadeTimer = null;
  }

  bindMethods() {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.updateTime = this.updateTime.bind(this);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: black;
        z-index: 1000;
        font-family: 'Product Sans Regular', 'Rubik', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .night-mode {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: black;
        transition: background-color 0.5s ease-in-out;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .night-time {
        color: white;
        font-size: 35vw;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        opacity: 0.7;
        transition: opacity 2s ease-in-out, font-size 0.3s ease-in-out;
        margin: 0;
        padding: 0;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
      }

      .night-time.fade-dim {
        opacity: 0.4;
      }

      .error-message {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 59, 48, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        text-align: center;
        max-width: 80%;
      }

      .error-message.visible {
        opacity: 1;
      }

      .touch-indicator {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        background: radial-gradient(
          circle at var(--touch-x, 50%) var(--touch-y, 50%),
          rgba(255, 255, 255, 0.1) 0%,
          transparent 60%
        );
      }

      .touch-indicator.active {
        opacity: 1;
      }

      .swipe-hint {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.3);
        font-size: 16px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }

      .swipe-hint.visible {
        opacity: 1;
        animation: fadeInOut 3s infinite;
      }

      @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }

      @media (max-width: 768px) {
        .night-time {
          font-size: 45vw;
        }
      }

      @media (max-width: 480px) {
        .night-time {
          font-size: 55vw;
        }
        
        .swipe-hint {
          bottom: 30px;
          font-size: 14px;
        }
      }

      @media (max-height: 480px) {
        .night-time {
          font-size: 25vh;
        }
      }

      @media (prefers-contrast: more) {
        .night-time {
          opacity: 1;
          text-shadow: none;
        }

        .night-time.fade-dim {
          opacity: 0.8;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .night-time,
        .night-time.fade-dim,
        .swipe-hint {
          transition: none;
          animation: none;
        }
      }

      @media (orientation: landscape) and (max-height: 500px) {
        .night-time {
          font-size: 25vh;
        }

        .swipe-hint {
          bottom: 20px;
        }
      }

      @media print {
        .night-mode {
          background-color: white !important;
        }

        .night-time {
          color: black !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        .swipe-hint,
        .error-message,
        .touch-indicator {
          display: none !important;
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
    this.startTimeUpdate();
    this.startFadeAnimation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.stopTimeUpdate();
    this.stopFadeAnimation();
  }

  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }

  cleanupEventListeners() {
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  startTimeUpdate() {
    this.updateTime();
    this.updateTimer = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  stopTimeUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  startFadeAnimation() {
    this.fadeTimer = setInterval(() => {
      this.isAnimating = !this.isAnimating;
      this.requestUpdate();
    }, TIMING.NIGHT_MODE_TRANSITION_DELAY * 20);
  }

  stopFadeAnimation() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  updateTime() {
    try {
      const now = new Date();
      this.currentTime = this.formatTime(now);
      this.error = null;
    } catch (error) {
      console.error('Error updating time:', error);
      this.error = 'Error updating time';
    }
    this.requestUpdate();
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, '');
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
    
    // Update touch indicator position
    const touchIndicator = this.shadowRoot.querySelector('.touch-indicator');
    if (touchIndicator) {
      touchIndicator.style.setProperty('--touch-x', `${e.touches[0].clientX}px`);
      touchIndicator.style.setProperty('--touch-y', `${e.touches[0].clientY}px`);
      touchIndicator.classList.add('active');
    }
  }

  handleTouchMove(e) {
    if (!this.touchStartY) return;

    const currentY = e.touches[0].clientY;
    const deltaY = this.touchStartY - currentY;

    if (deltaY > 50) {
      this.dispatchEvent(
        new CustomEvent('exit-night-mode', {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  handleTouchEnd() {
    this.touchStartY = null;
    
    // Remove touch indicator
    const touchIndicator = this.shadowRoot.querySelector('.touch-indicator');
    if (touchIndicator) {
      touchIndicator.classList.remove('active');
    }
  }

  setBrightness(value) {
    this.brightness = Math.max(BRIGHTNESS.MIN, Math.min(BRIGHTNESS.NIGHT_MODE, value));
    this.requestUpdate();
  }

  toggleAnimation() {
    if (this.fadeTimer) {
      this.stopFadeAnimation();
    } else {
      this.startFadeAnimation();
    }
  }

  handleError(error) {
    this.error = error.message;
    this.requestUpdate();
    
    const errorEvent = new CustomEvent('night-mode-error', {
      detail: { error },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(errorEvent);
  }

  render() {
    return html`
      <div class="night-mode"
           @touchstart="${this.handleTouchStart}"
           @touchmove="${this.handleTouchMove}"
           @touchend="${this.handleTouchEnd}">
        <div class="night-time ${this.isAnimating ? 'fade-dim' : ''}">${this.currentTime}</div>
        <div class="touch-indicator"></div>
        <div class="swipe-hint ${!this.error ? 'visible' : ''}">Swipe up to exit night mode</div>
        ${this.error ? html`<div class="error-message visible">${this.error}</div>` : ''}
      </div>
    `;
  }

  // Public methods for external control
  forceUpdate() {
    this.updateTime();
  }

  updateTimeDisplay() {
    this.updateTime();
  }

  setNightBrightness(value) {
    this.setBrightness(value);
  }

  toggleFadeAnimation() {
    this.toggleAnimation();
  }
}

customElements.define('night-mode', NightMode);
