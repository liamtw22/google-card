// src/types/card-config.ts

import { LovelaceCardConfig } from './home-assistant';

/**
 * Image source types supported by the card
 */
export type ImageSourceType = 
  | 'media-source' 
  | 'unsplash-api' 
  | 'immich-api' 
  | 'picsum' 
  | 'url';

/**
 * Image fit options
 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

/**
 * Image order options
 */
export type ImageOrder = 'sorted' | 'random';

/**
 * Google Card Configuration
 */
export interface GoogleCardConfig extends LovelaceCardConfig {
  // Image Settings
  image_url: string;
  display_time?: number;
  crossfade_time?: number;
  image_fit?: ImageFit;
  image_list_update_interval?: number;
  image_order?: ImageOrder;

  // Display Settings
  show_date?: boolean;
  show_time?: boolean;
  show_weather?: boolean;
  show_aqi?: boolean;

  // Entity Settings
  weather_entity?: string;
  aqi_entity?: string;
  light_sensor_entity?: string;
  brightness_sensor_entity?: string;
  brightness_control_entity?: string;

  // Device Settings
  device_name?: string;
  
  // Debug Settings
  show_debug?: boolean;
  sensor_update_delay?: number;
}

/**
 * Debug information structure
 */
export interface DebugInfo {
  imageList?: string[];
  currentIndex?: number;
  activeImage?: 'A' | 'B';
  screenWidth?: number;
  screenHeight?: number;
  error?: string | null;
  lastUpdate?: string;
  nightModeActive?: boolean;
  brightness?: number;
  lightSensorValue?: number;
}

/**
 * Weather icon mapping
 */
export const WEATHER_ICONS: Record<string, string> = {
  'clear-night': 'clear-night',
  'cloudy': 'cloudy',
  'exceptional': 'exceptional',
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
};

/**
 * AQI Color thresholds
 */
export interface AQIThreshold {
  max: number;
  color: string;
  label: string;
}

export const AQI_THRESHOLDS: AQIThreshold[] = [
  { max: 50, color: '#00e400', label: 'Good' },
  { max: 100, color: '#ffff00', label: 'Moderate' },
  { max: 150, color: '#f47c06', label: 'Unhealthy for Sensitive Groups' },
  { max: 200, color: '#c43828', label: 'Unhealthy' },
  { max: 300, color: '#ab1457', label: 'Very Unhealthy' },
  { max: Infinity, color: '#83104c', label: 'Hazardous' },
];

/**
 * Night mode source
 */
export type NightModeSource = 'manual' | 'sensor' | null;

/**
 * Component Event Types
 */
export interface BrightnessChangeEvent extends CustomEvent {
  detail: number;
}

export interface BrightnessCardToggleEvent extends CustomEvent {
  detail: boolean;
}

export interface DebugToggleEvent extends CustomEvent {
  detail: boolean;
}

export interface NightModeExitEvent extends CustomEvent {
  detail: void;
}
