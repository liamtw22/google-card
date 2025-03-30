// src/components/NightMode.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { NIGHT_MODE_TRANSITION_DELAY } from '../constants';
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
    
    // Set up periodic sensor checks for sun-based detection
    this.sensorCheckInterval = setInterval(() => {
      this.checkSunEntities();
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
        this.checkSunEntities();
      }
      
      // Update brightness from entity
      const brightnessEntity = 'number.liam_display_screen_brightness';
      if (this.hass.states[brightnessEntity]) {
        this.brightness = parseFloat(this.hass.states[brightnessEntity].state);
      }
    }
  }

  checkSunEntities() {
    if (!this.hass) return;
    
    this.sensorCheckedTime = Date.now();

    // Get sun state entities
    const sunRisingEntity = this.hass.states['sensor.sun_next_rising'];
    const sunSettingEntity = this.hass.states['sensor.sun_next_setting'];
    
    if (!sunRisingEntity || !sunSettingEntity) {
      return;
    }
    
    try {
      // Parse the timestamp strings into Date objects
      const nextRising = new Date(sunRisingEntity.state);
      const nextSetting = new Date(sunSettingEntity.state);
      
      // If the next sun event is rising, then it's currently night
      // If the next sun event is setting, then it's currently day
      const isDarkTime = nextRising < nextSetting;
      
      // If night mode was manually activated, don't let sensor readings deactivate it
      if (this.isInNightMode && this.nightModeSource === 'manual') {
        // Keep night mode on regardless of sun state
        return;
      }
      
      // For sensor-based night mode, follow the sun state
      if (isDarkTime && !this.isInNightMode) {
        this.enterNightMode();
        this.nightModeSource = 'sensor';
      } else if (!isDarkTime && this.isInNightMode && this.nightModeSource === 'sensor') {
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
      
      // If this was enabled by a sensor, set a timer to re-check after 30 seconds
      if (originalSource === 'sensor') {
        // Clear any existing timer
        if (this.nightModeReactivationTimer) {
          clearTimeout(this.nightModeReactivationTimer);
        }
        
        // Set a new timer to re-check sun state after 30 seconds
        this.nightModeReactivationTimer = setTimeout(() => {
          this.checkSunEntities();
          this.nightModeReactivationTimer = null;
        }, 30000); // 30 seconds
      }
    }
  }
}
customElements.define('night-mode', NightMode);
