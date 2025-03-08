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
      }
      
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      await this.setBrightness(MIN_BRIGHTNESS);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      await this.toggleAutoBrightness(true);

      this.isInNightMode = true;
      this.error = null;
    } catch (error) {
      console.error('Error entering night mode:', error);
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
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      
      // Use previous brightness or a reasonable default
      const targetBrightness = this.previousBrightness > MIN_BRIGHTNESS 
        ? this.previousBrightness 
        : 128; // Default to middle brightness if no previous value
      
      await this.setBrightness(targetBrightness);

      this.isInNightMode = false;
      this.error = null;
      
      // Notify parent that night mode has been exited
      this.dispatchEvent(new CustomEvent('nightModeExit', {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      console.error('Error exiting night mode:', error);
      this.error = `Error exiting night mode: ${error.message}`;
    } finally {
      this.isTransitioning = false;
      this.requestUpdate();
    }
  }

  async setBrightness(value) {
    if (!this.hass) {
      console.warn('Home Assistant not available');
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
      console.error('Error setting brightness:', error);
      throw error;
    }
  }

  async toggleAutoBrightness(enabled) {
    if (!this.hass) {
      console.warn('Home Assistant not available');
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
      console.error('Error toggling auto brightness:', error);
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
      console.warn('Light sensor not found');
      return;
    }
    
    if (lightSensor.state === 'unavailable' || lightSensor.state === 'unknown') {
      console.warn('Light sensor is unavailable or in unknown state');
      return;
    }

    try {
      const lightLevel = parseInt(lightSensor.state);
      const shouldBeInNightMode = lightLevel === 0;

      if (shouldBeInNightMode && !this.isInNightMode) {
        this.enterNightMode();
      } else if (!shouldBeInNightMode && this.isInNightMode) {
        this.exitNightMode();
      }
    } catch (error) {
      console.error('Error parsing light sensor value:', error);
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
      <div class="night-mode">
        <div class="night-time">${this.currentTime}</div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('night-mode', NightMode);
