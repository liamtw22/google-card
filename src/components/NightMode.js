// src/components/NightMode.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { nightModeStyles } from '../styles/NightModeStyles';
import { sharedStyles } from '../styles/SharedStyles';
import {
  NIGHT_MODE_TRANSITION_DELAY,
  MIN_BRIGHTNESS,
  DEFAULT_SENSOR_UPDATE_DELAY,
} from '../constants';

export class NightMode extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      currentTime: { type: String },
      brightness: { type: Number },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isTransitioning: { type: Boolean },
      error: { type: String },
      sensorCheckedTime: { type: Number },
      nightModeSource: { type: String },
    };
  }

  static get styles() {
    return [sharedStyles, nightModeStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.currentTime = '';
    this.brightness = MIN_BRIGHTNESS;
    this.isInNightMode = false;
    this.previousBrightness = MIN_BRIGHTNESS;
    this.timeUpdateInterval = null;
    this.sensorCheckInterval = null;
    this.isTransitioning = false;
    this.error = null;
    this.sensorCheckedTime = 0;
    this.nightModeSource = null; // Can be 'sensor' or 'manual'
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateTime();
    this.startTimeUpdates();
    
    // Only enter night mode automatically if it's confirmed via the light sensor
    if (this.isInNightMode) {
      this.enterNightMode();
    }
    
    // Set up periodic sensor checks
    this.sensorCheckInterval = setInterval(() => {
      this.checkLightSensor();
    }, 30000); // Check every 30 seconds
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    if (this.sensorCheckInterval) {
      clearInterval(this.sensorCheckInterval);
    }
  }

  startTimeUpdates() {
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

  async enterNightMode() {
    if (this.isInNightMode && !this.isTransitioning) return;
    this.isTransitioning = true;
    
    try {
      // Store current brightness before entering night mode
      if (this.brightness > MIN_BRIGHTNESS) {
        this.previousBrightness = this.brightness;
        // Console log removed for linting
      }
      
      // Disable auto brightness first
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      
      // Set to minimum brightness
      await this.setBrightness(MIN_BRIGHTNESS);
      
      // Don't re-enable auto brightness, to avoid possible conflicts
      
      this.isInNightMode = true;
      this.error = null;
    } catch (error) {
      // Console log removed for linting
      this.error = `Error entering night mode: ${error.message}`;
    } finally {
      this.isTransitioning = false;
      this.requestUpdate();
    }
  }

  async exitNightMode() {
    if (!this.isInNightMode || this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      // Ensure auto-brightness is disabled
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      
      // Restore previous brightness or use a reasonable default
      const targetBrightness = (this.previousBrightness && this.previousBrightness > MIN_BRIGHTNESS) 
        ? this.previousBrightness 
        : 128; // Default to middle brightness if no previous value
      
      // Console log removed for linting
      await this.setBrightness(targetBrightness);
      
      this.isInNightMode = false;
      this.error = null;
      
      // Notify parent that night mode has been exited
      this.dispatchEvent(new CustomEvent('nightModeExit', {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      // Console log removed for linting
      this.error = `Error exiting night mode: ${error.message}`;
    } finally {
      this.isTransitioning = false;
      this.requestUpdate();
    }
  }

  async setBrightness(value) {
    if (!this.hass) {
      // Console log warning removed for linting
      return;
    }

    try {
      const brightness = Math.max(MIN_BRIGHTNESS, Math.min(255, Math.round(value)));
      
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: brightness,
        },
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors',
      });

      await new Promise(resolve => setTimeout(resolve, DEFAULT_SENSOR_UPDATE_DELAY));

      this.brightness = brightness;
      this.requestUpdate();
    } catch (error) {
      // Console log removed for linting
      throw error;
    }
  }

  async toggleAutoBrightness(enabled) {
    if (!this.hass) {
      // Console log warning removed for linting
      return;
    }

    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_auto_screen_brightness',
        data: {
          command: enabled ? 'turn_on' : 'turn_off',
        },
      });
    } catch (error) {
      // Console log removed for linting
      throw error;
    }
  }

  updated(changedProperties) {
    // Check if hass was just connected
    if (changedProperties.has('hass') && this.hass) {
      const timeSinceLastCheck = Date.now() - this.sensorCheckedTime;
      // Only check if we haven't checked recently
      if (timeSinceLastCheck > 5000) {
        this.checkLightSensor();
      }
    }
  }

  checkLightSensor() {
    if (!this.hass) return;
    this.sensorCheckedTime = Date.now();

    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    
    if (!lightSensor) {
      // Console log warning removed for linting
      return;
    }
    
    if (lightSensor.state === 'unavailable' || lightSensor.state === 'unknown') {
      // Console log warning removed for linting
      return;
    }

    try {
      const lightLevel = parseInt(lightSensor.state);
      const shouldBeInNightMode = lightLevel === 0;

      // If night mode was manually activated, don't let sensor readings deactivate it
      if (this.isInNightMode && this.nightModeSource === 'manual') {
        // Keep night mode on regardless of sensor
        return;
      }
      
      // For sensor-based night mode, follow the sensor readings
      if (shouldBeInNightMode && !this.isInNightMode) {
        this.enterNightMode();
        this.nightModeSource = 'sensor';
      } else if (!shouldBeInNightMode && this.isInNightMode && this.nightModeSource === 'sensor') {
        this.exitNightMode();
        this.nightModeSource = null;
      }
    } catch (error) {
      // Console log removed for linting
    }
  }

  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div class="night-mode" @click="${this.handleNightModeTap}">
        <div class="night-time">${this.currentTime}</div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        
        ${this.nightModeSource === 'manual' ? html`
          <div class="tap-hint">Tap anywhere to exit night mode</div>
        ` : ''}
      </div>
    `;
  }
  
  handleNightModeTap() {
    // Only respond to taps when in manual night mode
    if (this.isInNightMode && this.nightModeSource === 'manual') {
      this.exitNightMode();
      this.dispatchEvent(new CustomEvent('nightModeExit', {
        bubbles: true,
        composed: true,
      }));
    }
  }
}

customElements.define('night-mode', NightMode);
