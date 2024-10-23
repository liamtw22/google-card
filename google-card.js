import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

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
    this.date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    this.time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '');

    if (this.hass) {
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

    this.requestUpdate();
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
            <img src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg" class="weather-icon" alt="Weather icon">
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
        text-shadow: 1px 1px 3px black;
        margin-left: 10px;
      }
      .time {
        font-size: 90px;
        line-height: 1;
        font-weight: 500;
        text-shadow: 1px 1px 3px black;
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
        text-shadow: 1px 1px 3px black;
      }
      .aqi {
        font-size: 20px;
        padding: 5px 10px 5px;
        border-radius: 6px;
        font-weight: 500;
        margin-top: 5px;
        margin-left: 30px;
        align-self: flex-end;
        min-width: 60px;
        text-align: center;
        vertical-align: middle;
      }
    `;
  }
}

customElements.define('weather-component', WeatherComponent);

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
      brightnessCardTransition: { type: String },
      isNightMode: { type: Boolean },
      currentTime: { type: String }
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
    this.brightnessCardTransition = 'none';
    this.longPressTimer = null;
    this.brightnessCardDismissTimer = null;
    this.isNightMode = false;
    this.currentTime = '';
    this.timeUpdateInterval = null;
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

  connectedCallback() {
    super.connectedCallback();
    console.log("Card connected");
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.updateImageList();
    this.startImageRotation();
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, this.config.image_list_update_interval * 1000);

    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));

    this.updateBrightness();
    
    // Start time updates for night mode
    this.updateTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log("Card disconnected");
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    clearInterval(this.imageUpdateInterval);
    clearInterval(this.imageListUpdateInterval);
    clearInterval(this.timeUpdateInterval);
    this.clearOverlayDismissTimer();
    this.clearBrightnessCardDismissTimer();

    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\s?[AP]M/, '');
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.updateNightMode();
      this.updateBrightness();
    }
  }

  updateNightMode() {
    if (this.hass && this.hass.states['sensor.liam_room_display_light_sensor']) {
      const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
      this.isNightMode = parseInt(lightSensor.state) === 0;
      this.requestUpdate();
    }
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

    if (deltaY > 50 && !this.showBrightnessCard) {
      this.showOverlay = true;
      this.requestUpdate();
      this.startOverlayDismissTimer();
    } else if (deltaY < -50) {
      if (this.showBrightnessCard) {
        this.dismissBrightnessCard();
      } else {
        this.dismissOverlay();
      }
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

  startBrightnessCardDismissTimer() {
    this.clearBrightnessCardDismissTimer();
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, 10000);
  }

  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }

  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = false;
    this.clearBrightnessCardDismissTimer();
    this.requestUpdate();
  }

  updateBrightness() {
    if (this.hass && this.hass.states['sensor.liam_room_display_screen_brightness']) {
      const brightnessState = this.hass.states['sensor.liam_room_display_screen_brightness'];
      this.brightness = parseInt(brightnessState.state);
      this.requestUpdate();
    }
  }

  setBrightness(value) {
    const internalValue = Math.max(1, Math.min(255, Math.round(value)));
    this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: "command_screen_brightness_level",
      data: {
        command: internalValue
      }
    });
    this.brightness = internalValue;
    this.startBrightnessCardDismissTimer();
    this.requestUpdate();
  }

  handleBrightnessChange(e) {
    const clickedDot = e.target.closest('.brightness-dot');
    if (!clickedDot) return;

    const newBrightness = parseInt(clickedDot.dataset.value);
    this.setBrightness(newBrightness * 25.5);
  }

  handleBrightnessDrag(e) {
    const container = this.shadowRoot.querySelector('.brightness-dots');
    const rect = container.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    const containerWidth = rect.width;
    let newValue = Math.round((relativeX / containerWidth) * 10);
    this.setBrightness(newValue * 25.5);
  }

  getBrightnessDisplayValue() {
    return Math.round(this.brightness / 25.5);
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleSettingsIconTouchStart(e) {
    this.longPressTimer = setTimeout(() => {
      this.toggleDebugInfo();
    }, 1000);
  }

  handleSettingsIconTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  render() {
    if (this.isNightMode) {
      return html`
        <div class="night-mode">
          <div class="night-time">${this.currentTime}</div>
        </div>
      `;
    }

    const imageAOpacity = this.activeImage === "A" ? 1 : 0;
    const imageBOpacity = this.activeImage === "B" ? 1 : 0;
    const brightnessDisplayValue = this.getBrightnessDisplayValue();

    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">
      <div class="background-container">
        <div class="background-image" style="background-image: url('${this.imageA}'); opacity: ${imageAOpacity};"></div>
        <div class="background-image" style="background-image: url('${this.imageB}'); opacity: ${imageBOpacity};"></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      <weather-component .hass="${this.hass}"></weather-component>
      ${this.showDebugInfo ? html`
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
          <p><strong>Image List:</strong> ${JSON.stringify(this.imageList)}</p>
          <p><strong>Error:</strong> ${this.error}</p>
          <h3>Config:</h3>
          <pre>${JSON.stringify(this.config, null, 2)}</pre>
        </div>
      ` : ''}
      ${!this.showBrightnessCard ? html`
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
      ` : ''}
      <div class="brightness-card ${this.showBrightnessCard ? 'show' : ''}" style="transition: ${this.brightnessCardTransition};">
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div class="brightness-dots" 
                 @click="${this.handleBrightnessChange}"
                 @mousedown="${this.handleBrightnessDrag}"
                 @mousemove="${this.handleBrightnessDrag}"
                 @touchstart="${this.handleBrightnessDrag}"
                 @touchmove="${this.handleBrightnessDrag}">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => html`
                <div class="brightness-dot ${value <= brightnessDisplayValue ? 'active' : ''}" data-value="${value}"></div>
              `)}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
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
        font-family: "Product Sans Regular", sans-serif;
        color: white;
        font-size: 30vw;
        font-weight: 500;
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
