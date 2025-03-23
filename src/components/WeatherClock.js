// src/components/WeatherClock.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { weatherClockStyles } from '../styles/WeatherClockStyles';
import { sharedStyles } from '../styles/SharedStyles';

export class WeatherClock extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      date: { type: String },
      time: { type: String },
      temperature: { type: String },
      weatherIcon: { type: String },
      aqi: { type: String },
      weatherEntity: { type: String },
      aqiEntity: { type: String },
      error: { type: String },
    };
  }

  static get styles() {
    return [weatherClockStyles, sharedStyles];
  }

  constructor() {
    super();
    this.resetProperties();
    this.updateTimer = null;
  }

  resetProperties() {
    this.date = '';
    this.time = '';
    this.temperature = '--°';
    this.weatherIcon = 'not-available';
    this.aqi = '--';
    this.weatherEntity = 'weather.forecast_home';  // Default weather entity
    this.aqiEntity = 'sensor.air_quality_index';   // Default AQI entity
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateWeather();
    this.scheduleNextMinuteUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
  }

  scheduleNextMinuteUpdate() {
    const now = new Date();
    // Calculate milliseconds until the start of the next minute
    const delay = (60 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds());
    
    this.updateTimer = setTimeout(() => {
      this.updateWeather();
      this.scheduleNextMinuteUpdate();
    }, delay);
  }

  updateWeather() {
    const now = new Date();
    this.updateDateTime(now);
    this.updateWeatherData();
    this.requestUpdate();
  }

  updateDateTime(now) {
    this.date = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    this.time = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\s?[AP]M/, '');
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this.updateWeatherData();
    }
  }

  /**
   * Find the first available weather entity
   * @returns {string|null} Entity ID or null if none found
   */
  findWeatherEntity() {
    if (!this.hass) return null;
    
    // Try to find configured entity
    if (this.weatherEntity && this.hass.states[this.weatherEntity]) {
      return this.weatherEntity;
    }
    
    // Try to find the "64_west_glen_ave" entity specifically
    if (this.hass.states['weather.64_west_glen_ave']) {
      this.weatherEntity = 'weather.64_west_glen_ave';
      return this.weatherEntity;
    }
    
    // Find any weather entity
    for (const entityId in this.hass.states) {
      if (entityId.startsWith('weather.')) {
        this.weatherEntity = entityId;
        return entityId;
      }
    }
    
    return null;
  }

  /**
   * Find the first available AQI entity
   * @returns {string|null} Entity ID or null if none found
   */
  findAqiEntity() {
    if (!this.hass) return null;
    
    // Try to find configured entity
    if (this.aqiEntity && this.hass.states[this.aqiEntity]) {
      return this.aqiEntity;
    }
    
    // Try to find the "ridgewood_air_quality_index" entity specifically
    if (this.hass.states['sensor.ridgewood_air_quality_index']) {
      this.aqiEntity = 'sensor.ridgewood_air_quality_index';
      return this.aqiEntity;
    }
    
    // Find any AQI-related entity
    const possibleNames = [
      'air_quality_index',
      'aqi',
      'pm25',
      'pm2_5',
      'air_quality'
    ];
    
    for (const entityId in this.hass.states) {
      if (entityId.startsWith('sensor.')) {
        const name = entityId.replace('sensor.', '').toLowerCase();
        if (possibleNames.some(term => name.includes(term))) {
          this.aqiEntity = entityId;
          return entityId;
        }
      }
    }
    
    return null;
  }

  updateWeatherData() {
    if (!this.hass) return;

    try {
      const weatherEntityId = this.findWeatherEntity();
      const aqiEntityId = this.findAqiEntity();
      
      // Update temperature and weather state
      if (weatherEntityId) {
        const weatherEntity = this.hass.states[weatherEntityId];
        if (weatherEntity && weatherEntity.attributes && typeof weatherEntity.attributes.temperature !== 'undefined') {
          this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`;
          this.weatherIcon = this.getWeatherIcon(weatherEntity.state);
        } else {
          this.temperature = '--°';
          this.weatherIcon = 'not-available';
        }
      } else {
        this.temperature = '--°';
        this.weatherIcon = 'not-available';
      }
      
      // Update AQI
      if (aqiEntityId) {
        const aqiEntity = this.hass.states[aqiEntityId];
        if (aqiEntity && aqiEntity.state && aqiEntity.state !== 'unknown' && aqiEntity.state !== 'unavailable') {
          this.aqi = aqiEntity.state;
        } else {
          this.aqi = '--';
        }
      } else {
        this.aqi = '--';
      }
      
      this.error = null;
    } catch (error) {
      console.error('Error updating weather data:', error);
      this.error = `Error: ${error.message}`;
    }
    
    this.requestUpdate();
  }

  getWeatherIcon(state) {
    // Comprehensive weather icon mapping
    const iconMapping = {
      'clear-night': 'clear-night',
      'cloudy': 'cloudy',
      'fog': 'fog',
      'hail': 'hail',
      'lightning': 'thunderstorms',
      'lightning-rainy': 'thunderstorms-rain',
      'partlycloudy': 'partly-cloudy-day',
      'pouring': 'rain',
      'rainy': 'drizzle',
      'snowy': 'snow',
      'snowy-rainy': 'sleet',
      'sunny': 'clear-day',
      'windy': 'wind',
      'windy-variant': 'wind',
      'exceptional': 'not-available',
      // Add fallbacks for other possible weather states
      'overcast': 'overcast-day',
      'partly-cloudy': 'partly-cloudy-day',
      'partly-cloudy-night': 'partly-cloudy-night',
      'clear': 'clear-day',
      'thunderstorm': 'thunderstorms',
      'storm': 'thunderstorms',
      'rain': 'rain',
      'snow': 'snow',
      'mist': 'fog',
      'dust': 'dust',
      'smoke': 'smoke',
      'drizzle': 'drizzle',
      'light-rain': 'drizzle'
    };
    
    // Return the mapped icon or a fallback
    return iconMapping[state] || 'not-available';
  }

  getAqiColor(aqi) {
    const aqiNum = parseInt(aqi);
    
    // Handle non-numeric AQI
    if (isNaN(aqiNum)) return '#999999';
    
    // Standard EPA AQI color scale
    if (aqiNum <= 50) return '#68a03a';     // Good - Green
    if (aqiNum <= 100) return '#f9bf33';    // Moderate - Yellow
    if (aqiNum <= 150) return '#f47c06';    // Unhealthy for Sensitive Groups - Orange
    if (aqiNum <= 200) return '#c43828';    // Unhealthy - Red
    if (aqiNum <= 300) return '#ab1457';    // Very Unhealthy - Purple
    return '#83104c';                       // Hazardous - Maroon
  }

  render() {
    const hasValidAqi = this.aqi && this.aqi !== '--';
    
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div class="weather-component">
        <div class="left-column">
          <div class="date">${this.date}</div>
          <div class="time">${this.time}</div>
        </div>
        <div class="right-column">
          <div class="weather-info">
            <img
              src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
              class="weather-icon"
              alt="Weather icon"
              onerror="this.src='https://basmilius.github.io/weather-icons/production/fill/all/not-available.svg'"
            />
            <span class="temperature">${this.temperature}</span>
          </div>
          ${hasValidAqi ? html`
            <div class="aqi" style="background-color: ${this.getAqiColor(this.aqi)}">
              ${this.aqi} AQI
            </div>
          ` : ''}
        </div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('weather-clock', WeatherClock);
