// src/components/WeatherDisplay.js
import { LitElement, html } from 'lit-element';
import { weatherStyles } from '../styles/weather.js';
import {
  ENTITIES,
  WEATHER_ICONS,
  AQI_COLORS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
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
    };
  }

  constructor() {
    super();
    this.initializeProperties();
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
    return weatherStyles;
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
    // Initial update
    this.updateWeather();
    this.updateDateTime();

    // Set up regular updates
    this.updateTimer = setInterval(() => {
      this.updateDateTime();
      // Update weather data every minute
      const now = Date.now();
      if (now - this.lastUpdate >= 60000) {
        this.updateWeather();
      }
    }, 1000); // Update every second for time
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
    // Update date
    this.date = now.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
    // Update time
    this.time = now.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, ''); // Remove AM/PM
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
    // Update temperature
    const temp = weatherEntity.attributes.temperature;
    this.temperature = `${Math.round(temp)}°`;
    // Update weather state and icon
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
    if (isNaN(aqiValue)) {
      return AQI_COLORS.HAZARDOUS.color;
    }
    if (aqiValue <= AQI_COLORS.GOOD.max) {
      return AQI_COLORS.GOOD.color;
    } else if (aqiValue <= AQI_COLORS.MODERATE.max) {
      return AQI_COLORS.MODERATE.color;
    } else if (aqiValue <= AQI_COLORS.UNHEALTHY_SENSITIVE.max) {
      return AQI_COLORS.UNHEALTHY_SENSITIVE.color;
    } else if (aqiValue <= AQI_COLORS.UNHEALTHY.max) {
      return AQI_COLORS.UNHEALTHY.color;
    } else if (aqiValue <= AQI_COLORS.VERY_UNHEALTHY.max) {
      return AQI_COLORS.VERY_UNHEALTHY.color;
    } else {
      return AQI_COLORS.HAZARDOUS.color;
    }
  }

  getAqiDescription(aqi) {
    const aqiValue = parseInt(aqi);
    if (isNaN(aqiValue)) return 'Unknown';
    if (aqiValue <= AQI_COLORS.GOOD.max) {
      return 'Good';
    } else if (aqiValue <= AQI_COLORS.MODERATE.max) {
      return 'Moderate';
    } else if (aqiValue <= AQI_COLORS.UNHEALTHY_SENSITIVE.max) {
      return 'Unhealthy for Sensitive Groups';
    } else if (aqiValue <= AQI_COLORS.UNHEALTHY.max) {
      return 'Unhealthy';
    } else if (aqiValue <= AQI_COLORS.VERY_UNHEALTHY.max) {
      return 'Very Unhealthy';
    } else {
      return 'Hazardous';
    }
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
          src="https://basmilius.github.io/weather-icons/production/fill/all/${this
            .weatherIcon}.svg"
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
      <div class="aqi" style="background-color: ${aqiColor}" title="${aqiDescription}">
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
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div class="weather-component">
        ${this.renderDateTime()}
        <div class="right-column">${this.renderWeatherInfo()} ${this.renderAQI()}</div>
        ${this.renderError()}
      </div>
    `;
  }

  forceUpdate() {
    this.updateWeather();
    this.updateDateTime();
  }

  updateTime() {
    this.updateDateTime();
  }

  refreshWeather() {
    this.updateWeather();
  }
}

customElements.define('weather-display', WeatherDisplay);
