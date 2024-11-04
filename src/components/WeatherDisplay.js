// src/components/WeatherDisplay.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { sharedStyles } from '../styles/shared.js';
import {
  UI,
  AQI_COLORS,
  WEATHER_ICONS,
  ENTITIES,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS
} from '../constants.js';

export class WeatherDisplay extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      date: { type: String },
      time: { type: String },
      temperature: { type: String },
      weatherIcon: { type: String },
      weatherState: { type: String },
      aqi: { type: String },
      lastUpdate: { type: Number },
      error: { type: String },
      updateTimer: { type: Object }
    };
  }

  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }

  bindMethods() {
    this.updateWeather = this.updateWeather.bind(this);
    this.updateDateTime = this.updateDateTime.bind(this);
    this.handleWeatherIconError = this.handleWeatherIconError.bind(this);
  }

  initializeProperties() {
    this.date = '';
    this.time = '';
    this.temperature = '';
    this.weatherIcon = WEATHER_ICONS.default;
    this.weatherState = '';
    this.aqi = '';
    this.lastUpdate = 0;
    this.error = null;
    this.updateTimer = null;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        font-family: 'Product Sans Regular', 'Rubik', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .weather-component {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        width: 100%;
        max-width: 400px;
        padding: 10px;
        box-sizing: border-box;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .left-column {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: hidden;
      }

      .date {
        font-size: 25px;
        margin-bottom: 5px;
        font-weight: 400;
        margin-left: 10px;
        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: font-size 0.3s ease;
      }

      .time {
        font-size: 90px;
        line-height: 1;
        font-weight: 500;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        margin-left: 8px;
        transition: font-size 0.3s ease;
      }

      .right-column {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 120px;
      }

      .weather-info {
        display: flex;
        align-items: center;
        margin-top: 10px;
        font-weight: 500;
        margin-right: -5px;
        transition: all 0.3s ease;
      }

      .weather-icon {
        width: 50px;
        height: 50px;
        margin-right: 8px;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
        transition: all 0.3s ease;
      }

      .temperature {
        font-size: 35px;
        font-weight: 500;
        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
        transition: font-size 0.3s ease;
      }

      .aqi {
        font-size: 20px;
        padding: 7px 10px 5px;
        border-radius: 8px;
        font-weight: 500;
        margin-top: 2px;
        margin-left: 25px;
        align-self: flex-end;
        min-width: 70px;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .error-message {
        background-color: rgba(255, 59, 48, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        margin-top: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      @media (max-width: 480px) {
        .date {
          font-size: 20px;
          margin-left: 8px;
        }

        .time {
          font-size: 70px;
          margin-left: 6px;
        }

        .weather-icon {
          width: 40px;
          height: 40px;
        }

        .temperature {
          font-size: 28px;
        }

        .aqi {
          font-size: 16px;
          padding: 5px 8px 4px;
          margin-left: 15px;
          min-width: 60px;
        }
      }

      @media (max-width: 360px) {
        .date {
          font-size: 18px;
        }

        .time {
          font-size: 60px;
        }

        .weather-icon {
          width: 35px;
          height: 35px;
        }

        .temperature {
          font-size: 24px;
        }

        .aqi {
          font-size: 14px;
          min-width: 50px;
        }
      }

      @media (prefers-contrast: more) {
        .weather-component {
          text-shadow: none;
        }

        .aqi {
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .date,
        .time,
        .weather-info,
        .weather-icon,
        .temperature,
        .aqi {
          transition: none;
        }
      }

      @media print {
        .weather-component {
          color: black;
          text-shadow: none;
        }

        .aqi {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }

      @media (prefers-color-scheme: dark) {
        .error-message {
          background-color: rgba(255, 59, 48, 0.7);
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startUpdates();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopUpdates();
  }

  startUpdates() {
    this.updateWeather();
    this.updateDateTime();

    this.updateTimer = setInterval(() => {
      this.updateDateTime();
      const now = Date.now();
      if (now - this.lastUpdate >= 60000) { // Update weather every minute
        this.updateWeather();
      }
    }, 1000); // Update time every second
  }

  stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this.updateWeather();
    }
  }

  updateDateTime() {
    const now = new Date();
    this.date = now.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
    this.time = now.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, '');
    this.requestUpdate();
  }

  updateWeather() {
    if (!this.hass) {
      this.error = 'Home Assistant not available';
      return;
    }

    try {
      this.updateWeatherData();
      this.updateAQIData();
      this.lastUpdate = Date.now();
      this.error = null;
    } catch (error) {
      console.error('Error updating weather data:', error);
      this.error = 'Error updating weather data';
    }
    
    this.requestUpdate();
  }

  updateWeatherData() {
    const weatherEntity = this.hass.states[ENTITIES.WEATHER];
    if (!weatherEntity) {
      throw new Error('Weather entity not available');
    }

    const temp = weatherEntity.attributes.temperature;
    this.temperature = `${Math.round(temp)}°`;
    this.weatherState = weatherEntity.state;
    this.weatherIcon = this.getWeatherIcon(weatherEntity.state);
  }

  updateAQIData() {
    const aqiEntity = this.hass.states[ENTITIES.AQI];
    if (!aqiEntity) {
      throw new Error('AQI entity not available');
    }
    this.aqi = aqiEntity.state;
  }

  getWeatherIcon(state) {
    return WEATHER_ICONS[state] || WEATHER_ICONS.default;
  }

  getAqiColor(aqi) {
    const aqiValue = parseInt(aqi);
    if (isNaN(aqiValue)) return AQI_COLORS.HAZARDOUS.color;
    
    for (const [level, data] of Object.entries(AQI_COLORS)) {
      if (!data.max || aqiValue <= data.max) {
        return data.color;
      }
    }
    
    return AQI_COLORS.HAZARDOUS.color;
  }

  getAqiDescription(aqi) {
    const aqiValue = parseInt(aqi);
    if (isNaN(aqiValue)) return 'Unknown';
    
    if (aqiValue <= AQI_COLORS.GOOD.max) return 'Good';
    if (aqiValue <= AQI_COLORS.MODERATE.max) return 'Moderate';
    if (aqiValue <= AQI_COLORS.UNHEALTHY_SENSITIVE.max) return 'Unhealthy for Sensitive Groups';
    if (aqiValue <= AQI_COLORS.UNHEALTHY.max) return 'Unhealthy';
    if (aqiValue <= AQI_COLORS.VERY_UNHEALTHY.max) return 'Very Unhealthy';
    return 'Hazardous';
  }

  handleWeatherIconError(e) {
    console.error('Error loading weather icon');
    e.target.src = `https://basmilius.github.io/weather-icons/production/fill/all/${WEATHER_ICONS.default}.svg`;
  }

  renderDateTime() {
    return html`
      <div class="left-column">
        <div class="date">${this.date}</div>
        <div class="time">${this.time}</div>
      </div>
    `;
  }

  renderWeatherInfo() {
    return html`
      <div class="weather-info">
        <img
          src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
          class="weather-icon"
          alt="Weather icon for ${this.weatherState}"
          @error=${this.handleWeatherIconError}
        />
        <span class="temperature">${this.temperature}</span>
      </div>
    `;
  }

  renderAQI() {
    if (!this.aqi) return null;
    
    const aqiColor = this.getAqiColor(this.aqi);
    const aqiDescription = this.getAqiDescription(this.aqi);
    
    return html`
      <div class="aqi" 
           style="background-color: ${aqiColor}" 
           title="${aqiDescription}">
        ${this.aqi} AQI
      </div>
    `;
  }

  renderError() {
    if (!this.error) return null;
    return html`<div class="error-message">${this.error}</div>`;
  }

  render() {
    return html`
      <div class="weather-component">
        ${this.renderDateTime()}
        <div class="right-column">
          ${this.renderWeatherInfo()}
          ${this.renderAQI()}
        </div>
        ${this.renderError()}
      </div>
    `;
  }

  // Public methods for external control
  forceUpdate() {
    this.updateWeather();
    this.updateDateTime();
  }

  refreshWeather() {
    this.updateWeather();
  }

  updateTime() {
    this.updateDateTime();
  }
}

customElements.define('weather-display', WeatherDisplay);
