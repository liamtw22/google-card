// src/components/weather-clock.ts

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, HassEntityState, WeatherEntityAttributes } from '../types';
import { GoogleCardConfig, WEATHER_ICONS, AQI_THRESHOLDS } from '../types/card-config';
import { sharedStyles } from '../styles/shared-styles';

@customElement('weather-clock')
export class WeatherClock extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: GoogleCardConfig;

  @state() private _date = '';
  @state() private _time = '';
  @state() private _temperature = '';
  @state() private _weatherIcon = 'not-available';
  @state() private _aqi: string | null = null;
  @state() private _error: string | null = null;

  private _timeUpdateInterval?: number;

  static styles = [
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
        margin-left: 10px;
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
        margin-top: 20px;
        margin-left: 15px;
      }

      .weather-info {
        display: flex;
        align-items: center;
        font-weight: 500;
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
        padding: 2px 15px;
        border-radius: 8px;
        font-weight: 500;
        align-self: center;
        min-width: 60px;
        text-align: center;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._updateDateTime();
    this._scheduleNextMinuteUpdate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timeUpdateInterval) {
      clearTimeout(this._timeUpdateInterval);
    }
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('hass') && this.hass) {
      this._updateWeatherData();
    }
    if (changedProperties.has('config') && this.config) {
      this.requestUpdate();
    }
  }

  private _scheduleNextMinuteUpdate(): void {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds());
    this._timeUpdateInterval = window.setTimeout(() => {
      this._updateDateTime();
      this._scheduleNextMinuteUpdate();
    }, delay);
  }

  private _updateDateTime(): void {
    const now = new Date();

    // Format date - matching original: short weekday, short month
    this._date = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // Format time - no AM/PM
    this._time = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\s?[AP]M/, '');

    this.requestUpdate();
  }

  private _updateWeatherData(): void {
    if (!this.hass) return;

    try {
      const weatherEntity = this.config.weather_entity;
      if (weatherEntity && this.hass.states[weatherEntity]) {
        const weatherState = this.hass.states[weatherEntity] as HassEntityState;
        const attrs = weatherState.attributes as WeatherEntityAttributes;

        if (attrs && attrs.temperature !== undefined) {
          this._temperature = `${Math.round(attrs.temperature)}°`;
          this._weatherIcon = WEATHER_ICONS[weatherState.state] || 'not-available';
        } else {
          this._temperature = '--°';
          this._weatherIcon = 'not-available';
        }
      } else {
        this._temperature = '--°';
        this._weatherIcon = 'not-available';
      }

      const aqiEntity = this.config.aqi_entity;
      if (aqiEntity && this.hass.states[aqiEntity]) {
        const aqiState = this.hass.states[aqiEntity];
        if (
          aqiState.state &&
          aqiState.state !== 'unknown' &&
          aqiState.state !== 'unavailable'
        ) {
          const aqiValue = parseFloat(aqiState.state);
          this._aqi = isNaN(aqiValue) ? null : aqiState.state;
        } else {
          this._aqi = null;
        }
      } else {
        this._aqi = null;
      }

      this._error = null;
      this.requestUpdate();
    } catch (error) {
      this._error = `Error: ${(error as Error).message}`;
    }
  }

  private _getAqiColor(aqi: string | null): string {
    if (!aqi) return '#999999';

    const aqiNum = parseInt(aqi);
    if (isNaN(aqiNum)) return '#999999';

    for (const threshold of AQI_THRESHOLDS) {
      if (aqiNum <= threshold.max) {
        return threshold.color;
      }
    }

    return AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1].color;
  }

  protected render(): TemplateResult {
    const hasValidAqi =
      this._aqi !== null && this.config.show_aqi !== false && !isNaN(parseFloat(this._aqi));

    return html`
      <div class="weather-component">
        <div class="top-row">
          <div class="left-column">
            ${this.config.show_date !== false
              ? html`<div class="date">${this._date}</div>`
              : nothing}
            ${this.config.show_time !== false
              ? html`<div class="time">${this._time}</div>`
              : nothing}
          </div>

          ${this.config.show_weather !== false
            ? html`
                <div class="weather-section">
                  <div class="weather-info">
                    <img
                      src="https://basmilius.github.io/weather-icons/production/fill/all/${this
                        ._weatherIcon}.svg"
                      class="weather-icon"
                      alt="Weather icon"
                      @error=${this._handleIconError}
                    />
                    <span class="temperature">${this._temperature}</span>
                  </div>
                  ${hasValidAqi
                    ? html`
                        <div class="aqi" style="background-color: ${this._getAqiColor(this._aqi)}">
                          ${this._aqi} AQI
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </div>
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </div>
    `;
  }

  private _handleIconError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src =
      'https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg';
    img.onerror = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-clock': WeatherClock;
  }
}
