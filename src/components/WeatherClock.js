// src/components/WeatherClock.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { LitElement, html } from "lit-element";
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
      aqi: { type: String }
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
    this.temperature = '';
    this.weatherIcon = '';
    this.aqi = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateWeather();
    this.scheduleUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
  }

  scheduleUpdate() {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    this.updateTimer = setTimeout(() => {
      this.updateWeather();
      this.scheduleUpdate();
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
      day: 'numeric' 
    });
    
    this.time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).replace(/\s?[AP]M/, '');
  }

  updateWeatherData() {
    if (!this.hass) return;

    const weatherEntity = this.hass.states['weather.64_west_glen_ave'];
    const aqiEntity = this.hass.states['sensor.ridgewood_air_quality_index'];

    if (weatherEntity) {
      this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`;
      this.weatherIcon = this.getWeatherIcon(weatherEntity.state);
    }

    if (aqiEntity) {
      this.aqi = aqiEntity.state;
    }
  }

  getWeatherIcon(state) {
    const iconMapping = {
      'clear-night': 'clear-night',
      'cloudy': 'cloudy-fill',
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
      'exceptional': 'not-available'
    };
    return iconMapping[state] || 'not-available-fill';
  }

  getAqiColor(aqi) {
    if (aqi <= 50) return '#68a03a';
    if (aqi <= 100) return '#f9bf33';
    if (aqi <= 150) return '#f47c06';
    if (aqi <= 200) return '#c43828';
    if (aqi <= 300) return '#ab1457';
    return '#83104c';
  }

  render() {
    return html`
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet">
      <div class="weather-component">
        <div class="left-column">
          <div class="date">${this.date}</div>
          <div class="time">${this.time}</div>
        </div>
        <div class="right-column">
          <div class="weather-info">
            <img src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg" 
                 class="weather-icon" 
                 alt="Weather icon">
            <span class="temperature">${this.temperature}</span>
          </div>
          <div class="aqi" style="background-color: ${this.getAqiColor(parseInt(this.aqi))}">
            ${this.aqi} AQI
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("weather-clock", WeatherClock);
