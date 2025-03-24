// src/components/NightMode.js
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module';
import { NIGHT_MODE_TRANSITION_DELAY, MIN_BRIGHTNESS, DEFAULT_SENSOR_UPDATE_DELAY } from '../constants';
import { sharedStyles } from '../styles/SharedStyles';

export class NightMode extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      currentTime: { type: String },
      brightness: { type: Number },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isTransitioning: { type: Boolean },
      error: { type: String },
      nightModeSource: { type: String },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .night-mode {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 5;
          cursor: pointer;
        }

        .night-time {
          color: white;
          font-size: 35vw;
          font-weight: 400;
          font-family: 'Product Sans Regular', sans-serif;
        }
        
        .tap-hint {
          position: fixed;
          bottom: 40px;
          left: 0;
          right: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          text-align: center;
          font-family: 'Rubik', sans-serif;
          font-weight: 300;
          animation: pulse 3s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
      `
    ];
  }

  constructor() {
    super();
    this.currentTime = '';
    this.brightness = MIN_BRIGHTNESS;
    this.isInNightMode = false;
    this.previousBrightness = MIN_BRIGHTNESS;
    this.isTransitioning = false;
    this.error = null;
    this.nightModeSource = null; // Can be 'sensor' or 'manual'
    this.timeUpdateInterval = null;
    this.sensorCheckInterval = null;
    this.sensorCheckedTime = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateTime();
    this.startTimeUpdates();
    
    // Only enter night mode automatically if it's confirmed
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
      
      // Disable auto brightness first
      await this.toggleAutoBrightness(false);
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      
      // Set to minimum brightness
      await this.setBrightness(MIN_BRIGHTNESS);
      
      // Enable auto brightness for night mode
      await new Promise(resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY));
      await this.toggleAutoBrightness(true);
      
      this.isInNightMode = true;
      this.error = null;
    } catch (error) {
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
      
      await this.setBrightness(targetBrightness);
      
      // Keep auto brightness disabled after exiting
      
      this.isInNightMode = false;
      this.error = null;
      
      // Notify parent that night mode has been exited
      this.dispatchEvent(new CustomEvent('nightModeExit', {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      this.error = `Error exiting night mode: ${error.message}`;
    } finally {
      this.isTransitioning = false;
      this.requestUpdate();
    }
  }

  async setBrightness(value) {
    if (!this.hass || !this.config) return;

    const brightness = Math.max(MIN_BRIGHTNESS, Math.min(255, Math.round(value)));
    const deviceName = this.config.device_name || 'mobile_app_liam_s_room_display';
      
    await this.hass.callService('notify', deviceName, {
      message: 'command_screen_brightness_level',
      data: {
        command: brightness,
      },
    });

    await this.hass.callService('notify', deviceName, {
      message: 'command_update_sensors',
    });

    await new Promise(resolve => setTimeout(resolve, 
      this.config.sensor_update_delay || DEFAULT_SENSOR_UPDATE_DELAY));

    this.brightness = brightness;
    this.requestUpdate();
  }

  async toggleAutoBrightness(enabled) {
    if (!this.hass || !this.config) return;
    
    const deviceName = this.config.device_name || 'mobile_app_liam_s_room_display';

    await this.hass.callService('notify', deviceName, {
      message: 'command_auto_screen_brightness',
      data: {
        command: enabled ? 'turn_on' : 'turn_off',
      },
    });
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
    if (!this.hass || !this.config) return;
    this.sensorCheckedTime = Date.now();

    const lightSensorEntity = this.config.light_sensor_entity || 'sensor.liam_room_display_light_sensor';
    const lightSensor = this.hass.states[lightSensorEntity];
    
    if (!lightSensor) {
      return;
    }
    
    if (lightSensor.state === 'unavailable' || lightSensor.state === 'unknown') {
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
      // Handle error silently
    }
  }

  render() {
    return html`
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
