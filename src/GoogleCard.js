// src/GoogleCard.js
import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from './styles/shared.js';
import './components/BackgroundRotator.js';
import './components/WeatherDisplay.js';
import './components/NightMode.js';
import './components/Controls.js';
import { DEFAULT_CONFIG } from './constants.js';

export class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      error: { type: String },
      debugInfo: { type: Object },
      showDebugInfo: { type: Boolean },
      isNightMode: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.error = null;
    this.debugInfo = {};
    this.showDebugInfo = false;
    this.isNightMode = false;
  }

  static get styles() {
    return sharedStyles;
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
  }

  renderDebugInfo() {
    if (!this.showDebugInfo) return null;

    return html`
      <div class="debug-info">
        <h2>Background Card Debug Info</h2>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }

  render() {
    if (this.isNightMode) {
      return html`
        <night-mode
          .currentTime="${new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).replace(/\s?[AP]M/, '')}">
        </night-mode>
      `;
    }

    return html`
      <background-rotator
        .config="${this.config}">
      </background-rotator>
      
      <weather-display
        .hass="${this.hass}">
      </weather-display>
      
      <google-controls
        .hass="${this.hass}">
      </google-controls>

      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.renderDebugInfo()}
    `;
  }
}

customElements.define('google-card', GoogleCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'google-card',
    name: 'Google Card',
    description: 'A Google Nest Hub-inspired card for Home Assistant',
    preview: true,
    documentationURL: 'https://github.com/liamtw22/google-card'
});

