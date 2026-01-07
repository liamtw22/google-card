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
  @state() private _weatherIcon = 'clear-day';
  @state() private _aqi: string | null = null;
  @state() private _error: string | null = null;

  private _timeUpdateInterval?: number;

  static styles = [
    sharedStyles,
    css`
      .weather-component {
        position: absolute;
        bottom: 40px;
        left: 40px;
        z-index: 2;
        pointer-events: none;
      }

      .top-row {
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 30px;
      }

      .left-column {
        display: flex;
        flex-direction: column;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      }

      .date {
        font-size: 24px;
        color: white;
        font-weight: 400;
      }

      .time {
        font-size: 100px;
        color: white;
        font-weight: 400;
        line-height: 1;
        margin-top: -5px;
      }

      .weather-section {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .weather-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .weather-icon {
        width: 64px;
        height: 64px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      .temperature {
        font-size: 48px;
        color: white;
        font-weight: 400;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      }

      .aqi {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._updateTime();
    this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timeUpdateInterval) {
      clearInterval(this._timeUpdateInterval);
    }
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('hass') && this.hass) {
      this._updateWeather();
      this._updateAqi();
    }
  }

  private _updateTime(): void {
    const now = new Date();

    // Format date
    this._date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Format time
    this._time = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\s?(AM|PM)$/i, '');

    this.requestUpdate();
  }

  private _updateWeather(): void {
    if (!this.hass || !this.config.weather_entity) return;

    const weatherState = this.hass.states[this.config.weather_entity] as
      | HassEntityState
      | undefined;
    if (!weatherState) {
      this._error = `Weather entity not found: ${this.config.weather_entity}`;
      return;
    }

    const attrs = weatherState.attributes as WeatherEntityAttributes;
    const temp = attrs.temperature;
    const unit = attrs.temperature_unit || '°';

    if (temp !== undefined) {
      this._temperature = `${Math.round(temp)}${unit}`;
    }

    // Map weather condition to icon
    const condition = weatherState.state;
    this._weatherIcon = WEATHER_ICONS[condition] || 'clear-day';
    this._error = null;
  }

  private _updateAqi(): void {
    if (!this.hass || !this.config.aqi_entity) {
      this._aqi = null;
      return;
    }

    const aqiState = this.hass.states[this.config.aqi_entity];
    if (!aqiState) {
      this._aqi = null;
      return;
    }

    const aqiValue = parseFloat(aqiState.state);
    if (!isNaN(aqiValue)) {
      this._aqi = String(Math.round(aqiValue));
    } else {
      this._aqi = null;
    }
  }

  private _getAqiColor(aqi: string | null): string {
    if (!aqi) return 'transparent';

    const aqiNum = parseFloat(aqi);
    if (isNaN(aqiNum)) return 'transparent';

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
