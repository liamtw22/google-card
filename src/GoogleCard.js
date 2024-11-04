// src/GoogleCard.js
import { LitElement, html } from 'lit-element';
import { sharedStyles } from './styles/shared.js';
import './components/BackgroundRotator.js';
import './components/WeatherDisplay.js';
import './components/NightMode.js';
import './components/Controls.js';
import {
  TIMING,
  BRIGHTNESS,
  VOLUME,
  UI,
  AQI_COLORS,
  WEATHER_ICONS,
  IMAGE_SOURCE_TYPES,
  DEFAULT_CONFIG,
  ENTITIES,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  CSS_CLASSES
} from './constants.js';

export class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      // Image-related properties
      currentImageIndex: { type: Number },
      imageList: { type: Array },
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      isTransitioning: { type: Boolean },
      // Screen properties
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      // Debug properties
      error: { type: String },
      debugInfo: { type: Object },
      showDebugInfo: { type: Boolean },
      // UI state properties
      showOverlay: { type: Boolean },
      // Night mode properties
      isNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isInNightMode: { type: Boolean },
      // Control properties
      brightness: { type: Number },
      volume: { type: Number }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }

  initializeProperties() {
    // Initialize image-related properties
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = "";
    this.imageB = "";
    this.activeImage = "A";
    this.preloadedImage = "";
    this.isTransitioning = false;

    // Initialize UI state
    this.showOverlay = false;
    this.showDebugInfo = false;
    this.error = null;
    this.debugInfo = {};

    // Initialize control values
    this.brightness = BRIGHTNESS.DEFAULT;
    this.volume = VOLUME.DEFAULT;

    // Initialize night mode state
    this.isNightMode = false;
    this.previousBrightness = BRIGHTNESS.DEFAULT;
    this.isInNightMode = false;

    this.updateScreenSize();
  }

  static get styles() {
    return sharedStyles;
  }

  setConfig(config) {
    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.urlTemplate = this.config.image_url;
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
    this.startTimers();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.clearTimers();
  }

  setupEventListeners() {
    window.addEventListener('resize', this.boundUpdateScreenSize);
  }

  cleanupEventListeners() {
    window.removeEventListener('resize', this.boundUpdateScreenSize);
  }

  startTimers() {
    this.updateImageList();
    this.startImageRotation();
    
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, this.config.image_list_update_interval * 1000);
  }

  clearTimers() {
    clearInterval(this.imageUpdateInterval);
    clearInterval(this.imageListUpdateInterval);
  }

  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) {
      this.error = "Screen dimensions not set";
      this.requestUpdate();
      return;
    }

    try {
      const newImageList = await this.fetchImageList();
      this.imageList = this.config.image_order === "random" 
        ? this.shuffleArray(newImageList)
        : newImageList.sort();
        
      this.error = null;
      this.debugInfo.imageList = this.imageList;
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }

  shuffleArray(array) {
    return [...array].sort(() => 0.5 - Math.random());
  }

  async fetchImageList() {
    const sourceType = this.getImageSourceType();
    switch (sourceType) {
      case IMAGE_SOURCE_TYPES.MEDIA_SOURCE:
        return this.getImagesFromMediaSource();
      case IMAGE_SOURCE_TYPES.UNSPLASH_API:
        return this.getImagesFromUnsplashAPI();
      case IMAGE_SOURCE_TYPES.IMMICH_API:
        return this.getImagesFromImmichAPI();
      default:
        return [this.getImageUrl()];
    }
  }

  getImageSourceType() {
    const { image_url } = this.config;
    if (image_url.startsWith("media-source://")) return IMAGE_SOURCE_TYPES.MEDIA_SOURCE;
    if (image_url.startsWith("https://api.unsplash")) return IMAGE_SOURCE_TYPES.UNSPLASH_API;
    if (image_url.startsWith("immich+")) return IMAGE_SOURCE_TYPES.IMMICH_API;
    if (image_url.includes("picsum.photos")) return IMAGE_SOURCE_TYPES.PICSUM;
    return IMAGE_SOURCE_TYPES.URL;
  }

  getImageUrl() {
    const timestamp = Date.now();
    return this.urlTemplate
      .replace(/\${width}/g, this.screenWidth)
      .replace(/\${height}/g, this.screenHeight)
      .replace(/\${timestamp_ms}/g, timestamp)
      .replace(/\${timestamp}/g, Math.floor(timestamp / 1000));
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.updateImageList();
  }

  startImageRotation() {
    this.updateImage();
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, this.config.display_time * 1000);
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
      this.preloadedImage = "";
      return image;
    }

    const sourceType = this.getImageSourceType();
    if (sourceType === IMAGE_SOURCE_TYPES.PICSUM) {
      return this.getImageUrl();
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
      const nextImageToPreload = this.getImageSourceType() === IMAGE_SOURCE_TYPES.PICSUM
        ? this.getImageUrl()
        : this.imageList[(this.currentImageIndex + 1) % this.imageList.length];

      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error("Error preloading next image:", error);
      this.preloadedImage = "";
    }
  }

  // Event Handlers
  handleBrightnessChange(event) {
    this.brightness = event.detail.brightness;
    this.requestUpdate();
  }

  handleVolumeChange(event) {
    this.volume = event.detail.volume;
    this.requestUpdate();
  }

  // Night Mode Handlers
  async updateNightMode() {
    if (!this.hass?.states[ENTITIES.LIGHT_SENSOR]) return;

    const lightSensor = this.hass.states[ENTITIES.LIGHT_SENSOR];
    const newNightMode = parseInt(lightSensor.state) === 0;
    
    if (newNightMode === this.isInNightMode) return;
    
    if (newNightMode) {
      await this.enterNightMode();
    } else {
      await this.exitNightMode();
    }
    
    this.isInNightMode = newNightMode;
    this.isNightMode = newNightMode;
    this.requestUpdate();
  }

  // Debug Info Methods
  renderDebugInfo() {
    if (!this.showDebugInfo) return null;

    return html`
      <div class="debug-info">
        <h2>Background Card Debug Info</h2>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Current Image:</strong> ${this.activeImage === 'A' ? this.imageA : this.imageB}</p>
        <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
        <p><strong>Brightness:</strong> ${this.brightness}</p>
        <p><strong>Volume:</strong> ${this.volume}</p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }

  render() {
    if (this.isNightMode) {
      return html`
        <night-mode
          .currentTime="${new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).replace(/\s?[AP]M/, '')}">
        </night-mode>
      `;
    }

    return html`
      <background-rotator
        .imageA="${this.imageA}"
        .imageB="${this.imageB}"
        .activeImage="${this.activeImage}"
        .isTransitioning="${this.isTransitioning}"
        .crossfadeTime="${this.config.crossfade_time}">
      </background-rotator>
      
      <weather-display
        .hass="${this.hass}">
      </weather-display>
      
      <google-controls
        .brightness="${this.brightness}"
        .volume="${this.volume}"
        .showOverlay="${this.showOverlay}"
        @brightness-change="${this.handleBrightnessChange}"
        @volume-change="${this.handleVolumeChange}">
      </google-controls>

      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.renderDebugInfo()}
    `;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'google-card',
    name: 'Google Card',
    description: 'A Google Nest Hub-inspired card for Home Assistant',
    preview: true,
    documentationURL: 'https://github.com/liamtw22/google-card'
});

customElements.define('google-card', GoogleCard);
