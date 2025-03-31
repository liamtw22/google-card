Here's the entirety of the updated GoogleCard.js file with the requested changes:

```javascript
// src/GoogleCard.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { DEFAULT_CONFIG } from './constants';
import { sharedStyles } from './styles/SharedStyles';
import './components/BackgroundRotator';
import './components/Controls';
import './components/NightMode';
import './components/WeatherClock';
import './editor';

class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      showDebugInfo: { type: Boolean },
      showOverlay: { type: Boolean },
      isOverlayVisible: { type: Boolean },
      isOverlayTransitioning: { type: Boolean },
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      isBrightnessCardVisible: { type: Boolean },
      isBrightnessCardTransitioning: { type: Boolean },
      isNightMode: { type: Boolean },
      currentTime: { type: String },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number },
      touchStartY: { type: Number },
      touchStartX: { type: Number },
      touchStartTime: { type: Number },
      isDarkMode: { type: Boolean },
      editMode: { type: Boolean },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        .touch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          touch-action: none;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .editor-placeholder {
          padding: 16px;
          font-family: var(--primary-font-family, Roboto);
          font-size: 14px;
          color: var(--primary-text-color);
          background: var(--card-background-color, #fff);
          border-radius: var(--ha-card-border-radius, 4px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0,0,0,0.14));
          margin: 8px;
        }
      `
    ];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.brightnessUpdateQueue = [];
    this.isProcessingBrightnessUpdate = false;
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.boundHandleThemeChange = this.handleThemeChange.bind(this);
    this.handleBrightnessCardToggle = this.handleBrightnessCardToggle.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessChangeComplete = this.handleBrightnessChangeComplete.bind(this);
    this.handleDebugToggle = this.handleDebugToggle.bind(this);
    this.handleNightModeExit = this.handleNightModeExit.bind(this);
  }

  initializeProperties() {
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.isOverlayVisible = false;
    this.isOverlayTransitioning = false;
    this.isNightMode = false; // Start in normal mode
    this.showBrightnessCard = false;
    this.isBrightnessCardVisible = false;
    this.isBrightnessCardTransitioning = false;
    this.brightness = DEFAULT_CONFIG.brightness || 128;
    this.visualBrightness = this.brightness;
    this.previousBrightness = this.brightness;
    this.isInNightMode = false; // Start in normal mode
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchStartTime = 0;
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.brightnessStabilizeTimer = null;
    this.timeUpdateInterval = null;
    this.nightModeSource = null;
    this.nightModeReactivationTimer = null; // Add this for reactivation
    this.editMode = false;

    this.updateScreenSize();
    this.updateTime();
  }

  static async getConfigElement() {
    return document.createElement('google-card-editor');
  }

  static getStubConfig() {
    return {
      image_url: 'https://source.unsplash.com/random',
      display_time: 15,
      crossfade_time: 3,
      image_fit: 'contain',
      show_date: true,
      show_time: true,
      show_weather: true,
      show_aqi: true,
      weather_entity: 'weather.forecast_home',
      aqi_entity: 'sensor.air_quality_index',
      device_name: 'mobile_app_device',
      light_sensor_entity: 'sensor.light_sensor',
      brightness_sensor_entity: 'sensor.brightness_sensor',
    };
  }

  setConfig(config) {
    if (!config.image_url) throw new Error('Image URL required');
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.showDebugInfo = this.config.show_debug;
    this.updateCssVariables();
  }

  updateCssVariables() {
    if (this.config) {
      this.style.setProperty('--crossfade-time', `${this.config.crossfade_time || 3}s`);
      this.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
      this.style.setProperty('--theme-background', this.isDarkMode ? '#121212' : '#ffffff');
      this.style.setProperty('--theme-text', this.isDarkMode ? '#ffffff' : '#333333');
      
      document.documentElement.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
      document.documentElement.style.setProperty('--theme-background', this.isDarkMode ? '#121212' : '#ffffff');
      document.documentElement.style.setProperty('--theme-text', this.isDarkMode ? '#ffffff' : '#333333');
    }
  }

  handleThemeChange(e) {
    const newIsDarkMode = e.matches;
    if (this.isDarkMode !== newIsDarkMode) {
      this.isDarkMode = newIsDarkMode;
      this.updateCssVariables();
      this.refreshComponents();
      this.requestUpdate();
    }
  }

  refreshComponents() {
    if (this._inEditor()) return;
    
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    
    const backgroundRotator = this.shadowRoot.querySelector('background-rotator');
    const weatherClock = this.shadowRoot.querySelector('weather-clock');
    const controls = this.shadowRoot.querySelector('google-controls');
    
    if (backgroundRotator) {
      backgroundRotator.requestUpdate();
    }
    if (weatherClock) {
      weatherClock.requestUpdate();
    }
    if (controls) {
      controls.requestUpdate();
      // Force update the controls component to apply dark mode
      if (controls.syncDarkMode) {
        controls.syncDarkMode();
      }
    }
  }

  render() {
    if (this._inEditor()) {
      return html`
        <div class="editor-placeholder">
          <h3>Google Card</h3>
          <div>Image Source: ${this.config?.image_url || 'Not configured'}</div>
          <div>Current Mode: ${this.config?.image_fit || 'contain'}</div>
        </div>
      `;
    }

    // Always load background-rotator
    const backgroundComponent = html`
      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
      ></background-rotator>
    `;
    
    // Always render weather-clock but hide it in night mode
    const weatherComponent = html`
      <weather-clock 
        .hass=${this.hass} 
        .config=${this.config}
        style="${this.isNightMode ? 'display: none;' : ''}"
      ></weather-clock>
    `;

    const nightModeComponent = this.isNightMode ? html`
      <night-mode 
        .currentTime=${this.currentTime}
        .hass=${this.hass}
        .config=${this.config}
        .brightness=${this.brightness}
        .previousBrightness=${this.previousBrightness}
        .isInNightMode=${this.isInNightMode}
        .nightModeSource=${this.nightModeSource}
        @nightModeExit=${this.handleNightModeExit}
      ></night-mode>
    ` : '';

    const controlsComponent = html`
      <google-controls
        .hass=${this.hass}
        .config=${this.config}
        .showOverlay=${this.showOverlay}
        .isOverlayVisible=${this.isOverlayVisible}
        .isOverlayTransitioning=${this.isOverlayTransitioning}
        .showBrightnessCard=${this.showBrightnessCard}
        .isBrightnessCardVisible=${this.isBrightnessCardVisible}
        .isBrightnessCardTransitioning=${this.isBrightnessCardTransitioning}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
        @overlayToggle=${this.handleOverlayToggle}
        @brightnessCardToggle=${this.handleBrightnessCardToggle}
        @brightnessChange=${this.handleBrightnessChange}
        @brightnessChangeComplete=${this.handleBrightnessChangeComplete}
        @debugToggle=${this.handleDebugToggle}
        style="${this.isNightMode ? 'display: none;' : ''}"
      ></google-controls>
    `;

    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap" rel="stylesheet">
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src: local('Product Sans'), local('ProductSans-Regular'),
            url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2) format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      </style>

      <div class="touch-container">
        <div class="content-wrapper">
          ${backgroundComponent}
          ${weatherComponent}
          ${nightModeComponent}
          ${controlsComponent}
        </div>
      </div>
    `;
  }

  _inEditor() {
    if (window.location.pathname.includes('/lovelace/') && 
       (window.location.pathname.includes('/edit/') || 
        window.location.search.includes('edit=1'))) return true;

    let parent = this.parentNode;
    while (parent) {
      if (parent.tagName) {
        const tag = parent.tagName.toLowerCase();
        const classes = Array.from(parent.classList || []);
        if (tag.includes('-editor') || classes.some(c => c.includes('editor'))) return true;
      }
      parent = parent.parentNode || parent.host;
    }
    return false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._inEditor()) {
      this.style.position = 'static';
      this.style.height = 'auto';
      return;
    }
    
    this.startTimeUpdates();
    setTimeout(() => this.updateNightMode(), 1000);
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.themeMediaQuery.addEventListener('change', this.boundHandleThemeChange);
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._inEditor()) return;
    
    this.clearAllTimers();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.themeMediaQuery.removeEventListener('change', this.boundHandleThemeChange);
    
    const touchContainer = this.shadowRoot?.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.removeEventListener('touchstart', this.handleTouchStart);
      touchContainer.removeEventListener('touchmove', this.handleTouchMove);
      touchContainer.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  firstUpdated() {
    if (this._inEditor()) return;
    
    const touchContainer = this.shadowRoot.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      touchContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      touchContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    // Initial refresh to ensure dark mode is correctly applied
    this.refreshComponents();
    
    // Check entity brightness state to initialize
    this.updateFromEntity();
  }
  
  updateFromEntity() {
    if (this.hass) {
      const brightnessEntity = 'number.liam_display_screen_brightness';
      if (this.hass.states[brightnessEntity]) {
        const newBrightness = parseFloat(this.hass.states[brightnessEntity].state);
        if (!isNaN(newBrightness)) {
          this.brightness = newBrightness;
          this.visualBrightness = newBrightness;
          
          // If not in night mode, also save as previous brightness (if > 0)
          if (!this.isNightMode && newBrightness > 0) {
            this.previousBrightness = newBrightness;
          }
          
          this.requestUpdate();
        }
      }
    }
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    if (this.nightModeReactivationTimer) clearTimeout(this.nightModeReactivationTimer);
  }

  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }

  startTimeUpdates() {
    this.updateTime();
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/\s?[AP]M/, '');
  }

  handleTouchStart(event) {
    if (event.touches.length === 1) {
      this.touchStartY = event.touches[0].clientY;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartTime = Date.now();
    }
  }

  handleTouchMove(event) {
    if (event.touches.length === 1) {
      // Prevent default scroll behavior only when showing UI overlays
      if (this.showBrightnessCard || this.showOverlay) {
        event.preventDefault();
      }
    }
  }

  handleTouchEnd(event) {
    if (event.changedTouches.length === 1) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY;
      const deltaX = this.touchStartX - event.changedTouches[0].clientX;
      const deltaTime = Date.now() - this.touchStartTime;
      const velocityY = Math.abs(deltaY) / deltaTime;
      const velocityX = Math.abs(deltaX) / deltaTime;
      
      // If in manually activated night mode, any touch/tap should exit night mode
      if (this.isNightMode) {
        // Only minor movements should count as taps, not full swipes
        if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) {
          this.handleNightModeExit();
          return;
        }
      }
      
      // Check for horizontal swipe from left to right (for night mode toggle)
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > 50 && 
          velocityX > 0.2 && 
          this.touchStartX < window.innerWidth * 0.25 && // Started from the left quarter of screen
          deltaX < 0) { // Left to right swipe (negative deltaX)
        
        // Toggle night mode with manual source
        if (!this.isNightMode) {
          this.handleNightModeTransition(true, 'manual');
        }
      }
      // Check for vertical swipe
      else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && velocityY > 0.2) {
        if (deltaY > 0 && !this.showBrightnessCard && !this.showOverlay) {
          // Swipe up - show overlay
          this.handleOverlayToggle(true);
        } else if (deltaY < 0) {
          if (this.showBrightnessCard) {
            this.dismissBrightnessCard();
          } else if (this.showOverlay) {
            this.dismissOverlay();
          }
        }
      }
    }
  }

  handleOverlayToggle(shouldShow = true) {
    if (shouldShow && !this.showOverlay) {
      this.showOverlay = true;
      this.isOverlayTransitioning = true;
      
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isOverlayVisible = true;
          this.startOverlayDismissTimer();
          this.requestUpdate();

          setTimeout(() => {
            this.isOverlayTransitioning = false;
            this.requestUpdate();
          }, 300);
        });
      });
    } else if (!shouldShow && this.showOverlay) {
      this.dismissOverlay();
    }
  }

  startOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }
    this.overlayDismissTimer = setTimeout(() => {
      this.dismissOverlay();
    }, 10000);
  }

  startBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }
    this.brightnessCardDismissTimer = setTimeout(() => {
      this.dismissBrightnessCard();
    }, 10000);
  }

  dismissOverlay() {
    if (this.isOverlayTransitioning) return;
    
    this.isOverlayTransitioning = true;
    this.isOverlayVisible = false;
    
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
    }

    requestAnimationFrame(() => {
      this.requestUpdate();
      setTimeout(() => {
        this.showOverlay = false;
        this.isOverlayTransitioning = false;
        this.requestUpdate();
      }, 300);
    });
  }

  dismissBrightnessCard() {
    if (this.isBrightnessCardTransitioning) return;
    
    this.isBrightnessCardTransitioning = true;
    this.isBrightnessCardVisible = false;
    
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
    }

    requestAnimationFrame(() => {
      this.requestUpdate();
      setTimeout(() => {
        this.showBrightnessCard = false;
        this.isBrightnessCardTransitioning = false;
        this.requestUpdate();
      }, 300);
    });
  }

  // Updated to only handle visual changes during dragging
  handleBrightnessChange(event) {
    const brightness = event.detail;
    
    // Only update visual state for responsive UI
    this.isAdjustingBrightness = true;
    this.visualBrightness = brightness;
    
    // Request update for visual changes
    this.requestUpdate();
  }

  // New handler for when brightness changes are complete (after dragging ends or clicking)
  handleBrightnessChangeComplete(event) {
    const brightness = event.detail;
    
    // Update the entity only when dragging completes or dot is clicked
    if (this.hass) {
      this.hass.callService('number', 'set_value', {
        entity_id: 'number.liam_display_screen_brightness',
        value: brightness
      }).catch(err => {
        console.error('Error updating brightness:', err);
      });
    }
    
    // Store as previous brightness if not in night mode and greater than 0
    if (!this.isNightMode && brightness > 0) {
      this.previousBrightness = brightness;
    }
    
    this.brightness = brightness;
    
    // Reset dismiss timer
    this.startBrightnessCardDismissTimer();
    this.lastBrightnessUpdateTime = Date.now();
    
    // Allow entity updates after a short delay
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }
    
    this.brightnessStabilizeTimer = setTimeout(() => {
      this.isAdjustingBrightness = false;
      this.requestUpdate();
    }, 2000);
  }

  handleDebugToggle() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  // Updated for reactivation timer
  handleNightModeExit() {
    this.isNightMode = false;
    this.isInNightMode = false;
    
    // If light sensor is still 0, set up reactivation timer
    const lightSensorEntity = this.config.light_sensor_entity || 'sensor.liam_room_display_light_sensor';
    if (this.hass && this.hass.states[lightSensorEntity]) {
      const lightLevel = parseInt(this.hass.states[lightSensorEntity].state);
      if (lightLevel === 0) {
        // Set timer to reactivate night mode after 30 seconds
        if (this.nightModeReactivationTimer) {
          clearTimeout(this.nightModeReactivationTimer);
        }
        
        this.nightModeReactivationTimer = setTimeout(() => {
          this.updateNightMode(); // This will check light sensor and reactivate if needed
        }, 30000); // 30 seconds
      }
    }
    
    // Restore previous brightness
    this.restorePreviousBrightness();
    
    this.requestUpdate();
  }
  
  // New method to explicitly restore previous brightness
  async restorePreviousBrightness() {
    if (!this.hass) return;
    
    const brightnessEntity = 'number.liam_display_screen_brightness';
    
    // Restore previous brightness or use a reasonable default
    const restoreBrightness = (this.previousBrightness && this.previousBrightness > 0) 
      ? this.previousBrightness 
      : 128;
    
    await this.hass.callService('number', 'set_value', {
      entity_id: brightnessEntity,
      value: restoreBrightness
    });
    
    // Update local state
    this.brightness = restoreBrightness;
    this.visualBrightness = restoreBrightness;
  }

  // Updated to use sun sensors for dark mode detection
  updateNightMode() {
    if (!this.hass) return;
    
    // Use sun sensors for dark mode detection
    const sunRisingEntity = 'sensor.sun_next_rising';
    const sunSettingEntity = 'sensor.sun_next_setting';
    
    if (this.hass.states[sunRisingEntity] && this.hass.states[sunSettingEntity]) {
      try {
        // Get the current time
        const now = new Date();
        
        // Parse times from sensors (Home Assistant usually provides ISO format dates)
        const nextRising = new Date(this.hass.states[sunRisingEntity].state);
        const nextSetting = new Date(this.hass.states[sunSettingEntity].state);
        
        // Determine if it's currently night time
        // If next rising is sooner than next setting, then it's currently dark
        const isDark = nextRising < nextSetting;
        
        // Set dark mode based on sun position
        if (isDark !== this.isDarkMode) {
          this.isDarkMode = isDark;
          document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
          this.updateCssVariables();
          this.refreshComponents();
          this.requestUpdate();
        }
        
        // If night mode was manually activated, don't let sensor readings deactivate it
        if (this.isInNightMode && this.nightModeSource === 'manual') {
          return;
        }
        
        // Otherwise, follow sun sensors for automatic night mode
        if (isDark !== this.isInNightMode) {
          this.handleNightModeTransition(isDark, 'sensor');
        }
        
        return; // Successfully used sun sensors, exit
      } catch (error) {
        console.error('Error processing sun sensors:', error);
        // Fall through to light sensor as backup
      }
    }
    
    // Fallback to light sensor if sun sensors aren't available or had an error
    this.updateNightModeWithLightSensor();
  }
  
  // Add fallback method using the original light sensor logic
  updateNightModeWithLightSensor() {
    if (!this.hass) return;
    
    // Use the light sensor entity instead of sun entities
    const lightSensorEntity = this.config.light_sensor_entity || 'sensor.liam_room_display_light_sensor';
    const lightSensor = this.hass.states[lightSensorEntity];
    
    if (!lightSensor) {
      return;
    }
    
    if (lightSensor.state === 'unavailable' || lightSensor.state === 'unknown') {
      return;
    }

    const lightLevel = parseInt(lightSensor.state);
    const shouldBeInNightMode = lightLevel === 0;
    
    // Set dark mode based on light sensor
    if (shouldBeInNightMode !== this.isDarkMode) {
      this.isDarkMode = shouldBeInNightMode;
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      this.updateCssVariables();
      this.refreshComponents();
      this.requestUpdate();
    }
    
    // If night mode was manually activated, don't let sensor readings deactivate it
    if (this.isInNightMode && this.nightModeSource === 'manual') {
      return;
    }
    
    // Otherwise, follow light sensor for automatic night mode
    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode, 'sensor');
    }
  }

  // Updated to add animation support for night mode
  async handleNightModeTransition(newNightMode, source = 'sensor') {
    if (newNightMode === this.isInNightMode && this.nightModeSource === source) return;
    
    try {
      const brightnessEntity = 'number.liam_display_screen_brightness';
      
      if (newNightMode) {
        // Save current brightness before entering night mode
        if (!this.isInNightMode && this.hass.states[brightnessEntity]) {
          const currentValue = parseFloat(this.hass.states[brightnessEntity].state);
          // Only store non-zero values as previous brightness
          if (currentValue > 0) {
            this.previousBrightness = currentValue;
          }
        }
        
        // Set brightness to 0
        await this.hass.callService('number', 'set_value', {
          entity_id: brightnessEntity,
          value: 0
        });
        
        this.nightModeSource = source;
      } else {
        // Restore previous brightness or use a reasonable default
        const restoreBrightness = (this.previousBrightness && this.previousBrightness > 0) 
          ? this.previousBrightness 
          : 128;
        
        await this.hass.callService('number', 'set_value', {
          entity_id: brightnessEntity,
          value: restoreBrightness
        });
        
        this.nightModeSource = null;
      }
      
      // Update state variables
      this.isInNightMode = newNightMode;
      this.isNightMode = newNightMode;
      
      // Update the night-mode component if it exists
      const nightModeComponent = this.shadowRoot.querySelector('night-mode');
      if (nightModeComponent) {
        nightModeComponent.isInNightMode = newNightMode;
        nightModeComponent.previousBrightness = this.previousBrightness;
        nightModeComponent.nightModeSource = this.nightModeSource;
        
        // Activate animation for manual mode entry
        if (newNightMode && source === 'manual') {
          nightModeComponent.animationActive = true;
        }
      }
      
      this.requestUpdate();
    } catch (error) {
      // On error, restore the previous state
      this.isInNightMode = !newNightMode;
      this.isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  // Updated to monitor entity changes and show visual changes immediately
  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass && !this.isAdjustingBrightness && !this._inEditor()) {
      // Monitor brightness entity changes
      const brightnessEntity = 'number.liam_display_screen_brightness';
      if (this.hass.states[brightnessEntity]) {
        const newBrightness = parseFloat(this.hass.states[brightnessEntity].state);
        if (this.brightness !== newBrightness) {
          this.brightness = newBrightness;
          this.visualBrightness = newBrightness;
          
          // If not in night mode and brightness > 0, also update previous brightness
          if (!this.isNightMode && newBrightness > 0) {
            this.previousBrightness = newBrightness;
          }
          
          this.requestUpdate();
        }
      }
      
      // Check if it's time to update night mode
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
      }
    }
    
    // Ensure theme is properly applied
    if (changedProperties.has('isDarkMode') || changedProperties.has('hass')) {
      this.refreshComponents();
    }
  }

  handleBrightnessCardToggle(event) {
    const shouldShow = event.detail;
    
    if (shouldShow && !this.showBrightnessCard) {
      // Hide overlay first if showing
      if (this.showOverlay) {
        this.isOverlayVisible = false;
        this.showOverlay = false;
        this.isOverlayTransitioning = false;
        
        if (this.overlayDismissTimer) {
          clearTimeout(this.overlayDismissTimer);
        }
      }

      // Then show brightness card
      this.showBrightnessCard = true;
      this.isBrightnessCardTransitioning = true;
      
      requestAnimationFrame(() => {
        this.isBrightnessCardVisible = true;
        this.startBrightnessCardDismissTimer();
        this.requestUpdate();
        
        setTimeout(() => {
          this.isBrightnessCardTransitioning = false;
          this.requestUpdate();
        }, 300);
      });
    } else if (!shouldShow && this.showBrightnessCard) {
      this.dismissBrightnessCard();
    }
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('google-card', GoogleCard);

// Make GoogleCard available to the outside world
window.customCards = window.customCards || [];
window.customCards.push({
  type: "google-card",
  name: "Google Card",
  description: "A card that mimics Google's UI for photo frame displays",
  preview: true
});

export { GoogleCard };
```
