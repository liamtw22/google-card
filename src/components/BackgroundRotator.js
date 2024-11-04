import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { backgroundStyles } from '../styles/background.js';
import { TIMING, IMAGE_SOURCE_TYPES, DEFAULT_CONFIG, CSS_CLASSES } from '../constants.js';

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
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

  connectedCallback() {
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.startImageRotation();
    this.render();
  }

  disconnectedCallback() {
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
    this.render();
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
    } catch (error) {
      console.error('Error updating image:', error);
      this.error = `Error updating image: ${error.message}`;
      this.render();
    }
  }

  async getNextImage() {
    if (this.preloadedImage) {
      const image = this.preloadedImage;
      this.preloadedImage = '';
      return image;
    }
    if (this.imageList.length === 0) {
      throw new Error('No images available');
    }
    this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
    return this.imageList[this.currentImageIndex];
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
    this.render();
  }

  getBackgroundSize() {
    return this.config?.image_fit || DEFAULT_CONFIG.image_fit;
  }

  setImageList(list) {
    this.imageList = list;
    this.currentImageIndex = -1;
    this.render();
  }

  setCrossfadeTime(time) {
    this.crossfadeTime = time;
    this.render();
  }

  setConfig(config) {
    this.config = config;
    this.render();
  }

  async forceImageUpdate() {
    await this.updateImage();
  }

  pauseRotation() {
    this.clearTimers();
  }

  resumeRotation() {
    this.startImageRotation();
  }

  render() {
    const styles = `
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
        background-size: ${this.getBackgroundSize()};
        background-position: center;
        background-repeat: no-repeat;
        will-change: opacity;
        transition: opacity ${this.crossfadeTime}s ease-in-out;
      }

      .error-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: #ff4444;
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        text-align: center;
        z-index: 2;
        max-width: 80%;
      }
    `;

    const imageAOpacity = this.activeImage === 'A' ? 1 : 0;
    const imageBOpacity = this.activeImage === 'B' ? 1 : 0;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="background-container">
        ${this.error ? `<div class="error-message">${this.error}</div>` : ''}
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); opacity: ${imageAOpacity};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); opacity: ${imageBOpacity};"
        ></div>
      </div>
    `;
  }
}

customElements.define('background-rotator', BackgroundRotator);
