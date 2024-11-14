import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

const DEFAULT_CONFIG = {
  image_url: "",
  display_time: 15,
  crossfade_time: 3,
  image_fit: "contain",
  image_list_update_interval: 3600,
  image_order: "sorted",
  show_debug: !1,
  sensor_update_delay: 500
}, sharedStyles = css`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    font-family: 'Product Sans Regular', sans-serif;
    font-weight: 400;
  }
`, backgroundRotatorStyles = css`
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    transition: opacity var(--crossfade-time) ease-in-out;
  }

  .error {
    color: red;
    padding: 16px;
  }

  .debug-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 16px;
    font-size: 14px;
    z-index: 10;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    border-radius: 8px;
  }
`;

class BackgroundRotator extends LitElement {
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
      currentImageIndex: {
        type: Number
      },
      imageList: {
        type: Array
      },
      imageA: {
        type: String
      },
      imageB: {
        type: String
      },
      activeImage: {
        type: String
      },
      preloadedImage: {
        type: String
      },
      error: {
        type: String
      },
      debugInfo: {
        type: Object
      },
      isTransitioning: {
        type: Boolean
      }
    };
  }
  static get styles() {
    return [ backgroundRotatorStyles, sharedStyles ];
  }
  constructor() {
    super(), this.initializeProperties();
  }
  initializeProperties() {
    this.currentImageIndex = -1, this.imageList = [], this.imageA = "", this.imageB = "", 
    this.activeImage = "A", this.preloadedImage = "", this.error = null, this.debugInfo = {}, 
    this.isTransitioning = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.startImageRotation(), this.startImageListUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearTimers();
  }
  clearTimers() {
    this.imageUpdateInterval && clearInterval(this.imageUpdateInterval), this.imageListUpdateInterval && clearInterval(this.imageListUpdateInterval);
  }
  startImageListUpdates() {
    this.updateImageList(), this.imageListUpdateInterval = setInterval((() => {
      this.updateImageList();
    }), 1e3 * this.config.image_list_update_interval);
  }
  startImageRotation() {
    this.updateImage(), this.imageUpdateInterval = setInterval((() => {
      this.updateImage();
    }), 1e3 * this.config.display_time);
  }
  getImageSourceType() {
    const {image_url: image_url} = this.config;
    return image_url.startsWith("media-source://") ? "media-source" : image_url.startsWith("https://api.unsplash") ? "unsplash-api" : image_url.startsWith("immich+") ? "immich-api" : image_url.includes("picsum.photos") ? "picsum" : "url";
  }
  getImageUrl() {
    const timestamp_ms = Date.now(), timestamp = Math.floor(timestamp_ms / 1e3);
    return this.config.image_url.replace(/\${width}/g, this.screenWidth).replace(/\${height}/g, this.screenHeight).replace(/\${timestamp_ms}/g, timestamp_ms).replace(/\${timestamp}/g, timestamp);
  }
  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) return this.error = "Screen dimensions not set", 
    void this.requestUpdate();
    try {
      const newImageList = await this.fetchImageList();
      this.imageList = "random" === this.config.image_order ? newImageList.sort((() => .5 - Math.random())) : newImageList.sort(), 
      -1 === this.currentImageIndex && this.imageList.length > 0 && (this.imageA = await this.preloadImage(this.imageList[0]), 
      this.currentImageIndex = 0), this.error = null, this.debugInfo.imageList = this.imageList;
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }
  async fetchImageList() {
    switch (this.getImageSourceType()) {
     case "media-source":
      return this.getImagesFromMediaSource();

     case "unsplash-api":
      return this.getImagesFromUnsplashAPI();

     case "immich-api":
      return this.getImagesFromImmichAPI();

     default:
      return [ this.getImageUrl() ];
    }
  }
  async getImagesFromMediaSource() {
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, "");
      return (await this.hass.callWS({
        type: "media_source/browse_media",
        media_content_id: mediaContentId
      })).children.filter((child => "image" === child.media_class)).map((child => child.media_content_id));
    } catch (error) {
      return console.error("Error fetching images from media source:", error), [ this.getImageUrl() ];
    }
  }
  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      return (await response.json()).map((image => image.urls.regular));
    } catch (error) {
      return console.error("Error fetching images from Unsplash API:", error), [ this.getImageUrl() ];
    }
  }
  async getImagesFromImmichAPI() {
    try {
      const apiUrl = this.config.image_url.replace(/^immich\+/, ""), response = await fetch(`${apiUrl}/albums`, {
        headers: {
          "x-api-key": this.config.immich_api_key
        }
      }), imagePromises = (await response.json()).map((async album => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            "x-api-key": this.config.immich_api_key
          }
        });
        return (await albumResponse.json()).assets.filter((asset => "IMAGE" === asset.type)).map((asset => `${apiUrl}/assets/${asset.id}/original`));
      }));
      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      return console.error("Error fetching images from Immich API:", error), [ this.getImageUrl() ];
    }
  }
  async preloadImage(url) {
    return new Promise(((resolve, reject) => {
      const img = new Image;
      img.onload = () => resolve(url), img.onerror = () => reject(new Error(`Failed to load image: ${url}`)), 
      img.src = url;
    }));
  }
  async preloadNextImage() {
    if (0 === this.imageList.length) return;
    const nextImageToPreload = "picsum" === this.getImageSourceType() ? this.getImageUrl() : this.imageList[(this.currentImageIndex + 1) % this.imageList.length];
    try {
      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error("Error preloading next image:", error), this.preloadedImage = "";
    }
  }
  async getNextImage() {
    if (0 === this.imageList.length) return null;
    let newImage;
    try {
      return this.preloadedImage ? (newImage = this.preloadedImage, this.preloadedImage = "") : ("picsum" === this.getImageSourceType() ? newImage = this.getImageUrl() : (this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length, 
      newImage = this.imageList[this.currentImageIndex]), newImage = await this.preloadImage(newImage)), 
      newImage;
    } catch (error) {
      return console.error("Error getting next image:", error), null;
    }
  }
  async updateImage() {
    if (!this.isTransitioning && 0 !== this.imageList.length) try {
      const newImage = await this.getNextImage();
      newImage && (await this.transitionToNewImage(newImage), this.preloadNextImage());
    } catch (error) {
      console.error("Error updating image:", error);
    }
  }
  async transitionToNewImage(newImage) {
    this.isTransitioning = !0, "A" === this.activeImage ? this.imageB = newImage : this.imageA = newImage, 
    this.updateDebugInfo(), this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, 50))), 
    this.activeImage = "A" === this.activeImage ? "B" : "A", this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, 1e3 * this.config.crossfade_time + 50))), 
    this.isTransitioning = !1;
  }
  updateDebugInfo() {
    this.debugInfo = {
      imageA: this.imageA,
      imageB: this.imageB,
      activeImage: this.activeImage,
      preloadedImage: this.preloadedImage,
      imageList: this.imageList,
      currentImageIndex: this.currentImageIndex,
      config: this.config,
      error: this.error
    };
  }
  render() {
    const imageAOpacity = "A" === this.activeImage ? 1 : 0, imageBOpacity = "B" === this.activeImage ? 1 : 0;
    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 background-size: ${this.config.image_fit || "contain"};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 background-size: ${this.config.image_fit || "contain"};"
        ></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ""}
      ${this.showDebugInfo ? this.renderDebugInfo() : ""}
    `;
  }
  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Background Rotator Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Image A:</strong> ${this.imageA}</p>
        <p><strong>Image B:</strong> ${this.imageB}</p>
        <p><strong>Active Image:</strong> ${this.activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this.preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
        <p><strong>Current Image Index:</strong> ${this.currentImageIndex}</p>
        <p><strong>Error:</strong> ${this.error}</p>
        <h3>Image List:</h3>
        <pre>${JSON.stringify(this.imageList, null, 2)}</pre>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
}

customElements.define("background-rotator", BackgroundRotator), customElements.define("background-rotator", BackgroundRotator);

const controlsStyles = css`
  :host {
    --control-z-index: 1000;
  }

  .controls-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: auto;
    z-index: var(--control-z-index);
    touch-action: none;
  }

  .overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--overlay-height);
    background-color: rgba(255, 255, 255, 0.95);
    color: #333;
    box-sizing: border-box;
    transition: transform 0.3s ease-in-out;
    transform: translateY(100%);
    z-index: calc(var(--control-z-index) + 1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    pointer-events: auto;
    touch-action: none;
  }

  .overlay.show {
    transform: translateY(0);
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
    justify-content: space-between;
    align-items: center;
    width: 85%;
    pointer-events: auto;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #333;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    touch-action: none;
  }

  .icon-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .brightness-card {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: calc(var(--control-z-index) + 2);
    transform: translateY(calc(100% + 20px));
    transition: transform 0.3s ease-in-out;
    pointer-events: auto;
    touch-action: none;
  }

  .brightness-card.show {
    transform: translateY(0);
  }

  .brightness-control {
    display: flex;
    align-items: center;
    width: 100%;
    pointer-events: auto;
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
  }

  .brightness-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #d1d1d1;
    transition: background-color 0.2s ease;
    cursor: pointer;
    pointer-events: auto;
  }

  .brightness-dot.active {
    background-color: #333;
  }

  .brightness-value {
    min-width: 60px;
    text-align: right;
    font-size: 40px;
    color: black;
    font-weight: 300;
    margin-right: 20px;
    pointer-events: none;
  }

  iconify-icon {
    font-size: 50px;
    display: block;
    width: 50px;
    height: 50px;
    pointer-events: none;
  }

  @supports (-webkit-touch-callout: none) {
    .controls-container {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .overlay {
      padding-bottom: env(safe-area-inset-bottom, 0);
      height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
    }
  }
`;

customElements.define("google-controls", class Controls extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      showOverlay: {
        type: Boolean
      },
      showBrightnessCard: {
        type: Boolean
      },
      brightnessCardTransition: {
        type: String
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
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
    return [ controlsStyles, sharedStyles ];
  }
  constructor() {
    super(), this.initializeProperties();
  }
  initializeProperties() {
    this.showOverlay = !1, this.showBrightnessCard = !1, this.brightnessCardTransition = "none", 
    this.brightness = 128, this.visualBrightness = 128, this.isAdjustingBrightness = !1, 
    this.lastBrightnessUpdateTime = 0, this.brightnessUpdateTimer = null, this.brightnessStabilizeTimer = null, 
    this.longPressTimer = null;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearAllTimers();
  }
  clearAllTimers() {
    this.brightnessUpdateTimer && clearTimeout(this.brightnessUpdateTimer), this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), 
    this.longPressTimer && clearTimeout(this.longPressTimer);
  }
  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest(".brightness-dot");
    if (!clickedDot) return;
    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(25.5 * newBrightness);
  }
  handleBrightnessDrag(e) {
    e.stopPropagation();
    const rect = this.shadowRoot.querySelector(".brightness-dots").getBoundingClientRect(), x = e.type.includes("touch") ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * 10);
    this.updateBrightnessValue(25.5 * newValue);
  }
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = !0, this.visualBrightness = Math.max(1, Math.min(255, Math.round(value))), 
    this.brightnessUpdateTimer && clearTimeout(this.brightnessUpdateTimer), this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), 
    this.brightnessUpdateTimer = setTimeout((async () => {
      await this.setBrightness(value), this.lastBrightnessUpdateTime = Date.now(), this.brightnessStabilizeTimer = setTimeout((() => {
        this.isAdjustingBrightness = !1, this.requestUpdate();
      }), 2e3);
    }), 250), this.dispatchEvent(new CustomEvent("brightnessChange", {
      detail: this.visualBrightness,
      bubbles: !0,
      composed: !0
    }));
  }
  async setBrightness(value) {
    const internalValue = Math.max(1, Math.min(255, Math.round(value)));
    try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_screen_brightness_level",
        data: {
          command: internalValue
        }
      }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_update_sensors"
      }), await new Promise((resolve => setTimeout(resolve, 500))), this.brightness = internalValue, 
      this.requestUpdate();
    } catch (error) {
      console.error("Error setting brightness:", error), this.visualBrightness = this.brightness;
    }
  }
  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }
  toggleBrightnessCard(e) {
    e && e.stopPropagation(), this.dispatchEvent(new CustomEvent("brightnessCardToggle", {
      detail: !this.showBrightnessCard,
      bubbles: !0,
      composed: !0
    }));
  }
  handleSettingsIconTouchStart=e => {
    e.stopPropagation(), this.longPressTimer = setTimeout((() => {
      this.dispatchEvent(new CustomEvent("debugToggle", {
        bubbles: !0,
        composed: !0
      }));
    }), 1e3);
  };
  handleSettingsIconTouchEnd=e => {
    e.stopPropagation(), this.longPressTimer && clearTimeout(this.longPressTimer);
  };
  render() {
    return html`
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ""}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ""}
      </div>
    `;
  }
  renderOverlay() {
    return html`
      <div class="overlay show" @click="${e => e.stopPropagation()}">
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${e => this.toggleBrightnessCard(e)}">
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
            >
              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html`
      <div
        class="brightness-card show"
        style="transition: ${this.brightnessCardTransition};"
        @click="${e => e.stopPropagation()}"
      >
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div
              class="brightness-dots"
              @click="${this.handleBrightnessChange}"
              @mousedown="${this.handleBrightnessDrag}"
              @mousemove="${e => 1 === e.buttons && this.handleBrightnessDrag(e)}"
              @touchstart="${this.handleBrightnessDrag}"
              @touchmove="${this.handleBrightnessDrag}"
            >
              ${[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((value => html`
                  <div
                    class="brightness-dot ${value <= brightnessDisplayValue ? "active" : ""}"
                    data-value="${value}"
                  ></div>
                `))}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }
});

const nightModeStyles = css`
  .night-mode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
  }

  .night-time {
    color: white;
    font-size: 35vw;
    font-weight: 400;
    font-family: 'Product Sans Regular', sans-serif;
  }
`;

customElements.define("night-mode", class NightMode extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      currentTime: {
        type: String
      },
      brightness: {
        type: Number
      },
      isInNightMode: {
        type: Boolean
      },
      previousBrightness: {
        type: Number
      }
    };
  }
  static get styles() {
    return [ sharedStyles, nightModeStyles ];
  }
  constructor() {
    super(), this.initializeProperties();
  }
  initializeProperties() {
    this.currentTime = "", this.brightness = 1, this.isInNightMode = !1, this.previousBrightness = 1, 
    this.timeUpdateInterval = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateTime(), this.startTimeUpdates(), this.enterNightMode();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval);
  }
  startTimeUpdates() {
    this.timeUpdateInterval = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  async enterNightMode() {
    if (!this.isInNightMode) try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 100))), 
      await this.setBrightness(1), await new Promise((resolve => setTimeout(resolve, 100))), 
      await this.toggleAutoBrightness(!0), this.isInNightMode = !0, this.requestUpdate();
    } catch (error) {
      console.error("Error entering night mode:", error);
    }
  }
  async exitNightMode() {
    if (this.isInNightMode) try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 100))), 
      await this.setBrightness(this.previousBrightness), this.isInNightMode = !1, this.requestUpdate(), 
      this.dispatchEvent(new CustomEvent("nightModeExit", {
        bubbles: !0,
        composed: !0
      }));
    } catch (error) {
      console.error("Error exiting night mode:", error);
    }
  }
  async setBrightness(value) {
    if (this.hass) try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_screen_brightness_level",
        data: {
          command: value
        }
      }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_update_sensors"
      }), await new Promise((resolve => setTimeout(resolve, 500))), this.brightness = value, 
      this.requestUpdate();
    } catch (error) {
      console.error("Error setting brightness:", error);
    }
  }
  async toggleAutoBrightness(enabled) {
    if (this.hass) try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_auto_screen_brightness",
        data: {
          command: enabled ? "turn_on" : "turn_off"
        }
      });
    } catch (error) {
      console.error("Error toggling auto brightness:", error);
    }
  }
  updated(changedProperties) {
    changedProperties.has("hass") && this.checkLightSensor();
  }
  checkLightSensor() {
    if (!this.hass?.states["sensor.liam_room_display_light_sensor"]) return;
    const lightSensor = this.hass.states["sensor.liam_room_display_light_sensor"], shouldBeInNightMode = 0 === parseInt(lightSensor.state);
    shouldBeInNightMode && !this.isInNightMode ? (this.previousBrightness = this.brightness, 
    this.enterNightMode()) : !shouldBeInNightMode && this.isInNightMode && this.exitNightMode();
  }
  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
      <div class="night-mode">
        <div class="night-time">${this.currentTime}</div>
      </div>
    `;
  }
});

const weatherClockStyles = css`
  .weather-component {
    position: fixed;
    bottom: 30px;
    left: 40px;
    display: flex;
    justify-content: start;
    align-items: center;
    color: white;
    font-family: 'Product Sans Regular', sans-serif;
    width: 100%;
    max-width: 400px;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .date {
    font-size: 25px;
    margin-bottom: 5px;
    font-weight: 400;
    margin-left: 10px;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  }

  .time {
    font-size: 90px;
    line-height: 1;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .weather-info {
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: 500;
    margin-right: -5px;
  }

  .weather-icon {
    width: 50px;
    height: 50px;
  }

  .temperature {
    font-size: 35px;
    font-weight: 500;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  }

  .aqi {
    font-size: 20px;
    padding: 6px 10px 5px 10px;
    border-radius: 6px;
    font-weight: 500;
    margin-top: 5px;
    margin-left: 30px;
    align-self: flex-end;
    min-width: 60px;
    text-align: center;
  }
`;

customElements.define("weather-clock", class WeatherClock extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      date: {
        type: String
      },
      time: {
        type: String
      },
      temperature: {
        type: String
      },
      weatherIcon: {
        type: String
      },
      aqi: {
        type: String
      }
    };
  }
  static get styles() {
    return [ weatherClockStyles, sharedStyles ];
  }
  constructor() {
    super(), this.resetProperties(), this.updateTimer = null;
  }
  resetProperties() {
    this.date = "", this.time = "", this.temperature = "", this.weatherIcon = "", this.aqi = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.updateWeather(), this.scheduleUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.updateTimer && clearTimeout(this.updateTimer);
  }
  scheduleUpdate() {
    const now = new Date, delay = 1e3 * (60 - now.getSeconds()) - now.getMilliseconds();
    this.updateTimer = setTimeout((() => {
      this.updateWeather(), this.scheduleUpdate();
    }), delay);
  }
  updateWeather() {
    const now = new Date;
    this.updateDateTime(now), this.updateWeatherData(), this.requestUpdate();
  }
  updateDateTime(now) {
    this.date = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }), this.time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  updateWeatherData() {
    if (!this.hass) return;
    const weatherEntity = this.hass.states["weather.64_west_glen_ave"], aqiEntity = this.hass.states["sensor.ridgewood_air_quality_index"];
    weatherEntity && (this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`, 
    this.weatherIcon = this.getWeatherIcon(weatherEntity.state)), aqiEntity && (this.aqi = aqiEntity.state);
  }
  getWeatherIcon(state) {
    return {
      "clear-night": "clear-night",
      cloudy: "cloudy",
      fog: "fog",
      hail: "hail",
      lightning: "thunderstorms",
      "lightning-rainy": "thunderstorms-rain",
      partlycloudy: "partly-cloudy-day",
      pouring: "rain",
      rainy: "drizzle",
      snowy: "snow",
      "snowy-rainy": "sleet",
      sunny: "clear-day",
      windy: "wind",
      "windy-variant": "wind",
      exceptional: "not-available"
    }[state] || "not-available-fill";
  }
  getAqiColor(aqi) {
    return aqi <= 50 ? "#68a03a" : aqi <= 100 ? "#f9bf33" : aqi <= 150 ? "#f47c06" : aqi <= 200 ? "#c43828" : aqi <= 300 ? "#ab1457" : "#83104c";
  }
  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div class="weather-component">
        <div class="left-column">
          <div class="date">${this.date}</div>
          <div class="time">${this.time}</div>
        </div>
        <div class="right-column">
          <div class="weather-info">
            <img
              src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
              class="weather-icon"
              alt="Weather icon"
            />
            <span class="temperature">${this.temperature}</span>
          </div>
          <div class="aqi" style="background-color: ${this.getAqiColor(parseInt(this.aqi))}">
            ${this.aqi} AQI
          </div>
        </div>
      </div>
    `;
  }
});

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
      previousBrightness: {
        type: Number
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      lastBrightnessUpdateTime: {
        type: Number
      },
      touchStartY: {
        type: Number
      },
      overlayDismissTimer: {
        type: Object
      },
      brightnessStabilizeTimer: {
        type: Object
      },
      brightnessUpdateTimer: {
        type: Object
      },
      longPressTimer: {
        type: Object
      }
    };
  }
  static get styles() {
    return [ sharedStyles ];
  }
  constructor() {
    super(), this.initializeProperties(), this.boundUpdateScreenSize = this.updateScreenSize.bind(this), 
    this.handleTouchStart = this.handleTouchStart.bind(this), this.handleTouchMove = this.handleTouchMove.bind(this), 
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }
  initializeProperties() {
    this.showDebugInfo = !1, this.showOverlay = !1, this.isNightMode = !1, this.showBrightnessCard = !1, 
    this.brightnessCardTransition = "none", this.brightness = DEFAULT_CONFIG.brightness || 128, 
    this.visualBrightness = this.brightness, this.previousBrightness = this.brightness, 
    this.isInNightMode = !1, this.isAdjustingBrightness = !1, this.lastBrightnessUpdateTime = 0, 
    this.touchStartY = 0, this.updateScreenSize(), this.updateTime(), this.startTimeUpdates();
  }
  setConfig(config) {
    if (!config.image_url) throw new Error("You need to define an image_url");
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      sensor_update_delay: config.sensor_update_delay || DEFAULT_CONFIG.sensor_update_delay
    }, this.showDebugInfo = this.config.show_debug;
  }
  firstUpdated() {
    super.firstUpdated(), this.setupEventListeners(), window.addEventListener("resize", this.boundUpdateScreenSize);
  }
  setupEventListeners() {
    this.addEventListener("touchstart", this.handleTouchStart, {
      passive: !0
    }), this.addEventListener("touchmove", this.handleTouchMove, {
      passive: !1
    }), this.addEventListener("touchend", this.handleTouchEnd, {
      passive: !0
    }), this.addEventListener("overlayToggle", this.handleOverlayToggle), this.addEventListener("brightnessCardToggle", this.handleBrightnessCardToggle), 
    this.addEventListener("brightnessChange", this.handleBrightnessChange), this.addEventListener("debugToggle", this.handleDebugToggle), 
    this.addEventListener("nightModeExit", (() => {
      this.isNightMode = !1, this.requestUpdate();
    }));
  }
  connectedCallback() {
    super.connectedCallback(), this.updateNightMode();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearTimers(), this.cleanupEventListeners();
  }
  cleanupEventListeners() {
    window.removeEventListener("resize", this.boundUpdateScreenSize), this.removeEventListener("touchstart", this.handleTouchStart), 
    this.removeEventListener("touchmove", this.handleTouchMove), this.removeEventListener("touchend", this.handleTouchEnd), 
    this.removeEventListener("overlayToggle", this.handleOverlayToggle), this.removeEventListener("brightnessCardToggle", this.handleBrightnessCardToggle), 
    this.removeEventListener("brightnessChange", this.handleBrightnessChange), this.removeEventListener("debugToggle", this.handleDebugToggle), 
    this.removeEventListener("nightModeExit", this.handleNightModeExit);
  }
  clearTimers() {
    this.timeUpdateInterval && clearInterval(this.timeUpdateInterval), this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), 
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.brightnessUpdateTimer && clearTimeout(this.brightnessUpdateTimer), 
    this.longPressTimer && clearTimeout(this.longPressTimer);
  }
  handleTouchStart(event) {
    1 === event.touches.length && (this.touchStartY = event.touches[0].clientY);
  }
  handleTouchMove(event) {
    (this.showBrightnessCard || this.showOverlay) && event.preventDefault();
  }
  handleTouchEnd(event) {
    if (1 === event.changedTouches.length) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY;
      Math.abs(deltaY) > 50 && (deltaY > 0 && !this.showBrightnessCard ? (this.showOverlay = !0, 
      this.requestUpdate(), this.dispatchEvent(new CustomEvent("overlayToggle", {
        detail: !0,
        bubbles: !0,
        composed: !0
      })), this.startOverlayDismissTimer()) : deltaY < 0 && (this.showBrightnessCard ? this.dismissBrightnessCard() : this.showOverlay && this.dismissOverlay()));
    }
  }
  handleOverlayToggle=event => {
    this.showOverlay = event.detail, this.requestUpdate();
  };
  handleBrightnessCardToggle=event => {
    this.showBrightnessCard = event.detail, this.brightnessCardTransition = "transform 0.3s ease-in-out", 
    this.requestUpdate();
  };
  handleBrightnessChange=async event => {
    await this.updateBrightnessValue(event.detail);
  };
  handleDebugToggle=() => {
    this.showDebugInfo = !this.showDebugInfo, this.requestUpdate();
  };
  handleNightModeExit=() => {
    this.isNightMode = !1, this.requestUpdate();
  };
  startTimeUpdates() {
    this.updateTime(), this.timeUpdateInterval = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  startOverlayDismissTimer() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.overlayDismissTimer = setTimeout((() => {
      this.dismissOverlay();
    }), 1e4);
  }
  dismissOverlay() {
    this.showOverlay = !1, this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), 
    this.requestUpdate(), this.dispatchEvent(new CustomEvent("overlayToggle", {
      detail: !1,
      bubbles: !0,
      composed: !0
    }));
  }
  dismissBrightnessCard() {
    this.brightnessCardTransition = "transform 0.3s ease-in-out", this.showBrightnessCard = !1, 
    this.dispatchEvent(new CustomEvent("brightnessCardToggle", {
      detail: !1,
      bubbles: !0,
      composed: !0
    })), this.requestUpdate();
  }
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio), this.screenHeight = Math.round(window.innerHeight * pixelRatio), 
    this.requestUpdate();
  }
  updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = !0, this.visualBrightness = Math.max(1, Math.min(255, Math.round(value))), 
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer);
    try {
      await this.setBrightness(value), this.lastBrightnessUpdateTime = Date.now(), this.brightnessStabilizeTimer = setTimeout((() => {
        this.isAdjustingBrightness = !1, this.requestUpdate();
      }), 2e3);
    } catch (error) {
      console.error("Error updating brightness:", error), this.visualBrightness = this.brightness;
    }
  }
  async setBrightness(value) {
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_screen_brightness_level",
        data: {
          command: brightness
        }
      }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_update_sensors"
      }), await new Promise((resolve => setTimeout(resolve, this.config.sensor_update_delay))), 
      this.brightness = brightness, this.isNightMode || (this.previousBrightness = brightness);
    } catch (error) {
      throw console.error("Error setting brightness:", error), error;
    }
  }
  updateNightMode() {
    if (!this.hass?.states["sensor.liam_room_display_light_sensor"]) return;
    const lightSensor = this.hass.states["sensor.liam_room_display_light_sensor"], shouldBeInNightMode = 0 === parseInt(lightSensor.state);
    shouldBeInNightMode !== this.isInNightMode && this.handleNightModeTransition(shouldBeInNightMode);
  }
  async handleNightModeTransition(newNightMode) {
    newNightMode ? await this.enterNightMode() : await this.exitNightMode(), this.isInNightMode = newNightMode, 
    this.isNightMode = newNightMode, this.requestUpdate();
  }
  async enterNightMode() {
    this.previousBrightness = this.brightness, await this.toggleAutoBrightness(!1), 
    await new Promise((resolve => setTimeout(resolve, 100))), await this.setBrightness(1), 
    await new Promise((resolve => setTimeout(resolve, 100))), await this.toggleAutoBrightness(!0);
  }
  async exitNightMode() {
    await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 100))), 
    await this.setBrightness(this.previousBrightness);
  }
  async toggleAutoBrightness(enabled) {
    await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_auto_screen_brightness",
      data: {
        command: enabled ? "turn_on" : "turn_off"
      }
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && !this.isAdjustingBrightness) {
      Date.now() - this.lastBrightnessUpdateTime > 2e3 && this.updateNightMode();
    }
  }
  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Show Overlay:</strong> ${this.showOverlay}</p>
        <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p>
          <strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}
        </p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
  render() {
    return this.isNightMode ? html` <night-mode .currentTime=${this.currentTime} .hass=${this.hass}></night-mode> ` : html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        ..screenHeight=${this.screenHeight}
        .showDebugInfo=${this.showDebugInfo}
      ></background-rotator>

      <weather-clock .hass=${this.hass}></weather-clock>

      <google-controls
        .hass=${this.hass}
        .showOverlay=${this.showOverlay}
        .showBrightnessCard=${this.showBrightnessCard}
        .brightnessCardTransition=${this.brightnessCardTransition}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
      ></google-controls>

      ${this.showDebugInfo ? this.renderDebugInfo() : ""}
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
//# sourceMappingURL=google-card.js.map
