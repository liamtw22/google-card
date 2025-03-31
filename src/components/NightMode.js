// src/components/NightMode.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
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
      `
    ];
  }

  constructor() {
    super();
    this.currentTime = '';
    this.brightness = 0;
    this.isInNightMode = false;
    this.previousBrightness = 128;
    this.isTransitioning = false;
    this.error = null;
    this.nightModeSource = null; // Can be 'sensor' or 'manual'
    this.timeUpdateInterval = null;
    this.sensorCheckInterval = null;
    this.sensorCheckedTime = 0;
    this.nightModeReactivationTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateTime();
    this.startTimeUpdates();
    
    // Only enter night mode automatically if it's confirmed
    if (this.isInNightMode) {
      this.enterNightMode();
    }
    
    // Set up periodic sensor checks for light-based detection
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
    if (this.nightModeReactivationTimer) {
      clearTimeout(this.nightModeReactivationTimer);
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
      const brightnessEntity = 'number.liam_display_screen_brightness';
      
      // Store current brightness before entering night mode
      if (this.hass.states[brightnessEntity]) {
        this.previousBrightness = parseFloat(this.hass.states[brightnessEntity].state);
      }
      
      // Set to minimum brightness (0)
      await this.hass.callService('number', 'set_value', {
        entity_id: brightnessEntity,
        value: 0
      });
      
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
      const brightnessEntity = 'number.liam_display_screen_brightness';
      
      // Restore previous brightness or use a reasonable default
      const targetBrightness = (this.previousBrightness && this.previousBrightness > 0) 
        ? this.previousBrightness 
        : 128; // Default to middle brightness if no previous value
      
      await this.hass.callService('number', 'set_value', {
        entity_id: brightnessEntity,
        value: targetBrightness
      });
      
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

  updated(changedProperties) {
    // Check if hass was just connected
    if (changedProperties.has('hass') && this.hass) {
      const timeSinceLastCheck = Date.now() - this.sensorCheckedTime;
      // Only check if we haven't checked recently
      if (timeSinceLastCheck > 5000) {
        this.checkLightSensor();
      }
      
      // Update brightness from entity
      const brightnessEntity = 'number.liam_display_screen_brightness';
      if (this.hass.states[brightnessEntity]) {
        this.brightness = parseFloat(this.hass.states[brightnessEntity].state);
      }
    }
  }

  checkLightSensor(force = false) {
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

      // If night mode was manually deactivated and this is not a forced check, 
      // don't let sensor readings reactivate it
      if (!this.isInNightMode && this.nightModeSource === 'manual' && !force) {
        return;
      }
      
      // For sensor-based night mode or forced check, follow the sensor readings
      if (shouldBeInNightMode && !this.isInNightMode) {
        this.enterNightMode();
        this.nightModeSource = 'sensor';
      } else if (!shouldBeInNightMode && this.isInNightMode && (this.nightModeSource === 'sensor' || force)) {
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
      </div>
    `;
  }
  
  handleNightModeTap() {
    if (this.isInNightMode) {
      // Save the original source
      const originalSource = this.nightModeSource;
      
      // Exit night mode
      this.exitNightMode();
      
      // If light sensor is still 0, set up reactivation timer
      const lightSensorEntity = this.config.light_sensor_entity || 'sensor.liam_room_display_light_sensor';
      if (this.hass && this.hass.states[lightSensorEntity]) {
        const lightLevel = parseInt(this.hass.states[lightSensorEntity].state);
        if (lightLevel === 0) {
          // Clear any existing timer
          if (this.nightModeReactivationTimer) {
            clearTimeout(this.nightModeReactivationTimer);
          }
          
          // Set a new timer to re-check light sensor after 30 seconds
          this.nightModeReactivationTimer = setTimeout(() => {
            this.checkLightSensor(true); // Force check that will reactivate if needed
            this.nightModeReactivationTimer = null;
          }, 30000); // 30 seconds
        }
      }
    }
  }
}
customElements.define('night-mode', NightMode);
