//src/components/BackgroundRotator.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { sharedStyles } from '../styles/SharedStyles';
import { TRANSITION_BUFFER } from '../constants';

export class BackgroundRotator extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      showDebugInfo: { type: Boolean },
      currentImageIndex: { type: Number },
      imageList: { type: Array },
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      error: { type: String },
      debugInfo: { type: Object },
      isTransitioning: { type: Boolean },
    };
  }

  static get styles() {
    return [sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.error = null;
    this.debugInfo = {};
    this.isTransitioning = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startImageRotation();
    this.startImageListUpdates();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimers();
  }

  clearTimers() {
    if (this.imageUpdateInterval) clearInterval(this.imageUpdateInterval);
    if (this.imageListUpdateInterval) clearInterval(this.imageListUpdateInterval);
  }

  startImageListUpdates() {
    this.updateImageList();
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, this.config.image_list_update_interval * 1000);
  }

  startImageRotation() {
    this.updateImage();
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, this.config.display_time * 1000);
  }

  getImageSourceType() {
    const { image_url } = this.config;
    if (image_url.startsWith('media-source://')) return 'media-source';
    if (image_url.startsWith('https://api.unsplash')) return 'unsplash-api';
    if (image_url.startsWith('immich+')) return 'immich-api';
    if (image_url.includes('picsum.photos')) return 'picsum';
    return 'url';
  }

  getImageUrl() {
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    return this.config.image_url
      .replace(/\${width}/g, this.screenWidth)
      .replace(/\${height}/g, this.screenHeight)
      .replace(/\${timestamp_ms}/g, timestamp_ms)
      .replace(/\${timestamp}/g, timestamp);
  }

  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) {
      this.error = 'Screen dimensions not set';
      this.requestUpdate();
      return;
    }

    try {
      const newImageList = await this.fetchImageList();
      this.imageList = this.config.image_order === 'random'
        ? newImageList.sort(() => 0.5 - Math.random())
        : newImageList.sort();

      // Set initial image if first load
      if (this.currentImageIndex === -1 && this.imageList.length > 0) {
        this.imageA = await this.preloadImage(this.imageList[0]);
        this.currentImageIndex = 0;
      }

      this.error = null;
      this.debugInfo.imageList = this.imageList;
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }

  async fetchImageList() {
    const sourceType = this.getImageSourceType();
    switch (sourceType) {
      case 'media-source':
        return this.getImagesFromMediaSource();
      case 'unsplash-api':
        return this.getImagesFromUnsplashAPI();
      case 'immich-api':
        return this.getImagesFromImmichAPI();
      default:
        return [this.getImageUrl()];
    }
  }

  async getImagesFromMediaSource() {
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, '');
      const result = await this.hass.callWS({
        type: 'media_source/browse_media',
        media_content_id: mediaContentId,
      });
      return result.children
        .filter(child => child.media_class === 'image')
        .map(child => child.media_content_id);
    } catch (error) {
      console.error('Error fetching images from media source:', error);
      return [this.getImageUrl()];
    }
  }

  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      const data = await response.json();
      return data.map(image => image.urls.regular);
    } catch (error) {
      console.error('Error fetching images from Unsplash API:', error);
      return [this.getImageUrl()];
    }
  }

  async getImagesFromImmichAPI() {
    try {
      const apiUrl = this.config.image_url.replace(/^immich\+/, '');
      const response = await fetch(`${apiUrl}/albums`, {
        headers: {
          'x-api-key': this.config.immich_api_key,
        },
      });
      const albums = await response.json();

      const imagePromises = albums.map(async (album) => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            'x-api-key': this.config.immich_api_key,
          },
        });
        const albumData = await albumResponse.json();
        return albumData.assets
          .filter(asset => asset.type === 'IMAGE')
          .map(asset => `${apiUrl}/assets/${asset.id}/original`);
      });

      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      console.error('Error fetching images from Immich API:', error);
      return [this.getImageUrl()];
    }
  }

  async preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async preloadNextImage() {
    if (this.imageList.length === 0) return;

    const nextImageToPreload = this.getImageSourceType() === 'picsum'
      ? this.getImageUrl()
      : this.imageList[(this.currentImageIndex + 1) % this.imageList.length];

    try {
      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error('Error preloading next image:', error);
      this.preloadedImage = '';
    }
  }

  async getNextImage() {
    if (this.imageList.length === 0) return null;

    let newImage;
    try {
      if (this.preloadedImage) {
        newImage = this.preloadedImage;
        this.preloadedImage = '';
      } else {
        if (this.getImageSourceType() === 'picsum') {
          newImage = this.getImageUrl();
        } else {
          this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
          newImage = this.imageList[this.currentImageIndex];
        }
        newImage = await this.preloadImage(newImage);
      }
      return newImage;
    } catch (error) {
      console.error('Error getting next image:', error);
      return null;
    }
  }

  async updateImage() {
    if (this.isTransitioning || this.imageList.length === 0) return;

    try {
      const newImage = await this.getNextImage();
      if (newImage) {
        await this.transitionToNewImage(newImage);
        this.preloadNextImage();
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  }

  async transitionToNewImage(newImage) {
    this.isTransitioning = true;

    if (this.activeImage === 'A') {
      this.imageB = newImage;
    } else {
      this.imageA = newImage;
    }

    this.updateDebugInfo();
    this.requestUpdate();

    await new Promise(resolve => setTimeout(resolve, TRANSITION_BUFFER));
    this.activeImage = this.activeImage === 'A' ? 'B' : 'A';
    this.requestUpdate();

    await new Promise(resolve => setTimeout(resolve, this.config.crossfade_time * 1000 + TRANSITION_BUFFER));
    this.isTransitioning = false;
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
    };
  }

  render() {
    const imageAOpacity = this.activeImage === 'A' ? 1 : 0;
    const imageBOpacity = this.activeImage === 'B' ? 1 : 0;

    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 background-size: ${this.config.image_fit || 'contain'};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 background-size: ${this.config.image_fit || 'contain'};"
        ></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
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

customElements.define('background-rotator', BackgroundRotator);
