// src/editor.js
import { LitElement, html, css } from 'lit-element';

import { DEFAULT_CONFIG } from './constants';

export class GoogleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      .form-container {
        padding: 16px;
      }
      
      .card {
        margin-bottom: 16px;
        background: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2));
        color: var(--primary-text-color);
        padding: 16px;
      }
      
      .card-header {
        font-family: var(--ha-card-header-font-family, inherit);
        font-size: var(--ha-card-header-font-size, 24px);
        font-weight: 400;
        color: var(--ha-card-header-color, --primary-text-color);
        padding: 4px 0 12px;
        line-height: 1.2;
      }
      
      .card-section {
        margin-bottom: 16px;
      }
      
      .section-header {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 4px;
      }
      
      .row {
        display: flex;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      
      .input-group {
        padding: 8px 0;
        box-sizing: border-box;
        flex: 1 0 200px;
        max-width: 100%;
        margin-right: 16px;
      }
      
      .input-group:last-child {
        margin-right: 0;
      }
      
      .input-group.full-width {
        flex: 1 0 100%;
        max-width: 100%;
      }
      
      .input-label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
      }
      
      .input-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      
      ha-textfield,
      ha-select,
      ha-switch {
        width: 100%;
      }
      
      ha-alert {
        display: block;
        margin: 8px 0;
      }
    `;
  }

  constructor() {
    super();
    this.config = { ...DEFAULT_CONFIG };
  }

  // The component has been first updated
  firstUpdated() {
    // Initialize any components or fetch data if needed
  }

  // Called by Home Assistant when the configuration changes
  setConfig(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Validate configuration values
  validate(key, value) {
    switch (key) {
      case 'display_time':
      case 'crossfade_time':
        return Math.max(1, parseInt(value) || DEFAULT_CONFIG[key]);
      case 'image_list_update_interval':
        return Math.max(60, parseInt(value) || DEFAULT_CONFIG[key]);
      default:
        return value;
    }
  }

  // Get entity suggestions filtered by domain
  getEntitySuggestions(domain) {
    if (!this.hass) return [];
    
    return Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith(`${domain}.`))
      .sort();
  }

  // Handle value changes
  handleValueChange(e) {
    if (!this.config || !this.hass) return;
    
    const target = e.target;
    const key = target.configValue;
    
    if (!key) return;
    
    let value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = this.validate(key, target.value);
    } else {
      value = target.value;
    }
    
    if (value === '' || value === undefined) {
      // Clear the key from config when empty
      const newConfig = { ...this.config };
      delete newConfig[key];
      this.config = newConfig;
    } else {
      this.config = { ...this.config, [key]: value };
    }
    
    // Dispatch the config-changed event
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
  }

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="form-container">
        <div class="card">
          <div class="card-header">Google Card Configuration</div>
          
          <!-- Image Source Settings -->
          <div class="card-section">
            <div class="section-header">Image Source</div>
            <div class="row">
              <div class="input-group full-width">
                <label class="input-label" for="image_url">Image URL</label>
                <ha-textfield
                  id="image_url"
                  .value=${this.config.image_url || ''}
                  .configValue=${'image_url'}
                  @change=${this.handleValueChange}
                  placeholder="https://source.unsplash.com/random/1920x1080/?nature"
                ></ha-textfield>
                <div class="input-desc">
                  Supported formats: Direct URL, Media Source (media-source://media_source/...), 
                  Unsplash API, Immich API, Picsum (https://picsum.photos/...)
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="image_fit">Image Fit</label>
                <ha-select
                  id="image_fit"
                  .value=${this.config.image_fit || 'contain'}
                  .configValue=${'image_fit'}
                  @change=${this.handleValueChange}
                >
                  <ha-list-item value="contain">Contain (Fit entire image)</ha-list-item>
                  <ha-list-item value="cover">Cover (Fill screen)</ha-list-item>
                </ha-select>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="image_order">Image Order</label>
                <ha-select
                  id="image_order"
                  .value=${this.config.image_order || 'sorted'}
                  .configValue=${'image_order'}
                  @change=${this.handleValueChange}
                >
                  <ha-list-item value="sorted">Sorted</ha-list-item>
                  <ha-list-item value="random">Random</ha-list-item>
                </ha-select>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="display_time">Display Time (seconds)</label>
                <ha-textfield
                  id="display_time"
                  type="number"
                  min="1"
                  .value=${this.config.display_time || 15}
                  .configValue=${'display_time'}
                  @change=${this.handleValueChange}
                ></ha-textfield>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="crossfade_time">Crossfade Time (seconds)</label>
                <ha-textfield
                  id="crossfade_time"
                  type="number"
                  min="0.5"
                  step="0.5"
                  .value=${this.config.crossfade_time || 3}
                  .configValue=${'crossfade_time'}
                  @change=${this.handleValueChange}
                ></ha-textfield>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="image_list_update_interval">Image List Update Interval (seconds)</label>
                <ha-textfield
                  id="image_list_update_interval"
                  type="number"
                  min="60"
                  .value=${this.config.image_list_update_interval || 3600}
                  .configValue=${'image_list_update_interval'}
                  @change=${this.handleValueChange}
                ></ha-textfield>
              </div>
            </div>
          </div>
          
          <!-- Display Settings -->
          <div class="card-section">
            <div class="section-header">Display Settings</div>
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="device_name">Device Name</label>
                <ha-textfield
                  id="device_name"
                  .value=${this.config.device_name || 'mobile_app_liam_s_room_display'}
                  .configValue=${'device_name'}
                  @change=${this.handleValueChange}
                  placeholder="mobile_app_device"
                ></ha-textfield>
                <div class="input-desc">
                  The mobile device name for brightness control
                </div>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="sensor_update_delay">Sensor Update Delay (ms)</label>
                <ha-textfield
                  id="sensor_update_delay"
                  type="number"
                  min="100"
                  step="100"
                  .value=${this.config.sensor_update_delay || 500}
                  .configValue=${'sensor_update_delay'}
                  @change=${this.handleValueChange}
                ></ha-textfield>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="light_sensor_entity">Light Sensor Entity</label>
                <ha-select
                  id="light_sensor_entity"
                  .value=${this.config.light_sensor_entity || ''}
                  .configValue=${'light_sensor_entity'}
                  @change=${this.handleValueChange}
                >
                  <ha-list-item value="">Default (sensor.liam_room_display_light_sensor)</ha-list-item>
                  ${this.getEntitySuggestions('sensor').map(
                    entityId => html`<ha-list-item value="${entityId}">${entityId}</ha-list-item>`
                  )}
                </ha-select>
                <div class="input-desc">
                  Sensor used for night mode detection
                </div>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="brightness_sensor_entity">Brightness Sensor Entity</label>
                <ha-select
                  id="brightness_sensor_entity"
                  .value=${this.config.brightness_sensor_entity || ''}
                  .configValue=${'brightness_sensor_entity'}
                  @change=${this.handleValueChange}
                >
                  <ha-list-item value="">Default (sensor.liam_room_display_brightness_sensor)</ha-list-item>
                  ${this.getEntitySuggestions('sensor').map(
                    entityId => html`<ha-list-item value="${entityId}">${entityId}</ha-list-item>`
                  )}
                </ha-select>
              </div>
            </div>
          </div>
          
          <!-- Weather Clock Settings -->
          <div class="card-section">
            <div class="section-header">Weather & Clock Settings</div>
            <div class="row">
              <div class="input-group">
                <label class="input-label">Show Date</label>
                <ha-switch
                  .checked=${this.config.show_date !== false}
                  .configValue=${'show_date'}
                  @change=${this.handleValueChange}
                ></ha-switch>
              </div>
              
              <div class="input-group">
                <label class="input-label">Show Time</label>
                <ha-switch
                  .checked=${this.config.show_time !== false}
                  .configValue=${'show_time'}
                  @change=${this.handleValueChange}
                ></ha-switch>
              </div>
              
              <div class="input-group">
                <label class="input-label">Show Weather</label>
                <ha-switch
                  .checked=${this.config.show_weather !== false}
                  .configValue=${'show_weather'}
                  @change=${this.handleValueChange}
                ></ha-switch>
              </div>
              
              <div class="input-group">
                <label class="input-label">Show AQI (when available)</label>
                <ha-switch
                  .checked=${this.config.show_aqi !== false}
                  .configValue=${'show_aqi'}
                  @change=${this.handleValueChange}
                ></ha-switch>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="weather_entity">Weather Entity</label>
                <ha-select
                  id="weather_entity"
                  .value=${this.config.weather_entity || 'weather.forecast_home'}
                  .configValue=${'weather_entity'}
                  @change=${this.handleValueChange}
                >
                  ${this.getEntitySuggestions('weather').map(
                    entityId => html`<ha-list-item value="${entityId}">${entityId}</ha-list-item>`
                  )}
                </ha-select>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="aqi_entity">AQI Entity</label>
                <ha-select
                  id="aqi_entity"
                  .value=${this.config.aqi_entity || 'sensor.air_quality_index'}
                  .configValue=${'aqi_entity'}
                  @change=${this.handleValueChange}
                >
                  <ha-list-item value="">None</ha-list-item>
                  ${this.getEntitySuggestions('sensor').map(
                    entityId => html`<ha-list-item value="${entityId}">${entityId}</ha-list-item>`
                  )}
                </ha-select>
              </div>
            </div>
          </div>
          
          <!-- Debug Settings -->
          <div class="card-section">
            <div class="section-header">Debug Settings</div>
            <div class="row">
              <div class="input-group">
                <label class="input-label">Show Debug Info</label>
                <ha-switch
                  .checked=${this.config.show_debug || false}
                  .configValue=${'show_debug'}
                  @change=${this.handleValueChange}
                ></ha-switch>
                <div class="input-desc">
                  Long press settings icon to toggle debug mode
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('google-card-editor', GoogleCardEditor);
