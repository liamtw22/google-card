import { LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { weatherClockStyles } from "../styles/WeatherClockStyles.js";

import { sharedStyles } from "../styles/SharedStyles.js";

class WeatherClock extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      date: {
        type: String
      },
      time: {
        type: String
      },
      temperature: {
        type: String
      },
      weatherIcon: {
        type: String
      },
      aqi: {
        type: String
      }
    };
  }
  static get styles() {
    return [ weatherClockStyles, sharedStyles ];
  }
  constructor() {
    super(), this.resetProperties(), this.updateTimer = null;
  }
  resetProperties() {
    this.date = "", this.time = "", this.temperature = "", this.weatherIcon = "", this.aqi = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.updateWeather(), this.scheduleUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.updateTimer && clearTimeout(this.updateTimer);
  }
  scheduleUpdate() {
    const now = new Date, delay = 1e3 * (60 - now.getSeconds()) - now.getMilliseconds();
    this.updateTimer = setTimeout((() => {
      this.updateWeather(), this.scheduleUpdate();
    }), delay);
  }
  updateWeather() {
    const now = new Date;
    this.updateDateTime(now), this.updateWeatherData(), this.requestUpdate();
  }
  updateDateTime(now) {
    this.date = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }), this.time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  updateWeatherData() {
    if (!this.hass) return;
    const weatherEntity = this.hass.states["weather.64_west_glen_ave"], aqiEntity = this.hass.states["sensor.ridgewood_air_quality_index"];
    weatherEntity && (this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`, 
    this.weatherIcon = this.getWeatherIcon(weatherEntity.state)), aqiEntity && (this.aqi = aqiEntity.state);
  }
  getWeatherIcon(state) {
    return {
      "clear-night": "clear-night",
      cloudy: "cloudy-fill",
      fog: "fog",
      hail: "hail",
      lightning: "thunderstorms",
      "lightning-rainy": "thunderstorms-rain",
      partlycloudy: "partly-cloudy-day",
      pouring: "rain",
      rainy: "drizzle",
      snowy: "snow",
      "snowy-rainy": "sleet",
      sunny: "clear-day",
      windy: "wind",
      "windy-variant": "wind",
      exceptional: "not-available"
    }[state] || "not-available-fill";
  }
  getAqiColor(aqi) {
    return aqi <= 50 ? "#68a03a" : aqi <= 100 ? "#f9bf33" : aqi <= 150 ? "#f47c06" : aqi <= 200 ? "#c43828" : aqi <= 300 ? "#ab1457" : "#83104c";
  }
  render() {
    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
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
            />
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

export { WeatherClock };
//# sourceMappingURL=WeatherClock.js.map
