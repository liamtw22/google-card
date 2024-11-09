import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { DEFAULT_CONFIG } from "./constants.js";

import { sharedStyles } from "./styles/SharedStyles.js";

import "./components/BackgroundRotator.js";

import "./components/Controls.js";

import "./components/NightMode.js";

import "./components/WeatherClock.js";

class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      screenWidth: {
        type: Number
      },
      screenHeight: {
        type: Number
      },
      showDebugInfo: {
        type: Boolean
      },
      showOverlay: {
        type: Boolean
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
      },
      showBrightnessCard: {
        type: Boolean
      },
      brightnessCardTransition: {
        type: String
      },
      isNightMode: {
        type: Boolean
      },
      currentTime: {
        type: String
      },
      isInNightMode: {
        type: Boolean
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      lastBrightnessUpdateTime: {
        type: Number
      }
    };
  }
  static get styles() {
    return [ sharedStyles ];
  }
  constructor() {
    super(), this.initializeProperties(), this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }
  initializeProperties() {
    this.showDebugInfo = !1, this.showOverlay = !1, this.isNightMode = !1, this.showBrightnessCard = !1, 
    this.brightnessCardTransition = "none", this.isAdjustingBrightness = !1, this.lastBrightnessUpdateTime = 0, 
    this.updateScreenSize();
  }
  setConfig(config) {
    if (!config.image_url) throw new Error("You need to define an image_url");
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }, this.showDebugInfo = this.config.show_debug;
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("resize", this.boundUpdateScreenSize);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("resize", this.boundUpdateScreenSize);
  }
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio), this.screenHeight = Math.round(window.innerHeight * pixelRatio);
  }
  async handleBrightnessChange(newBrightness) {
    await this.controls.updateBrightnessValue(newBrightness);
  }
  handleOverlayToggle(show) {
    this.showOverlay = show, this.requestUpdate();
  }
  handleBrightnessCardToggle(show) {
    this.showBrightnessCard = show, this.requestUpdate();
  }
  handleNightModeChange(isNightMode) {
    this.isNightMode = isNightMode, this.requestUpdate();
  }
  handleDebugToggle() {
    this.showDebugInfo = !this.showDebugInfo, this.requestUpdate();
  }
  render() {
    return this.isNightMode ? html` <night-mode .currentTime=${this.currentTime}></night-mode> ` : html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
        .showDebugInfo=${this.showDebugInfo}
      ></background-rotator>

      <weather-clock .hass=${this.hass}></weather-clock>

      <controls
        .hass=${this.hass}
        .showOverlay=${this.showOverlay}
        .showBrightnessCard=${this.showBrightnessCard}
        .brightnessCardTransition=${this.brightnessCardTransition}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        @brightnessChange=${e => this.handleBrightnessChange(e.detail)}
        @overlayToggle=${e => this.handleOverlayToggle(e.detail)}
        @brightnessCardToggle=${e => this.handleBrightnessCardToggle(e.detail)}
        @debugToggle=${() => this.handleDebugToggle()}
      ></controls>
    `;
  }
}

customElements.define("google-card", GoogleCard), window.customCards = window.customCards || [], 
window.customCards.push({
  type: "google-card",
  name: "Google Card",
  description: "A Google Nest Hub-inspired card for Home Assistant",
  preview: !0,
  documentationURL: "https://github.com/liamtw22/google-card"
});

export { GoogleCard };
//# sourceMappingURL=GoogleCard.js.map
