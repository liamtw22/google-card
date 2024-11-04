// src/components/BackgroundRotator.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { backgroundStyles } from '../styles/background.js';
import { TIMING, IMAGE_SOURCE_TYPES, DEFAULT_CONFIG } from '../constants.js';

if (!customElements.get('background-rotator')) {
  class BackgroundRotator extends LitElement {
    static get properties() {
      return {
        config: { type: Object },
        hass: { type: Object },
        imageA: { type: String },
        imageB: { type: String },
        activeImage: { type: String },
        preloadedImage: { type: String },
        isTransitioning: { type: Boolean },
        imageList: { type: Array },
        currentImageIndex: { type: Number },
        error: { type: String }
      };
    }

    constructor() {
      super();
      this.initializeProperties();
    }

    initializeProperties() {
      this.imageA = '';
      this.imageB = '';
      this.activeImage = 'A';
      this.preloadedImage = '';
      this.isTransitioning = false;
      this.imageList = [];
      this.currentImageIndex = -1;
      this.error = null;
      this.updateTimer = null;
    }

    connectedCallback() {
      super.connectedCallback();
      this.startImageRotation();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.clearTimers();
    }

    updated(changedProperties) {
      if (changedProperties.has('config') && this.config) {
        this.startImageRotation();
      }
    }

    clearTimers() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
    }

    async startImageRotation() {
      this.clearTimers();
      await this.updateImage();
      
      this.updateTimer = setInterval(() => {
        this.updateImage();
      }, (this.config?.display_time || DEFAULT_CONFIG.display_time) * 1000);
    }

    async updateImage() {
      if (this.isTransitioning || !this.config) return;

      try {
        const newImage = await this.getNextImage();
        if (newImage) {
          await this.transitionToNewImage(newImage);
        }
      } catch (error) {
        console.error('Error updating image:', error);
        this.error = `Error updating image: ${error.message}`;
        this.requestUpdate();
      }
    }

    async getNextImage() {
      if (!this.config.image_url) return null;

      if (this.config.image_url.startsWith('http')) {
        // For direct URLs, just return the URL with any necessary parameters
        return this.config.image_url
          .replace('${width}', window.innerWidth)
          .replace('${height}', window.innerHeight)
          .replace('${timestamp}', Date.now());
      }

      // Handle media-source URLs if needed
      if (this.config.image_url.startsWith('media-source://')) {
        // Add media source handling here if needed
        return this.config.image_url;
      }

      return this.config.image_url;
    }

    async transitionToNewImage(newImage) {
      this.isTransitioning = true;

      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });
      };

      try {
        await loadImage(newImage);

        if (this.activeImage === 'A') {
          this.imageB = newImage;
          await new Promise(resolve => setTimeout(resolve, 50));
          this.activeImage = 'B';
        } else {
          this.imageA = newImage;
          await new Promise(resolve => setTimeout(resolve, 50));
          this.activeImage = 'A';
        }

        await new Promise(resolve => 
          setTimeout(resolve, (this.config?.crossfade_time || DEFAULT_CONFIG.crossfade_time) * 1000)
        );
      } catch (error) {
        console.error('Image transition failed:', error);
        this.error = error.message;
      } finally {
        this.isTransitioning = false;
        this.requestUpdate();
      }
    }

    static get styles() {
      return [
        backgroundStyles,
        css`
          :host {
            display: block;
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
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
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: opacity ${props => props.config?.crossfade_time || DEFAULT_CONFIG.crossfade_time}s ease-in-out;
          }

          .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: red;
            padding: 1rem;
            border-radius: 4px;
          }
        `
      ];
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
            "
          ></div>
          <div
            class="background-image"
            style="
              background-image: url('${this.imageB}');
              opacity: ${this.activeImage === 'B' ? 1 : 0};
            "
          ></div>
        </div>
      `;
    }
  }

  customElements.define('background-rotator', BackgroundRotator);
}
