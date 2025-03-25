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
          flex-direction: column;
          align-items: flex-start;
          color: white;
          font-family: 'Product Sans Regular', sans-serif;
          width: 100%;
          max-width: 400px;
        }

        .top-row {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }

        .left-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
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

        .weather-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 5px;
          margin-left: 15px;
        }

        .weather-info {
          display: flex;
          align-items: center;
          font-weight: 500;
          margin-right: 0px;
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
          margin-top: 5px;
          align-self: center;
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
    this.aqi = null;
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
      if (this.hass && this.aqiEntity && this.hass.states[this.aqiEntity]) {
        const aqiEntity = this.hass.states[this.aqiEntity];
        if (aqiEntity.state !== 'unknown' && aqiEntity.state !== 'unavailable') {
          // Only update if it's a valid numeric value
          const aqiValue = parseFloat(aqiEntity.state);
          if (!isNaN(aqiValue)) {
            console.log('AQI poll detected numeric change:', aqiValue);
            this.aqi = aqiEntity.state;
            this.requestUpdate();
          }
        }
      }
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
      
      // Check if AQI entity has changed
      if (this.aqiEntity && this.hass.states[this.aqiEntity]) {
        const oldState = changedProperties.get('hass')?.states?.[this.aqiEntity]?.state;
        const newState = this.hass.states[this.aqiEntity].state;
        
        if (oldState !== newState) {
          // Only update if it's a valid numeric value
          const aqiValue = parseFloat(newState);
          if (!isNaN(aqiValue)) {
            console.log('AQI state changed from', oldState, 'to', newState);
            this.requestUpdate(); // Force update when AQI changes
          }
        }
      }
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
      
      // Improved AQI detection - only accept numeric values
      if (this.aqiEntity && this.hass.states[this.aqiEntity]) {
        const aqiEntity = this.hass.states[this.aqiEntity];
        console.log('AQI Entity state:', aqiEntity.state, 'Entity:', this.aqiEntity);
        
        if (aqiEntity.state && 
            aqiEntity.state !== 'unknown' && 
            aqiEntity.state !== 'unavailable') {
          
          // Only accept valid numeric values
          const aqiValue = parseFloat(aqiEntity.state);
          if (!isNaN(aqiValue)) {
            // Valid numeric value
            this.aqi = aqiEntity.state;
            console.log('Valid numeric AQI value detected:', this.aqi);
          } else {
            // Non-numeric - don't display
            this.aqi = null;
            console.log('Non-numeric AQI value detected, not displaying');
          }
        } else {
          this.aqi = null;
          console.log('Invalid AQI state, not displaying');
        }
      } else {
        this.aqi = null;
        console.log('AQI entity not found, not displaying');
      }
      
      this.error = null;
      this.requestUpdate(); // Force update after AQI changes
    } catch (error) {
      console.error('Error updating weather data:', error);
      this.error = `Error: ${error.message}`;
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
    // Only show AQI if we have a valid numeric value and config allows it
    const hasValidAqi = this.aqi !== null && 
                        this.config.show_aqi !== false && 
                        !isNaN(parseFloat(this.aqi));
    
    if (hasValidAqi) {
      console.log('Rendering AQI indicator with numeric value:', this.aqi);
    } else {
      console.log('Not showing AQI indicator, value:', this.aqi, 'show_aqi config:', this.config.show_aqi);
    }
    
    return html`
      <div class="weather-component">
        <div class="top-row">
          <div class="left-column">
            ${this.config.show_date !== false ? html`<div class="date">${this.date}</div>` : ''}
            ${this.config.show_time !== false ? html`<div class="time">${this.time}</div>` : ''}
          </div>
          
          ${this.config.show_weather !== false ? html`
            <div class="weather-section">
              <div class="weather-info">
                <img
                  src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
                  class="weather-icon"
                  alt="Weather icon"
                  onerror="this.src='https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg'; if(this.src.includes('not-available')) this.onerror=null;"
                />
                <span class="temperature">${this.temperature}</span>
              </div>
              ${hasValidAqi ? html`
                <div class="aqi" style="background-color: ${this.getAqiColor(this.aqi)}">
                  ${this.aqi} AQI
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('weather-clock', WeatherClock);
