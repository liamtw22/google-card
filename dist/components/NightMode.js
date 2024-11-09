import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { nightModeStyles } from "../styles/NightModeStyles.js";

import { sharedStyles } from "../styles/SharedStyles.js";

import { MIN_BRIGHTNESS, NIGHT_MODE_TRANSITION_DELAY, DEFAULT_SENSOR_UPDATE_DELAY } from "../constants.js";

class NightMode extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      currentTime: {
        type: String
      },
      brightness: {
        type: Number
      },
      isInNightMode: {
        type: Boolean
      },
      previousBrightness: {
        type: Number
      }
    };
  }
  static get styles() {
    return [ sharedStyles, nightModeStyles ];
  }
  constructor() {
    super(), this.initializeProperties(), this.timeUpdateInterval = null;
  }
  initializeProperties() {
    this.currentTime = "", this.brightness = MIN_BRIGHTNESS, this.isInNightMode = !1, 
    this.previousBrightness = MIN_BRIGHTNESS;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateTime(), this.startTimeUpdates(), this.enterNightMode();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval);
  }
  startTimeUpdates() {
    this.timeUpdateInterval = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  async enterNightMode() {
    if (!this.isInNightMode) try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY))), 
      await this.setBrightness(MIN_BRIGHTNESS), await new Promise((resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY))), 
      await this.toggleAutoBrightness(!0), this.isInNightMode = !0, this.requestUpdate();
    } catch (error) {
      console.error("Error entering night mode:", error);
    }
  }
  async exitNightMode() {
    if (this.isInNightMode) try {
      await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, NIGHT_MODE_TRANSITION_DELAY))), 
      await this.setBrightness(this.previousBrightness), this.isInNightMode = !1, this.requestUpdate(), 
      this.dispatchEvent(new CustomEvent("nightModeExit"));
    } catch (error) {
      console.error("Error exiting night mode:", error);
    }
  }
  async setBrightness(value) {
    if (this.hass) try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_screen_brightness_level",
        data: {
          command: value
        }
      }), await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_update_sensors"
      }), await new Promise((resolve => setTimeout(resolve, DEFAULT_SENSOR_UPDATE_DELAY))), 
      this.brightness = value, this.requestUpdate();
    } catch (error) {
      console.error("Error setting brightness:", error);
    }
  }
  async toggleAutoBrightness(enabled) {
    if (this.hass) try {
      await this.hass.callService("notify", "mobile_app_liam_s_room_display", {
        message: "command_auto_screen_brightness",
        data: {
          command: enabled ? "turn_on" : "turn_off"
        }
      });
    } catch (error) {
      console.error("Error toggling auto brightness:", error);
    }
  }
  updated(changedProperties) {
    changedProperties.has("hass") && this.checkLightSensor();
  }
  checkLightSensor() {
    if (!this.hass?.states["sensor.liam_room_display_light_sensor"]) return;
    const lightSensor = this.hass.states["sensor.liam_room_display_light_sensor"], shouldBeInNightMode = 0 === parseInt(lightSensor.state);
    shouldBeInNightMode && !this.isInNightMode ? (this.previousBrightness = this.brightness, 
    this.enterNightMode()) : !shouldBeInNightMode && this.isInNightMode && this.exitNightMode();
  }
  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap"
        rel="stylesheet"
      />
      <div class="night-mode">
        <div class="night-time">${this.currentTime}</div>
      </div>
    `;
  }
}

customElements.define("night-mode", NightMode);

export { NightMode };
//# sourceMappingURL=NightMode.js.map
