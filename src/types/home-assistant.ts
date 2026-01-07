// src/types/home-assistant.ts

/**
 * Home Assistant Entity State
 */
export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributes;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HassEntityAttributes {
  friendly_name?: string;
  icon?: string;
  unit_of_measurement?: string;
  device_class?: string;
  [key: string]: unknown;
}

export interface WeatherEntityAttributes extends HassEntityAttributes {
  temperature?: number;
  temperature_unit?: string;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  wind_bearing?: number;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
}

/**
 * Home Assistant Object
 */
export interface HomeAssistant {
  states: { [entity_id: string]: HassEntityState };
  services: { [domain: string]: { [service: string]: unknown } };
  user?: HassUser;
  themes: HassThemes;
  language: string;
  locale: HassLocale;
  config: HassConfig;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: HassServiceTarget
  ) => Promise<void>;
  callWS: <T>(msg: MessageBase) => Promise<T>;
  connection: {
    subscribeMessage: <T>(
      callback: (message: T) => void,
      subscribeMessage: MessageBase
    ) => Promise<() => void>;
  };
}

export interface HassUser {
  id: string;
  name: string;
  is_admin: boolean;
  is_owner: boolean;
}

export interface HassThemes {
  default_theme: string;
  themes: { [name: string]: Record<string, string> };
}

export interface HassLocale {
  language: string;
  number_format: string;
  time_format: string;
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  allowlist_external_dirs: string[];
  allowlist_external_urls: string[];
  version: string;
  config_source: string;
  safe_mode: boolean;
  state: string;
  external_url: string | null;
  internal_url: string | null;
}

export interface HassServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

export interface MessageBase {
  id?: number;
  type: string;
  [key: string]: unknown;
}

/**
 * Lovelace Card Types
 */
export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
  getCardSize?(): number | Promise<number>;
  getGridOptions?(): GridOptions;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface GridOptions {
  rows?: number;
  columns?: number | 'full';
  min_rows?: number;
  max_rows?: number;
  min_columns?: number;
  max_columns?: number;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: LovelaceConfig;
  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceConfig {
  title?: string;
  views: LovelaceViewConfig[];
  background?: string;
}

export interface LovelaceViewConfig {
  title?: string;
  path?: string;
  icon?: string;
  cards?: LovelaceCardConfig[];
  [key: string]: unknown;
}

/**
 * Custom Card Registration
 */
export interface CustomCardEntry {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}

/**
 * Form Schema Types for Built-in Editor
 */
export interface FormSchemaBase {
  name: string;
  required?: boolean;
  disabled?: boolean;
  default?: unknown;
}

export interface FormSchemaSelector extends FormSchemaBase {
  selector: Selector;
  context?: Record<string, string>;
}

export interface FormSchemaGrid {
  type: 'grid';
  name: string;
  schema: FormSchema[];
}

export interface FormSchemaExpandable {
  type: 'expandable';
  name: string;
  title?: string;
  icon?: string;
  schema: FormSchema[];
}

export type FormSchema = FormSchemaSelector | FormSchemaGrid | FormSchemaExpandable;

export interface Selector {
  entity?: EntitySelectorConfig;
  device?: DeviceSelectorConfig;
  area?: AreaSelectorConfig;
  target?: TargetSelectorConfig;
  number?: NumberSelectorConfig;
  boolean?: BooleanSelectorConfig;
  text?: TextSelectorConfig;
  select?: SelectSelectorConfig;
  icon?: IconSelectorConfig;
  theme?: ThemeSelectorConfig;
  attribute?: AttributeSelectorConfig;
  label?: LabelSelectorConfig;
  time?: TimeSelectorConfig;
  date?: DateSelectorConfig;
  datetime?: DateTimeSelectorConfig;
  color_rgb?: ColorRGBSelectorConfig;
  color_temp?: ColorTempSelectorConfig;
  ui_action?: UIActionSelectorConfig;
  ui_color?: UIColorSelectorConfig;
  constant?: ConstantSelectorConfig;
  template?: TemplateSelectorConfig;
  object?: ObjectSelectorConfig;
}

export interface EntitySelectorConfig {
  domain?: string | string[];
  device_class?: string | string[];
  multiple?: boolean;
  include_entities?: string[];
  exclude_entities?: string[];
}

export interface DeviceSelectorConfig {
  integration?: string;
  manufacturer?: string;
  model?: string;
  multiple?: boolean;
}

export interface AreaSelectorConfig {
  device?: DeviceSelectorConfig;
  entity?: EntitySelectorConfig;
  multiple?: boolean;
}

export interface TargetSelectorConfig {
  device?: DeviceSelectorConfig;
  entity?: EntitySelectorConfig;
}

export interface NumberSelectorConfig {
  min?: number;
  max?: number;
  step?: number | 'any';
  mode?: 'box' | 'slider';
  unit_of_measurement?: string;
}

export interface BooleanSelectorConfig {
  // No additional config needed
}

export interface TextSelectorConfig {
  multiline?: boolean;
  type?: 'text' | 'password' | 'email' | 'url' | 'number' | 'search' | 'tel' | 'date' | 'time';
  prefix?: string;
  suffix?: string;
}

export interface SelectSelectorConfig {
  options: string[] | SelectOption[];
  multiple?: boolean;
  custom_value?: boolean;
  mode?: 'dropdown' | 'list';
  sort?: boolean;
  translation_key?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface IconSelectorConfig {
  placeholder?: string;
}

export interface ThemeSelectorConfig {
  include_default?: boolean;
}

export interface AttributeSelectorConfig {
  entity_id?: string;
  hide_attributes?: string[];
}

export interface LabelSelectorConfig {
  // No additional config needed
}

export interface TimeSelectorConfig {
  // No additional config needed
}

export interface DateSelectorConfig {
  // No additional config needed
}

export interface DateTimeSelectorConfig {
  // No additional config needed
}

export interface ColorRGBSelectorConfig {
  // No additional config needed
}

export interface ColorTempSelectorConfig {
  min?: number;
  max?: number;
  min_mireds?: number;
  max_mireds?: number;
}

export interface UIActionSelectorConfig {
  actions?: string[];
  default_action?: string;
}

export interface UIColorSelectorConfig {
  default_color?: string;
}

export interface ConstantSelectorConfig {
  value: string | number | boolean;
  label?: string;
}

export interface TemplateSelectorConfig {
  // No additional config needed
}

export interface ObjectSelectorConfig {
  // No additional config needed
}

/**
 * Config Form Return Type
 */
export interface ConfigFormReturn {
  schema: FormSchema[];
  computeLabel?: (schema: FormSchema) => string | undefined;
  computeHelper?: (schema: FormSchema) => string | undefined;
  assertConfig?: (config: unknown) => void;
}

/**
 * Media Source Types
 */
export interface MediaSourceItem {
  title: string;
  media_content_type: string;
  media_content_id: string;
  media_class: string;
  children_media_class?: string;
  can_play: boolean;
  can_expand: boolean;
  thumbnail?: string;
  children?: MediaSourceItem[];
}

export interface BrowseMediaSource {
  title: string;
  media_content_type: string;
  media_content_id: string;
  media_class: string;
  children_media_class?: string;
  can_play: boolean;
  can_expand: boolean;
  children?: MediaSourceItem[];
  not_shown?: number;
  thumbnail?: string;
}
