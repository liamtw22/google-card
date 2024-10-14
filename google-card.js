import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      currentImageIndex: { type: Number },
      imageList: { type: Array },
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      error: { type: String },
      debugInfo: { type: Object },
      isTransitioning: { type: Boolean },
      showDebugInfo: { type: Boolean },
      showOverlay: { type: Boolean },
      brightness: { type: Number },
      overlayDismissTimer: { type: Number },
      showBrightnessCard: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = "";
    this.imageB = "";
    this.activeImage = "A";
    this.preloadedImage = "";
    this.imageUpdateInterval = null;
    this.imageListUpdateInterval = null;
    this.error = null;
    this.debugInfo = {};
    this.urlTemplate = "";
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.isTransitioning = false;
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.updateScreenSize();
    this.touchStartY = 0;
    this.brightness = 128;
    this.overlayDismissTimer = null;
    this.showBrightnessCard = false;
    this.longPressTimer = null;
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }
    this.config = {
      image_url: "",
      display_time: 15,
      crossfade_time: 3,
      image_fit: "contain",
      image_list_update_interval: 3600,
      image_order: "sorted",
      show_debug: false,
      ...config,
    };
    this.urlTemplate = this.config.image_url;
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
    this.style.setProperty('--crossfade-time', `${this.config.crossfade_time}s`);
    console.log("Config set:", this.config);
  }

  async connectedCallback() {
    super.connectedCallback();
    console.log("Card connected");
    window.addEventListener('resize', this.boundUpdateScreenSize);
    await this.updateImageList();
    this.startImageRotation();
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, this.config.image_list_update_interval * 1000);

    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));

    await this.updateBrightness();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log("Card disconnected");
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    clearInterval(this.imageUpdateInterval);
    clearInterval(this.imageListUpdateInterval);
    this.clearOverlayDismissTimer();

    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  handleTouchStart(event) {
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    event.preventDefault();
  }

  handleTouchEnd(event) {
    const touchEndY = event.changedTouches[0].clientY;
    const deltaY = this.touchStartY - touchEndY;

    if (deltaY > 50) {
      this.showOverlay = true;
      this.requestUpdate();
      this.startOverlayDismissTimer();
    } else if (deltaY < -50) {
      this.dismissOverlay();
    }
  }

  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, 10000);
  }

  clearOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
      this.overlayDismissTimer = null;
    }
  }

  dismissOverlay() {
    this.showOverlay = false;
    this.showBrightnessCard = false;
    this.clearOverlayDismissTimer();
    this.requestUpdate();
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    console.log(`Viewport dimensions: ${this.screenWidth}x${this.screenHeight}`);
    this.updateImageList();
  }

  getImageUrl() {
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    let url = this.urlTemplate;
    url = url.replace(/\${width}/g, this.screenWidth);
    url = url.replace(/\${height}/g, this.screenHeight);
    url = url.replace(/\${timestamp_ms}/g, timestamp_ms);
    url = url.replace(/\${timestamp}/g, timestamp);
    console.log("Generated image URL:", url);
    return url;
  }

  async updateImageList() {
    console.log("Updating image list");
    if (!this.screenWidth || !this.screenHeight) {
      console.error("Screen dimensions not set");
      this.error = "Screen dimensions not set";
      this.requestUpdate();
      return;
    }
    const imageSourceType = this.getImageSourceType();
    let newImageList = [];

    try {
      switch (imageSourceType) {
        case "media-source":
          newImageList = await this.getImagesFromMediaSource();
          break;
        case "unsplash-api":
          newImageList = await this.getImagesFromUnsplashAPI();
          break;
        case "immich-api":
          newImageList = await this.getImagesFromImmichAPI();
          break;
        case "picsum":
          newImageList = [this.getImageUrl()];
          break;
        default:
          newImageList = [this.getImageUrl()];
      }

      if (this.config.image_order === "random") {
        newImageList.sort(() => 0.5 - Math.random());
      } else {
        newImageList.sort();
      }

      this.imageList = newImageList;
      this.error = null;
      this.debugInfo.imageList = this.imageList;
      console.log("Updated image list:", this.imageList);
    } catch (error) {
      console.error("Error updating image list:", error);
      this.error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }

  getImageSourceType() {
    const { image_url } = this.config;
    if (image_url.startsWith("media-source://")) return "media-source";
    if (image_url.startsWith("https://api.unsplash")) return "unsplash-api";
    if (image_url.startsWith("immich+")) return "immich-api";
    if (image_url.includes("picsum.photos")) return "picsum";
    return "url";
  }

  async getImagesFromMediaSource() {
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, '');
      const result = await this.hass.callWS({
        type: "media_source/browse_media",
        media_content_id: mediaContentId
      });

      return result.children
        .filter(child => child.media_class === "image")
        .map(child => child.media_content_id);
    } catch (error) {
      console.error("Error fetching images from media source:", error);
      return [this.getImageUrl()];
    }
  }

  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      const data = await response.json();
      return data.map(image => image.urls.regular);
    } catch (error) {
      console.error("Error fetching images from Unsplash API:", error);
      return [this.getImageUrl()];
    }
  }

  async getImagesFromImmichAPI() {
    try {
      const apiUrl = this.config.image_url.replace(/^immich\+/, "");
      const response = await fetch(`${apiUrl}/albums`, {
        headers: {
          'x-api-key': this.config.immich_api_key
        }
      });
      const albums = await response.json();
      
      const imagePromises = albums.map(async (album) => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            'x-api-key': this.config.immich_api_key
          }
        });
        const albumData = await albumResponse.json();
        return albumData.assets
          .filter(asset => asset.type === "IMAGE")
          .map(asset => `${apiUrl}/assets/${asset.id}/original`);
      });

      const imageArrays = await Promise.all(imagePromises);
      return imageArrays.flat();
    } catch (error) {
      console.error("Error fetching images from Immich API:", error);
      return [this.getImageUrl()];
    }
  }

  startImageRotation() {
    console.log("Starting image rotation");
    this.updateImage();
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, this.config.display_time * 1000);
  }

  async preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async updateImage() {
    console.log("Updating image");
    if (this.isTransitioning) {
      console.log("Transition in progress, skipping update");
      return;
    }

    let newImage;
    if (this.getImageSourceType() === "picsum") {
      newImage = this.getImageUrl();
    } else {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
      newImage = this.imageList[this.currentImageIndex];
    }

    if (this.preloadedImage) {
      newImage = this.preloadedImage;
      this.preloadedImage = "";
    } else {
      try {
        newImage = await this.preloadImage(newImage);
      } catch (error) {
        console.error("Error loading new image:", error);
        return;
      }
    }

    this.preloadNextImage();

    this.isTransitioning = true;

    if (this.activeImage === "A") {
      this.imageB = newImage;
    } else {
      this.imageA = newImage;
    }

    this.debugInfo.imageA = this.imageA;
    this.debugInfo.imageB = this.imageB;
    this.debugInfo.activeImage = this.activeImage;
    this.debugInfo.preloadedImage = this.preloadedImage;
    console.log("Image A:", this.imageA);
    console.log("Image B:", this.imageB);
    console.log("Active Image:", this.activeImage);
    console.log("Preloaded image:", this.preloadedImage);

    this.requestUpdate();

    setTimeout(() => {
      this.activeImage = this.activeImage === "A" ? "B" : "A";
      this.requestUpdate();

      setTimeout(() => {
        this.isTransitioning = false;
        this.requestUpdate();
      }, this.config.crossfade_time * 1000 + 50);
    }, 50);
  }

  async preloadNextImage() {
    let nextImageToPreload;
    if (this.getImageSourceType() === "picsum") {
      nextImageToPreload = this.getImageUrl();
    } else {
      const nextIndex = (this.currentImageIndex + 1) % this.imageList.length;
      nextImageToPreload = this.imageList[nextIndex];
    }

    try {
      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error("Error preloading next image:", error);
      this.preloadedImage = "";
    }
  }

  async updateBrightness() {
    if (this.hass && this.hass.states['number.liam_display_screen_brightness']) {
      const brightnessState = this.hass.states['number.liam_display_screen_brightness'];
      this.brightness = brightnessState.state;
    }
  }

  handleBrightnessChange(e) {
    const newBrightness = parseInt(e.target.value) * 25.5;
    this.hass.callService('number', 'set_value', {
      entity_id: 'number.liam_display_screen_brightness',
      value: Math.round(newBrightness)
    });
    this.brightness = newBrightness;
    this.startOverlayDismissTimer();
  }

  toggleBrightnessCard() {
    this.showBrightnessCard = !this.showBrightnessCard;
    this.startOverlayDismissTimer();
    this.requestUpdate();
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleSettingsIconTouchStart(e) {
    this.longPressTimer = setTimeout(() => {
      this.toggleDebugInfo();
    }, 1000); // 1 second long press
  }

  handleSettingsIconTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  render() {
    const imageAOpacity = this.activeImage === "A" ? 1 : 0;
    const imageBOpacity = this.activeImage === "B" ? 1 : 0;
    const brightnessValue = Math.round(this.brightness / 25.5);
    return html`
      <div class="background-container">
        <div class="background-image" style="background-image: url('${this.imageA}'); opacity: ${imageAOpacity};"></div>
        <div class="background-image" style="background-image: url('${this.imageB}'); opacity: ${imageBOpacity};"></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.showDebugInfo ? html`
        <div class="debug-info">
          <h2>Background Card Debug Info</h2>
          <h3>Background Card Version: 22</h3>
          <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
          <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
          <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
          <p><strong>Image A:</strong> ${this.imageA}</p>
          <p><strong>Image B:</strong> ${this.imageB}</p>
          <p><strong>Active Image:</strong> ${this.activeImage}</p>
          <p><strong>Preloaded Image:</strong> ${this.preloadedImage}</p>
          <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
          <p><strong>Image List:</strong> ${JSON.stringify(this.imageList)}</p>
          <p><strong>Error:</strong> ${this.error}</p>
          <h3>Config:</h3>
          <pre>${JSON.stringify(this.config, null, 2)}</pre>
        </div>
      ` : ''}
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
        ${this.showBrightnessCard ? html`
          <button class="back-button" @click="${this.toggleBrightnessCard}">
            <iconify-icon icon="material-symbols-light:arrow-back"></iconify-icon>
            Back
          </button>
          <div class="brightness-card">
            <div class="brightness-control">
              <label for="brightness-slider">Brightness:</label>
              <input 
                type="range" 
                id="brightness-slider" 
                min="0" 
                max="10" 
                step="1"
                .value="${brightnessValue}"
                @change="${this.handleBrightnessChange}"
                @input="${this.startOverlayDismissTimer}"
              >
            </div>
          </div>
        ` : html`
          <div class="icon-container">
            <div class="icon-row">
              <button class="icon-button" @click="${this.toggleBrightnessCard}">
                <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>
              </button>
              <button class="icon-button">
                <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>
              </button>
              <button class="icon-button">
                <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>
              </button>
              <button class="icon-button">
                <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>
              </button>
              <button class="icon-button"
                @touchstart="${this.handleSettingsIconTouchStart}"
                @touchend="${this.handleSettingsIconTouchEnd}"
                @touchcancel="${this.handleSettingsIconTouchEnd}">
                <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  }

  static get styles() {
    return css`
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
      }
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
        transition: opacity var(--crossfade-time, 3s) ease-in-out;
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
        z-index: 2;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
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
      }
      .icon-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 85%;
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
      }
      .icon-button:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .brightness-card {
        width: 90%;
        max-width: 300px;
      }
      .brightness-control {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .brightness-control label {
        margin-right: 10px;
      }
      .brightness-control input {
        flex-grow: 1;
      }
      .back-button {
        align-self: flex-start;
        background: none;
        border: none;
        color: #333;
        cursor: pointer;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
      }
      .back-button iconify-icon {
        margin-right: 8px;
      }
      iconify-icon {
        font-size: 50px;
        display: block;
        width: 50px;
        height: 50px;
      }
    `;
  }
}

customElements.define("google-card", GoogleCard);
