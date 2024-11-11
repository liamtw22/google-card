// src/GoogleCard.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { DEFAULT_CONFIG } from './constants';
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
      brightness: { type: Number },
      visualBrightness: { type: Number },
      showBrightnessCard: { type: Boolean },
      brightnessCardTransition: { type: String },
      isNightMode: { type: Boolean },
      currentTime: { type: String },
      isInNightMode: { type: Boolean },
      previousBrightness: { type: Number },
      isAdjustingBrightness: { type: Boolean },
      lastBrightnessUpdateTime: { type: Number },
    };
  }

  static get styles() {
    return [sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }

  initializeProperties() {
    this.showDebugInfo = false;
    this.showOverlay = false;
    this.isNightMode = false;
    this.showBrightnessCard = false;
    this.brightnessCardTransition = 'none';
    this.brightness = DEFAULT_CONFIG.brightness || 128;
    this.visualBrightness = DEFAULT_CONFIG.brightness || 128;
    this.previousBrightness = DEFAULT_CONFIG.brightness || 128;
    this.isInNightMode = false;
    this.isAdjustingBrightness = false;
    this.lastBrightnessUpdateTime = 0;
    this.updateScreenSize();

    // Initialize time
    this.updateTime();
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
  }

  firstUpdated() {
    super.firstUpdated();
    // Set up event listeners
    this.addEventListener('overlayToggle', this.handleOverlayToggle);
    this.addEventListener('brightnessCardToggle', this.handleBrightnessCardToggle);
    this.addEventListener('brightnessChange', this.handleBrightnessChange);
    this.addEventListener('debugToggle', this.handleDebugToggle);
    window.addEventListener('resize', this.boundUpdateScreenSize);

    // Start time updates
    this.startTimeUpdates();
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateNightMode();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimers();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('overlayToggle', this.handleOverlayToggle);
    this.removeEventListener('brightnessCardToggle', this.handleBrightnessCardToggle);
    this.removeEventListener('brightnessChange', this.handleBrightnessChange);
    this.removeEventListener('debugToggle', this.handleDebugToggle);
  }

  clearTimers() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    if (this.brightnessStabilizeTimer) clearTimeout(this.brightnessStabilizeTimer);
  }

  // Event Handlers
  handleOverlayToggle = (event) => {
    this.showOverlay = event.detail;
    this.requestUpdate();
  }

  handleBrightnessCardToggle = (event) => {
    this.showBrightnessCard = event.detail;
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.requestUpdate();
  }

  handleBrightnessChange = async (event) => {
    await this.updateBrightnessValue(event.detail);
  }

  handleDebugToggle = () => {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }

  // Screen and Time Management
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
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
      hour12: true
    }).replace(/\s?[AP]M/, '');
  }

  // Brightness Management
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = true;
    this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));
    
    if (this.brightnessStabilizeTimer) {
      clearTimeout(this.brightnessStabilizeTimer);
    }

    try {
      await this.setBrightness(value);
      this.lastBrightnessUpdateTime = Date.now();
      
      this.brightnessStabilizeTimer = setTimeout(() => {
        this.isAdjustingBrightness = false;
        this.requestUpdate();
      }, 2000);
    } catch (error) {
      console.error('Error updating brightness:', error);
      this.visualBrightness = this.brightness;
    }
  }

  async setBrightness(value) {
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    
    try {
      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: brightness
        }
      });

      await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });

      await new Promise(resolve => setTimeout(resolve, this.config.sensor_update_delay));
      
      this.brightness = brightness;
      if (!this.isNightMode) {
        this.previousBrightness = brightness;
      }
    } catch (error) {
      console.error('Error setting brightness:', error);
      throw error;
    }
  }

  // Night Mode Management
  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      const timeSinceLastUpdate = Date.now() - this.lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this.updateNightMode();
      }
    }
  }

  updateNightMode() {
    if (!this.hass?.states['sensor.liam_room_display_light_sensor']) return;

    const lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'];
    const shouldBeInNightMode = parseInt(lightSensor.state) === 0;

    if (shouldBeInNightMode !== this.isInNightMode) {
      this.handleNightModeTransition(shouldBeInNightMode);
    }
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
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.setBrightness(1);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.toggleAutoBrightness(true);
  }

  async exitNightMode() {
    await this.toggleAutoBrightness(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.setBrightness(this.previousBrightness);
  }

  async toggleAutoBrightness(enabled) {
    await this.hass.callService('notify', 'mobile_app_liam_s_room_display', {
      message: 'command_auto_screen_brightness',
      data: {
        command: enabled ? 'turn_on' : 'turn_off'
      }
    });
  }

  // Render Methods
  render() {
    if (this.isNightMode) {
      return html`
        <night-mode 
          .currentTime=${this.currentTime}
          .hass=${this.hass}
        ></night-mode>
      `;
    }

    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <background-rotator
        .hass=${this.hass}
        .config=${this.config}
        .screenWidth=${this.screenWidth}
        .screenHeight=${this.screenHeight}
        .showDebugInfo=${this.showDebugInfo}
      ></background-rotator>

      <weather-clock 
        .hass=${this.hass}
      ></weather-clock>

      <google-controls
        .hass=${this.hass}
        .showOverlay=${this.showOverlay}
        .showBrightnessCard=${this.showBrightnessCard}
        .brightnessCardTransition=${this.brightnessCardTransition}
        .brightness=${this.brightness}
        .visualBrightness=${this.visualBrightness}
        .isAdjustingBrightness=${this.isAdjustingBrightness}
      ></google-controls>

      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
    `;
  }

  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Google Card Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Night Mode:</strong> ${this.isNightMode}</p>
        <p><strong>Show Overlay:</strong> ${this.showOverlay}</p>
        <p><strong>Show Brightness Card:</strong> ${this.showBrightnessCard}</p>
        <p><strong>Current Brightness:</strong> ${this.brightness}</p>
        <p><strong>Visual Brightness:</strong> ${this.visualBrightness}</p>
        <p><strong>Previous Brightness:</strong> ${this.previousBrightness}</p>
        <p><strong>Is Adjusting Brightness:</strong> ${this.isAdjustingBrightness}</p>
        <p><strong>Last Brightness Update:</strong> ${new Date(this.lastBrightnessUpdateTime).toLocaleString()}</p>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
}

customElements.define('google-card', GoogleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: 'A Google Nest Hub-inspired card for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/liamtw22/google-card',
});
