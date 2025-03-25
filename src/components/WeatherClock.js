// src/components/WeatherClock.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { sharedStyles } from '../styles/SharedStyles';

export class WeatherClock extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
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
    return [
      sharedStyles,
      css`
        .weather-component {
          position: fixed;
          bottom: 30px;
          left: 40px;
          display: flex;
          justify-content: start;
          align-items: center;
          color: white;
          font-family: 'Product Sans Regular', sans-serif;
          width: 100%;
          max-width: 400px;
        }

        .left-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-left: 10px; /* Reduced from auto to bring closer */
          margin-right: 20px; /* Reduced from 40px */
        }

        .date {
          font-size: 25px;
          margin-bottom: 5px;
          font-weight: 400;
          margin-left: 10px; /* Added left padding */
          text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
        }

        .time {
          font-size: 90px;
          line-height: 1;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .weather-info {
          display: flex;
          align-items: center;
          margin-top: 10px; /* Reduced from 10px */
          font-weight: 500;
          margin-right: 20px; /* Reduced from 40px */
        }

        .weather-icon {
          width: 50px;
          height: 50px;
        }

        .temperature {
          font-size: 35px;
          font-weight: 500;
          text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
          padding-top: 2px;
        }

        .aqi {
          font-size: 20px;
          padding: 7px 15px 5px 15px;
          border-radius: 6px;
          font-weight: 500;
          margin-left: 30px;
          align-self: flex-end;
          min-width: 60px;
          text-align: center;
        }
      `
    ];
  }

  constructor() {
    super();
    this.date = '';
    this.time = '';
    this.temperature = '--°';
    this.weatherIcon = 'not-available';
    this.aqi = null; // Set to null initially
    this.weatherEntity = '';
    this.aqiEntity = '';
    this.error = null;
    this.updateTimer = null;
    this.aqiPollInterval = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateWeather();
    this.scheduleNextMinuteUpdate();
    
    // Add AQI polling every 15 seconds
    this.aqiPollInterval = setInterval(() => {
      this.updateAqiData();
    }, 15000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    if (this.aqiPollInterval) {
      clearInterval(this.aqiPollInterval);
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
    this.updateAqiData();
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
      this.updateAqiData();
    }
    
    if (changedProperties.has('config') && this.config) {
      this.weatherEntity = this.config.weather_entity || 'weather.forecast_home';
      this.aqiEntity = this.config.aqi_entity || 'sensor.air_quality_index';
      this.requestUpdate();
    }
  }

  updateWeatherData() {
    if (!this.hass) return;

    try {
      // Update temperature and weather state
      if (this.weatherEntity && this.hass.states[this.weatherEntity]) {
        const weatherEntity = this.hass.states[this.weatherEntity];
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
      
      this.error = null;
    } catch (error) {
      console.error('Error updating weather data:', error);
      this.error = `Error: ${error.message}`;
    }
  }

  updateAqiData() {
    if (!this.hass || !this.config) return;
    
    try {
      // Check if AQI should be shown based on config
      if (this.config.show_aqi === false) {
        this.aqi = null;
        return;
      }
      
      // Get AQI entity
      const aqiEntityId = this.aqiEntity || this.config.aqi_entity || 'sensor.air_quality_index';
      const aqiEntity = this.hass.states[aqiEntityId];
      
      if (!aqiEntity) {
        this.aqi = null;
        return;
      }
      
      // Check if the entity state is a valid number
      const aqiValue = parseFloat(aqiEntity.state);
      
      if (!isNaN(aqiValue)) {
        // Valid numeric AQI value found
        this.aqi = aqiEntity.state;
      } else if (aqiEntity.state === 'unavailable' || aqiEntity.state === 'unknown') {
        // Explicitly set to null when unavailable
        this.aqi = null;
      } else {
        // Any other non-numeric states
        this.aqi = null;
      }
      
      this.requestUpdate();
    } catch (error) {
      console.error('Error updating AQI data:', error);
      this.aqi = null;
    }
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
    // Simplified AQI visibility check
    const showAqi = this.config?.show_aqi !== false && this.aqi !== null;
    
    return html`
      <div class="weather-component">
        <div class="left-column">
          ${this.config?.show_date !== false ? html`<div class="date">${this.date}</div>` : ''}
          ${this.config?.show_time !== false ? html`<div class="time">${this.time}</div>` : ''}
        </div>
        <div class="right-column">
          ${this.config?.show_weather !== false ? html`
            <div class="weather-info">
              <img
                src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
                class="weather-icon"
                alt="Weather icon"
                onerror="this.src='https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg'; if(this.src.includes('not-available')) this.onerror=null;"
              />
              <span class="temperature">${this.temperature}</span>
            </div>
          ` : ''}
          ${showAqi ? html`
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
