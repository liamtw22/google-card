// src/GoogleCard.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { DEFAULT_CONFIG, MIN_BRIGHTNESS } from './constants';
import { sharedStyles } from './styles/SharedStyles';
import './components/BackgroundRotator';
import './components/Controls';
import './components/NightMode';
import './components/WeatherClock';

export class GoogleCard extends LitElement {
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
      `
    ];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.brightnessUpdateQueue = [];
    this.isProcessingBrightnessUpdate = false;
    
    // Theme detection
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.boundHandleThemeChange = this.handleThemeChange.bind(this);
    
    // Bind event handler methods to preserve 'this' context
    this.handleBrightnessCardToggle = this.handleBrightnessCardToggle.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleDebugToggle = this.handleDebugToggle.bind(this);
    this.handleNightModeExit = this.handleNightModeExit.bind(this);
  }

  initializeProperties() {
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.isOverlayVisible = false;
    this.isOverlayTransitioning = false;
    this.isNightMode = false;
    this.showBrightnessCard = false;
    this.isBrightnessCardVisible = false;
    this.isBrightnessCardTransitioning = false;
    this.brightness = DEFAULT_CONFIG.brightness || 128;
    this.visualBrightness = this.brightness;
    this.previousBrightness = this.brightness;
    this.isInNightMode = false;
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

    this.updateScreenSize();
    this.updateTime();
  }

  // Home Assistant configuration
  static getConfigElement() {
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
    if (!config.image_url) {
      throw new Error('You need to define an image_url');
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      sensor_update_delay: config.sensor_update_delay || DEFAULT_CONFIG.sensor_update_delay
    };

    this.showDebugInfo = this.config.show_debug;
    this.updateCssVariables();
  }
  
  updateCssVariables() {
    if (!this.config) return;
    
    this.style.setProperty('--crossfade-time', `${this.config.crossfade_time || 3}s`);
    this.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
    this.style.setProperty('--theme-background', this.isDarkMode ? '#121212' : '#ffffff');
    this.style.setProperty('--theme-text', this.isDarkMode ? '#ffffff' : '#333333');
    
    document.documentElement.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
    document.documentElement.style.setProperty('--theme-background', this.isDarkMode ? '#121212' : '#ffffff');
    document.documentElement.style.setProperty('--theme-text', this.isDarkMode ? '#ffffff' : '#333333');
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
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    
    // Force refresh of key components
    const backgroundRotator = this.shadowRoot.querySelector('background-rotator');
    const weatherClock = this.shadowRoot.querySelector('weather-clock');
    const controls = this.shadowRoot.querySelector('google-controls');
    
    if (backgroundRotator) backgroundRotator.requestUpdate();
    if (weatherClock) weatherClock.requestUpdate();
    if (controls) controls.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.startTimeUpdates();
    // Delay initial night mode check to ensure hass is available
    setTimeout(() => this.updateNightMode(), 1000);
    window.addEventListener('resize', this.boundUpdateScreenSize);
    
    // Add theme change detection
    this.themeMediaQuery.addEventListener('change', this.boundHandleThemeChange);
    
    // Apply current theme on initial load
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    
    // Force initial refresh to ensure everything loads properly
    setTimeout(() => {
      this.updateCssVariables();
      this.refreshComponents();
    }, 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    
    // Remove theme change listener
    this.themeMediaQuery.removeEventListener('change', this.boundHandleThemeChange);
    
    const touchContainer = this.shadowRoot?.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.removeEventListener('touchstart', this.handleTouchStart);
      touchContainer.removeEventListener('touchmove', this.handleTouchMove);
      touchContainer.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  firstUpdated() {
    super.firstUpdated();
    
    const touchContainer = this.shadowRoot.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      touchContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      touchContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
  }

  clearAllTimers() {
    if (this.overlayDismissTimer) clearTimeout(this.overlayDismissTimer);
    if (this.brightnessCardDismissTimer) clearTimeout(this.brightnessCardDismissTimer);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
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
      if (this.isNightMode && this.nightModeSource === 'manual') {
        // Only minor movements should count as taps, not full swipes
        if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) {
          this.handleNightModeTransition(false);
          return;
        }
      }
      
      // Check for horizontal swipe from left to right (for night mode toggle)
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > 50 && 
          velocityX > 0.2 && 
          this.touchStartX < window.innerWidth * 0.2 && // Started from the left edge (20% of screen)
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

  // Implement a queue-based approach to prevent rapid brightness updates
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));
    
    // Add to update queue
    this.brightnessUpdateQueue.push(value);
    
    // Start processing if not already in progress
    if (!this.isProcessingBrightnessUpdate) {
      this.processBrightnessUpdateQueue();
    }
    
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }
    
    this.brightnessStabilizeTimer = setTimeout(() => {
      this.isAdjustingBrightness = false;
      this.requestUpdate();
    }, 2000);
  }

  async processBrightnessUpdateQueue() {
    if (this.brightnessUpdateQueue.length === 0) {
      this.isProcessingBrightnessUpdate = false;
      return;
    }
    
    this.isProcessingBrightnessUpdate = true;
    
    // Take the last value in the queue to skip intermediate values
    const lastValue = this.brightnessUpdateQueue[this.brightnessUpdateQueue.length - 1];
    this.brightnessUpdateQueue = [];
    
    try {
      await this.setBrightness(lastValue);
      this.lastBrightnessUpdateTime = Date.now();
    } catch (error) {
      // Error handling without console log
      this.visualBrightness = this.brightness;
    }
    
    // Process remaining updates after a short delay to prevent rapid updates
    setTimeout(() => this.processBrightnessUpdateQueue(), 250);
  }

  async setBrightness(value) {
    if (!this.hass) return;
    
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    const deviceName = this.config.device_name || 'mobile_app_liam_s_room_display';
    
    await this.hass.callService('notify', deviceName, {
      message: 'command_screen_brightness_level',
      data: {
        command: brightness
      }
    });

    await this.hass.callService('notify', deviceName, {
      message: 'command_update_sensors'
    });

    await new Promise(resolve => setTimeout(resolve, this.config.sensor_update_delay));
    
    this.brightness = brightness;
    if (!this.isNightMode) {
      this.previousBrightness = brightness;
    }
  }

  async handleNightModeTransition(newNightMode, source = 'sensor') {
    if (newNightMode === this.isInNightMode && this.nightModeSource === source) return;
    
    try {
      if (newNightMode) {
        await this.enterNightMode();
        this.nightModeSource = source;
      } else {
        await this.exitNightMode();
        this.nightModeSource = null;
      }
      
      this.isInNightMode = newNightMode;
      this.isNightMode = newNightMode;
      
      // Update the night-mode component if it exists
      const nightModeComponent = this.shadowRoot.querySelector('night-mode');
      if (nightModeComponent) {
        nightModeComponent.isInNightMode = newNightMode;
        nightModeComponent.previousBrightness = this.previousBrightness;
        nightModeComponent.nightModeSource = this.nightModeSource;
      }
      
      this.requestUpdate();
    } catch (error) {
      // Restore previous state on error
      this.isInNightMode = !newNightMode;
      this.isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  async enterNightMode() {
    // Save current brightness, but only if it's not already saved and reasonable
    if (!this.isInNightMode && this.brightness > MIN_BRIGHTNESS) {
      this.previousBrightness = this.brightness;
    }
    
    const deviceName = this.config.device_name || 'mobile_app_liam_s_room_display';
    
    try {
      // First disable auto brightness
      await this.hass.callService('notify', deviceName, {
        message: 'command_auto_screen_brightness',
        data: {
          command: 'turn_off'
        }
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Set to minimum brightness
      await this.setBrightness(MIN_BRIGHTNESS);
      
      // Then enable auto brightness for night mode
      await new Promise(resolve => setTimeout(resolve, 200));
      await this.hass.callService('notify', deviceName, {
        message: 'command_auto_screen_brightness',
        data: {
          command: 'turn_on'
        }
      });
    } catch (error) {
      console.error("Error entering night mode:", error);
      throw error;
    }
  }

  async exitNightMode() {
    const deviceName = this.config.device_name || 'mobile_app_liam_s_room_display';
    
    try {
      // First disable auto brightness
      await this.hass.callService('notify', deviceName, {
        message: 'command_auto_screen_brightness',
        data: {
          command: 'turn_off'
        }
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Restore previous brightness or use a reasonable default
      const restoreBrightness = (this.previousBrightness && this.previousBrightness > MIN_BRIGHTNESS) 
        ? this.previousBrightness 
        : 128;
      
      await this.setBrightness(restoreBrightness);
      
      // Keep auto brightness disabled after exiting night mode
    } catch (error) {
      console.error("Error exiting night mode:", error);
      throw error;
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

  handleBrightnessChange(event) {
    this.updateBrightnessValue(event.detail);
    // Reset dismiss timer when user interacts with brightness
    this.startBrightnessCardDismissTimer();
  }

  handleDebugToggle() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  handleNightModeExit() {
    this.isNightMode = false;
    this.requestUpdate();
  }

  updateNightMode() {
    if (!this.hass) return;
    
    const lightSensorEntity = this.config.light_sensor_entity || 'sensor.liam_room_display_light_sensor';
    const lightSensor = this.hass.states[lightSensorEntity];
    if (!lightSensor) {
      return;
    }

    const sensorState = lightSensor.state;
    if (sensorState === 'unavailable' || sensorState === 'unknown') {
      return;
    }

    const shouldBeInNightMode = parseInt(sensorState) === 0;
    
    // If night mode was manually activated, don't let sensor readings deactivate it
    if (this.isInNightMode && this.nightModeSource === 'manual') {
      // Keep night mode on regardless of sensor
      return;
    }
    
    // Otherwise, follow sensor readings for automatic night mode
    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode, 'sensor');
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
      }
    }
  }

  render() {
    const mainContent = this.isNightMode ? html`
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
    ` : html`
      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
      ></background-rotator>

      <weather-clock 
        .hass=${this.hass}
        .config=${this.config}
      ></weather-clock>

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
        @debugToggle=${this.handleDebugToggle}
      ></google-controls>
    `;

    return html`
      <!-- Import all required fonts -->
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet" crossorigin="anonymous">
      <link href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap" rel="stylesheet" crossorigin="anonymous">
      
      <!-- Fallback font style for Product Sans -->
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src: local('Product Sans'), local('Product Sans Regular'), local('ProductSans-Regular'), url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2) format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      </style>
      
      <div class="touch-container">
        <div class="content-wrapper">
          ${mainContent}
        </div>
      </div>
    `;
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
