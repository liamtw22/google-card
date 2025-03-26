// src/editor.js
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import { DEFAULT_CONFIG } from './constants';

// Define fireEvent function directly to avoid dependency issues
const fireEvent = (node, type, detail = {}, options = {}) => {
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });

  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

export class GoogleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  constructor() {
    super();
    this._config = { ...DEFAULT_CONFIG };
  }

  // Called by Home Assistant when the configuration changes
  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
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

  // Handle value changes for all input types
  valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    
    const target = ev.target;
    const key = target.configValue;
    
    if (!key) return;
    
    let value;
    if (target.type === 'checkbox' || target.tagName === 'HA-SWITCH') {
      value = target.checked;
    } else if (target.type === 'number' || 
              key === 'display_time' || 
              key === 'crossfade_time' ||
              key === 'image_list_update_interval' ||
              key === 'sensor_update_delay') {
      value = this.validate(key, target.value);
    } else {
      value = target.value;
    }
    
    if (value === '' || value === undefined) {
      // Clear the key from config when empty
      const newConfig = { ...this._config };
      delete newConfig[key];
      this._config = newConfig;
    } else {
      this._config = { ...this._config, [key]: value };
    }
    
    // Dispatch the config-changed event
    fireEvent(this, 'config-changed', { config: this._config });
  }

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    // Destructure config with defaults for proper initialization
    const {
      image_url = '',
      display_time = 15,
      crossfade_time = 3,
      image_fit = 'contain',
      image_list_update_interval = 3600,
      image_order = 'sorted',
      show_debug = false,
      sensor_update_delay = DEFAULT_CONFIG.sensor_update_delay || 500,
      device_name = 'mobile_app_liam_s_room_display',
      show_date = true,
      show_time = true,
      show_weather = true,
      show_aqi = true,
      weather_entity = 'weather.forecast_home',
      aqi_entity = 'sensor.ridgewood_air_quality_index',
      light_sensor_entity = 'sensor.liam_room_display_light_sensor',
      brightness_sensor_entity = 'sensor.liam_room_display_brightness_sensor',
    } = this._config;

    return html`
      <div class="form-container">
        <div class="card">
          <div class="card-header">Google Card Configuration</div>
          
          <!-- Image Source Settings -->
          <div class="card-section">
            <div class="section-header">Image Source</div>
            <div class="row">
              <div class="input-group full-width">
                <label class="input-label" for="image_url">Image URL (required)</label>
                <ha-textfield
                  id="image_url"
                  .value=${image_url}
                  .configValue=${'image_url'}
                  @input=${this.valueChanged}
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
                  .value=${image_fit}
                  .configValue=${'image_fit'}
                  @selected=${this.valueChanged}
                >
                  <ha-list-item value="contain">Contain (Fit entire image)</ha-list-item>
                  <ha-list-item value="cover">Cover (Fill screen)</ha-list-item>
                </ha-select>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="image_order">Image Order</label>
                <ha-select
                  id="image_order"
                  .value=${image_order}
                  .configValue=${'image_order'}
                  @selected=${this.valueChanged}
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
                  .value=${display_time}
                  .configValue=${'display_time'}
                  @input=${this.valueChanged}
                ></ha-textfield>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="crossfade_time">Crossfade Time (seconds)</label>
                <ha-textfield
                  id="crossfade_time"
                  type="number"
                  min="0.5"
                  step="0.5"
                  .value=${crossfade_time}
                  .configValue=${'crossfade_time'}
                  @input=${this.valueChanged}
                ></ha-textfield>
              </div>
              
              <div class="input-group">
                <label class="input-label" for="image_list_update_interval">Update Interval (seconds)</label>
                <ha-textfield
                  id="image_list_update_interval"
                  type="number"
                  min="60"
                  .value=${image_list_update_interval}
                  .configValue=${'image_list_update_interval'}
                  @input=${this.valueChanged}
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
                  .value=${device_name}
                  .configValue=${'device_name'}
                  @input=${this.valueChanged}
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
                  .value=${sensor_update_delay}
                  .configValue=${'sensor_update_delay'}
                  @input=${this.valueChanged}
                ></ha-textfield>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="light_sensor_entity">Light Sensor Entity</label>
                <ha-select
                  id="light_sensor_entity"
                  .value=${light_sensor_entity}
                  .configValue=${'light_sensor_entity'}
                  @selected=${this.valueChanged}
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
                  .value=${brightness_sensor_entity}
                  .configValue=${'brightness_sensor_entity'}
                  @selected=${this.valueChanged}
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
              <div class="switch-group">
                <ha-formfield label="Show Date">
                  <ha-switch
                    .checked=${show_date}
                    .configValue=${'show_date'}
                    @change=${this.valueChanged}
                  ></ha-switch>
                </ha-formfield>
              </div>
              
              <div class="switch-group">
                <ha-formfield label="Show Time">
                  <ha-switch
                    .checked=${show_time}
                    .configValue=${'show_time'}
                    @change=${this.valueChanged}
                  ></ha-switch>
                </ha-formfield>
              </div>
              
              <div class="switch-group">
                <ha-formfield label="Show Weather">
                  <ha-switch
                    .checked=${show_weather}
                    .configValue=${'show_weather'}
                    @change=${this.valueChanged}
                  ></ha-switch>
                </ha-formfield>
              </div>
              
              <div class="switch-group">
                <ha-formfield label="Show AQI">
                  <ha-switch
                    .checked=${show_aqi}
                    .configValue=${'show_aqi'}
                    @change=${this.valueChanged}
                  ></ha-switch>
                </ha-formfield>
              </div>
            </div>
            
            <div class="row">
              <div class="input-group">
                <label class="input-label" for="weather_entity">Weather Entity</label>
                <ha-select
                  id="weather_entity"
                  .value=${weather_entity}
                  .configValue=${'weather_entity'}
                  @selected=${this.valueChanged}
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
                  .value=${aqi_entity}
                  .configValue=${'aqi_entity'}
                  @selected=${this.valueChanged}
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
              <div class="switch-group">
                <ha-formfield label="Show Debug Info">
                  <ha-switch
                    .checked=${show_debug}
                    .configValue=${'show_debug'}
                    @change=${this.valueChanged}
                  ></ha-switch>
                </ha-formfield>
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

  static get styles() {
    return css`
      .form-container {
        padding: 16px;
      }
      
      .card {
        margin-bottom: 16px;
        background: var(--card-background-color, var(--ha-card-background));
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
      
      .switch-group {
        padding: 8px 16px 8px 0;
        box-sizing: border-box;
      }
      
      ha-textfield,
      ha-select {
        width: 100%;
      }
      
      ha-formfield {
        display: flex;
        align-items: center;
      }
      
      ha-switch {
        --mdc-theme-secondary: var(--switch-checked-color, var(--primary-color));
      }
    `;
  }
}

customElements.define('google-card-editor', GoogleCardEditor);
