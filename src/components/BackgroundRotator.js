// src/components/BackgroundRotator.js
import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from '../styles/shared.js';
import { TIMING, IMAGE_SOURCE_TYPES, DEFAULT_CONFIG } from '../constants.js';

export class BackgroundRotator extends LitElement {
  static get properties() {
    return {
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      isTransitioning: { type: Boolean },
      crossfadeTime: { type: Number },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      config: { type: Object },
      error: { type: String },
      imageList: { type: Array },
      currentImageIndex: { type: Number },
      imageUpdateInterval: { type: Object },
      imageListUpdateInterval: { type: Object }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }

  initializeProperties() {
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.isTransitioning = false;
    this.crossfadeTime = DEFAULT_CONFIG.crossfade_time;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.error = null;
    this.imageList = [];
    this.currentImageIndex = -1;
    this.imageUpdateInterval = null;
    this.imageListUpdateInterval = null;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: black;
        }

        .background-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
          z-index: 1;
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
          will-change: opacity;
          transition-property: opacity;
          transition-timing-function: ease-in-out;
        }

        .error-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--color-error);
          color: white;
          padding: var(--spacing-4);
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-base);
          text-align: center;
          z-index: 2;
          max-width: 80%;
        }
      `
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    await this.initializeImageList();
    this.startImageRotation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.clearTimers();
  }

  clearTimers() {
    if (this.imageUpdateInterval) clearInterval(this.imageUpdateInterval);
    if (this.imageListUpdateInterval) clearInterval(this.imageListUpdateInterval);
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }

  async initializeImageList() {
    if (this.config?.image_url) {
      try {
        const imageUrl = this.getImageUrl(this.config.image_url);
        this.imageList = [imageUrl];
        this.currentImageIndex = -1;
        this.error = null;
      } catch (error) {
        console.error('Error initializing image list:', error);
        this.error = 'Error initializing images';
      }
    }
  }

  getImageUrl(template) {
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    return template
      .replace(/\${width}/g, this.screenWidth)
      .replace(/\${height}/g, this.screenHeight)
      .replace(/\${timestamp_ms}/g, timestamp_ms)
      .replace(/\${timestamp}/g, timestamp);
  }

  async startImageRotation() {
    await this.updateImage();
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, (this.config?.display_time || DEFAULT_CONFIG.display_time) * 1000);
  }

  async updateImage() {
    if (this.isTransitioning) return;
    try {
      const newImage = await this.getNextImage();
      await this.transitionToNewImage(newImage);
      this.preloadNextImage();
      this.error = null;
    } catch (error) {
      console.error('Error updating image:', error);
      this.error = `Error updating image: ${error.message}`;
      this.requestUpdate();
    }
  }

  async getNextImage() {
    if (!this.imageList || this.imageList.length === 0) {
      if (this.config?.image_url) {
        const imageUrl = this.getImageUrl(this.config.image_url);
        this.imageList = [imageUrl];
      } else {
        throw new Error('No image URL configured');
      }
    }

    if (this.preloadedImage) {
      const image = this.preloadedImage;
      this.preloadedImage = '';
      return image;
    }

    this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
    const nextImage = this.imageList[this.currentImageIndex];
    return this.preloadImage(nextImage);
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
    try {
      const nextIndex = (this.currentImageIndex + 1) % this.imageList.length;
      const nextImageUrl = this.imageList[nextIndex];
      this.preloadedImage = await this.preloadImage(nextImageUrl);
    } catch (error) {
      console.error('Error preloading next image:', error);
      this.preloadedImage = '';
    }
  }

  async transitionToNewImage(newImage) {
    this.isTransitioning = true;

    if (this.activeImage === 'A') {
      this.imageB = newImage;
      await new Promise(resolve => setTimeout(resolve, TIMING.TRANSITION_BUFFER));
      this.activeImage = 'B';
    } else {
      this.imageA = newImage;
      await new Promise(resolve => setTimeout(resolve, TIMING.TRANSITION_BUFFER));
      this.activeImage = 'A';
    }

    await new Promise(resolve =>
      setTimeout(resolve, this.crossfadeTime * 1000 + TIMING.TRANSITION_BUFFER)
    );

    this.isTransitioning = false;
    this.requestUpdate();
  }

  setConfig(config) {
    this.config = config;
    this.initializeImageList();
    this.crossfadeTime = config.crossfade_time || DEFAULT_CONFIG.crossfade_time;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="background-container">
        ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
        <div
          class="background-image"
          style="
            background-image: url('${this.imageA}');
            opacity: ${this.activeImage === 'A' ? 1 : 0};
            transition-duration: ${this.crossfadeTime}s;
            background-size: ${this.config?.image_fit || DEFAULT_CONFIG.image_fit};
          "
        ></div>
        <div
          class="background-image"
          style="
            background-image: url('${this.imageB}');
            opacity: ${this.activeImage === 'B' ? 1 : 0};
            transition-duration: ${this.crossfadeTime}s;
            background-size: ${this.config?.image_fit || DEFAULT_CONFIG.image_fit};
          "
        ></div>
      </div>
    `;
  }

  // Public methods for external control
  async forceImageUpdate() {
    await this.updateImage();
  }

  pauseRotation() {
    this.clearTimers();
  }

  resumeRotation() {
    this.startImageRotation();
  }
}

customElements.define('background-rotator', BackgroundRotator);
