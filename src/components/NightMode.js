// src/components/NightMode.js
import { LitElement, html } from 'lit-element';
import { nightModeStyles } from '../styles/nightMode.js';
import { 
  TIME_FORMAT_OPTIONS, 
  BRIGHTNESS,
  TIMING 
} from '../constants.js';

export class NightMode extends LitElement {
  static get properties() {
    return {
      currentTime: { type: String },
      brightness: { type: Number },
      isAnimating: { type: Boolean },
      error: { type: String }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.currentTime = this.formatTime(new Date());
    this.brightness = BRIGHTNESS.NIGHT_MODE;
    this.isAnimating = false;
    this.error = null;
    this.updateTimer = null;
    this.fadeTimer = null;
  }

  static get styles() {
    return nightModeStyles;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startTimeUpdate();
    this.startFadeAnimation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimeUpdate();
    this.stopFadeAnimation();
  }

  startTimeUpdate() {
    // Initial update
    this.updateTime();

    // Set up interval for updates
    this.updateTimer = setInterval(() => {
      this.updateTime();
    }, 1000); // Update every second
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
    }, TIMING.NIGHT_MODE_TRANSITION_DELAY * 20); // Slow pulse animation
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
    return date.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS)
      .replace(/\s?[AP]M/, ''); // Remove AM/PM
  }

  // Touch event handlers
  handleTouchStart(e) {
    // Store the initial touch position
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.touchStartY) return;

    const currentY = e.touches[0].clientY;
    const deltaY = this.touchStartY - currentY;

    // If user has swiped up significantly, emit event
    if (deltaY > 50) { // 50px threshold
      this.dispatchEvent(new CustomEvent('exit-night-mode', {
        bubbles: true,
        composed: true
      }));
    }
  }

  handleTouchEnd() {
    // Reset touch tracking
    this.touchStartY = null;
  }

  // Animation helpers
  getAnimationClass() {
    return this.isAnimating ? 'fade-dim' : '';
  }

  // Render helper methods
  renderTime() {
    return html`
      <div class="night-time ${this.getAnimationClass()}">
        ${this.currentTime}
      </div>
    `;
  }

  renderError() {
    if (!this.error) return null;

    return html`
      <div class="error-message">
        ${this.error}
      </div>
    `;
  }

  render() {
    return html`
      <div class="night-mode"
           @touchstart="${this.handleTouchStart}"
           @touchmove="${this.handleTouchMove}"
           @touchend="${this.handleTouchEnd}">
        ${this.renderTime()}
        ${this.renderError()}
      </div>
    `;
  }

  // Public methods
  setBrightness(value) {
    this.brightness = Math.max(BRIGHTNESS.MIN, Math.min(BRIGHTNESS.NIGHT_MODE, value));
    this.requestUpdate();
  }

  // Force an immediate time update
  forceUpdate() {
    this.updateTime();
  }

  // Toggle the fade animation
  toggleAnimation() {
    if (this.fadeTimer) {
      this.stopFadeAnimation();
    } else {
      this.startFadeAnimation();
    }
  }

  // Method to handle errors
  handleError(error) {
    this.error = error.message;
    this.requestUpdate();

    // Emit error event
    const errorEvent = new CustomEvent('night-mode-error', {
      detail: { error },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(errorEvent);
  }
}

customElements.define('night-mode', NightMode);