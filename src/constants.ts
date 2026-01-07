// src/constants.ts

import { GoogleCardConfig } from './types';

// Timing constants
export const OVERLAY_DISMISS_TIMEOUT = 10000;
export const LONG_PRESS_TIMEOUT = 1000;
export const NIGHT_MODE_TRANSITION_DELAY = 100;
export const TRANSITION_BUFFER = 50;
export const DEFAULT_SENSOR_UPDATE_DELAY = 500;
export const BRIGHTNESS_DEBOUNCE_DELAY = 250;
export const BRIGHTNESS_STABILIZE_DELAY = 2000;

// Brightness constants
export const DEFAULT_BRIGHTNESS = 128;
export const MAX_BRIGHTNESS = 255;
export const MIN_BRIGHTNESS = 1;

// Touch constants
export const SWIPE_THRESHOLD = 50;

// Night mode light sensor threshold
export const NIGHT_MODE_LIGHT_THRESHOLD = 1;

/**
 * Default configuration for the Google Card
 */
export const DEFAULT_CONFIG: Omit<GoogleCardConfig, 'type'> = {
  image_url: '',
  display_time: 15,
  crossfade_time: 3,
  image_fit: 'contain',
  image_list_update_interval: 3600,
  image_order: 'sorted',
  show_debug: false,
  sensor_update_delay: DEFAULT_SENSOR_UPDATE_DELAY,
  device_name: '',
  show_date: true,
  show_time: true,
  show_weather: true,
  show_aqi: true,
  weather_entity: '',
  aqi_entity: '',
  light_sensor_entity: '',
  brightness_sensor_entity: '',
  brightness_control_entity: '',
};

/**
 * Image source type patterns for detection
 */
export const IMAGE_SOURCE_PATTERNS = {
  MEDIA_SOURCE: /^media-source:\/\//,
  UNSPLASH_API: /^https:\/\/api\.unsplash/,
  IMMICH_API: /^immich\+/,
  PICSUM: /picsum\.photos/,
} as const;
