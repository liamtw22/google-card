// src/components/BackgroundRotator.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
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
      imageListUpdateInterval: { type: Object },
      displayTime: { type: Number }
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
    this.displayTime = DEFAULT_CONFIG.display_time;
    this.screenWidth = window.outerWidth;
    this.screenHeight = window.outerHeight;
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
          : 100%;
          overflow: hidden;
          background-color: black;
        }

        .background-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          : 100%;
          background-color: black;
          z-index: 1;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          : 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          will-change: opacity, transform;
          transition-property: opacity;
          transition-timing-function: ease-in-out;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
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
    await this.startImageRotation();
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
    this.screenWidth = Math.ceil(window.outerWidth * pixelRatio);
    this.screenHeight = Math.ceil(window.outerHeight * pixelRatio);

    // Force image update when screen size changes
    this.updateImage();

    this.dispatchEvent(new CustomEvent('screen-size-update', {
      bubbles: true,
      composed: true,
      detail: {
        width: this.screenWidth,
        height: this.screenHeight
      }
    }));

    this.requestUpdate();
  }

  getImageUrl(template) {
    const pixelRatio = window.devicePixelRatio || 1;
    // Multiply dimensions by pixel ratio and round up to nearest 100 for better caching
    const width = this.screenWidth;
    const height = this.screenHeight;
    
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    
    return template
      .replace(/\${width}/g, width)
      .replace(/\${height}/g, height)
      .replace(/\${timestamp_ms}/g, timestamp_ms)
      .replace(/\${timestamp}/g, timestamp);
  }

  async initializeImageList() {
    if (!this.config?.image_url) {
      this.error = 'No image URL configured';
      return;
    }

    try {
      const imageUrl = this.getImageUrl(this.config.image_url);
      this.imageList = [imageUrl];
      this.currentImageIndex = -1;
      this.error = null;
      
      // Load initial image
      await this.preloadImage(imageUrl);
    } catch (error) {
      console.error('Error initializing image list:', error);
      this.error = 'Error initializing images';
    }
  }

  async startImageRotation() {
    try {
      await this.updateImage(); // Initial image load
      this.imageUpdateInterval = setInterval(() => {
        this.updateImage();
      }, this.displayTime * 1000);
    } catch (error) {
      console.error('Error starting image rotation:', error);
      this.error = 'Error starting image rotation';
      this.requestUpdate();
    }
  }

  async updateImage() {
    if (this.isTransitioning) {
      console.log('Skipping update - transition in progress');
      return;
    }
    
    try {
      const newImage = await this.getNextImage();
      if (newImage) {
        await this.transitionToNewImage(newImage);
        await this.preloadNextImage();
      }
    } catch (error) {
      console.error('Error updating image:', error);
      this.error = `Error updating image: ${error.message}`;
      this.requestUpdate();
    }
  }

  async getNextImage() {
    if (!this.config?.image_url) {
      throw new Error('No image URL configured');
    }

    // Generate a new image URL with current timestamp
    const nextImageUrl = this.getImageUrl(this.config.image_url);
    
    try {
      // Ensure the image is loaded before returning
      await this.preloadImage(nextImageUrl);
      return nextImageUrl;
    } catch (error) {
      throw new Error(`Failed to load image: ${nextImageUrl}`);
    }
  }

  async preloadImage(url) {
    if (!url) return null;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async transitionToNewImage(newImage) {
    if (this.isTransitioning) {
      console.log('Transition already in progress');
      return;
    }

    this.isTransitioning = true;

    try {
      // Set new image
      if (this.activeImage === 'A') {
        this.imageB = newImage;
      } else {
        this.imageA = newImage;
      }

      // Force a reflow before changing opacity
      this.requestUpdate();
      await this.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 50));

      // Switch active image
      this.activeImage = this.activeImage === 'A' ? 'B' : 'A';
      
      // Wait for transition to complete
      await new Promise(resolve => 
        setTimeout(resolve, (this.crossfadeTime * 1000) + 50)
      );
    } finally {
      this.isTransitioning = false;
      this.requestUpdate();
    }
  }

  async preloadNextImage() {
    if (!this.config?.image_url) return;
    
    try {
      const nextImageUrl = this.getImageUrl(this.config.image_url);
      this.preloadedImage = await this.preloadImage(nextImageUrl);
    } catch (error) {
      console.error('Error preloading next image:', error);
      this.preloadedImage = '';
    }
  }

  setConfig(config) {
    this.config = config;
    this.crossfadeTime = config.crossfade_time || DEFAULT_CONFIG.crossfade_time;
    this.displayTime = config.display_time || DEFAULT_CONFIG.display_time;
    this.initializeImageList();
    this.requestUpdate();
  }

  render() {
    const imageFit = this.config?.image_fit || DEFAULT_CONFIG.image_fit;
    
    return html`
      <div class="background-container">
        ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
        <div
          class="background-image"
          style="
            background-image: url('${this.imageA || ''}');
            opacity: ${this.activeImage === 'A' ? 1 : 0};
            transition-duration: ${this.crossfadeTime}s;
            background-size: ${imageFit};
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          "
        ></div>
        <div
          class="background-image"
          style="
            background-image: url('${this.imageB || ''}');
            opacity: ${this.activeImage === 'B' ? 1 : 0};
            transition-duration: ${this.crossfadeTime}s;
            background-size: ${imageFit};
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
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
