import { LitElement as LitElement$1, html as html$1, css as css$1 } from "https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module";

import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

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
    --theme-transition: background-color 0.3s ease, color 0.3s ease;
    --theme-background: #ffffff;
    --theme-text: #333333;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    font-family: 'Product Sans Regular', sans-serif;
    font-weight: 400;
    transition: var(--theme-transition);
  }

  :host([data-theme='dark']) {
    --theme-background: #121212;
    --theme-text: #ffffff;
  }

  html[data-theme='dark'] {
    --theme-background: #121212;
    --theme-text: #ffffff;
  }

  .error {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 1000;
    max-width: 90%;
    word-wrap: break-word;
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

customElements.define("background-rotator", class BackgroundRotator extends LitElement {
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
      },
      pendingImageUpdate: {
        type: Boolean
      },
      imageUpdateRetries: {
        type: Number
      },
      maxRetries: {
        type: Number
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
    this.isTransitioning = !1, this.pendingImageUpdate = !1, this.imageUpdateRetries = 0, 
    this.maxRetries = 3;
  }
  connectedCallback() {
    super.connectedCallback(), this.startImageRotation(), this.startImageListUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearTimers();
  }
  clearTimers() {
    this.imageUpdateInterval && clearInterval(this.imageUpdateInterval), this.imageListUpdateInterval && clearInterval(this.imageListUpdateInterval), 
    this.pendingImageUpdateTimeout && clearTimeout(this.pendingImageUpdateTimeout);
  }
  startImageListUpdates() {
    this.updateImageList(), this.imageListUpdateInterval = setInterval((() => {
      this.updateImageList();
    }), 1e3 * Math.max(60, this.config?.image_list_update_interval || 3600));
  }
  startImageRotation() {
    setTimeout((() => this.updateImage()), 500), this.imageUpdateInterval = setInterval((() => {
      this.updateImage();
    }), 1e3 * Math.max(5, this.config?.display_time || 15));
  }
  getImageSourceType() {
    if (!this.config?.image_url) return "url";
    const {image_url: image_url} = this.config;
    return image_url.startsWith("media-source://") ? "media-source" : image_url.startsWith("https://api.unsplash") ? "unsplash-api" : image_url.startsWith("immich+") ? "immich-api" : image_url.includes("picsum.photos") ? "picsum" : "url";
  }
  getImageUrl() {
    if (!this.config?.image_url) return "";
    const timestamp_ms = Date.now(), timestamp = Math.floor(timestamp_ms / 1e3), width = this.screenWidth || 1280, height = this.screenHeight || 720;
    return this.config.image_url.replace(/\${width}/g, width).replace(/\${height}/g, height).replace(/\${timestamp_ms}/g, timestamp_ms).replace(/\${timestamp}/g, timestamp);
  }
  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) return this.error = "Screen dimensions not set", 
    void this.requestUpdate();
    try {
      const newImageList = await this.fetchImageList();
      if (!Array.isArray(newImageList) || 0 === newImageList.length) throw new Error("No valid images found");
      if (this.imageList = "random" === this.config?.image_order ? this.shuffleArray([ ...newImageList ]) : [ ...newImageList ].sort(), 
      -1 === this.currentImageIndex && this.imageList.length > 0) try {
        this.imageA = await this.preloadImage(this.imageList[0]), this.currentImageIndex = 0, 
        this.error = null;
      } catch (error) {
        this.error = `Error loading initial image: ${error.message}`;
      }
      this.debugInfo.imageList = this.imageList, this.requestUpdate();
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`, this.requestUpdate();
    }
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [ array[j], array[i] ];
    }
    return array;
  }
  async fetchImageList() {
    switch (this.getImageSourceType()) {
     case "media-source":
      return this.getImagesFromMediaSource();

     case "unsplash-api":
      return this.getImagesFromUnsplashAPI();

     case "immich-api":
      return this.getImagesFromImmichAPI();

     case "picsum":
      return Array.from({
        length: 10
      }, (() => this.getImageUrl()));

     default:
      {
        const url = this.getImageUrl();
        return url ? [ url ] : [];
      }
    }
  }
  async getImagesFromMediaSource() {
    if (!this.hass) return [ this.getImageUrl() ];
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, ""), result = await this.hass.callWS({
        type: "media_source/browse_media",
        media_content_id: mediaContentId
      });
      if (!result || !Array.isArray(result.children)) throw new Error("Invalid response from media source");
      return result.children.filter((child => "image" === child.media_class)).map((child => child.media_content_id));
    } catch (error) {
      console.error("Error fetching images from media source:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      if (!response.ok) throw new Error(`Unsplash API returned status ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from Unsplash API");
      return data.map((image => image.urls.regular));
    } catch (error) {
      console.error("Error fetching images from Unsplash API:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async getImagesFromImmichAPI() {
    try {
      if (!this.config.immich_api_key) throw new Error("Immich API key not configured");
      const apiUrl = this.config.image_url.replace(/^immich\+/, ""), response = await fetch(`${apiUrl}/albums`, {
        headers: {
          "x-api-key": this.config.immich_api_key
        }
      });
      if (!response.ok) throw new Error(`Immich API returned status ${response.status}`);
      const albums = await response.json();
      if (!Array.isArray(albums)) throw new Error("Invalid response from Immich API");
      const imagePromises = albums.map((async album => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            "x-api-key": this.config.immich_api_key
          }
        });
        if (!albumResponse.ok) throw new Error(`Immich API album fetch returned status ${albumResponse.status}`);
        const albumData = await albumResponse.json();
        return albumData && Array.isArray(albumData.assets) ? albumData.assets.filter((asset => "IMAGE" === asset.type)).map((asset => `${apiUrl}/assets/${asset.id}/original`)) : [];
      }));
      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      console.error("Error fetching images from Immich API:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async preloadImage(url) {
    if (!url) throw new Error("Invalid image URL");
    return new Promise(((resolve, reject) => {
      const img = new Image, timeout = setTimeout((() => {
        reject(new Error(`Image load timeout: ${url}`));
      }), 3e4);
      img.onload = () => {
        clearTimeout(timeout), resolve(url);
      }, img.onerror = () => {
        clearTimeout(timeout), reject(new Error(`Failed to load image: ${url}`));
      }, img.src = url;
    }));
  }
  async preloadNextImage() {
    if (0 !== this.imageList.length) try {
      const nextImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
      let nextImageToPreload;
      nextImageToPreload = "picsum" === this.getImageSourceType() ? this.getImageUrl() : this.imageList[nextImageIndex], 
      this.preloadedImage = await this.preloadImage(nextImageToPreload), this.debugInfo.preloadedImage = this.preloadedImage, 
      this.requestUpdate();
    } catch (error) {
      console.error("Error preloading next image:", error), this.preloadedImage = "", 
      this.debugInfo.preloadError = error.message, this.requestUpdate();
    }
  }
  async getNextImage() {
    if (0 === this.imageList.length) return null;
    let newImage;
    try {
      return this.preloadedImage ? (newImage = this.preloadedImage, this.preloadedImage = "") : ("picsum" === this.getImageSourceType() ? newImage = this.getImageUrl() : (this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length, 
      newImage = this.imageList[this.currentImageIndex]), newImage = await this.preloadImage(newImage)), 
      this.imageUpdateRetries = 0, newImage;
    } catch (error) {
      return console.error("Error getting next image:", error), this.imageUpdateRetries++, 
      this.imageUpdateRetries > this.maxRetries ? (this.imageUpdateRetries = 0, this.currentImageIndex = -1, 
      null) : (setTimeout((() => this.updateImage()), 2e3), null);
    }
  }
  async updateImage() {
    if (!this.isTransitioning && !this.pendingImageUpdate && 0 !== this.imageList.length) try {
      this.pendingImageUpdate = !0;
      const newImage = await this.getNextImage();
      newImage && (await this.transitionToNewImage(newImage), setTimeout((() => this.preloadNextImage()), 1e3 * this.config?.crossfade_time + 50));
    } catch (error) {
      console.error("Error updating image:", error);
    } finally {
      this.pendingImageUpdate = !1;
    }
  }
  async transitionToNewImage(newImage) {
    this.isTransitioning = !0, "A" === this.activeImage ? this.imageB = newImage : this.imageA = newImage, 
    this.updateDebugInfo(), this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, 50))), 
    this.activeImage = "A" === this.activeImage ? "B" : "A", this.requestUpdate();
    const transitionTime = 1e3 * (this.config?.crossfade_time || 3) + 50;
    await new Promise((resolve => setTimeout(resolve, transitionTime))), this.isTransitioning = !1;
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
      error: this.error,
      isTransitioning: this.isTransitioning,
      pendingImageUpdate: this.pendingImageUpdate,
      imageUpdateRetries: this.imageUpdateRetries
    };
  }
  updated(changedProperties) {
    changedProperties.has("config") && this.config && this.style.setProperty("--crossfade-time", `${this.config.crossfade_time || 3}s`);
  }
  render() {
    const imageAOpacity = "A" === this.activeImage ? 1 : 0, imageBOpacity = "B" === this.activeImage ? 1 : 0, imageFit = this.config?.image_fit || "contain";
    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 background-size: ${imageFit};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 background-size: ${imageFit};"
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
        <p><strong>Source Type:</strong> ${this.getImageSourceType()}</p>
        <p><strong>Image A:</strong> ${this.imageA}</p>
        <p><strong>Image B:</strong> ${this.imageB}</p>
        <p><strong>Active Image:</strong> ${this.activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this.preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
        <p><strong>Current Image Index:</strong> ${this.currentImageIndex}</p>
        <p><strong>Image List Length:</strong> ${this.imageList?.length || 0}</p>
        <p><strong>Error:</strong> ${this.error}</p>
        <h3>Image List:</h3>
        <pre>
${JSON.stringify(this.imageList?.slice(0, 5), null, 2)}${this.imageList?.length > 5 ? "..." : ""}</pre
        >
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
});

const controlsStyles = css`
  :host {
    --control-z-index: 1000;
    --overlay-transition-duration: 0.3s;
    --overlay-height: 120px;
    --brightness-card-height: 70px;
    --icon-size: 50px;
    --icon-button-size: 60px;
    --brightness-dot-size: 12px;
    --brightness-value-size: 40px;
    --border-radius: 20px;
    --background-blur: 10px;
    --background-opacity: 0.95;
    --overlay-background: rgba(255, 255, 255, var(--background-opacity));
    --control-text-color: #333;
    --brightness-dot-color: #d1d1d1;
    --brightness-dot-active: #333;
  }

  html[data-theme='dark'],
  :host([data-theme='dark']) {
    --overlay-background: rgba(32, 33, 36, var(--background-opacity));
    --control-text-color: #fff;
    --brightness-dot-color: #5f6368;
    --brightness-dot-active: #fff;
  }

  .controls-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: none;
    z-index: var(--control-z-index);
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
    z-index: calc(var(--control-z-index) + 1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity;
  }

  .overlay.transitioning {
    transition: transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
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
    justify-content: space-between;
    align-items: center;
    width: 85%;
    pointer-events: auto;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--control-text-color);
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    touch-action: none;
    width: var(--icon-button-size);
    height: var(--icon-button-size);
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
    height: var(--brightness-card-height);
    background-color: var(--overlay-background);
    -webkit-backdrop-filter: blur(var(--background-blur));
    backdrop-filter: blur(var(--background-blur));
    color: var(--control-text-color);
    border-radius: var(--border-radius);
    padding: 40px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: calc(var(--control-z-index) + 2);
    transform: translateY(calc(100% + 20px));
    opacity: 0;
    transition: none;
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity;
  }

  .brightness-card.transitioning {
    transition: transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
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
    width: var(--brightness-dot-size);
    height: var(--brightness-dot-size);
    border-radius: 50%;
    background-color: var(--brightness-dot-color);
    transition: background-color 0.2s ease, transform 0.2s ease;
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
    font-size: var(--brightness-value-size);
    color: var(--control-text-color);
    font-weight: 300;
    margin-right: 20px;
    pointer-events: none;
    font-family: 'Rubik', sans-serif;
  }

  iconify-icon {
    font-size: var(--icon-size);
    width: var(--icon-size);
    height: var(--icon-size);
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

  /* Accessibility: reduce animation */
  @media (prefers-reduced-motion: reduce) {
    *,
    .overlay,
    .brightness-card,
    .overlay.transitioning,
    .brightness-card.transitioning {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  /* High contrast mode */
  @media (forced-colors: active) {
    .icon-button:hover,
    .icon-button:active {
      border: 1px solid ButtonText;
    }

    .brightness-dot {
      border: 1px solid ButtonText;
    }

    .brightness-dot.active {
      background-color: ButtonText;
    }
  }

  @keyframes button-press {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
  }

  .icon-button:active {
    animation: button-press 0.2s ease;
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
      isOverlayVisible: {
        type: Boolean
      },
      isOverlayTransitioning: {
        type: Boolean
      },
      showBrightnessCard: {
        type: Boolean
      },
      isBrightnessCardVisible: {
        type: Boolean
      },
      isBrightnessCardTransitioning: {
        type: Boolean
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
      longPressTimer: {
        type: Object
      },
      isDraggingBrightness: {
        type: Boolean
      }
    };
  }
  static get styles() {
    return [ controlsStyles, sharedStyles ];
  }
  constructor() {
    super(), this.initializeProperties(), this.handleBrightnessChange = this.handleBrightnessChange.bind(this), 
    this.handleBrightnessDragStart = this.handleBrightnessDragStart.bind(this), this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this), 
    this.handleBrightnessDragEnd = this.handleBrightnessDragEnd.bind(this), this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this), 
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
  }
  initializeProperties() {
    this.showOverlay = !1, this.isOverlayVisible = !1, this.isOverlayTransitioning = !1, 
    this.showBrightnessCard = !1, this.isBrightnessCardVisible = !1, this.isBrightnessCardTransitioning = !1, 
    this.brightness = 128, this.visualBrightness = 128, this.isAdjustingBrightness = !1, 
    this.longPressTimer = null, this.isDraggingBrightness = !1;
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.longPressTimer && clearTimeout(this.longPressTimer), 
    this.removeBrightnessDragListeners();
  }
  updated(changedProperties) {
    changedProperties.has("brightness") && !this.isAdjustingBrightness && (this.visualBrightness = this.brightness);
  }
  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest(".brightness-dot");
    if (!clickedDot) return;
    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(25.5 * newBrightness);
  }
  handleBrightnessDragStart(e) {
    e.stopPropagation(), this.isDraggingBrightness = !0, document.addEventListener("mousemove", this.handleBrightnessDrag), 
    document.addEventListener("mouseup", this.handleBrightnessDragEnd), document.addEventListener("touchmove", this.handleBrightnessDrag, {
      passive: !1
    }), document.addEventListener("touchend", this.handleBrightnessDragEnd), this.handleBrightnessDrag(e);
  }
  handleBrightnessDrag(e) {
    if (e.preventDefault(), e.stopPropagation(), !this.isDraggingBrightness) return;
    const container = this.shadowRoot.querySelector(".brightness-dots");
    if (!container) return;
    const rect = container.getBoundingClientRect(), clientX = e.type.includes("touch") ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    if (void 0 === clientX) return;
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * 10), cappedValue = Math.max(1, Math.min(10, newValue));
    this.updateBrightnessValue(25.5 * cappedValue);
  }
  handleBrightnessDragEnd(e) {
    e && (e.preventDefault(), e.stopPropagation()), this.isDraggingBrightness = !1, 
    this.removeBrightnessDragListeners();
  }
  removeBrightnessDragListeners() {
    document.removeEventListener("mousemove", this.handleBrightnessDrag), document.removeEventListener("mouseup", this.handleBrightnessDragEnd), 
    document.removeEventListener("touchmove", this.handleBrightnessDrag), document.removeEventListener("touchend", this.handleBrightnessDragEnd);
  }
  updateBrightnessValue(value) {
    this.visualBrightness = value, this.dispatchEvent(new CustomEvent("brightnessChange", {
      detail: Math.max(1, Math.min(255, Math.round(value))),
      bubbles: !0,
      composed: !0
    }));
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
  handleSettingsIconTouchStart(e) {
    e.stopPropagation(), this.longPressTimer && clearTimeout(this.longPressTimer), this.longPressTimer = setTimeout((() => {
      this.dispatchEvent(new CustomEvent("debugToggle", {
        bubbles: !0,
        composed: !0
      })), this.longPressTimer = null;
    }), 1e3);
  }
  handleSettingsIconTouchEnd(e) {
    e.stopPropagation(), this.longPressTimer && (clearTimeout(this.longPressTimer), 
    this.longPressTimer = null);
  }
  handleOverlayToggle(shouldShow) {
    this.dispatchEvent(new CustomEvent("overlayToggle", {
      detail: shouldShow,
      bubbles: !0,
      composed: !0
    }));
  }
  classMap(classes) {
    return Object.entries(classes).filter((([_, value]) => Boolean(value))).map((([className]) => className)).join(" ");
  }
  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html`
      <div
        class="brightness-card ${this.classMap({
      show: this.isBrightnessCardVisible,
      transitioning: this.isBrightnessCardTransitioning
    })}"
        @click="${e => e.stopPropagation()}"
      >
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div
              class="brightness-dots"
              @click="${this.handleBrightnessChange}"
              @mousedown="${this.handleBrightnessDragStart}"
              @touchstart="${this.handleBrightnessDragStart}"
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
  renderOverlay() {
    return html`
      <div
        class="overlay ${this.classMap({
      show: this.isOverlayVisible,
      transitioning: this.isOverlayTransitioning
    })}"
        @click="${e => e.stopPropagation()}"
      >
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
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ""}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ""}
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 5;
    cursor: pointer;
  }

  .night-time {
    color: white;
    font-size: 35vw;
    font-weight: 400;
    font-family: 'Product Sans Regular', sans-serif;
  }

  .error {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 14px;
    max-width: 80%;
    z-index: 10;
  }

  .tap-hint {
    position: fixed;
    bottom: 40px;
    left: 0;
    right: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    text-align: center;
    font-family: 'Rubik', sans-serif;
    font-weight: 300;
    animation: pulse 3s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0.3;
    }
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
      },
      isTransitioning: {
        type: Boolean
      },
      error: {
        type: String
      },
      sensorCheckedTime: {
        type: Number
      },
      nightModeSource: {
        type: String
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
    this.timeUpdateInterval = null, this.sensorCheckInterval = null, this.isTransitioning = !1, 
    this.error = null, this.sensorCheckedTime = 0, this.nightModeSource = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateTime(), this.startTimeUpdates(), this.isInNightMode && this.enterNightMode(), 
    this.sensorCheckInterval = setInterval((() => {
      this.checkLightSensor();
    }), 3e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval), 
    this.sensorCheckInterval && clearInterval(this.sensorCheckInterval);
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
    if (!this.isInNightMode || this.isTransitioning) {
      this.isTransitioning = !0;
      try {
        this.brightness > 1 && (this.previousBrightness = this.brightness), await this.toggleAutoBrightness(!1), 
        await new Promise((resolve => setTimeout(resolve, 100))), await this.setBrightness(1), 
        await new Promise((resolve => setTimeout(resolve, 100))), await this.toggleAutoBrightness(!0), 
        this.isInNightMode = !0, this.error = null;
      } catch (error) {
        this.error = `Error entering night mode: ${error.message}`;
      } finally {
        this.isTransitioning = !1, this.requestUpdate();
      }
    }
  }
  async exitNightMode() {
    if (this.isInNightMode && !this.isTransitioning) {
      this.isTransitioning = !0;
      try {
        await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 100)));
        const targetBrightness = this.previousBrightness && this.previousBrightness > 1 ? this.previousBrightness : 128;
        await this.setBrightness(targetBrightness), this.isInNightMode = !1, this.error = null, 
        this.dispatchEvent(new CustomEvent("nightModeExit", {
          bubbles: !0,
          composed: !0
        }));
      } catch (error) {
        this.error = `Error exiting night mode: ${error.message}`;
      } finally {
        this.isTransitioning = !1, this.requestUpdate();
      }
    }
  }
  async setBrightness(value) {
    if (!this.hass) return;
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_screen_brightness_level",
      data: {
        command: brightness
      }
    }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_update_sensors"
    }), await new Promise((resolve => setTimeout(resolve, 500))), this.brightness = brightness, 
    this.requestUpdate();
  }
  async toggleAutoBrightness(enabled) {
    this.hass && await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_auto_screen_brightness",
      data: {
        command: enabled ? "turn_on" : "turn_off"
      }
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && this.hass) {
      Date.now() - this.sensorCheckedTime > 5e3 && this.checkLightSensor();
    }
  }
  checkLightSensor() {
    if (!this.hass) return;
    this.sensorCheckedTime = Date.now();
    const lightSensor = this.hass.states["sensor.liam_room_display_light_sensor"];
    if (lightSensor && "unavailable" !== lightSensor.state && "unknown" !== lightSensor.state) try {
      const shouldBeInNightMode = 0 === parseInt(lightSensor.state);
      if (this.isInNightMode && "manual" === this.nightModeSource) return;
      shouldBeInNightMode && !this.isInNightMode ? (this.enterNightMode(), this.nightModeSource = "sensor") : !shouldBeInNightMode && this.isInNightMode && "sensor" === this.nightModeSource && (this.exitNightMode(), 
      this.nightModeSource = null);
    } catch (error) {}
  }
  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div class="night-mode" @click="${this.handleNightModeTap}">
        <div class="night-time">${this.currentTime}</div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ""}
        ${"manual" === this.nightModeSource ? html` <div class="tap-hint">Tap anywhere to exit night mode</div> ` : ""}
      </div>
    `;
  }
  handleNightModeTap() {
    this.isInNightMode && "manual" === this.nightModeSource && (this.exitNightMode(), 
    this.dispatchEvent(new CustomEvent("nightModeExit", {
      bubbles: !0,
      composed: !0
    })));
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
    margin-left: auto;
    margin-right: 40px;
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
    margin-right: 40px;
  }

  .weather-icon {
    width: 50px;
    height: 50px;
  }

  .temperature {
    font-size: 35px;
    font-weight: 500;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
    padding-top: 2px;
  }

  .aqi {
    font-size: 20px;
    padding: 7px 15px 5px 15px;
    border-radius: 6px;
    font-weight: 500;
    margin-left: 30px;
    align-self: flex-end;
    min-width: 60px;
    text-align: center;
  }

  .error {
    color: #ff4d4d;
    margin-top: 10px;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    text-shadow: none;
  }
`;

customElements.define("weather-clock", class WeatherClock extends LitElement$1 {
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
      },
      weatherEntity: {
        type: String
      },
      aqiEntity: {
        type: String
      },
      error: {
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
    this.date = "", this.time = "", this.temperature = "--°", this.weatherIcon = "not-available", 
    this.aqi = "--", this.weatherEntity = "weather.forecast_home", this.aqiEntity = "sensor.air_quality_index", 
    this.error = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateWeather(), this.scheduleNextMinuteUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.updateTimer && clearTimeout(this.updateTimer);
  }
  scheduleNextMinuteUpdate() {
    const now = new Date, delay = 1e3 * (60 - now.getSeconds()) + (1e3 - now.getMilliseconds());
    this.updateTimer = setTimeout((() => {
      this.updateWeather(), this.scheduleNextMinuteUpdate();
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
  updated(changedProperties) {
    changedProperties.has("hass") && this.hass && this.updateWeatherData();
  }
  findWeatherEntity() {
    if (!this.hass) return null;
    if (this.weatherEntity && this.hass.states[this.weatherEntity]) return this.weatherEntity;
    if (this.hass.states["weather.64_west_glen_ave"]) return this.weatherEntity = "weather.64_west_glen_ave", 
    this.weatherEntity;
    for (const entityId in this.hass.states) if (entityId.startsWith("weather.")) return this.weatherEntity = entityId, 
    entityId;
    return null;
  }
  findAqiEntity() {
    if (!this.hass) return null;
    if (this.aqiEntity && this.hass.states[this.aqiEntity]) return this.aqiEntity;
    if (this.hass.states["sensor.ridgewood_air_quality_index"]) return this.aqiEntity = "sensor.ridgewood_air_quality_index", 
    this.aqiEntity;
    const possibleNames = [ "air_quality_index", "aqi", "pm25", "pm2_5", "air_quality" ];
    for (const entityId in this.hass.states) if (entityId.startsWith("sensor.")) {
      const name = entityId.replace("sensor.", "").toLowerCase();
      if (possibleNames.some((term => name.includes(term)))) return this.aqiEntity = entityId, 
      entityId;
    }
    return null;
  }
  updateWeatherData() {
    if (this.hass) {
      try {
        const weatherEntityId = this.findWeatherEntity(), aqiEntityId = this.findAqiEntity();
        if (weatherEntityId) {
          const weatherEntity = this.hass.states[weatherEntityId];
          weatherEntity && weatherEntity.attributes && void 0 !== weatherEntity.attributes.temperature ? (this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`, 
          this.weatherIcon = this.getWeatherIcon(weatherEntity.state)) : (this.temperature = "--°", 
          this.weatherIcon = "not-available");
        } else this.temperature = "--°", this.weatherIcon = "not-available";
        if (aqiEntityId) {
          const aqiEntity = this.hass.states[aqiEntityId];
          aqiEntity && aqiEntity.state && "unknown" !== aqiEntity.state && "unavailable" !== aqiEntity.state ? this.aqi = aqiEntity.state : this.aqi = "--";
        } else this.aqi = "--";
        this.error = null;
      } catch (error) {
        console.error("Error updating weather data:", error), this.error = `Error: ${error.message}`;
      }
      this.requestUpdate();
    }
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
      exceptional: "not-available",
      overcast: "overcast-day",
      "partly-cloudy": "partly-cloudy-day",
      "partly-cloudy-night": "partly-cloudy-night",
      clear: "clear-day",
      thunderstorm: "thunderstorms",
      storm: "thunderstorms",
      rain: "rain",
      snow: "snow",
      mist: "fog",
      dust: "dust",
      smoke: "smoke",
      drizzle: "drizzle",
      "light-rain": "drizzle"
    }[state] || "not-available";
  }
  getAqiColor(aqi) {
    const aqiNum = parseInt(aqi);
    return isNaN(aqiNum) ? "#999999" : aqiNum <= 50 ? "#68a03a" : aqiNum <= 100 ? "#f9bf33" : aqiNum <= 150 ? "#f47c06" : aqiNum <= 200 ? "#c43828" : aqiNum <= 300 ? "#ab1457" : "#83104c";
  }
  render() {
    const hasValidAqi = this.aqi && "--" !== this.aqi;
    return html$1`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
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
              onerror="this.src='https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg'; if(this.src.includes('not-available')) this.onerror=null;"
            />
            <span class="temperature">${this.temperature}</span>
          </div>
          ${hasValidAqi ? html$1`
                <div class="aqi" style="background-color: ${this.getAqiColor(this.aqi)}">
                  ${this.aqi} AQI
                </div>
              ` : ""}
        </div>
        ${this.error ? html$1`<div class="error">${this.error}</div>` : ""}
      </div>
    `;
  }
});

class GoogleCard extends LitElement$1 {
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
      isOverlayVisible: {
        type: Boolean
      },
      isOverlayTransitioning: {
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
      isBrightnessCardVisible: {
        type: Boolean
      },
      isBrightnessCardTransitioning: {
        type: Boolean
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
      touchStartTime: {
        type: Number
      },
      touchStartX: {
        type: Number
      },
      debugTouchInfo: {
        type: Object
      },
      brightnessUpdateQueue: {
        type: Array
      },
      isProcessingBrightnessUpdate: {
        type: Boolean
      },
      isDarkMode: {
        type: Boolean
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css$1`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        .touch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          touch-action: none;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .debug-info {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 20px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80%;
          overflow: auto;
          z-index: 9999;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .debug-info h2 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #fff;
          text-align: center;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }

        .debug-info h3 {
          margin-top: 15px;
          margin-bottom: 10px;
          color: #76d275;
          border-bottom: 1px dotted #444;
          padding-bottom: 5px;
        }

        .debug-info h4 {
          margin-top: 15px;
          margin-bottom: 5px;
          color: #80deea;
        }

        .debug-info p {
          margin: 5px 0;
          line-height: 1.3;
        }

        .debug-info button {
          background: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 5px;
          padding: 5px 10px;
          margin: 0 2px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          transition: background 0.2s;
        }

        .debug-info button:hover {
          background: #444;
        }

        .debug-info button:active {
          background: #222;
        }

        .debug-info pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          background: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 5px;
          font-size: 11px;
          margin: 5px 0;
        }

        .debug-info ul {
          margin: 5px 0;
          padding-left: 20px;
        }

        .debug-info li {
          margin: 3px 0;
        }

        /* Style for strong tags */
        .debug-info strong {
          color: #ffab40;
        }
      ` ];
  }
  constructor() {
    super(), this.initializeProperties(), this.boundUpdateScreenSize = this.updateScreenSize.bind(this), 
    this.brightnessUpdateQueue = [], this.isProcessingBrightnessUpdate = !1, this.debugActiveTab = "main", 
    this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches, this.themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)"), 
    this.boundHandleThemeChange = this.handleThemeChange.bind(this), setTimeout((() => {
      this.updateCssVariables(), this.refreshComponents();
    }), 100);
  }
  initializeProperties() {
    this.showDebugInfo = !1, this.showOverlay = !1, this.isOverlayVisible = !1, this.isOverlayTransitioning = !1, 
    this.isNightMode = !1, this.showBrightnessCard = !1, this.isBrightnessCardVisible = !1, 
    this.isBrightnessCardTransitioning = !1, this.brightness = DEFAULT_CONFIG.brightness || 128, 
    this.visualBrightness = this.brightness, this.previousBrightness = this.brightness, 
    this.isInNightMode = !1, this.isAdjustingBrightness = !1, this.lastBrightnessUpdateTime = 0, 
    this.touchStartY = 0, this.touchStartX = 0, this.touchStartTime = 0, this.overlayDismissTimer = null, 
    this.brightnessCardDismissTimer = null, this.brightnessStabilizeTimer = null, this.timeUpdateInterval = null, 
    this.nightModeSource = null, this.debugTouchInfo = {
      touchStartY: 0,
      currentY: 0,
      deltaY: 0,
      lastSwipeDirection: "none",
      swipeCount: 0
    }, this.updateScreenSize(), this.updateTime();
  }
  setConfig(config) {
    if (!config.image_url) throw new Error("You need to define an image_url");
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      sensor_update_delay: config.sensor_update_delay || DEFAULT_CONFIG.sensor_update_delay
    }, this.showDebugInfo = this.config.show_debug, this.updateCssVariables();
  }
  updateCssVariables() {
    this.config && (this.style.setProperty("--crossfade-time", `${this.config.crossfade_time || 3}s`), 
    this.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease"), 
    this.style.setProperty("--theme-background", this.isDarkMode ? "#121212" : "#ffffff"), 
    this.style.setProperty("--theme-text", this.isDarkMode ? "#ffffff" : "#333333"), 
    document.documentElement.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease"), 
    document.documentElement.style.setProperty("--theme-background", this.isDarkMode ? "#121212" : "#ffffff"), 
    document.documentElement.style.setProperty("--theme-text", this.isDarkMode ? "#ffffff" : "#333333"));
  }
  handleThemeChange(e) {
    const newIsDarkMode = e.matches;
    this.isDarkMode !== newIsDarkMode && (this.isDarkMode = newIsDarkMode, this.requestUpdate(), 
    this.updateCssVariables(), this.refreshComponents());
  }
  refreshComponents() {
    const backgroundRotator = this.shadowRoot.querySelector("background-rotator"), weatherClock = this.shadowRoot.querySelector("weather-clock"), controls = this.shadowRoot.querySelector("google-controls");
    backgroundRotator && (backgroundRotator.requestUpdate(), backgroundRotator.updateCssVariables?.()), 
    weatherClock && weatherClock.requestUpdate(), controls && controls.requestUpdate(), 
    document.documentElement.setAttribute("data-theme", this.isDarkMode ? "dark" : "light");
  }
  connectedCallback() {
    super.connectedCallback(), this.startTimeUpdates(), setTimeout((() => this.updateNightMode()), 1e3), 
    window.addEventListener("resize", this.boundUpdateScreenSize), this.themeMediaQuery.addEventListener("change", this.boundHandleThemeChange), 
    document.documentElement.setAttribute("data-theme", this.isDarkMode ? "dark" : "light"), 
    setTimeout((() => {
      this.requestUpdate();
    }), 500);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearAllTimers(), window.removeEventListener("resize", this.boundUpdateScreenSize), 
    this.themeMediaQuery.removeEventListener("change", this.boundHandleThemeChange);
    const touchContainer = this.shadowRoot?.querySelector(".touch-container");
    touchContainer && (touchContainer.removeEventListener("touchstart", this.handleTouchStart), 
    touchContainer.removeEventListener("touchmove", this.handleTouchMove), touchContainer.removeEventListener("touchend", this.handleTouchEnd));
  }
  firstUpdated() {
    super.firstUpdated();
    const touchContainer = this.shadowRoot.querySelector(".touch-container");
    touchContainer && (touchContainer.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: !0
    }), touchContainer.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: !1
    }), touchContainer.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: !0
    }));
  }
  clearAllTimers() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval);
  }
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio), this.screenHeight = Math.round(window.innerHeight * pixelRatio), 
    this.requestUpdate();
  }
  startTimeUpdates() {
    this.updateTime(), this.timeUpdateInterval = setInterval((() => {
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
  handleTouchStart(event) {
    1 === event.touches.length && (this.touchStartY = event.touches[0].clientY, this.touchStartX = event.touches[0].clientX, 
    this.touchStartTime = Date.now(), this.debugTouchInfo = {
      ...this.debugTouchInfo,
      touchStartY: this.touchStartY,
      currentY: this.touchStartY,
      deltaY: 0
    }, this.requestUpdate());
  }
  handleTouchMove(event) {
    if (1 === event.touches.length) {
      const currentY = event.touches[0].clientY, deltaY = this.touchStartY - currentY;
      this.debugTouchInfo = {
        ...this.debugTouchInfo,
        currentY: currentY,
        deltaY: deltaY
      }, (this.showBrightnessCard || this.showOverlay) && event.preventDefault(), this.requestUpdate();
    }
  }
  handleTouchEnd(event) {
    if (1 === event.changedTouches.length) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY, deltaX = this.touchStartX - event.changedTouches[0].clientX, deltaTime = Date.now() - this.touchStartTime, velocityY = Math.abs(deltaY) / deltaTime, velocityX = Math.abs(deltaX) / deltaTime;
      if (this.debugTouchInfo = {
        ...this.debugTouchInfo,
        deltaY: deltaY,
        deltaX: deltaX,
        velocityY: velocityY.toFixed(2),
        velocityX: velocityX.toFixed(2),
        screenWidth: window.innerWidth,
        touchStartX: this.touchStartX,
        swipeCount: this.debugTouchInfo.swipeCount + 1
      }, this.isNightMode && "manual" === this.nightModeSource && Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return this.debugTouchInfo.lastSwipeDirection = "tap", 
      void this.handleNightModeTransition(!1);
      Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && velocityX > .2 && this.touchStartX < .2 * window.innerWidth && deltaX < 0 ? (this.debugTouchInfo.lastSwipeDirection = "right-edge", 
      this.isNightMode || this.handleNightModeTransition(!0, "manual")) : Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && velocityY > .2 && (this.debugTouchInfo.lastSwipeDirection = deltaY > 0 ? "up" : "down", 
      deltaY > 0 && !this.showBrightnessCard && !this.showOverlay ? this.handleOverlayToggle(!0) : deltaY < 0 && (this.showBrightnessCard ? this.dismissBrightnessCard() : this.showOverlay && this.dismissOverlay())), 
      this.requestUpdate();
    }
  }
  handleOverlayToggle(shouldShow = !0) {
    shouldShow && !this.showOverlay ? (this.showOverlay = !0, this.isOverlayTransitioning = !0, 
    requestAnimationFrame((() => {
      requestAnimationFrame((() => {
        this.isOverlayVisible = !0, this.startOverlayDismissTimer(), this.requestUpdate(), 
        setTimeout((() => {
          this.isOverlayTransitioning = !1, this.requestUpdate();
        }), 300);
      }));
    }))) : !shouldShow && this.showOverlay && this.dismissOverlay();
  }
  startOverlayDismissTimer() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.overlayDismissTimer = setTimeout((() => {
      this.dismissOverlay();
    }), 1e4);
  }
  startBrightnessCardDismissTimer() {
    this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    this.brightnessCardDismissTimer = setTimeout((() => {
      this.dismissBrightnessCard();
    }), 1e4);
  }
  dismissOverlay() {
    this.isOverlayTransitioning || (this.isOverlayTransitioning = !0, this.isOverlayVisible = !1, 
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), requestAnimationFrame((() => {
      this.requestUpdate(), setTimeout((() => {
        this.showOverlay = !1, this.isOverlayTransitioning = !1, this.requestUpdate();
      }), 300);
    })));
  }
  dismissBrightnessCard() {
    this.isBrightnessCardTransitioning || (this.isBrightnessCardTransitioning = !0, 
    this.isBrightnessCardVisible = !1, this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    requestAnimationFrame((() => {
      this.requestUpdate(), setTimeout((() => {
        this.showBrightnessCard = !1, this.isBrightnessCardTransitioning = !1, this.requestUpdate();
      }), 300);
    })));
  }
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = !0, this.visualBrightness = Math.max(1, Math.min(255, Math.round(value))), 
    this.brightnessUpdateQueue.push(value), this.isProcessingBrightnessUpdate || this.processBrightnessUpdateQueue(), 
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), this.brightnessStabilizeTimer = setTimeout((() => {
      this.isAdjustingBrightness = !1, this.requestUpdate();
    }), 2e3);
  }
  async processBrightnessUpdateQueue() {
    if (0 === this.brightnessUpdateQueue.length) return void (this.isProcessingBrightnessUpdate = !1);
    this.isProcessingBrightnessUpdate = !0;
    const lastValue = this.brightnessUpdateQueue[this.brightnessUpdateQueue.length - 1];
    this.brightnessUpdateQueue = [];
    try {
      await this.setBrightness(lastValue), this.lastBrightnessUpdateTime = Date.now();
    } catch (error) {
      this.visualBrightness = this.brightness;
    }
    setTimeout((() => this.processBrightnessUpdateQueue()), 250);
  }
  async setBrightness(value) {
    if (!this.hass) return;
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_screen_brightness_level",
      data: {
        command: brightness
      }
    }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_update_sensors"
    }), await new Promise((resolve => setTimeout(resolve, this.config.sensor_update_delay))), 
    this.brightness = brightness, this.isNightMode || (this.previousBrightness = brightness);
  }
  async handleNightModeTransition(newNightMode, source = "sensor") {
    if (newNightMode !== this.isInNightMode || this.nightModeSource !== source) try {
      newNightMode ? (await this.enterNightMode(), this.nightModeSource = source) : (await this.exitNightMode(), 
      this.nightModeSource = null), this.isInNightMode = newNightMode, this.isNightMode = newNightMode;
      const nightModeComponent = this.shadowRoot.querySelector("night-mode");
      nightModeComponent && (nightModeComponent.isInNightMode = newNightMode, nightModeComponent.previousBrightness = this.previousBrightness, 
      nightModeComponent.nightModeSource = this.nightModeSource), this.requestUpdate();
    } catch (error) {
      console.error("Error in night mode transition:", error), this.isInNightMode = !newNightMode, 
      this.isNightMode = !newNightMode, this.requestUpdate();
    }
  }
  async enterNightMode() {
    !this.isInNightMode && this.brightness > 1 && (this.previousBrightness = this.brightness);
    try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 200))), 
      await this.setBrightness(1), await new Promise((resolve => setTimeout(resolve, 200))), 
      await this.toggleAutoBrightness(!0);
    } catch (error) {
      throw console.error("Error entering night mode:", error), error;
    }
  }
  async exitNightMode() {
    try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 200)));
      const restoreBrightness = this.previousBrightness && this.previousBrightness > 1 ? this.previousBrightness : 128;
      await this.setBrightness(restoreBrightness);
    } catch (error) {
      throw console.error("Error exiting night mode:", error), error;
    }
  }
  async toggleAutoBrightness(enabled) {
    this.hass && await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
      message: "command_auto_screen_brightness",
      data: {
        command: enabled ? "turn_on" : "turn_off"
      }
    });
  }
  handleBrightnessCardToggle=event => {
    const shouldShow = event.detail;
    shouldShow && !this.showBrightnessCard ? (this.showOverlay && (this.isOverlayVisible = !1, 
    this.showOverlay = !1, this.isOverlayTransitioning = !1, this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer)), 
    this.showBrightnessCard = !0, this.isBrightnessCardTransitioning = !0, requestAnimationFrame((() => {
      this.isBrightnessCardVisible = !0, this.startBrightnessCardDismissTimer(), this.requestUpdate(), 
      setTimeout((() => {
        this.isBrightnessCardTransitioning = !1, this.requestUpdate();
      }), 300);
    }))) : !shouldShow && this.showBrightnessCard && this.dismissBrightnessCard();
  };
  handleBrightnessChange=async event => {
    await this.updateBrightnessValue(event.detail), this.startBrightnessCardDismissTimer();
  };
  handleDebugToggle=() => {
    this.showDebugInfo = !this.showDebugInfo, this.requestUpdate();
  };
  handleNightModeExit=() => {
    this.isNightMode = !1, this.requestUpdate();
  };
  updateNightMode() {
    if (!this.hass) return;
    const lightSensor = this.hass.states["sensor.liam_room_display_light_sensor"];
    if (!lightSensor) return;
    const sensorState = lightSensor.state;
    if ("unavailable" === sensorState || "unknown" === sensorState) return;
    const shouldBeInNightMode = 0 === parseInt(sensorState);
    this.isInNightMode && "manual" === this.nightModeSource || shouldBeInNightMode !== this.isInNightMode && this.handleNightModeTransition(shouldBeInNightMode, "sensor");
  }
  updateBrightness() {
    if (!this.hass) return;
    if (!this.hass.states["sensor.liam_room_display_light_sensor"]) return;
    const brightnessSensor = this.hass.states["sensor.liam_room_display_brightness_sensor"];
    if (brightnessSensor && "unavailable" !== brightnessSensor.state && "unknown" !== brightnessSensor.state) try {
      const currentBrightness = parseInt(brightnessSensor.state);
      !isNaN(currentBrightness) && currentBrightness > 0 && !this.isAdjustingBrightness && (this.isInNightMode || (this.brightness = currentBrightness, 
      this.visualBrightness = currentBrightness));
    } catch (error) {}
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && this.hass && !this.isAdjustingBrightness) {
      Date.now() - this.lastBrightnessUpdateTime > 2e3 && (this.updateNightMode(), this.updateBrightness());
    }
  }
  renderDebugInfo() {
    return this.showDebugInfo ? (this.shadowRoot.querySelector("background-rotator"), 
    this.shadowRoot.querySelector("weather-clock"), html$1`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
        <div style="display: flex; justify-content: space-between;">
          <button @click="${() => this.handleDebugTabClick("main")}">Main</button>
          <button @click="${() => this.handleDebugTabClick("touch")}">Touch</button>
          <button @click="${() => this.handleDebugTabClick("background")}">Background</button>
          <button @click="${() => this.handleDebugTabClick("weather")}">Weather</button>
          <button @click="${() => this.handleDebugTabClick("config")}">Config</button>
        </div>
        <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;">
          ${this.renderDebugTab()}
        </div>
      </div>
    `) : "";
  }
  handleDebugTabClick(tab) {
    this.debugActiveTab = tab, this.requestUpdate();
  }
  renderDebugTab() {
    switch (this.debugActiveTab || (this.debugActiveTab = "main"), this.debugActiveTab) {
     case "main":
     default:
      return this.renderMainDebugInfo();

     case "touch":
      return this.renderTouchDebugInfo();

     case "background":
      return this.renderBackgroundDebugInfo();

     case "weather":
      return this.renderWeatherDebugInfo();

     case "config":
      return this.renderConfigDebugInfo();
    }
  }
  renderMainDebugInfo() {
    return html$1`
      <h3>Main Information</h3>
      <p><strong>Screen Width:</strong> ${this.screenWidth}px</p>
      <p><strong>Screen Height:</strong> ${this.screenHeight}px</p>
      <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio}</p>
      <p><strong>Dark Mode:</strong> ${this.isDarkMode ? "Enabled" : "Disabled"}</p>

      <h4>Night Mode:</h4>
      <p><strong>Night Mode:</strong> ${this.isNightMode ? "Active" : "Inactive"}</p>
      <p><strong>Is In Night Mode:</strong> ${this.isInNightMode ? "Yes" : "No"}</p>
      <p><strong>Night Mode Source:</strong> ${this.nightModeSource || "None"}</p>
      <p>
        <small
          >${"sensor" === this.nightModeSource ? "Sensor-activated night mode will turn off when room brightens" : "manual" === this.nightModeSource ? "Manually-activated night mode will turn off when screen is tapped" : ""}</small
        >
      </p>

      <h4>Brightness:</h4>
      <p><strong>Current Brightness:</strong> ${this.brightness}</p>
      <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
      <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
      <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness ? "Yes" : "No"}</p>
      <p>
        <strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}
      </p>

      <h4>UI States:</h4>
      <p><strong>Show Overlay:</strong> ${this.showOverlay ? "Yes" : "No"}</p>
      <p><strong>Overlay Visible:</strong> ${this.isOverlayVisible ? "Yes" : "No"}</p>
      <p><strong>Overlay Transitioning:</strong> ${this.isOverlayTransitioning ? "Yes" : "No"}</p>
      <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard ? "Yes" : "No"}</p>
      <p>
        <strong>Brightness Card Visible:</strong> ${this.isBrightnessCardVisible ? "Yes" : "No"}
      </p>
      <p>
        <strong>Brightness Card Transitioning:</strong> ${this.isBrightnessCardTransitioning ? "Yes" : "No"}
      </p>
    `;
  }
  renderTouchDebugInfo() {
    return html$1`
      <h3>Touch Information</h3>
      <p>
        <strong>Last Swipe Direction:</strong> ${this.debugTouchInfo.lastSwipeDirection || "None"}
      </p>
      <p><strong>Swipe Count:</strong> ${this.debugTouchInfo.swipeCount || 0}</p>
      <p><strong>Touch Start X:</strong> ${this.debugTouchInfo.touchStartX?.toFixed(1) || 0}px</p>
      <p><strong>Touch Start Y:</strong> ${this.debugTouchInfo.touchStartY?.toFixed(1) || 0}px</p>
      <p><strong>Current Y:</strong> ${this.debugTouchInfo.currentY?.toFixed(1) || 0}px</p>
      <p><strong>Delta X:</strong> ${this.debugTouchInfo.deltaX?.toFixed(1) || 0}px</p>
      <p><strong>Delta Y:</strong> ${this.debugTouchInfo.deltaY?.toFixed(1) || 0}px</p>
      <p><strong>Velocity X:</strong> ${this.debugTouchInfo.velocityX || 0}px/ms</p>
      <p><strong>Velocity Y:</strong> ${this.debugTouchInfo.velocityY || 0}px/ms</p>
      <p><strong>Gesture Instructions:</strong></p>
      <ul>
        <li>Swipe up from bottom: Show overlay controls</li>
        <li>Swipe down: Dismiss overlay/controls</li>
        <li>Swipe right from left edge: Activate manual night mode</li>
        <li>Tap screen: Turn off manual night mode</li>
      </ul>

      <h4>Night Mode Behavior:</h4>
      <ul>
        <li>
          <strong>Manual Night Mode:</strong> Activated by swiping from left edge. Can only be
          dismissed by tapping screen. Ignores room brightness.
        </li>
        <li>
          <strong>Sensor Night Mode:</strong> Activated when room is dark. Automatically deactivates
          when room brightens.
        </li>
      </ul>
    `;
  }
  renderBackgroundDebugInfo() {
    const backgroundRotator = this.shadowRoot.querySelector("background-rotator");
    let imageA = "Not available", imageB = "Not available", imageList = [];
    return backgroundRotator && (imageA = backgroundRotator.imageA, imageB = backgroundRotator.imageB, 
    imageList = backgroundRotator.imageList || []), html$1`
      <h3>Background Information</h3>
      <p><strong>Current Image Index:</strong> ${backgroundRotator?.currentImageIndex || -1}</p>
      <p><strong>Image List Length:</strong> ${imageList.length}</p>
      <p><strong>Active Image:</strong> ${backgroundRotator?.activeImage || "None"}</p>
      <p><strong>Is Transitioning:</strong> ${backgroundRotator?.isTransitioning ? "Yes" : "No"}</p>
      <p><strong>Source Type:</strong> ${backgroundRotator?.getImageSourceType?.() || "unknown"}</p>
      <p><strong>Error:</strong> ${backgroundRotator?.error || "None"}</p>

      <h4>Image A:</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">${imageA}</div>

      <h4>Image B:</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">${imageB}</div>

      <h4>Image List (first 3):</h4>
      <div style="max-width: 100%; word-break: break-all; font-size: 11px;">
        ${imageList.slice(0, 3).map((url => html$1`<div>${url}</div>`))}
        ${imageList.length > 3 ? html$1`<div>...and ${imageList.length - 3} more</div>` : ""}
      </div>
    `;
  }
  renderWeatherDebugInfo() {
    const weatherClock = this.shadowRoot.querySelector("weather-clock");
    return html$1`
      <h3>Weather Information</h3>
      <p><strong>Date:</strong> ${weatherClock?.date || "N/A"}</p>
      <p><strong>Time:</strong> ${weatherClock?.time || "N/A"}</p>
      <p><strong>Temperature:</strong> ${weatherClock?.temperature || "N/A"}</p>
      <p><strong>Weather Icon:</strong> ${weatherClock?.weatherIcon || "N/A"}</p>
      <p><strong>AQI:</strong> ${weatherClock?.aqi || "N/A"}</p>
      <p><strong>Weather Entity:</strong> ${weatherClock?.weatherEntity || "N/A"}</p>
      <p><strong>AQI Entity:</strong> ${weatherClock?.aqiEntity || "N/A"}</p>
      <p><strong>Error:</strong> ${weatherClock?.error || "None"}</p>

      <div style="margin-top: 15px;">
        <h4>Light Sensor:</h4>
        <p>The Google Card uses the light sensor to determine night mode.</p>
        <p><strong>Sensor Entity:</strong> sensor.liam_room_display_light_sensor</p>
        <p>
          <strong>Current Value:</strong> ${this.hass?.states["sensor.liam_room_display_light_sensor"]?.state || "N/A"}
        </p>
        <p><small>Night mode activates when sensor value is 0</small></p>
      </div>
    `;
  }
  renderConfigDebugInfo() {
    return html$1`
      <h3>Configuration</h3>
      <pre style="font-size: 11px; overflow: auto; max-height: 300px;">
${JSON.stringify(this.config, null, 2)}</pre
      >
    `;
  }
  render() {
    const mainContent = this.isNightMode ? html$1`
          <night-mode
            .currentTime=${this.currentTime}
            .hass=${this.hass}
            .brightness=${this.brightness}
            .previousBrightness=${this.previousBrightness}
            .isInNightMode=${this.isInNightMode}
            .nightModeSource=${this.nightModeSource}
            @nightModeExit=${this.handleNightModeExit}
          ></night-mode>
        ` : html$1`
      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
        .showDebugInfo=${!1} <!-- Never show component's own debug, we use consolidated view -->
      ></background-rotator>

      <weather-clock 
        .hass=${this.hass}
      ></weather-clock>

      <google-controls
        .hass=${this.hass}
        .showOverlay=${this.showOverlay}
        .isOverlayVisible=${this.isOverlayVisible}
        .isOverlayTransitioning=${this.isOverlayTransitioning}
        .showBrightnessCard=${this.showBrightnessCard}
        .isBrightnessCardVisible=${this.isBrightnessCardVisible}
        .isBrightnessCardTransitioning=${this.isBrightnessCardTransitioning}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
        @overlayToggle=${this.handleOverlayToggle}
        @brightnessCardToggle=${this.handleBrightnessCardToggle}
        @brightnessChange=${this.handleBrightnessChange}
        @debugToggle=${this.handleDebugToggle}
      ></google-controls>
    `;
    return html$1`
      <!-- Import all required fonts with crossorigin attribute -->
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
      />

      <!-- Ensure Iconify is loaded -->
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>

      <!-- Fallback font style for Product Sans -->
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src: local('Product Sans'), local('Product Sans Regular'), local('ProductSans-Regular'),
            url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2)
              format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      </style>

      <div class="touch-container">
        <div class="content-wrapper">
          ${mainContent} ${this.showDebugInfo ? this.renderDebugInfo() : ""}
        </div>
      </div>
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
