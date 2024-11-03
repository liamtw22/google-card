// src/components/BackgroundRotator.js
import { LitElement, html } from 'lit-element';
import { backgroundStyles } from '../styles/background.js';
import { 
  TIMING,
  IMAGE_SOURCE_TYPES,
  DEFAULT_CONFIG 
} from '../constants.js';
export class BackgroundRotator extends LitElement {
  static get properties() {
    return {
      // Image properties
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      isTransitioning: { type: Boolean },
      crossfadeTime: { type: Number },
      // Screen properties
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      // Config properties
      config: { type: Object },
      // State properties
      error: { type: String },
      imageList: { type: Array },
      currentImageIndex: { type: Number }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }
  initializeProperties() {
    // Initialize image properties
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.isTransitioning = false;
    this.crossfadeTime = DEFAULT_CONFIG.crossfade_time;
    
    // Initialize screen properties
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    
    // Initialize state properties
    this.error = null;
    this.imageList = [];
    this.currentImageIndex = -1;
    
    // Initialize timers
    this.imageUpdateInterval = null;
    this.imageListUpdateInterval = null;
  }
  static get styles() {
    return backgroundStyles;
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.startImageRotation();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.clearTimers();
  }
  clearTimers() {
    if (this.imageUpdateInterval) {
      clearInterval(this.imageUpdateInterval);
    }
    if (this.imageListUpdateInterval) {
      clearInterval(this.imageListUpdateInterval);
    }
  }
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
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
      console.error("Error updating image:", error);
      this.error = `Error updating image: ${error.message}`;
      this.requestUpdate();
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
      console.error("Error preloading next image:", error);
      this.preloadedImage = '';
    }
  }
  async transitionToNewImage(newImage) {
    this.isTransitioning = true;
    
    if (this.activeImage === 'A') {
      this.imageB = newImage;
      await this.updateComplete;
      await new Promise(resolve => setTimeout(resolve, TIMING.TRANSITION_BUFFER));
      this.activeImage = 'B';
    } else {
      this.imageA = newImage;
      await this.updateComplete;
      await new Promise(resolve => setTimeout(resolve, TIMING.TRANSITION_BUFFER));
      this.activeImage = 'A';
    }
    // Wait for crossfade to complete
    await new Promise(resolve => 
      setTimeout(resolve, this.crossfadeTime * 1000 + TIMING.TRANSITION_BUFFER)
    );
    
    this.isTransitioning = false;
    this.requestUpdate();
  }
  getBackgroundSize() {
    return this.config?.image_fit || DEFAULT_CONFIG.image_fit;
  }
  getImageStyle(image, opacity) {
    return {
      'background-image': `url('${image}')`,
      'opacity': opacity,
      'background-size': this.getBackgroundSize(),
      'transition': `opacity ${this.crossfadeTime}s ease-in-out`
    };
  }
  styleMap(styles) {
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
  render() {
    const imageAOpacity = this.activeImage === 'A' ? 1 : 0;
    const imageBOpacity = this.activeImage === 'B' ? 1 : 0;
    return html`
      <div class="background-container">
        ${this.error ? html`
          <div class="error-message">
            ${this.error}
          </div>
        ` : ''}
        
        <div 
          class="background-image" 
          style="${this.styleMap(this.getImageStyle(this.imageA, imageAOpacity))}">
        </div>
        
        <div 
          class="background-image" 
          style="${this.styleMap(this.getImageStyle(this.imageB, imageBOpacity))}">
        </div>
      </div>
    `;
  }
  // Public methods for parent component
  setImageList(list) {
    this.imageList = list;
    this.currentImageIndex = -1; // Reset index when new list is set
    this.requestUpdate();
  }
  setCrossfadeTime(time) {
    this.crossfadeTime = time;
    this.requestUpdate();
  }
  setConfig(config) {
    this.config = config;
    this.requestUpdate();
  }
  // Method to force an immediate image update
  async forceImageUpdate() {
    await this.updateImage();
  }
  // Method to pause rotation
  pauseRotation() {
    this.clearTimers();
  }
  // Method to resume rotation
  resumeRotation() {
    this.startImageRotation();
  }
  // Error handling methods
  handleError(error) {
    this.error = error.message;
    this.requestUpdate();
    // Emit error event for parent component
    const errorEvent = new CustomEvent('background-error', {
      detail: { error },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(errorEvent);
  }
  // Method to clear error state
  clearError() {
    this.error = null;
    this.requestUpdate();
  }
}
customElements.define('background-rotator', BackgroundRotator);
