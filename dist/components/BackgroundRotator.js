import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { backgroundRotatorStyles } from "../styles/BackgroundRotatorStyles.js";

import { sharedStyles } from "../styles/SharedStyles.js";

import { IMAGE_SOURCE_TYPES, TRANSITION_BUFFER } from "../constants.js";

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
    clearInterval(this.imageUpdateInterval), clearInterval(this.imageListUpdateInterval);
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
    return image_url.startsWith("media-source://") ? IMAGE_SOURCE_TYPES.MEDIA_SOURCE : image_url.startsWith("https://api.unsplash") ? IMAGE_SOURCE_TYPES.UNSPLASH_API : image_url.startsWith("immich+") ? IMAGE_SOURCE_TYPES.IMMICH_API : image_url.includes("picsum.photos") ? IMAGE_SOURCE_TYPES.PICSUM : IMAGE_SOURCE_TYPES.URL;
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
      this.error = null, this.debugInfo.imageList = this.imageList;
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }
  async fetchImageList() {
    switch (this.getImageSourceType()) {
     case IMAGE_SOURCE_TYPES.MEDIA_SOURCE:
      return this.getImagesFromMediaSource();

     case IMAGE_SOURCE_TYPES.UNSPLASH_API:
      return this.getImagesFromUnsplashAPI();

     case IMAGE_SOURCE_TYPES.IMMICH_API:
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
    const nextImageToPreload = this.getImageSourceType() === IMAGE_SOURCE_TYPES.PICSUM ? this.getImageUrl() : this.imageList[(this.currentImageIndex + 1) % this.imageList.length];
    try {
      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error("Error preloading next image:", error), this.preloadedImage = "";
    }
  }
  async getNextImage() {
    let newImage;
    return this.preloadedImage ? (newImage = this.preloadedImage, this.preloadedImage = "") : (this.getImageSourceType() === IMAGE_SOURCE_TYPES.PICSUM ? newImage = this.getImageUrl() : (this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length, 
    newImage = this.imageList[this.currentImageIndex]), newImage = await this.preloadImage(newImage)), 
    newImage;
  }
  async updateImage() {
    if (!this.isTransitioning) try {
      const newImage = await this.getNextImage();
      await this.transitionToNewImage(newImage), this.preloadNextImage();
    } catch (error) {
      console.error("Error updating image:", error);
    }
  }
  async transitionToNewImage(newImage) {
    this.isTransitioning = !0, "A" === this.activeImage ? this.imageB = newImage : this.imageA = newImage, 
    this.updateDebugInfo(), this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, TRANSITION_BUFFER))), 
    this.activeImage = "A" === this.activeImage ? "B" : "A", this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, 1e3 * this.config.crossfade_time + TRANSITION_BUFFER))), 
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
  renderBackgroundImages() {
    const imageAOpacity = "A" === this.activeImage ? 1 : 0, imageBOpacity = "B" === this.activeImage ? 1 : 0;
    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                    opacity: ${imageAOpacity};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                    opacity: ${imageBOpacity};"
        ></div>
      </div>
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
  render() {
    return html`
      ${this.renderBackgroundImages()}
      ${this.error ? html`<div class="error">${this.error}</div>` : ""}
      ${this.showDebugInfo ? this.renderDebugInfo() : ""}
    `;
  }
}

customElements.define("background-rotator", BackgroundRotator);

export { BackgroundRotator };
//# sourceMappingURL=BackgroundRotator.js.map
