/**
 * Timing Constants
 * Defines various timeouts and delays used throughout the application
 */
export const TIMING = {
  // General timeouts
  OVERLAY_DISMISS_TIMEOUT: 10000, // Time before overlay auto-dismisses (ms)
  LONG_PRESS_TIMEOUT: 1000, // Duration for long press detection (ms)
  TRANSITION_BUFFER: 50, // Buffer time for transitions (ms)
  
  // Display timing
  DEFAULT_DISPLAY_TIME: 15, // Default time to display each image (seconds)
  DEFAULT_CROSSFADE_TIME: 3, // Default crossfade duration between images (seconds)
  
  // Night mode
  NIGHT_MODE_TRANSITION_DELAY: 100, // Delay for night mode transitions (ms)
  
  // Sensor and update delays
  DEFAULT_SENSOR_UPDATE_DELAY: 500, // Default delay for sensor updates (ms)
  DEFAULT_IMAGE_LIST_UPDATE_INTERVAL: 3600, // Default interval for updating image list (seconds)
  
  // Debounce and stabilization delays
  BRIGHTNESS_DEBOUNCE_DELAY: 250, // Delay before processing brightness changes (ms)
  BRIGHTNESS_STABILIZE_DELAY: 2000, // Time to wait for brightness to stabilize (ms)
  VOLUME_DEBOUNCE_DELAY: 250, // Delay before processing volume changes (ms)
  VOLUME_STABILIZE_DELAY: 2000 // Time to wait for volume to stabilize (ms)
};

/**
 * Brightness Constants
 * Defines brightness-related values and limits
 */
export const BRIGHTNESS = {
  DEFAULT: 128,
  MAX: 255,
  MIN: 1,
  DOTS: 10, // Number of brightness adjustment dots
  NIGHT_MODE: 1 // Brightness level for night mode
};

/**
 * Volume Constants
 * Defines volume-related values and limits
 */
export const VOLUME = {
  DEFAULT: 50,
  MAX: 100,
  MIN: 0,
  DOTS: 10, // Number of volume adjustment dots
  STEP: 10 // Step size for volume adjustments
};

/**
 * UI Constants
 * Defines various UI-related measurements and thresholds
 */
export const UI = {
  SWIPE_THRESHOLD: 50, // Minimum distance for swipe detection (px)
  OVERLAY_HEIGHT: 120, // Height of the overlay panel (px)
  BORDER_RADIUS: 20, // Default border radius for cards (px)
  ICON_SIZE: 50, // Default size for icons (px)
  TOUCH_TARGET_SIZE: 44 // Minimum touch target size (px)
};

/**
 * AQI Color Thresholds
 * Defines color codes for different AQI levels
 */
export const AQI_COLORS = {
  GOOD: {
    max: 50,
    color: '#68a03a'
  },
  MODERATE: {
    max: 100,
    color: '#f9bf33'
  },
  UNHEALTHY_SENSITIVE: {
    max: 150,
    color: '#f47c06'
  },
  UNHEALTHY: {
    max: 200,
    color: '#c43828'
  },
  VERY_UNHEALTHY: {
    max: 300,
    color: '#ab1457'
  },
  HAZARDOUS: {
    color: '#83104c'
  }
};

/**
 * Weather Icons
 * Maps weather conditions to their corresponding icon names
 */
export const WEATHER_ICONS = {
  'clear-night': 'clear-night',
  'cloudy': 'cloudy',
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
  'exceptional': 'not-available',
  'default': 'not-available-fill'
};

/**
 * Image Source Types
 * Defines different types of image sources and their identifiers
 */
export const IMAGE_SOURCE_TYPES = {
  MEDIA_SOURCE: 'media-source',
  UNSPLASH_API: 'unsplash-api',
  IMMICH_API: 'immich-api',
  PICSUM: 'picsum',
  URL: 'url'
};

/**
 * Default Configuration
 * Defines default values for configurable options
 */
export const DEFAULT_CONFIG = {
  image_url: '',
  display_time: TIMING.DEFAULT_DISPLAY_TIME,
  crossfade_time: TIMING.DEFAULT_CROSSFADE_TIME,
  image_fit: 'contain',
  image_list_update_interval: TIMING.DEFAULT_IMAGE_LIST_UPDATE_INTERVAL,
  image_order: 'sorted',
  show_debug: false,
  sensor_update_delay: TIMING.DEFAULT_SENSOR_UPDATE_DELAY
};

/**
 * Entity IDs
 * Defines the entity IDs used for various sensors and services
 */
export const ENTITIES = {
  WEATHER: 'weather.64_west_glen_ave',
  AQI: 'sensor.ridgewood_air_quality_index',
  BRIGHTNESS_SENSOR: 'sensor.liam_room_display_screen_brightness',
  LIGHT_SENSOR: 'sensor.liam_room_display_light_sensor'
};

/**
 * Date/Time Format Options
 * Defines formatting options for dates and times
 */
export const DATE_FORMAT_OPTIONS = {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
};

export const TIME_FORMAT_OPTIONS = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};

/**
 * CSS Classes
 * Defines commonly used CSS class names
 */
export const CSS_CLASSES = {
  ACTIVE: 'active',
  SHOW: 'show',
  ERROR: 'error'
};
