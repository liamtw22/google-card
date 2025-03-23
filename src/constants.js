// src/constants.js
export const OVERLAY_DISMISS_TIMEOUT = 10000;
export const LONG_PRESS_TIMEOUT = 1000;
export const NIGHT_MODE_TRANSITION_DELAY = 100;
export const TRANSITION_BUFFER = 50;
export const DEFAULT_BRIGHTNESS = 128;
export const MAX_BRIGHTNESS = 255;
export const MIN_BRIGHTNESS = 1;
export const SWIPE_THRESHOLD = 50;
export const DEFAULT_SENSOR_UPDATE_DELAY = 500;
export const BRIGHTNESS_DEBOUNCE_DELAY = 250;
export const BRIGHTNESS_STABILIZE_DELAY = 2000;

export const DEFAULT_CONFIG = {
  image_url: '',
  display_time: 15,
  crossfade_time: 3,
  image_fit: 'contain',
  image_list_update_interval: 3600,
  image_order: 'sorted',
  show_debug: false,
  sensor_update_delay: DEFAULT_SENSOR_UPDATE_DELAY,
  device_name: 'mobile_app_liam_s_room_display', // Customizable device target
  show_date: true,
  show_time: true,
  show_weather: true,
  show_aqi: true,
  weather_entity: 'weather.forecast_home',
  aqi_entity: 'sensor.air_quality_index',
  light_sensor_entity: 'sensor.liam_room_display_light_sensor',
  brightness_sensor_entity: 'sensor.liam_room_display_brightness_sensor',
};

export const IMAGE_SOURCE_TYPES = {
  MEDIA_SOURCE: 'media-source',
  UNSPLASH_API: 'unsplash-api',
  IMMICH_API: 'immich-api',
  PICSUM: 'picsum',
  URL: 'url',
};
