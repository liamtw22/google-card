// Master Google Card Version
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

// Constants
const OVERLAY_DISMISS_TIMEOUT = 10000;
const LONG_PRESS_TIMEOUT = 1000;
const NIGHT_MODE_TRANSITION_DELAY = 100;
const TRANSITION_BUFFER = 50;
const DEFAULT_BRIGHTNESS = 128;
const MAX_BRIGHTNESS = 255;
const MIN_BRIGHTNESS = 1;
const SWIPE_THRESHOLD = 50;
const DEFAULT_SENSOR_UPDATE_DELAY = 500;
const BRIGHTNESS_DEBOUNCE_DELAY = 250;
const BRIGHTNESS_STABILIZE_DELAY = 2000;

// Weather Component
class WeatherComponent extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      date: { type: String },
      time: { type: String },
      temperature: { type: String },
      weatherIcon: { type: String },
      aqi: { type: String }
    };
  }

  constructor() {
    super();
    this.resetProperties();
  }

  resetProperties() {
    this.date = '';
    this.time = '';
    this.temperature = '';
    this.weatherIcon = '';
    this.aqi = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateWeather();
    this.scheduleUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.updateTimer);
  }

  scheduleUpdate() {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    this.updateTimer = setTimeout(() => {
      this.updateWeather();
      this.scheduleUpdate();
    }, delay);
  }

  updateWeather() {
    const now = new Date();
    this.updateDateTime(now);
    this.updateWeatherData();
    this.requestUpdate();
  }

  updateDateTime(now) {
    this.date = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    this.time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).replace(/\s?[AP]M/, '');
  }

  updateWeatherData() {
    if (!this.hass) return;

    const weatherEntity = this.hass.states['weather.64_west_glen_ave'];
    const aqiEntity = this.hass.states['sensor.ridgewood_air_quality_index'];

    if (weatherEntity) {
      this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`;
      this.weatherIcon = this.getWeatherIcon(weatherEntity.state);
    }

    if (aqiEntity) {
      this.aqi = aqiEntity.state;
    }
  }

  getWeatherIcon(state) {
    const iconMapping = {
      'clear-night': 'clear-night',
      'cloudy': 'cloudy-fill',
      'fog': 'fog',
      'hail': 'hail',
      'lightning': 'thunderstorms',
      'lightning-rainy': 'thunderstorms-rain',
      'partlycloudy': 'partly-cloudy-day',
      'pouring': 'rain',
      'rainy': 'drizzle',
      'snowy': 'snow',
      'snowy-rainy': 'sleet',
      'sunny': 'clear-day',
      'windy': 'wind',
      'windy-variant': 'wind',
      'exceptional': 'not-available'
    };
    return iconMapping[state] || 'not-available-fill';
  }

  getAqiColor(aqi) {
    if (aqi <= 50) return '#68a03a';
    if (aqi <= 100) return '#f9bf33';
    if (aqi <= 150) return '#f47c06';
    if (aqi <= 200) return '#c43828';
    if (aqi <= 300) return '#ab1457';
    return '#83104c';
  }

  render() {
    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet">
      <div class="weather-component">
        <div class="left-column">
          <div class="date">${this.date}</div>
          <div class="time">${this.time}</div>
        </div>
        <div class="right-column">
          <div class="weather-info">
            <img src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg" 
                 class="weather-icon" 
                 alt="Weather icon">
            <span class="temperature">${this.temperature}</span>
          </div>
          <div class="aqi" style="background-color: ${this.getAqiColor(parseInt(this.aqi))}">
            ${this.aqi} AQI
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .weather-component {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        font-family: "Product Sans Regular", sans-serif;
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
        margin-right: -5px;
      }
      .weather-icon {
        width: 50px;
        height: 50px;
      }
      .temperature {
        font-size: 35px;
        font-weight: 500;
        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
      }
      .aqi {
        font-size: 20px;
        padding: 5px 10px;
        border-radius: 6px;
        font-weight: 500;
        margin-top: 5px;
        margin-left: 30px;
        align-self: flex-end;
        min-width: 60px;
        text-align: center;
      }
    `;
  }
}

customElements.define('weather-component', WeatherComponent);

// Main Google Card Component
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
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      isNightMode: { type: Boolean },
      currentTime: { type: String },
      previousBrightness: { type: Number },
      isInNightMode: { type: Boolean },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.brightnessUpdateTimer = null;
    this.brightnessStabilizeTimer = null;
  }

  initializeProperties() {
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = "";
    this.imageB = "";
    this.activeImage = "A";
    this.preloadedImage = "";
    this.error = null;
    this.debugInfo = {};
    this.isTransitioning = false;
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.brightness = DEFAULT_BRIGHTNESS;
    this.visualBrightness = DEFAULT_BRIGHTNESS;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.isNightMode = false;
    this.currentTime = '';
    this.previousBrightness = DEFAULT_BRIGHTNESS;
    this.isInNightMode = false;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.updateScreenSize();
  }

  setConfig(config) {
    const defaultConfig = {
      image_url: "",
      display_time: 15,
      crossfade_time: 3,
      image_fit: "contain",
      image_list_update_interval: 3600,
      image_order: "sorted",
      show_debug: false,
      sensor_update_delay: DEFAULT_SENSOR_UPDATE_DELAY
    };

    if (!config.image_url) {
      throw new Error("You need to define an image_url");
    }

    this.config = { ...defaultConfig, ...config };
    this.urlTemplate = this.config.image_url;
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
    this.style.setProperty('--crossfade-time', `${this.config.crossfade_time}s`);
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
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  cleanupEventListeners() {
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  startTimers() {
    this.updateImageList();
    this.startImageRotation();
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, this.config.image_list_update_interval * 1000);

    this.updateTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  clearTimers() {
    clearInterval(this.imageUpdateInterval);
    clearInterval(this.imageListUpdateInterval);
    clearInterval(this.timeUpdateInterval);
    this.clearOverlayDismissTimer();
    this.clearBrightnessCardDismissTimer();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      // Only update brightness if enough time has passed since last manual adjustment
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > BRIGHTNESS_STABILIZE_DELAY) {
        this.updateNightMode();
        this.updateBrightness();
      }
    }
  }

  updateBrightness() {
    if (!this.hass?.states['sensor.liam_room_display_screen_brightness'] || this.isAdjustingBrightness) return;
    
    const brightnessState = this.hass.states['sensor.liam_room_display_screen_brightness'];
    const newBrightness = parseInt(brightnessState.state);
    this.brightness = newBrightness;
    this.visualBrightness = newBrightness;
    this.requestUpdate();
  }

  async updateBrightnessValue(value) {
    // Update visual feedback immediately
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    this.requestUpdate();

    // Debounce the actual device update
    if (this.brightnessUpdateTimer) {
      clearTimeout(this.brightnessUpdateTimer);
    }
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }

    this.brightnessUpdateTimer = setTimeout(async () => {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      // Set a timer to re-enable sensor updates
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
        this.requestUpdate();
      }, BRIGHTNESS_STABILIZE_DELAY);
      
    }, BRIGHTNESS_DEBOUNCE_DELAY);
  }

  async setBrightness(value) {
    const internalValue = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(value)));
    
    try {
      // Set the brightness
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: "command_screen_brightness_level",
        data: {
          command: internalValue
        }
      });

      // Request sensor update
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: "command_update_sensors"
      });

      // Wait for sensors to update
      await new Promise(resolve => setTimeout(resolve, this.config.sensor_update_delay || DEFAULT_SENSOR_UPDATE_DELAY));

      this.brightness = internalValue;
      if (!this.isNightMode) {
        this.previousBrightness = internalValue;
      }
    } catch (error) {
      console.error("Error setting brightness:", error);
      // Revert visual brightness to last known good value
      this.visualBrightness = this.brightness;
    }

    this.startBrightnessCardDismissTimer();
    this.requestUpdate();
  }

  // Night mode handling
  updateNightMode() {
    if (!this.hass?.states['sensor.liam_room_display_light_sensor']) return;

    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    const newNightMode = parseInt(lightSensor.state) === 0;
    
    if (newNightMode === this.isInNightMode) return;

    this.handleNightModeTransition(newNightMode);
  }

  async handleNightModeTransition(newNightMode) {
    if (newNightMode) {
      await this.enterNightMode();
    } else {
      await this.exitNightMode();
    }
    
    this.isInNightMode = newNightMode;
    this.isNightMode = newNightMode;
    this.requestUpdate();
  }

  async enterNightMode() {
    this.previousBrightness = this.brightness;
    await this.toggleAutoBrightness(false);
    await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
    await this.setBrightness(MIN_BRIGHTNESS);
    await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
    await this.toggleAutoBrightness(true);
  }

  async exitNightMode() {
    await this.toggleAutoBrightness(false);
    await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
    await this.setBrightness(this.previousBrightness);
  }

  async toggleAutoBrightness(enabled) {
    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: "command_auto_screen_brightness",
      data: {
        command: enabled ? "turn_on" : "turn_off"
      }
    });
  }

  // Touch handling
  handleTouchStart(event) {
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    event.preventDefault();
  }

  handleTouchEnd(event) {
    const deltaY = this.touchStartY - event.changedTouches[0].clientY;

    if (deltaY > SWIPE_THRESHOLD && !this.showBrightnessCard) {
      this.showOverlay = true;
      this.requestUpdate();
      this.startOverlayDismissTimer();
    } else if (deltaY < -SWIPE_THRESHOLD) {
      this.showBrightnessCard ? this.dismissBrightnessCard() : this.dismissOverlay();
    }
  }

  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }

  async handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    await this.updateBrightnessValue(newBrightness * 25.5);
  }

  async handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const newValue = Math.round((relativeX / rect.width) * 10);
    await this.updateBrightnessValue(newValue * 25.5);
  }

  // Timer management
  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  clearOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
      this.overlayDismissTimer = null;
    }
  }

  startBrightnessCardDismissTimer() {
    this.clearBrightnessCardDismissTimer();
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }

  // UI State Management
  dismissOverlay() {
    this.showOverlay = false;
    this.clearOverlayDismissTimer();
    this.requestUpdate();
  }

  toggleBrightnessCard() {
    if (!this.showBrightnessCard) {
      this.showOverlay = false;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = true;
      this.startBrightnessCardDismissTimer();
    } else {
      this.dismissBrightnessCard();
    }
    this.requestUpdate();
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    this.clearBrightnessCardDismissTimer();
    this.requestUpdate();
  }

  // Debug Info
  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleSettingsIconTouchStart(e) {
    this.longPressTimer = setTimeout(() => {
      this.toggleDebugInfo();
    }, LONG_PRESS_TIMEOUT);
  }

  handleSettingsIconTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  // Screen and Image Management
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.updateImageList();
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).replace(/\s?[AP]M/, '');
  }

  getImageUrl() {
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    let url = this.urlTemplate
      .replace(/\${width}/g, this.screenWidth)
      .replace(/\${height}/g, this.screenHeight)
      .replace(/\${timestamp_ms}/g, timestamp_ms)
      .replace(/\${timestamp}/g, timestamp);
    return url;
  }

  getImageSourceType() {
    const { image_url } = this.config;
    if (image_url.startsWith("media-source://")) return "media-source";
    if (image_url.startsWith("https://api.unsplash")) return "unsplash-api";
    if (image_url.startsWith("immich+")) return "immich-api";
    if (image_url.includes("picsum.photos")) return "picsum";
    return "url";
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
        ? newImageList.sort(() => 0.5 - Math.random())
        : newImageList.sort();
        
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
      case "media-source":
        return this.getImagesFromMediaSource();
      case "unsplash-api":
        return this.getImagesFromUnsplashAPI();
      case "immich-api":
        return this.getImagesFromImmichAPI();
      default:
        return [this.getImageUrl()];
    }
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

      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      console.error("Error fetching images from Immich API:", error);
      return [this.getImageUrl()];
    }
  }

  startImageRotation() {
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

  async preloadNextImage() {
    const nextImageToPreload = this.getImageSourceType() === "picsum" 
      ? this.getImageUrl()
      : this.imageList[(this.currentImageIndex + 1) % this.imageList.length];

    try {
      this.preloadedImage = await this.preloadImage(nextImageToPreload);
    } catch (error) {
      console.error("Error preloading next image:", error);
      this.preloadedImage = "";
    }
  }

  async updateImage() {
    if (this.isTransitioning) return;

    try {
      const newImage = await this.getNextImage();
      await this.transitionToNewImage(newImage);
      this.preloadNextImage();
    } catch (error) {
      console.error("Error updating image:", error);
    }
  }

  async getNextImage() {
    let newImage;
    if (this.preloadedImage) {
      newImage = this.preloadedImage;
      this.preloadedImage = "";
    } else {
      if (this.getImageSourceType() === "picsum") {
        newImage = this.getImageUrl();
      } else {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
        newImage = this.imageList[this.currentImageIndex];
      }
      newImage = await this.preloadImage(newImage);
    }
    return newImage;
  }

  async transitionToNewImage(newImage) {
    this.isTransitioning = true;

    if (this.activeImage === "A") {
      this.imageB = newImage;
    } else {
      this.imageA = newImage;
    }

    this.updateDebugInfo();
    this.requestUpdate();

    await new Promise(resolve => setTimeout(resolve, TRANSITION_BUFFER));
    this.activeImage = this.activeImage === "A" ? "B" : "A";
    this.requestUpdate();

    await new Promise(resolve => setTimeout(resolve, this.config.crossfade_time * 1000 + TRANSITION_BUFFER));
    this.isTransitioning = false;
    this.requestUpdate();
  }

  updateDebugInfo() {
    this.debugInfo = {
      ...this.debugInfo,
      imageA: this.imageA,
      imageB: this.imageB,
      activeImage: this.activeImage,
      preloadedImage: this.preloadedImage
    };
  }

  // Render Methods
  renderNightMode() {
    return html`
      <div class="night-mode">
        <div class="night-time">${this.currentTime}</div>
      </div>
    `;
  }

  renderBackgroundImages() {
    const imageAOpacity = this.activeImage === "A" ? 1 : 0;
    const imageBOpacity = this.activeImage === "B" ? 1 : 0;

    return html`
      <div class="background-container">
        <div class="background-image" 
             style="background-image: url('${this.imageA}'); 
                    opacity: ${imageAOpacity};">
        </div>
        <div class="background-image" 
             style="background-image: url('${this.imageB}'); 
                    opacity: ${imageBOpacity};">
        </div>
      </div>
    `;
  }

  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Background Card Debug Info</h2>
        <h3>Background Card Version: 23</h3>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Image A:</strong> ${this.imageA}</p>
        <p><strong>Image B:</strong> ${this.imageB}</p>
        <p><strong>Active Image:</strong> ${this.activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this.preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
        <p><strong>Image List:</strong> ${JSON.stringify(this.imageList)}</p>
        <p><strong>Error:</strong> ${this.error}</p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }

  renderOverlay() {
    return html`
      <div class="overlay ${this.showOverlay ? 'show' : ''}">
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
      </div>
    `;
  }

  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html`
      <div class="brightness-card ${this.showBrightnessCard ? 'show' : ''}" 
           style="transition: ${this.brightnessCardTransition};">
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div class="brightness-dots" 
                 @click="${this.handleBrightnessChange}"
                 @mousedown="${this.handleBrightnessDrag}"
                 @mousemove="${e => e.buttons === 1 && this.handleBrightnessDrag(e)}"
                 @touchstart="${this.handleBrightnessDrag}"
                 @touchmove="${this.handleBrightnessDrag}">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => html`
                <div class="brightness-dot ${value <= brightnessDisplayValue ? 'active' : ''}" 
                     data-value="${value}">
                </div>
              `)}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }

  render() {
    if (this.isNightMode) {
      return this.renderNightMode();
    }

    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">
      ${this.renderBackgroundImages()}
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      <weather-component .hass="${this.hass}"></weather-component>
      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
      ${!this.showBrightnessCard ? this.renderOverlay() : ''}
      ${this.renderBrightnessCard()}
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
        font-family: "Product Sans Regular", sans-serif;
        font-weight: 400;
      }
      
      .night-mode {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 5;
      }
      
      .night-time {
        color: white;
        font-size: 35vw;
        font-weight: 400;
        font-family: "Product Sans Regular", sans-serif;
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
        z-index: 4;
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
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 40px 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 3;
        transform: translateY(calc(100% + 20px));
        transition: transform 0.3s ease-in-out;
      }
      
      .brightness-card.show {
        transform: translateY(0);
      }
      
      .brightness-control {
        display: flex;
        align-items: center;
        width: 100%;
      }
      
      .brightness-dots-container {
        flex-grow: 1;
        margin-right: 10px;
        padding: 0 10px;
      }
      
      .brightness-dots {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 30px;
      }
      
      .brightness-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #d1d1d1;
        transition: background-color 0.2s ease;
        cursor: pointer;
      }
      
      .brightness-dot.active {
        background-color: #333;
      }
      
      .brightness-value {
        min-width: 60px;
        text-align: right;
        font-size: 40px;
        color: black;
        font-weight: 300;
        margin-right: 20px;
      }
      
      iconify-icon {
        font-size: 50px;
        display: block;
        width: 50px;
        height: 50px;
      }
      
      weather-component {
        position: fixed;
        bottom: 30px;
        left: 30px;
        z-index: 2;
      }
    `;
  }
}

customElements.define("google-card", GoogleCard);
