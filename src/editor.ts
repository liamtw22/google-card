// src/editor.ts

import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { 
  HomeAssistant, 
  LovelaceCardEditor, 
  FormSchema, 
  ConfigFormReturn 
} from './types';
import { GoogleCardConfig } from './types/card-config';
import { DEFAULT_CONFIG } from './constants';
import { editorStyles } from './styles/shared-styles';

/**
 * Fire a custom event
 */
const fireEvent = (
  node: HTMLElement,
  type: string,
  detail: Record<string, unknown> = {},
  options: { bubbles?: boolean; cancelable?: boolean; composed?: boolean } = {}
): Event => {
  const event = new CustomEvent(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? false,
    composed: options.composed ?? true,
    detail,
  });
  node.dispatchEvent(event);
  return event;
};

/**
 * Form schema for the built-in Home Assistant form editor
 * This follows Home Assistant best practices for card configuration
 */
export function getConfigForm(): ConfigFormReturn {
  return {
    schema: [
      // Image Source Section
      {
        type: 'expandable',
        name: 'image_settings',
        title: 'Image Settings',
        icon: 'mdi:image',
        schema: [
          {
            name: 'image_url',
            required: true,
            selector: {
              text: {
                type: 'url',
              },
            },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'display_time',
                selector: {
                  number: {
                    min: 1,
                    max: 300,
                    step: 1,
                    mode: 'box',
                    unit_of_measurement: 'seconds',
                  },
                },
              },
              {
                name: 'crossfade_time',
                selector: {
                  number: {
                    min: 0,
                    max: 30,
                    step: 0.5,
                    mode: 'box',
                    unit_of_measurement: 'seconds',
                  },
                },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'image_fit',
                selector: {
                  select: {
                    options: [
                      { value: 'contain', label: 'Contain' },
                      { value: 'cover', label: 'Cover' },
                      { value: 'fill', label: 'Fill' },
                      { value: 'none', label: 'None' },
                      { value: 'scale-down', label: 'Scale Down' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'image_order',
                selector: {
                  select: {
                    options: [
                      { value: 'sorted', label: 'Sorted' },
                      { value: 'random', label: 'Random' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
          },
          {
            name: 'image_list_update_interval',
            selector: {
              number: {
                min: 60,
                max: 86400,
                step: 60,
                mode: 'box',
                unit_of_measurement: 'seconds',
              },
            },
          },
        ],
      },

      // Display Settings Section
      {
        type: 'expandable',
        name: 'display_settings',
        title: 'Display Settings',
        icon: 'mdi:monitor',
        schema: [
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'show_date',
                selector: { boolean: {} },
              },
              {
                name: 'show_time',
                selector: { boolean: {} },
              },
            ],
          },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'show_weather',
                selector: { boolean: {} },
              },
              {
                name: 'show_aqi',
                selector: { boolean: {} },
              },
            ],
          },
        ],
      },

      // Entity Settings Section
      {
        type: 'expandable',
        name: 'entity_settings',
        title: 'Entity Configuration',
        icon: 'mdi:home-assistant',
        schema: [
          {
            name: 'weather_entity',
            selector: {
              entity: {
                domain: 'weather',
              },
            },
          },
          {
            name: 'aqi_entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'aqi',
              },
            },
          },
          {
            name: 'light_sensor_entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'illuminance',
              },
            },
          },
          {
            name: 'brightness_sensor_entity',
            selector: {
              entity: {
                domain: 'sensor',
              },
            },
          },
          {
            name: 'brightness_control_entity',
            selector: {
              entity: {
                domain: ['number', 'input_number'],
              },
            },
          },
        ],
      },

      // Device Settings Section
      {
        type: 'expandable',
        name: 'device_settings',
        title: 'Device Settings',
        icon: 'mdi:tablet',
        schema: [
          {
            name: 'device_name',
            selector: {
              text: {},
            },
          },
          {
            name: 'sensor_update_delay',
            selector: {
              number: {
                min: 100,
                max: 5000,
                step: 100,
                mode: 'box',
                unit_of_measurement: 'ms',
              },
            },
          },
        ],
      },

      // Debug Settings Section
      {
        type: 'expandable',
        name: 'debug_settings',
        title: 'Debug Settings',
        icon: 'mdi:bug',
        schema: [
          {
            name: 'show_debug',
            selector: { boolean: {} },
          },
        ],
      },
    ],

    computeLabel: (schema: FormSchema): string | undefined => {
      const labels: Record<string, string> = {
        image_url: 'Image URL',
        display_time: 'Display Time',
        crossfade_time: 'Crossfade Time',
        image_fit: 'Image Fit',
        image_order: 'Image Order',
        image_list_update_interval: 'Image List Update Interval',
        show_date: 'Show Date',
        show_time: 'Show Time',
        show_weather: 'Show Weather',
        show_aqi: 'Show AQI',
        weather_entity: 'Weather Entity',
        aqi_entity: 'AQI Entity',
        light_sensor_entity: 'Light Sensor Entity',
        brightness_sensor_entity: 'Brightness Sensor Entity',
        brightness_control_entity: 'Brightness Control Entity',
        device_name: 'Device Name',
        sensor_update_delay: 'Sensor Update Delay',
        show_debug: 'Show Debug Info',
      };
      return labels[schema.name] ?? undefined;
    },

    computeHelper: (schema: FormSchema): string | undefined => {
      const helpers: Record<string, string> = {
        image_url: 'URL or media source path for images. Supports: direct URL, media-source://, Unsplash API, Immich API, Picsum',
        display_time: 'How long each image is displayed before transitioning',
        crossfade_time: 'Duration of the crossfade animation between images',
        image_fit: 'How images are fitted within the display area',
        image_order: 'Order in which images are displayed',
        image_list_update_interval: 'How often to refresh the image list from the source',
        weather_entity: 'Weather entity to display temperature and conditions',
        aqi_entity: 'Air quality index sensor entity',
        light_sensor_entity: 'Light sensor used for automatic night mode detection',
        brightness_sensor_entity: 'Sensor showing current display brightness',
        brightness_control_entity: 'Entity to control display brightness (number or input_number)',
        device_name: 'Device identifier for notifications (e.g., mobile_app_device_name)',
        sensor_update_delay: 'Delay before reading sensor values after changes',
        show_debug: 'Enable to show debug information overlay (also accessible via long-press on settings icon)',
      };
      return helpers[schema.name] ?? undefined;
    },

    assertConfig: (config: unknown): void => {
      const cfg = config as GoogleCardConfig;
      if (cfg.display_time !== undefined && (cfg.display_time < 1 || cfg.display_time > 300)) {
        throw new Error('Display time must be between 1 and 300 seconds');
      }
      if (cfg.crossfade_time !== undefined && (cfg.crossfade_time < 0 || cfg.crossfade_time > 30)) {
        throw new Error('Crossfade time must be between 0 and 30 seconds');
      }
    },
  };
}

/**
 * Google Card Editor Element
 * Uses the built-in Home Assistant form editor for best practices
 */
@customElement('google-card-editor')
export class GoogleCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: GoogleCardConfig;

  static styles = editorStyles;

  /**
   * Returns the config form schema for the built-in editor
   * This is the recommended way to create card editors in Home Assistant
   */
  static getConfigForm = getConfigForm;

  public setConfig(config: GoogleCardConfig): void {
    this._config = { ...DEFAULT_CONFIG, ...config } as GoogleCardConfig;
  }

  /**
   * Validate configuration values
   */
  private _validate(key: string, value: unknown): unknown {
    switch (key) {
      case 'display_time':
      case 'crossfade_time':
        return Math.max(1, parseInt(String(value)) || DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG] as number);
      case 'image_list_update_interval':
        return Math.max(60, parseInt(String(value)) || DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG] as number);
      default:
        return value;
    }
  }

  /**
   * Handle value changes from form elements
   */
  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;

    const target = ev.target as HTMLElement & { 
      configValue?: string; 
      value?: unknown; 
      checked?: boolean;
    };
    const key = target.configValue;

    if (!key) return;

    let value: unknown;
    if ((target as HTMLInputElement).type === 'checkbox' || target.tagName === 'HA-SWITCH') {
      value = target.checked;
    } else if (
      (target as HTMLInputElement).type === 'number' ||
      ['display_time', 'crossfade_time', 'image_list_update_interval', 'sensor_update_delay'].includes(key)
    ) {
      value = this._validate(key, target.value);
    } else {
      value = target.value;
    }

    if (value === '' || value === undefined) {
      const newConfig = { ...this._config };
      delete (newConfig as Record<string, unknown>)[key];
      this._config = newConfig;
    } else {
      this._config = { ...this._config, [key]: value };
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * Fallback render method for manual editor (if built-in form is not supported)
   * The built-in form editor is preferred and will be used automatically
   */
  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html`<div>Loading...</div>`;
    }

    // The built-in form editor will be used automatically via getConfigForm()
    // This render method is only used as a fallback
    return html`
      <div class="form-container">
        <div class="card">
          <div class="card-header">Google Card Configuration</div>
          <p class="input-desc">
            This card uses the built-in Home Assistant form editor.
            If you see this message, the form editor is loading...
          </p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'google-card-editor': GoogleCardEditor;
  }
}
