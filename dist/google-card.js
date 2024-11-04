// Google Card for Home Assistant
// MIT License

import { css as css$1, LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

import 'https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js';

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c), u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}

function _asyncToGenerator(n) {
  return function() {
    var t = this, e = arguments;
    return new Promise((function(r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, 'next', n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, 'throw', n);
      }
      _next(void 0);
    }));
  };
}

function _defineProperty(e, r, t) {
  return (r = (function(t) {
    var i = (function(t, r) {
      if ('object' != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || 'default');
        if ('object' != typeof i) return i;
        throw new TypeError('@@toPrimitive must return a primitive value.');
      }
      return ('string' === r ? String : Number)(t);
    })(t, 'string');
    return 'symbol' == typeof i ? i : i + '';
  })(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}

function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter((function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    }))), t.push.apply(t, o);
  }
  return t;
}

function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach((function(r) {
      _defineProperty(e, r, t[r]);
    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach((function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    }));
  }
  return e;
}

function _taggedTemplateLiteral(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, {
    raw: {
      value: Object.freeze(t)
    }
  }));
}

var _templateObject$8, _templateObject$7, _templateObject2$4, _templateObject3$4, _templateObject$6, sharedStyles = css$1(_templateObject$8 || (_templateObject$8 = _taggedTemplateLiteral([ '\n  /* CSS Custom Properties (Variables) */\n  :host {\n    /* Colors */\n    --color-primary: #333333;\n    --color-primary-light: #666666;\n    --color-primary-dark: #000000;\n    --color-background: #ffffff;\n    --color-background-translucent: rgba(255, 255, 255, 0.95);\n    --color-error: #ff3b30;\n    --color-success: #34c759;\n    --color-warning: #ffcc00;\n    --color-text: #333333;\n    --color-text-secondary: #666666;\n    --color-border: #e0e0e0;\n    --color-shadow: rgba(0, 0, 0, 0.1);\n\n    /* Typography */\n    --font-family-primary: \'Product Sans Regular\', \'Rubik\', sans-serif;\n    --font-weight-light: 300;\n    --font-weight-regular: 400;\n    --font-weight-medium: 500;\n    --font-weight-bold: 600;\n    --font-size-small: 14px;\n    --font-size-regular: 16px;\n    --font-size-large: 18px;\n    --font-size-xlarge: 24px;\n    --font-size-xxlarge: 32px;\n    --line-height-tight: 1.2;\n    --line-height-normal: 1.5;\n    --line-height-loose: 1.8;\n\n    /* Spacing */\n    --spacing-xxsmall: 4px;\n    --spacing-xsmall: 8px;\n    --spacing-small: 12px;\n    --spacing-medium: 16px;\n    --spacing-large: 24px;\n    --spacing-xlarge: 32px;\n    --spacing-xxlarge: 48px;\n\n    /* Borders */\n    --border-radius-small: 4px;\n    --border-radius-medium: 8px;\n    --border-radius-large: 16px;\n    --border-radius-xlarge: 24px;\n    --border-width-thin: 1px;\n    --border-width-regular: 2px;\n    --border-width-thick: 4px;\n\n    /* Shadows */\n    --shadow-small: 0 2px 4px var(--color-shadow);\n    --shadow-medium: 0 4px 8px var(--color-shadow);\n    --shadow-large: 0 8px 16px var(--color-shadow);\n    --shadow-xlarge: 0 12px 24px var(--color-shadow);\n\n    /* Transitions */\n    --transition-duration-fast: 0.15s;\n    --transition-duration-normal: 0.3s;\n    --transition-duration-slow: 0.5s;\n    --transition-timing: ease-in-out;\n\n    /* Z-index */\n    --z-index-base: 1;\n    --z-index-overlay: 1000;\n    --z-index-modal: 2000;\n    --z-index-tooltip: 3000;\n    --z-index-maximum: 9999;\n\n    /* Component-specific */\n    --overlay-height: 120px;\n    --icon-size-small: 24px;\n    --icon-size-medium: 36px;\n    --icon-size-large: 48px;\n    --header-height: 60px;\n    --footer-height: 80px;\n  }\n\n  /* Base Styles */\n  * {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n  }\n\n  /* Typography Reset */\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6,\n  p {\n    margin: 0;\n    font-weight: var(--font-weight-regular);\n  }\n\n  /* Common Text Styles */\n  .text-small {\n    font-size: var(--font-size-small);\n    line-height: var(--line-height-tight);\n  }\n\n  .text-regular {\n    font-size: var(--font-size-regular);\n    line-height: var(--line-height-normal);\n  }\n\n  .text-large {\n    font-size: var(--font-size-large);\n    line-height: var(--line-height-normal);\n  }\n\n  /* Common Layout Classes */\n  .flex {\n    display: flex;\n  }\n\n  .flex-column {\n    display: flex;\n    flex-direction: column;\n  }\n\n  .flex-center {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n\n  .flex-between {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  }\n\n  .flex-around {\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n  }\n\n  .flex-grow {\n    flex-grow: 1;\n  }\n\n  /* Common Spacing Classes */\n  .m-0 {\n    margin: 0;\n  }\n  .p-0 {\n    padding: 0;\n  }\n  .m-1 {\n    margin: var(--spacing-xsmall);\n  }\n  .p-1 {\n    padding: var(--spacing-xsmall);\n  }\n  .m-2 {\n    margin: var(--spacing-small);\n  }\n  .p-2 {\n    padding: var(--spacing-small);\n  }\n  .m-3 {\n    margin: var(--spacing-medium);\n  }\n  .p-3 {\n    padding: var(--spacing-medium);\n  }\n  .m-4 {\n    margin: var(--spacing-large);\n  }\n  .p-4 {\n    padding: var(--spacing-large);\n  }\n\n  /* Common Animation Classes */\n  .fade-in {\n    animation: fadeIn var(--transition-duration-normal) var(--transition-timing);\n  }\n\n  .fade-out {\n    animation: fadeOut var(--transition-duration-normal) var(--transition-timing);\n  }\n\n  @keyframes fadeIn {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  @keyframes fadeOut {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n\n  /* Common Utility Classes */\n  .hidden {\n    display: none !important;\n  }\n\n  .invisible {\n    visibility: hidden !important;\n  }\n\n  .truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n\n  .no-select {\n    user-select: none;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n  }\n\n  /* Accessibility */\n  .screen-reader-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n\n  /* Focus States */\n  :focus-visible {\n    outline: var(--border-width-regular) solid var(--color-primary);\n    outline-offset: var(--border-width-thin);\n  }\n\n  /* Dark Mode */\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --color-primary: #ffffff;\n      --color-primary-light: #cccccc;\n      --color-primary-dark: #999999;\n      --color-background: #000000;\n      --color-background-translucent: rgba(0, 0, 0, 0.95);\n      --color-text: #ffffff;\n      --color-text-secondary: #cccccc;\n      --color-border: #333333;\n      --color-shadow: rgba(0, 0, 0, 0.3);\n    }\n  }\n\n  /* High Contrast Mode */\n  @media (prefers-contrast: more) {\n    :host {\n      --color-primary: #000000;\n      --color-background: #ffffff;\n      --color-text: #000000;\n      --color-border: #000000;\n      --shadow-small: none;\n      --shadow-medium: none;\n      --shadow-large: none;\n      --shadow-xlarge: none;\n    }\n  }\n\n  /* Reduced Motion */\n  @media (prefers-reduced-motion: reduce) {\n    * {\n      animation-duration: 0.01ms !important;\n      animation-iteration-count: 1 !important;\n      transition-duration: 0.01ms !important;\n      scroll-behavior: auto !important;\n    }\n  }\n\n  /* Print Styles */\n  @media print {\n    :host {\n      --color-primary: #000000;\n      --color-background: #ffffff;\n      --color-text: #000000;\n      --shadow-small: none;\n      --shadow-medium: none;\n      --shadow-large: none;\n      --shadow-xlarge: none;\n    }\n  }\n\n  /* RTL Support */\n  :host([dir=\'rtl\']) {\n    direction: rtl;\n  }\n\n  /* Touch Device Optimization */\n  @media (hover: none) {\n    :host {\n      --spacing-small: 16px;\n      --spacing-medium: 20px;\n      --spacing-large: 28px;\n    }\n  }\n' ]))), TIMING_OVERLAY_DISMISS_TIMEOUT = 1e4, TIMING_LONG_PRESS_TIMEOUT = 1e3, TIMING_TRANSITION_BUFFER = 50, TIMING_NIGHT_MODE_TRANSITION_DELAY = 100, BRIGHTNESS_DEFAULT = 128, BRIGHTNESS_MAX = 255, BRIGHTNESS_MIN = 1, BRIGHTNESS_DOTS = 10, BRIGHTNESS_NIGHT_MODE = 1, VOLUME_DEFAULT = 50, VOLUME_MAX = 100, VOLUME_MIN = 0, VOLUME_DOTS = 10, UI_SWIPE_THRESHOLD = 50, AQI_COLORS_GOOD = {
  max: 50,
  color: '#68a03a'
}, AQI_COLORS_MODERATE = {
  max: 100,
  color: '#f9bf33'
}, AQI_COLORS_UNHEALTHY_SENSITIVE = {
  max: 150,
  color: '#f47c06'
}, AQI_COLORS_UNHEALTHY = {
  max: 200,
  color: '#c43828'
}, AQI_COLORS_VERY_UNHEALTHY = {
  max: 300,
  color: '#ab1457'
}, AQI_COLORS_HAZARDOUS = {
  color: '#83104c'
}, WEATHER_ICONS = {
  'clear-night': 'clear-night',
  cloudy: 'cloudy',
  fog: 'fog',
  hail: 'hail',
  lightning: 'thunderstorms',
  'lightning-rainy': 'thunderstorms-rain',
  partlycloudy: 'partly-cloudy-day',
  pouring: 'rain',
  rainy: 'drizzle',
  snowy: 'snow',
  'snowy-rainy': 'sleet',
  sunny: 'clear-day',
  windy: 'wind',
  'windy-variant': 'wind',
  exceptional: 'not-available',
  default: 'not-available-fill'
}, DEFAULT_CONFIG = {
  image_url: '',
  display_time: 15,
  crossfade_time: 3,
  image_fit: 'contain',
  image_list_update_interval: 3600,
  image_order: 'sorted',
  show_debug: !1,
  sensor_update_delay: 500
}, ENTITIES_WEATHER = 'weather.64_west_glen_ave', ENTITIES_AQI = 'sensor.ridgewood_air_quality_index', DATE_FORMAT_OPTIONS = {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}, TIME_FORMAT_OPTIONS = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: !0
};

customElements.define('background-rotator', class extends LitElement {
  static get properties() {
    return {
      imageA: {
        type: String
      },
      imageB: {
        type: String
      },
      activeImage: {
        type: String
      },
      preloadedImage: {
        type: String
      },
      isTransitioning: {
        type: Boolean
      },
      crossfadeTime: {
        type: Number
      },
      screenWidth: {
        type: Number
      },
      screenHeight: {
        type: Number
      },
      config: {
        type: Object
      },
      error: {
        type: String
      },
      imageList: {
        type: Array
      },
      currentImageIndex: {
        type: Number
      },
      imageUpdateInterval: {
        type: Object
      },
      imageListUpdateInterval: {
        type: Object
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
  }
  initializeProperties() {
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.isTransitioning = !1;
    this.crossfadeTime = DEFAULT_CONFIG.crossfade_time;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.error = null;
    this.imageList = [];
    this.currentImageIndex = -1;
    this.imageUpdateInterval = null;
    this.imageListUpdateInterval = null;
  }
  static get styles() {
    return css$1(_templateObject$7 || (_templateObject$7 = _taggedTemplateLiteral([ '\n      :host {\n        display: block;\n        position: relative;\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n        background-color: black;\n      }\n\n      .background-container {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background-color: black;\n        z-index: 1;\n      }\n\n      .background-image {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background-size: contain;\n        background-position: center;\n        background-repeat: no-repeat;\n        will-change: opacity;\n        transition-property: opacity;\n        transition-timing-function: ease-in-out;\n      }\n\n      .error-message {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        background-color: rgba(0, 0, 0, 0.8);\n        color: #ff4444;\n        padding: 1rem;\n        border-radius: 0.5rem;\n        font-size: 1rem;\n        text-align: center;\n        z-index: 2;\n        max-width: 80%;\n      }\n\n      /* High DPI Screen Optimizations */\n      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n        .background-image {\n          transform: translateZ(0);\n          backface-visibility: hidden;\n        }\n      }\n\n      /* Reduced Motion Preferences */\n      @media (prefers-reduced-motion: reduce) {\n        .background-image {\n          transition-duration: 0.5s !important;\n        }\n      }\n    ' ])));
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.startImageRotation();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.clearTimers();
  }
  clearTimers() {
    this.imageUpdateInterval && clearInterval(this.imageUpdateInterval);
    this.imageListUpdateInterval && clearInterval(this.imageListUpdateInterval);
  }
  updateScreenSize() {
    var pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }
  startImageRotation() {
    var _this = this;
    return _asyncToGenerator((function*() {
      var _this$config;
      yield _this.updateImage();
      _this.imageUpdateInterval = setInterval((() => {
        _this.updateImage();
      }), 1e3 * ((null === (_this$config = _this.config) || void 0 === _this$config ? void 0 : _this$config.display_time) || DEFAULT_CONFIG.display_time));
    }))();
  }
  updateImage() {
    var _this2 = this;
    return _asyncToGenerator((function*() {
      if (!_this2.isTransitioning) try {
        var newImage = yield _this2.getNextImage();
        yield _this2.transitionToNewImage(newImage);
        _this2.preloadNextImage();
      } catch (error) {
        console.error('Error updating image:', error);
        _this2.error = 'Error updating image: '.concat(error.message);
        _this2.requestUpdate();
      }
    }))();
  }
  getNextImage() {
    var _this3 = this;
    return _asyncToGenerator((function*() {
      if (_this3.preloadedImage) {
        var image = _this3.preloadedImage;
        _this3.preloadedImage = '';
        return image;
      }
      if (0 === _this3.imageList.length) throw new Error('No images available');
      _this3.currentImageIndex = (_this3.currentImageIndex + 1) % _this3.imageList.length;
      return _this3.imageList[_this3.currentImageIndex];
    }))();
  }
  preloadImage(url) {
    return _asyncToGenerator((function*() {
      return new Promise(((resolve, reject) => {
        var img = new Image;
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to load image: '.concat(url)));
        img.src = url;
      }));
    }))();
  }
  preloadNextImage() {
    var _this4 = this;
    return _asyncToGenerator((function*() {
      try {
        var nextIndex = (_this4.currentImageIndex + 1) % _this4.imageList.length, nextImageUrl = _this4.imageList[nextIndex];
        _this4.preloadedImage = yield _this4.preloadImage(nextImageUrl);
      } catch (error) {
        console.error('Error preloading next image:', error);
        _this4.preloadedImage = '';
      }
    }))();
  }
  transitionToNewImage(newImage) {
    var _this5 = this;
    return _asyncToGenerator((function*() {
      _this5.isTransitioning = !0;
      if ('A' === _this5.activeImage) {
        _this5.imageB = newImage;
        yield new Promise((resolve => setTimeout(resolve, TIMING_TRANSITION_BUFFER)));
        _this5.activeImage = 'B';
      } else {
        _this5.imageA = newImage;
        yield new Promise((resolve => setTimeout(resolve, TIMING_TRANSITION_BUFFER)));
        _this5.activeImage = 'A';
      }
      yield new Promise((resolve => setTimeout(resolve, 1e3 * _this5.crossfadeTime + TIMING_TRANSITION_BUFFER)));
      _this5.isTransitioning = !1;
      _this5.requestUpdate();
    }))();
  }
  getBackgroundSize() {
    var _this$config2;
    return (null === (_this$config2 = this.config) || void 0 === _this$config2 ? void 0 : _this$config2.image_fit) || DEFAULT_CONFIG.image_fit;
  }
  setImageList(list) {
    this.imageList = list;
    this.currentImageIndex = -1;
    this.requestUpdate();
  }
  setCrossfadeTime(time) {
    this.crossfadeTime = time;
    this.requestUpdate();
  }
  setConfig(config) {
    this.config = config;
    this.requestUpdate();
  }
  forceImageUpdate() {
    var _this6 = this;
    return _asyncToGenerator((function*() {
      yield _this6.updateImage();
    }))();
  }
  pauseRotation() {
    this.clearTimers();
  }
  resumeRotation() {
    this.startImageRotation();
  }
  render() {
    return html(_templateObject2$4 || (_templateObject2$4 = _taggedTemplateLiteral([ '\n      <div class="background-container">\n        ', '\n        <div\n          class="background-image"\n          style="\n            background-image: url(\'', '\');\n            opacity: ', ';\n            transition-duration: ', 's;\n            background-size: ', ';\n          "\n        ></div>\n        <div\n          class="background-image"\n          style="\n            background-image: url(\'', '\');\n            opacity: ', ';\n            transition-duration: ', 's;\n            background-size: ', ';\n          "\n        ></div>\n      </div>\n    ' ])), this.error ? html(_templateObject3$4 || (_templateObject3$4 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : '', this.imageA, 'A' === this.activeImage ? 1 : 0, this.crossfadeTime, this.getBackgroundSize(), this.imageB, 'B' === this.activeImage ? 1 : 0, this.crossfadeTime, this.getBackgroundSize());
  }
});

var _templateObject$5, _templateObject2$3, _templateObject3$3, _templateObject4$2, _templateObject5$2, _templateObject$4, weatherStyles = css$1(_templateObject$6 || (_templateObject$6 = _taggedTemplateLiteral([ '\n  :host {\n    display: block;\n    position: relative;\n    font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n\n  /* Main Container */\n  .weather-component {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    color: white;\n    width: 100%;\n    max-width: 400px;\n    padding: 10px;\n    box-sizing: border-box;\n    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n  }\n\n  /* Left Column - Date & Time */\n  .left-column {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    overflow: hidden;\n  }\n\n  .date {\n    font-size: 25px;\n    margin-bottom: 5px;\n    font-weight: 400;\n    margin-left: 10px;\n    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    transition: font-size 0.3s ease;\n  }\n\n  .time {\n    font-size: 90px;\n    line-height: 1;\n    font-weight: 500;\n    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);\n    margin-left: 8px;\n    transition: font-size 0.3s ease;\n  }\n\n  /* Right Column - Weather & AQI */\n  .right-column {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-end;\n    min-width: 120px;\n  }\n\n  /* Weather Info Section */\n  .weather-info {\n    display: flex;\n    align-items: center;\n    margin-top: 10px;\n    font-weight: 500;\n    margin-right: -5px;\n    transition: all 0.3s ease;\n  }\n\n  .weather-icon {\n    width: 50px;\n    height: 50px;\n    margin-right: 8px;\n    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));\n    transition: all 0.3s ease;\n  }\n\n  .weather-icon.loading {\n    opacity: 0.5;\n    animation: pulse 1.5s infinite;\n  }\n\n  .temperature {\n    font-size: 35px;\n    font-weight: 500;\n    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);\n    transition: font-size 0.3s ease;\n  }\n\n  /* AQI Section */\n  .aqi {\n    font-size: 20px;\n    padding: 7px 10px 5px;\n    border-radius: 8px;\n    font-weight: 500;\n    margin-top: 2px;\n    margin-left: 25px;\n    align-self: flex-end;\n    min-width: 70px;\n    text-align: center;\n    transition: all 0.3s ease;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n  }\n\n  /* AQI Color Classes */\n  .aqi.good {\n    background-color: #68a03a;\n  }\n\n  .aqi.moderate {\n    background-color: #f9bf33;\n  }\n\n  .aqi.unhealthy-sensitive {\n    background-color: #f47c06;\n  }\n\n  .aqi.unhealthy {\n    background-color: #c43828;\n  }\n\n  .aqi.very-unhealthy {\n    background-color: #ab1457;\n  }\n\n  .aqi.hazardous {\n    background-color: #83104c;\n  }\n\n  /* Loading States */\n  @keyframes pulse {\n    0% {\n      opacity: 0.5;\n    }\n    50% {\n      opacity: 0.8;\n    }\n    100% {\n      opacity: 0.5;\n    }\n  }\n\n  .loading {\n    opacity: 0.7;\n    animation: pulse 1.5s infinite;\n  }\n\n  /* Error States */\n  .error-message {\n    background-color: rgba(255, 59, 48, 0.9);\n    color: white;\n    padding: 8px 12px;\n    border-radius: 6px;\n    font-size: 14px;\n    margin-top: 8px;\n    text-align: center;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n  }\n\n  /* Weather Description */\n  .weather-description {\n    font-size: 16px;\n    margin-top: 4px;\n    opacity: 0.9;\n    text-align: right;\n  }\n\n  /* Hover Effects */\n  .weather-info:hover .weather-icon {\n    transform: scale(1.1);\n  }\n\n  .aqi:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n  }\n\n  /* Animations */\n  @keyframes fadeIn {\n    from {\n      opacity: 0;\n      transform: translateY(10px);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n\n  .fade-in {\n    animation: fadeIn 0.3s ease forwards;\n  }\n\n  /* Responsive Design */\n  @media (max-width: 480px) {\n    .weather-component {\n      padding: 8px;\n      max-width: 100%;\n    }\n\n    .date {\n      font-size: 20px;\n      margin-left: 8px;\n    }\n\n    .time {\n      font-size: 70px;\n      margin-left: 6px;\n    }\n\n    .weather-icon {\n      width: 40px;\n      height: 40px;\n    }\n\n    .temperature {\n      font-size: 28px;\n    }\n\n    .aqi {\n      font-size: 16px;\n      padding: 5px 8px 4px;\n      margin-left: 15px;\n      min-width: 60px;\n    }\n  }\n\n  @media (max-width: 360px) {\n    .date {\n      font-size: 18px;\n    }\n\n    .time {\n      font-size: 60px;\n    }\n\n    .weather-icon {\n      width: 35px;\n      height: 35px;\n    }\n\n    .temperature {\n      font-size: 24px;\n    }\n\n    .aqi {\n      font-size: 14px;\n      min-width: 50px;\n    }\n  }\n\n  /* High Contrast Mode */\n  @media (prefers-contrast: more) {\n    .weather-component {\n      text-shadow: none;\n    }\n\n    .aqi {\n      border: 2px solid rgba(255, 255, 255, 0.8);\n    }\n  }\n\n  /* Reduced Motion */\n  @media (prefers-reduced-motion: reduce) {\n    .weather-info:hover .weather-icon {\n      transform: none;\n    }\n\n    .aqi:hover {\n      transform: none;\n    }\n\n    .loading {\n      animation: none;\n      opacity: 0.7;\n    }\n  }\n\n  /* Print Styles */\n  @media print {\n    .weather-component {\n      color: black;\n      text-shadow: none;\n    }\n\n    .aqi {\n      print-color-adjust: exact;\n      -webkit-print-color-adjust: exact;\n    }\n  }\n\n  /* Dark Mode Adjustments */\n  @media (prefers-color-scheme: dark) {\n    .error-message {\n      background-color: rgba(255, 59, 48, 0.7);\n    }\n  }\n\n  /* Focus States for Accessibility */\n  :host(:focus-within) {\n    outline: 2px solid white;\n    outline-offset: 2px;\n  }\n\n  /* RTL Support */\n  :host([dir=\'rtl\']) {\n    .left-column {\n      align-items: flex-end;\n    }\n\n    .right-column {\n      align-items: flex-start;\n    }\n\n    .date,\n    .time {\n      margin-left: 0;\n      margin-right: 10px;\n    }\n\n    .aqi {\n      margin-left: 0;\n      margin-right: 25px;\n    }\n\n    .weather-info {\n      margin-right: 0;\n      margin-left: -5px;\n    }\n  }\n\n  /* Utility Classes */\n  .hidden {\n    display: none !important;\n  }\n\n  .invisible {\n    visibility: hidden !important;\n  }\n\n  .no-wrap {\n    white-space: nowrap;\n  }\n\n  .truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n' ])));

customElements.define('weather-display', class extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      date: {
        type: String
      },
      time: {
        type: String
      },
      temperature: {
        type: String
      },
      weatherIcon: {
        type: String
      },
      weatherState: {
        type: String
      },
      aqi: {
        type: String
      },
      lastUpdate: {
        type: Number
      },
      error: {
        type: String
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
  }
  initializeProperties() {
    this.date = '';
    this.time = '';
    this.temperature = '';
    this.weatherIcon = WEATHER_ICONS.default;
    this.weatherState = '';
    this.aqi = '';
    this.lastUpdate = 0;
    this.error = null;
    this.updateTimer = null;
  }
  static get styles() {
    return weatherStyles;
  }
  connectedCallback() {
    super.connectedCallback();
    this.startUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopUpdates();
  }
  startUpdates() {
    // Initial update
    this.updateWeather();
    this.updateDateTime();
    // Set up regular updates
        this.updateTimer = setInterval((() => {
      this.updateDateTime();
      // Update weather data every minute
            Date.now() - this.lastUpdate >= 6e4 && this.updateWeather();
    }), 1e3);
 // Update every second for time
    }
  stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
  updated(changedProperties) {
    changedProperties.has('hass') && this.hass && this.updateWeather();
  }
  updateDateTime() {
    var now = new Date;
    // Update date
        this.date = now.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
    // Update time
        this.time = now.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, '');
 // Remove AM/PM
        this.requestUpdate();
  }
  updateWeather() {
    if (this.hass) {
      try {
        this.updateWeatherData();
        this.updateAQIData();
        this.lastUpdate = Date.now();
        this.error = null;
      } catch (error) {
        console.error('Error updating weather data:', error);
        this.error = 'Error updating weather data';
      }
      this.requestUpdate();
    } else this.error = 'Home Assistant not available';
  }
  updateWeatherData() {
    var weatherEntity = this.hass.states[ENTITIES_WEATHER];
    if (!weatherEntity) throw new Error('Weather entity not available');
    // Update temperature
        var temp = weatherEntity.attributes.temperature;
    this.temperature = ''.concat(Math.round(temp), '°');
    // Update weather state and icon
        this.weatherState = weatherEntity.state;
    this.weatherIcon = this.getWeatherIcon(weatherEntity.state);
  }
  updateAQIData() {
    var aqiEntity = this.hass.states[ENTITIES_AQI];
    if (!aqiEntity) throw new Error('AQI entity not available');
    this.aqi = aqiEntity.state;
  }
  getWeatherIcon(state) {
    return WEATHER_ICONS[state] || WEATHER_ICONS.default;
  }
  getAqiColor(aqi) {
    var aqiValue = parseInt(aqi);
    return isNaN(aqiValue) ? AQI_COLORS_HAZARDOUS.color : aqiValue <= AQI_COLORS_GOOD.max ? AQI_COLORS_GOOD.color : aqiValue <= AQI_COLORS_MODERATE.max ? AQI_COLORS_MODERATE.color : aqiValue <= AQI_COLORS_UNHEALTHY_SENSITIVE.max ? AQI_COLORS_UNHEALTHY_SENSITIVE.color : aqiValue <= AQI_COLORS_UNHEALTHY.max ? AQI_COLORS_UNHEALTHY.color : aqiValue <= AQI_COLORS_VERY_UNHEALTHY.max ? AQI_COLORS_VERY_UNHEALTHY.color : AQI_COLORS_HAZARDOUS.color;
  }
  getAqiDescription(aqi) {
    var aqiValue = parseInt(aqi);
    return isNaN(aqiValue) ? 'Unknown' : aqiValue <= AQI_COLORS_GOOD.max ? 'Good' : aqiValue <= AQI_COLORS_MODERATE.max ? 'Moderate' : aqiValue <= AQI_COLORS_UNHEALTHY_SENSITIVE.max ? 'Unhealthy for Sensitive Groups' : aqiValue <= AQI_COLORS_UNHEALTHY.max ? 'Unhealthy' : aqiValue <= AQI_COLORS_VERY_UNHEALTHY.max ? 'Very Unhealthy' : 'Hazardous';
  }
  handleWeatherIconError(e) {
    console.error('Error loading weather icon');
    e.target.src = 'https://basmilius.github.io/weather-icons/production/fill/all/'.concat(WEATHER_ICONS.default, '.svg');
  }
  renderDateTime() {
    return html(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral([ '\n      <div class="left-column">\n        <div class="date">', '</div>\n        <div class="time">', '</div>\n      </div>\n    ' ])), this.date, this.time);
  }
  renderWeatherInfo() {
    return html(_templateObject2$3 || (_templateObject2$3 = _taggedTemplateLiteral([ '\n      <div class="weather-info">\n        <img\n          src="https://basmilius.github.io/weather-icons/production/fill/all/', '.svg"\n          class="weather-icon"\n          alt="Weather icon for ', '"\n          @error=', '\n        />\n        <span class="temperature">', '</span>\n      </div>\n    ' ])), this.weatherIcon, this.weatherState, this.handleWeatherIconError, this.temperature);
  }
  renderAQI() {
    if (!this.aqi) return null;
    var aqiColor = this.getAqiColor(this.aqi), aqiDescription = this.getAqiDescription(this.aqi);
    return html(_templateObject3$3 || (_templateObject3$3 = _taggedTemplateLiteral([ '\n      <div class="aqi" style="background-color: ', '" title="', '">\n        ', ' AQI\n      </div>\n    ' ])), aqiColor, aqiDescription, this.aqi);
  }
  renderError() {
    return this.error ? html(_templateObject4$2 || (_templateObject4$2 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : null;
  }
  render() {
    return html(_templateObject5$2 || (_templateObject5$2 = _taggedTemplateLiteral([ '\n      <link\n        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"\n        rel="stylesheet"\n      />\n      <div class="weather-component">\n        ', '\n        <div class="right-column">', ' ', '</div>\n        ', '\n      </div>\n    ' ])), this.renderDateTime(), this.renderWeatherInfo(), this.renderAQI(), this.renderError());
  }
  forceUpdate() {
    this.updateWeather();
    this.updateDateTime();
  }
  updateTime() {
    this.updateDateTime();
  }
  refreshWeather() {
    this.updateWeather();
  }
});

var _templateObject$3, _templateObject2$2, _templateObject3$2, _templateObject$2, nightModeStyles = css$1(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '\n  :host {\n    display: block;\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100vh;\n    background-color: black;\n    z-index: 1000;\n    font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n\n  /* Main Container */\n  .night-mode {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    flex-direction: column;\n    background-color: black;\n    transition: background-color 0.5s ease-in-out;\n    user-select: none;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n  }\n\n  /* Time Display */\n  .night-time {\n    color: white;\n    font-size: 35vw;\n    font-weight: 400;\n    line-height: 1;\n    text-align: center;\n    opacity: 0.7;\n    transition: opacity 2s ease-in-out, font-size 0.3s ease-in-out;\n    margin: 0;\n    padding: 0;\n    letter-spacing: -0.02em;\n    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);\n  }\n\n  /* Fade Animation */\n  .night-time.fade-dim {\n    opacity: 0.4;\n    transition: opacity 2s ease-in-out;\n  }\n\n  /* Error Message */\n  .error-message {\n    position: absolute;\n    bottom: 20px;\n    left: 50%;\n    transform: translateX(-50%);\n    background-color: rgba(255, 59, 48, 0.8);\n    color: white;\n    padding: 8px 16px;\n    border-radius: 8px;\n    font-size: 14px;\n    opacity: 0;\n    transition: opacity 0.3s ease-in-out;\n    text-align: center;\n    max-width: 80%;\n  }\n\n  .error-message.visible {\n    opacity: 1;\n  }\n\n  /* Touch Feedback */\n  .touch-indicator {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    pointer-events: none;\n    opacity: 0;\n    transition: opacity 0.3s ease-in-out;\n    background: radial-gradient(\n      circle at var(--touch-x, 50%) var(--touch-y, 50%),\n      rgba(255, 255, 255, 0.1) 0%,\n      transparent 60%\n    );\n  }\n\n  .touch-indicator.active {\n    opacity: 1;\n  }\n\n  /* Swipe Hint */\n  .swipe-hint {\n    position: absolute;\n    bottom: 40px;\n    left: 50%;\n    transform: translateX(-50%);\n    color: rgba(255, 255, 255, 0.3);\n    font-size: 16px;\n    opacity: 0;\n    transition: opacity 0.3s ease-in-out;\n  }\n\n  .swipe-hint.visible {\n    opacity: 1;\n    animation: fadeInOut 3s infinite;\n  }\n\n  /* Exit Animation */\n  .night-mode.exiting {\n    animation: fadeOut 0.5s ease-in-out forwards;\n  }\n\n  /* Entry Animation */\n  .night-mode.entering {\n    animation: fadeIn 0.5s ease-in-out forwards;\n  }\n\n  /* Animations */\n  @keyframes fadeIn {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  @keyframes fadeOut {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n\n  @keyframes fadeInOut {\n    0%,\n    100% {\n      opacity: 0;\n    }\n    50% {\n      opacity: 1;\n    }\n  }\n\n  @keyframes pulse {\n    0%,\n    100% {\n      opacity: 0.7;\n    }\n    50% {\n      opacity: 0.4;\n    }\n  }\n\n  /* Loading State */\n  .loading {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    width: 40px;\n    height: 40px;\n    border: 3px solid rgba(255, 255, 255, 0.1);\n    border-top-color: white;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    to {\n      transform: translate(-50%, -50%) rotate(360deg);\n    }\n  }\n\n  /* Responsive Design */\n  @media (max-width: 768px) {\n    .night-time {\n      font-size: 45vw;\n    }\n  }\n\n  @media (max-width: 480px) {\n    .night-time {\n      font-size: 55vw;\n    }\n\n    .swipe-hint {\n      bottom: 30px;\n      font-size: 14px;\n    }\n  }\n\n  @media (max-height: 480px) {\n    .night-time {\n      font-size: 25vh;\n    }\n  }\n\n  /* High Contrast Mode */\n  @media (prefers-contrast: more) {\n    .night-time {\n      opacity: 1;\n      text-shadow: none;\n    }\n\n    .night-time.fade-dim {\n      opacity: 0.8;\n    }\n  }\n\n  /* Reduced Motion */\n  @media (prefers-reduced-motion: reduce) {\n    .night-time {\n      transition: none;\n    }\n\n    .night-time.fade-dim {\n      transition: none;\n    }\n\n    .swipe-hint {\n      animation: none;\n    }\n\n    .night-mode.entering,\n    .night-mode.exiting {\n      animation: none;\n    }\n  }\n\n  /* Dark Mode Optimization */\n  @media (prefers-color-scheme: dark) {\n    .night-mode {\n      background-color: #000000;\n    }\n\n    .night-time {\n      opacity: 0.8;\n    }\n\n    .night-time.fade-dim {\n      opacity: 0.5;\n    }\n  }\n\n  /* RTL Support */\n  :host([dir=\'rtl\']) {\n    .swipe-hint {\n      transform: translateX(50%);\n    }\n\n    .error-message {\n      transform: translateX(50%);\n    }\n  }\n\n  /* Print Mode */\n  @media print {\n    .night-mode {\n      background-color: white !important;\n    }\n\n    .night-time {\n      color: black !important;\n      opacity: 1 !important;\n      text-shadow: none !important;\n    }\n\n    .swipe-hint,\n    .error-message,\n    .touch-indicator {\n      display: none !important;\n    }\n  }\n\n  /* Landscape Mode */\n  @media (orientation: landscape) and (max-height: 500px) {\n    .night-time {\n      font-size: 25vh;\n    }\n\n    .swipe-hint {\n      bottom: 20px;\n    }\n  }\n\n  /* Touch Screen Optimization */\n  @media (hover: none) {\n    .touch-indicator {\n      display: none;\n    }\n  }\n\n  /* Accessibility */\n  .screen-reader-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n\n  /* Focus States */\n  :host(:focus-within) .night-mode {\n    outline: 2px solid white;\n    outline-offset: -2px;\n  }\n\n  /* Battery Optimization */\n  @media (prefers-reduced-data: reduce) {\n    .night-time {\n      text-shadow: none;\n    }\n  }\n' ])));

customElements.define('night-mode', class extends LitElement {
  static get properties() {
    return {
      currentTime: {
        type: String
      },
      brightness: {
        type: Number
      },
      isAnimating: {
        type: Boolean
      },
      error: {
        type: String
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
  }
  initializeProperties() {
    this.currentTime = this.formatTime(new Date);
    this.brightness = BRIGHTNESS_NIGHT_MODE;
    this.isAnimating = !1;
    this.error = null;
    this.updateTimer = null;
    this.fadeTimer = null;
  }
  static get styles() {
    return nightModeStyles;
  }
  connectedCallback() {
    super.connectedCallback();
    this.startTimeUpdate();
    this.startFadeAnimation();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimeUpdate();
    this.stopFadeAnimation();
  }
  startTimeUpdate() {
    this.updateTime();
    this.updateTimer = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  stopTimeUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
  startFadeAnimation() {
    this.fadeTimer = setInterval((() => {
      this.isAnimating = !this.isAnimating;
      this.requestUpdate();
    }), 20 * TIMING_NIGHT_MODE_TRANSITION_DELAY);
  }
  stopFadeAnimation() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
  updateTime() {
    try {
      var now = new Date;
      this.currentTime = this.formatTime(now);
      this.error = null;
    } catch (error) {
      console.error('Error updating time:', error);
      this.error = 'Error updating time';
    }
    this.requestUpdate();
  }
  formatTime(date) {
    return date.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, '');
  }
  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }
  handleTouchMove(e) {
    if (this.touchStartY) {
      var currentY = e.touches[0].clientY;
      this.touchStartY - currentY > 50 && this.dispatchEvent(new CustomEvent('exit-night-mode', {
        bubbles: !0,
        composed: !0
      }));
    }
  }
  handleTouchEnd() {
    this.touchStartY = null;
  }
  getAnimationClass() {
    return this.isAnimating ? 'fade-dim' : '';
  }
  renderTime() {
    return html(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral([ '<div class="night-time ', '">', '</div>' ])), this.getAnimationClass(), this.currentTime);
  }
  renderError() {
    return this.error ? html(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : null;
  }
  render() {
    return html(_templateObject3$2 || (_templateObject3$2 = _taggedTemplateLiteral([ '\n      <div\n        class="night-mode"\n        @touchstart="', '"\n        @touchmove="', '"\n        @touchend="', '"\n      >\n        ', ' ', '\n      </div>\n    ' ])), this.handleTouchStart, this.handleTouchMove, this.handleTouchEnd, this.renderTime(), this.renderError());
  }
  setBrightness(value) {
    this.brightness = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_NIGHT_MODE, value));
    this.requestUpdate();
  }
  forceUpdate() {
    this.updateTime();
  }
  toggleAnimation() {
    this.fadeTimer ? this.stopFadeAnimation() : this.startFadeAnimation();
  }
  handleError(error) {
    this.error = error.message;
    this.requestUpdate();
    var errorEvent = new CustomEvent('night-mode-error', {
      detail: {
        error: error
      },
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(errorEvent);
  }
});

var _templateObject$1, _templateObject2$1, _templateObject3$1, _templateObject4$1, _templateObject5$1, _templateObject6$1, _templateObject7$1, _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, controlsStyles = css$1(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral([ '\n  :host {\n    display: block;\n    position: relative;\n    width: 100%;\n    height: 100%;\n    --overlay-height: 120px;\n    --icon-size: 50px;\n    --border-radius: 20px;\n    --transition-timing: 0.3s ease-in-out;\n    font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n  }\n\n  /* Base Control Container */\n  .controls-container {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    z-index: 1000;\n    touch-action: none;\n  }\n\n  /* Main Overlay */\n  .overlay {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: var(--overlay-height);\n    background-color: rgba(255, 255, 255, 0.95);\n    color: #333;\n    box-sizing: border-box;\n    transition: transform var(--transition-timing);\n    transform: translateY(100%);\n    z-index: 1000;\n    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    border-top-left-radius: var(--border-radius);\n    border-top-right-radius: var(--border-radius);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n  }\n\n  .overlay.show {\n    transform: translateY(0);\n  }\n\n  /* Icon Container */\n  .icon-container {\n    width: 100%;\n    height: 100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n\n  .icon-row {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    width: 85%;\n    max-width: 500px;\n  }\n\n  /* Icon Buttons */\n  .icon-button {\n    background: none;\n    border: none;\n    cursor: pointer;\n    color: #333;\n    padding: 10px;\n    border-radius: 50%;\n    transition: background-color 0.2s ease, transform 0.2s ease;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    position: relative;\n    outline: none;\n  }\n\n  .icon-button:hover {\n    background-color: rgba(0, 0, 0, 0.1);\n  }\n\n  .icon-button:active {\n    transform: scale(0.95);\n  }\n\n  .icon-button:focus-visible {\n    box-shadow: 0 0 0 2px #333;\n  }\n\n  iconify-icon {\n    font-size: var(--icon-size);\n    display: block;\n    width: var(--icon-size);\n    height: var(--icon-size);\n    transition: transform 0.2s ease;\n  }\n\n  /* Brightness and Volume Cards */\n  .brightness-card,\n  .volume-card {\n    position: fixed;\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n    background-color: rgba(255, 255, 255, 0.95);\n    border-radius: var(--border-radius);\n    padding: 40px 20px;\n    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n    z-index: 1001;\n    transform: translateY(calc(100% + 20px));\n    transition: transform var(--transition-timing);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n    max-width: 600px;\n    margin: 0 auto;\n  }\n\n  .brightness-card.show,\n  .volume-card.show {\n    transform: translateY(0);\n  }\n\n  /* Control Sliders */\n  .brightness-control,\n  .volume-control {\n    display: flex;\n    align-items: center;\n    width: 100%;\n  }\n\n  .brightness-dots-container,\n  .volume-dots-container {\n    flex-grow: 1;\n    margin-right: 10px;\n    padding: 0 10px;\n    touch-action: none;\n  }\n\n  .brightness-dots,\n  .volume-dots {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    height: 30px;\n    position: relative;\n  }\n\n  /* Dots */\n  .brightness-dot,\n  .volume-dot {\n    width: 12px;\n    height: 12px;\n    border-radius: 50%;\n    background-color: #d1d1d1;\n    transition: background-color 0.2s ease, transform 0.2s ease;\n    cursor: pointer;\n    position: relative;\n  }\n\n  .brightness-dot.active,\n  .volume-dot.active {\n    background-color: #333;\n    transform: scale(1.1);\n  }\n\n  /* Value Display */\n  .brightness-value,\n  .volume-value {\n    min-width: 60px;\n    text-align: right;\n    font-size: 40px;\n    color: black;\n    font-weight: 300;\n    margin-right: 20px;\n    transition: color 0.2s ease;\n  }\n\n  /* Progress Bar */\n  .progress-bar {\n    position: absolute;\n    left: 0;\n    top: 50%;\n    transform: translateY(-50%);\n    height: 2px;\n    background-color: #333;\n    transition: width 0.1s ease-out;\n  }\n\n  /* Loading States */\n  .loading {\n    opacity: 0.5;\n    pointer-events: none;\n  }\n\n  @keyframes pulse {\n    0%,\n    100% {\n      opacity: 0.5;\n    }\n    50% {\n      opacity: 0.8;\n    }\n  }\n\n  .loading .brightness-dot,\n  .loading .volume-dot {\n    animation: pulse 1.5s infinite;\n  }\n\n  /* Error States */\n  .error-message {\n    position: fixed;\n    bottom: 100px;\n    left: 50%;\n    transform: translateX(-50%);\n    background-color: rgba(255, 59, 48, 0.9);\n    color: white;\n    padding: 8px 16px;\n    border-radius: 8px;\n    font-size: 14px;\n    z-index: 1002;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n    animation: slideUp 0.3s ease-out;\n  }\n\n  @keyframes slideUp {\n    from {\n      transform: translate(-50%, 20px);\n      opacity: 0;\n    }\n    to {\n      transform: translate(-50%, 0);\n      opacity: 1;\n    }\n  }\n\n  /* Responsive Design */\n  @media (max-width: 768px) {\n    .icon-row {\n      width: 95%;\n    }\n\n    .brightness-card,\n    .volume-card {\n      bottom: 10px;\n      left: 10px;\n      right: 10px;\n      padding: 30px 15px;\n    }\n\n    .brightness-value,\n    .volume-value {\n      font-size: 32px;\n      min-width: 50px;\n      margin-right: 15px;\n    }\n  }\n\n  @media (max-width: 480px) {\n    --overlay-height: 100px;\n    --icon-size: 40px;\n\n    .brightness-dot,\n    .volume-dot {\n      width: 10px;\n      height: 10px;\n    }\n\n    .brightness-value,\n    .volume-value {\n      font-size: 28px;\n      min-width: 40px;\n      margin-right: 10px;\n    }\n  }\n\n  /* Dark Mode Support */\n  @media (prefers-color-scheme: dark) {\n    .overlay,\n    .brightness-card,\n    .volume-card {\n      background-color: rgba(30, 30, 30, 0.95);\n    }\n\n    .icon-button {\n      color: white;\n    }\n\n    .brightness-dot,\n    .volume-dot {\n      background-color: #666;\n    }\n\n    .brightness-dot.active,\n    .volume-dot.active {\n      background-color: white;\n    }\n\n    .brightness-value,\n    .volume-value {\n      color: white;\n    }\n\n    .progress-bar {\n      background-color: white;\n    }\n  }\n\n  /* High Contrast Mode */\n  @media (prefers-contrast: more) {\n    .overlay,\n    .brightness-card,\n    .volume-card {\n      background-color: black;\n    }\n\n    .icon-button {\n      color: white;\n    }\n\n    .brightness-dot,\n    .volume-dot {\n      border: 1px solid white;\n    }\n\n    .brightness-value,\n    .volume-value {\n      color: white;\n    }\n  }\n\n  /* Reduced Motion */\n  @media (prefers-reduced-motion: reduce) {\n    .overlay,\n    .brightness-card,\n    .volume-card {\n      transition: none;\n    }\n\n    .icon-button,\n    .brightness-dot,\n    .volume-dot {\n      transition: none;\n    }\n\n    .loading .brightness-dot,\n    .loading .volume-dot {\n      animation: none;\n    }\n  }\n\n  /* Touch Screen Optimization */\n  @media (hover: none) {\n    .icon-button:hover {\n      background-color: transparent;\n    }\n\n    .brightness-dots,\n    .volume-dots {\n      height: 44px;\n    }\n\n    .brightness-dot,\n    .volume-dot {\n      width: 16px;\n      height: 16px;\n    }\n  }\n\n  /* RTL Support */\n  :host([dir=\'rtl\']) {\n    .brightness-dots-container,\n    .volume-dots-container {\n      margin-right: 0;\n      margin-left: 10px;\n    }\n\n    .brightness-value,\n    .volume-value {\n      text-align: left;\n      margin-right: 0;\n      margin-left: 20px;\n    }\n  }\n\n  /* Accessibility */\n  .screen-reader-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n\n  /* Focus States */\n  :host(:focus-within) {\n    outline: none;\n  }\n\n  /* Print Mode */\n  @media print {\n    .controls-container {\n      display: none;\n    }\n  }\n' ])));

customElements.define('google-controls', class extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
      },
      showBrightnessCard: {
        type: Boolean
      },
      brightnessCardTransition: {
        type: String
      },
      volume: {
        type: Number
      },
      visualVolume: {
        type: Number
      },
      showVolumeCard: {
        type: Boolean
      },
      volumeCardTransition: {
        type: String
      },
      showOverlay: {
        type: Boolean
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      isAdjustingVolume: {
        type: Boolean
      },
      error: {
        type: String
      },
      touchStartY: {
        type: Number
      },
      longPressTimer: {
        type: Number
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
  }
  initializeProperties() {
    // Control values
    this.brightness = BRIGHTNESS_DEFAULT;
    this.visualBrightness = BRIGHTNESS_DEFAULT;
    this.volume = VOLUME_DEFAULT;
    this.visualVolume = VOLUME_DEFAULT;
    // UI states
        this.showOverlay = !1;
    this.showBrightnessCard = !1;
    this.showVolumeCard = !1;
    this.brightnessCardTransition = 'none';
    this.volumeCardTransition = 'none';
    // State flags
        this.isAdjustingBrightness = !1;
    this.isAdjustingVolume = !1;
    // Touch handling
        this.touchStartY = null;
    this.longPressTimer = null;
    // Timers
        this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.volumeCardDismissTimer = null;
    // Error handling
        this.error = null;
  }
  static get styles() {
    return controlsStyles;
  }
  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout((() => {
      this.dismissOverlay();
    }), TIMING_OVERLAY_DISMISS_TIMEOUT);
  }
  clearOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
      this.overlayDismissTimer = null;
    }
  }
  startBrightnessCardDismissTimer() {
    this.clearBrightnessCardDismissTimer();
    this.brightnessCardDismissTimer = setTimeout((() => {
      this.dismissBrightnessCard();
    }), TIMING_OVERLAY_DISMISS_TIMEOUT);
  }
  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }
  startVolumeCardDismissTimer() {
    this.clearVolumeCardDismissTimer();
    this.volumeCardDismissTimer = setTimeout((() => {
      this.dismissVolumeCard();
    }), TIMING_OVERLAY_DISMISS_TIMEOUT);
  }
  clearVolumeCardDismissTimer() {
    if (this.volumeCardDismissTimer) {
      clearTimeout(this.volumeCardDismissTimer);
      this.volumeCardDismissTimer = null;
    }
  }
  updateBrightnessValue(value) {
    var _this = this;
    return _asyncToGenerator((function*() {
      _this.isAdjustingBrightness = !0;
      _this.visualBrightness = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_MAX, Math.round(value)));
      try {
        yield _this.setBrightness(value);
        _this.startBrightnessCardDismissTimer();
      } catch (error) {
        _this.handleError('Failed to update brightness', error);
        _this.visualBrightness = _this.brightness;
      }
      _this.requestUpdate();
    }))();
  }
  setBrightness(value) {
    var _this2 = this;
    return _asyncToGenerator((function*() {
      if (!_this2.hass) throw new Error('Home Assistant not available');
      var brightnessValue = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_MAX, Math.round(value)));
      yield _this2.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: brightnessValue
        }
      });
      yield _this2.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });
      _this2.brightness = brightnessValue;
      _this2.emitBrightnessChange(brightnessValue);
    }))();
  }
  updateVolumeValue(value) {
    var _this3 = this;
    return _asyncToGenerator((function*() {
      _this3.isAdjustingVolume = !0;
      _this3.visualVolume = Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.round(value)));
      try {
        yield _this3.setVolume(value);
        _this3.startVolumeCardDismissTimer();
      } catch (error) {
        _this3.handleError('Failed to update volume', error);
        _this3.visualVolume = _this3.volume;
      }
      _this3.requestUpdate();
    }))();
  }
  setVolume(value) {
    var _this4 = this;
    return _asyncToGenerator((function*() {
      if (!_this4.hass) throw new Error('Home Assistant not available');
      var volumeValue = Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.round(value)));
      yield _this4.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_volume_level',
        data: {
          media_stream: 'system_stream',
          command: volumeValue
        }
      });
      yield _this4.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_play_sound',
        data: {
          sound: 'volume_change'
        }
      });
      _this4.volume = volumeValue;
      _this4.emitVolumeChange(volumeValue);
    }))();
  }
  handleBrightnessChange(e) {
    var clickedDot = e.target.closest('.brightness-dot');
    if (clickedDot) {
      var newBrightness = parseInt(clickedDot.dataset.value);
      this.updateBrightnessValue(newBrightness * (BRIGHTNESS_MAX / BRIGHTNESS_DOTS));
    }
  }
  handleVolumeChange(e) {
    var clickedDot = e.target.closest('.volume-dot');
    if (clickedDot) {
      var newVolume = parseInt(clickedDot.dataset.value);
      this.updateVolumeValue(newVolume * (VOLUME_MAX / VOLUME_DOTS));
    }
  }
  handleBrightnessDrag(e) {
    var _this5 = this;
    return _asyncToGenerator((function*() {
      var rect = _this5.shadowRoot.querySelector('.brightness-dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * BRIGHTNESS_DOTS);
      yield _this5.updateBrightnessValue(newValue * (BRIGHTNESS_MAX / BRIGHTNESS_DOTS));
    }))();
  }
  handleVolumeDrag(e) {
    var _this6 = this;
    return _asyncToGenerator((function*() {
      var rect = _this6.shadowRoot.querySelector('.volume-dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * VOLUME_DOTS);
      yield _this6.updateVolumeValue(newValue * (VOLUME_MAX / VOLUME_DOTS));
    }))();
  }
  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }
  handleTouchMove(e) {
    if (this.touchStartY) {
      e.preventDefault();
      var deltaY = this.touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) > UI_SWIPE_THRESHOLD) {
        if (deltaY > 0) {
          this.showOverlay = !0;
          this.startOverlayDismissTimer();
        } else this.dismissAllCards();
        this.touchStartY = null;
      }
    }
  }
  handleTouchEnd() {
    this.touchStartY = null;
  }
  handleSettingsIconTouchStart() {
    this.longPressTimer = setTimeout((() => {
      this.emitDebugToggle();
    }), TIMING_LONG_PRESS_TIMEOUT);
  }
  handleSettingsIconTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  dismissOverlay() {
    this.showOverlay = !1;
    this.clearOverlayDismissTimer();
    this.requestUpdate();
  }
  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = !1;
    this.clearBrightnessCardDismissTimer();
    this.requestUpdate();
  }
  dismissVolumeCard() {
    this.volumeCardTransition = 'transform 0.3s ease-in-out';
    this.showVolumeCard = !1;
    this.clearVolumeCardDismissTimer();
    this.requestUpdate();
  }
  dismissAllCards() {
    this.dismissOverlay();
    this.dismissBrightnessCard();
    this.dismissVolumeCard();
  }
  toggleBrightnessCard() {
    if (this.showBrightnessCard) this.dismissBrightnessCard(); else {
      this.showOverlay = !1;
      this.showVolumeCard = !1;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = !0;
      this.startBrightnessCardDismissTimer();
    }
    this.requestUpdate();
  }
  toggleVolumeCard() {
    if (this.showVolumeCard) this.dismissVolumeCard(); else {
      this.showOverlay = !1;
      this.showBrightnessCard = !1;
      this.volumeCardTransition = 'none';
      this.showVolumeCard = !0;
      this.startVolumeCardDismissTimer();
    }
    this.requestUpdate();
  }
  emitBrightnessChange(value) {
    var event = new CustomEvent('brightness-change', {
      detail: {
        brightness: value
      },
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(event);
  }
  emitVolumeChange(value) {
    var event = new CustomEvent('volume-change', {
      detail: {
        volume: value
      },
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(event);
  }
  emitDebugToggle() {
    var event = new CustomEvent('debug-toggle', {
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(event);
  }
  handleError(message, error) {
    console.error(message, error);
    this.error = message;
    this.requestUpdate();
    var errorEvent = new CustomEvent('control-error', {
      detail: {
        error: message
      },
      bubbles: !0,
      composed: !0
    });
    this.dispatchEvent(errorEvent);
  }
  renderOverlay() {
    return html(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral([ '\n      <div class="overlay ', '">\n        <div class="icon-container">\n          <div class="icon-row">\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon\n                icon="material-symbols-light:do-not-disturb-on-outline-rounded"\n              ></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>\n            </button>\n            <button\n              class="icon-button"\n              @touchstart="', '"\n              @touchend="', '"\n              @touchcancel="', '"\n            >\n              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>\n            </button>\n          </div>\n        </div>\n      </div>\n    ' ])), this.showOverlay ? 'show' : '', this.toggleBrightnessCard, this.toggleVolumeCard, this.handleSettingsIconTouchStart, this.handleSettingsIconTouchEnd, this.handleSettingsIconTouchEnd);
  }
  renderBrightnessCard() {
    var brightnessDisplayValue = Math.round(this.visualBrightness / (BRIGHTNESS_MAX / BRIGHTNESS_DOTS));
    return html(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral([ '\n      <div\n        class="brightness-card ', '"\n        style="transition: ', '"\n      >\n        <div class="brightness-control">\n          <div class="brightness-dots-container">\n            <div\n              class="brightness-dots"\n              @click="', '"\n              @mousedown="', '"\n              @mousemove="', '"\n              @touchstart="', '"\n              @touchmove="', '"\n            >\n              ', '\n            </div>\n          </div>\n          <span class="brightness-value">', '</span>\n        </div>\n      </div>\n    ' ])), this.showBrightnessCard ? 'show' : '', this.brightnessCardTransition, this.handleBrightnessChange, this.handleBrightnessDrag, (e => 1 === e.buttons && this.handleBrightnessDrag(e)), this.handleBrightnessDrag, this.handleBrightnessDrag, [ ...Array(BRIGHTNESS_DOTS) ].map(((_, i) => html(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral([ '\n                  <div\n                    class="brightness-dot ', '"\n                    data-value="', '"\n                  ></div>\n                ' ])), i < brightnessDisplayValue ? 'active' : '', i + 1))), brightnessDisplayValue);
  }
  renderVolumeCard() {
    var volumeDisplayValue = Math.round(this.visualVolume / (VOLUME_MAX / VOLUME_DOTS));
    return html(_templateObject4$1 || (_templateObject4$1 = _taggedTemplateLiteral([ '\n      <div\n        class="volume-card ', '"\n        style="transition: ', '"\n      >\n        <div class="volume-control">\n          <div class="volume-dots-container">\n            <div\n              class="volume-dots"\n              @click="', '"\n              @mousedown="', '"\n              @mousemove="', '"\n              @touchstart="', '"\n              @touchmove="', '"\n            >\n              ', '\n            </div>\n          </div>\n          <span class="volume-value">', '</span>\n        </div>\n      </div>\n    ' ])), this.showVolumeCard ? 'show' : '', this.volumeCardTransition, this.handleVolumeChange, this.handleVolumeDrag, (e => 1 === e.buttons && this.handleVolumeDrag(e)), this.handleVolumeDrag, this.handleVolumeDrag, [ ...Array(VOLUME_DOTS) ].map(((_, i) => html(_templateObject5$1 || (_templateObject5$1 = _taggedTemplateLiteral([ '\n                  <div\n                    class="volume-dot ', '"\n                    data-value="', '"\n                  ></div>\n                ' ])), i < volumeDisplayValue ? 'active' : '', i + 1))), volumeDisplayValue);
  }
  renderError() {
    return this.error ? html(_templateObject6$1 || (_templateObject6$1 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : null;
  }
  render() {
    return html(_templateObject7$1 || (_templateObject7$1 = _taggedTemplateLiteral([ '\n      <div\n        class="controls-container"\n        @touchstart="', '"\n        @touchmove="', '"\n        @touchend="', '"\n      >\n        ', '\n        ', '\n        ', ' ', '\n      </div>\n    ' ])), this.handleTouchStart, this.handleTouchMove, this.handleTouchEnd, this.renderError(), this.showBrightnessCard || this.showVolumeCard ? '' : this.renderOverlay(), this.renderBrightnessCard(), this.renderVolumeCard());
  }
  setBrightnessValue(value) {
    this.brightness = value;
    this.visualBrightness = value;
    this.requestUpdate();
  }
  setVolumeValue(value) {
    this.volume = value;
    this.visualVolume = value;
    this.requestUpdate();
  }
  showBrightnessAdjustment() {
    this.toggleBrightnessCard();
  }
  showVolumeAdjustment() {
    this.toggleVolumeCard();
  }
  hideAllControls() {
    this.dismissAllCards();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAllTimers();
  }
  clearAllTimers() {
    this.clearOverlayDismissTimer();
    this.clearBrightnessCardDismissTimer();
    this.clearVolumeCardDismissTimer();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
});

class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      error: {
        type: String
      },
      debugInfo: {
        type: Object
      },
      showDebugInfo: {
        type: Boolean
      },
      isNightMode: {
        type: Boolean
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
      },
      showBrightnessCard: {
        type: Boolean
      },
      brightnessCardTransition: {
        type: String
      },
      showOverlay: {
        type: Boolean
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      lastBrightnessUpdateTime: {
        type: Number
      },
      previousBrightness: {
        type: Number
      },
      touchStartY: {
        type: Number
      },
      longPressTimer: {
        type: Number
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    // Bind methods
        this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
  }
  initializeProperties() {
    this.error = null;
    this.debugInfo = {};
    this.showDebugInfo = !1;
    this.isNightMode = !1;
    this.brightness = 128;
 // Default brightness
        this.visualBrightness = 128;
    this.showBrightnessCard = !1;
    this.brightnessCardTransition = 'none';
    this.showOverlay = !1;
    this.isAdjustingBrightness = !1;
    this.lastBrightnessUpdateTime = 0;
    this.previousBrightness = 128;
    this.touchStartY = null;
    this.longPressTimer = null;
    this.overlayDismissTimer = null;
    this.brightnessCardDismissTimer = null;
    this.brightnessUpdateTimer = null;
    this.brightnessStabilizeTimer = null;
  }
  static get styles() {
    return [ sharedStyles, css(_templateObject || (_templateObject = _taggedTemplateLiteral([ '\n        :host {\n          --crossfade-time: 3s;\n          --overlay-height: 120px;\n          display: block;\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100vw;\n          height: 100vh;\n          z-index: 1;\n          font-family: "Product Sans Regular", sans-serif;\n          font-weight: 400;\n        }\n\n        weather-display {\n          position: fixed;\n          bottom: 30px;\n          left: 30px;\n          z-index: 2;\n        }\n\n        .overlay {\n          position: fixed;\n          bottom: 0;\n          left: 0;\n          width: 100%;\n          height: var(--overlay-height);\n          background-color: rgba(255, 255, 255, 0.95);\n          color: #333;\n          box-sizing: border-box;\n          transition: transform 0.3s ease-in-out;\n          transform: translateY(100%);\n          z-index: 4;\n          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);\n          display: flex;\n          flex-direction: column;\n          justify-content: center;\n          align-items: center;\n          border-top-left-radius: 20px;\n          border-top-right-radius: 20px;\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n        }\n\n        .overlay.show {\n          transform: translateY(0);\n        }\n\n        .icon-container {\n          width: 100%;\n          height: 100%;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n\n        .icon-row {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          width: 85%;\n          max-width: 500px;\n        }\n\n        .icon-button {\n          background: none;\n          border: none;\n          cursor: pointer;\n          color: #333;\n          padding: 10px;\n          border-radius: 50%;\n          transition: background-color 0.2s ease;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n\n        .icon-button:hover {\n          background-color: rgba(0, 0, 0, 0.1);\n        }\n\n        iconify-icon {\n          font-size: 50px;\n          display: block;\n          width: 50px;\n          height: 50px;\n        }\n\n        .brightness-card {\n          position: fixed;\n          bottom: 20px;\n          left: 20px;\n          right: 20px;\n          background-color: rgba(255, 255, 255, 0.95);\n          border-radius: 20px;\n          padding: 40px 20px;\n          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n          z-index: 3;\n          transform: translateY(calc(100% + 20px));\n          transition: transform 0.3s ease-in-out;\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n          max-width: 600px;\n          margin: 0 auto;\n        }\n\n        .brightness-card.show {\n          transform: translateY(0);\n        }\n\n        .brightness-control {\n          display: flex;\n          align-items: center;\n          width: 100%;\n        }\n\n        .brightness-dots-container {\n          flex-grow: 1;\n          margin-right: 10px;\n          padding: 0 10px;\n        }\n\n        .brightness-dots {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          height: 30px;\n        }\n\n        .brightness-dot {\n          width: 12px;\n          height: 12px;\n          border-radius: 50%;\n          background-color: #d1d1d1;\n          transition: background-color 0.2s ease;\n          cursor: pointer;\n        }\n\n        .brightness-dot.active {\n          background-color: #333;\n          transform: scale(1.1);\n        }\n\n        .brightness-value {\n          min-width: 60px;\n          text-align: right;\n          font-size: 40px;\n          color: black;\n          font-weight: 300;\n          margin-right: 20px;\n        }\n\n        .debug-info {\n          position: absolute;\n          top: 50%;\n          left: 50%;\n          transform: translate(-50%, -50%);\n          background: rgba(0, 0, 0, 0.7);\n          color: white;\n          padding: 16px;\n          font-size: 14px;\n          z-index: 10;\n          max-width: 80%;\n          max-height: 80%;\n          overflow: auto;\n          border-radius: 8px;\n        }\n\n        @media (max-width: 768px) {\n          .icon-row {\n            width: 95%;\n          }\n\n          .brightness-card {\n            bottom: 10px;\n            left: 10px;\n            right: 10px;\n            padding: 30px 15px;\n          }\n\n          .brightness-value {\n            font-size: 32px;\n            min-width: 50px;\n            margin-right: 15px;\n          }\n        }\n\n        @media (prefers-color-scheme: dark) {\n          .overlay,\n          .brightness-card {\n            background-color: rgba(30, 30, 30, 0.95);\n          }\n\n          .icon-button {\n            color: white;\n          }\n\n          .brightness-dot {\n            background-color: #666;\n          }\n\n          .brightness-dot.active {\n            background-color: white;\n          }\n\n          .brightness-value {\n            color: white;\n          }\n        }\n      ' ]))) ];
  }
  setConfig(config) {
    if (!config.image_url) throw new Error('You need to define an image_url');
    this.config = _objectSpread2(_objectSpread2({}, DEFAULT_CONFIG), config);
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo.config = this.config;
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.clearAllTimers();
  }
  clearAllTimers() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer);
    this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer);
    this.brightnessUpdateTimer && clearTimeout(this.brightnessUpdateTimer);
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer);
    this.longPressTimer && clearTimeout(this.longPressTimer);
  }
  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      if (Date.now() - this.lastBrightnessUpdateTime > 2e3) {
        // 2 seconds stabilization delay
        this.updateNightMode();
        this.updateBrightness();
      }
    }
  }
  updateScreenSize() {
    var pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
  }
  updateBrightnessValue(value) {
    var _this = this;
    return _asyncToGenerator((function*() {
      _this.isAdjustingBrightness = !0;
      _this.visualBrightness = Math.max(1, Math.min(255, Math.round(value)));
      _this.brightnessUpdateTimer && clearTimeout(_this.brightnessUpdateTimer);
      _this.brightnessStabilizeTimer && clearTimeout(_this.brightnessStabilizeTimer);
      _this.brightnessUpdateTimer = setTimeout( _asyncToGenerator((function*() {
        yield _this.setBrightness(value);
        _this.lastBrightnessUpdateTime = Date.now();
        _this.brightnessStabilizeTimer = setTimeout((() => {
          _this.isAdjustingBrightness = !1;
          _this.requestUpdate();
        }), 2e3);
      })), 250);
    }))();
  }
  setBrightness(value) {
    var _this2 = this;
    return _asyncToGenerator((function*() {
      var brightnessValue = Math.max(1, Math.min(255, Math.round(value)));
      try {
        yield _this2.hass.callService('notify', 'mobile_app_liam_s_room_display', {
          message: 'command_screen_brightness_level',
          data: {
            command: brightnessValue
          }
        });
        yield _this2.hass.callService('notify', 'mobile_app_liam_s_room_display', {
          message: 'command_update_sensors'
        });
        _this2.brightness = brightnessValue;
        _this2.isNightMode || (_this2.previousBrightness = brightnessValue);
      } catch (error) {
        console.error('Error setting brightness:', error);
        _this2.visualBrightness = _this2.brightness;
      }
      _this2.startBrightnessCardDismissTimer();
    }))();
  }
  updateNightMode() {
    var _this$hass;
    if (null !== (_this$hass = this.hass) && void 0 !== _this$hass && _this$hass.states['sensor.liam_room_display_light_sensor']) {
      var lightSensor = this.hass.states['sensor.liam_room_display_light_sensor'], newNightMode = 0 === parseInt(lightSensor.state);
      newNightMode !== this.isNightMode && this.handleNightModeTransition(newNightMode);
    }
  }
  handleNightModeTransition(newNightMode) {
    var _this3 = this;
    return _asyncToGenerator((function*() {
      if (newNightMode) {
        _this3.previousBrightness = _this3.brightness;
        yield _this3.toggleAutoBrightness(!1);
        yield new Promise((resolve => setTimeout(resolve, 100)));
        yield _this3.setBrightness(1);
        yield new Promise((resolve => setTimeout(resolve, 100)));
        yield _this3.toggleAutoBrightness(!0);
      } else {
        yield _this3.toggleAutoBrightness(!1);
        yield new Promise((resolve => setTimeout(resolve, 100)));
        yield _this3.setBrightness(_this3.previousBrightness);
      }
      _this3.isNightMode = newNightMode;
    }))();
  }
  toggleAutoBrightness(enabled) {
    var _this4 = this;
    return _asyncToGenerator((function*() {
      yield _this4.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_auto_screen_brightness',
        data: {
          command: enabled ? 'turn_on' : 'turn_off'
        }
      });
    }))();
  }
  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }
  handleTouchMove(e) {
    if (this.touchStartY) {
      e.preventDefault();
      var deltaY = this.touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.showOverlay = !0;
          this.startOverlayDismissTimer();
        } else this.dismissAllCards();
        this.touchStartY = null;
      }
    }
  }
  handleTouchEnd() {
    this.touchStartY = null;
  }
  handleBrightnessChange(e) {
    var clickedDot = e.target.closest('.brightness-dot');
    if (clickedDot) {
      var newBrightness = parseInt(clickedDot.dataset.value);
      this.updateBrightnessValue(25.5 * newBrightness);
    }
  }
  handleBrightnessDrag(e) {
    var _this5 = this;
    return _asyncToGenerator((function*() {
      var rect = _this5.shadowRoot.querySelector('.brightness-dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * 10);
      yield _this5.updateBrightnessValue(25.5 * newValue);
    }))();
  }
  startOverlayDismissTimer() {
    this.clearOverlayDismissTimer();
    this.overlayDismissTimer = setTimeout((() => {
      this.dismissOverlay();
    }), 1e4);
  }
  clearOverlayDismissTimer() {
    if (this.overlayDismissTimer) {
      clearTimeout(this.overlayDismissTimer);
      this.overlayDismissTimer = null;
    }
  }
  startBrightnessCardDismissTimer() {
    this.clearBrightnessCardDismissTimer();
    this.brightnessCardDismissTimer = setTimeout((() => {
      this.dismissBrightnessCard();
    }), 1e4);
  }
  clearBrightnessCardDismissTimer() {
    if (this.brightnessCardDismissTimer) {
      clearTimeout(this.brightnessCardDismissTimer);
      this.brightnessCardDismissTimer = null;
    }
  }
  dismissOverlay() {
    this.showOverlay = !1;
    this.clearOverlayDismissTimer();
    this.requestUpdate();
  }
  dismissBrightnessCard() {
    this.brightnessCardTransition = 'transform 0.3s ease-in-out';
    this.showBrightnessCard = !1;
    this.clearBrightnessCardDismissTimer();
    this.requestUpdate();
  }
  dismissAllCards() {
    this.dismissOverlay();
    this.dismissBrightnessCard();
  }
  toggleBrightnessCard() {
    if (this.showBrightnessCard) this.dismissBrightnessCard(); else {
      this.showOverlay = !1;
      this.brightnessCardTransition = 'none';
      this.showBrightnessCard = !0;
      this.startBrightnessCardDismissTimer();
    }
    this.requestUpdate();
  }
  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.requestUpdate();
  }
  handleSettingsIconTouchStart() {
    this.longPressTimer = setTimeout((() => {
      this.toggleDebugInfo();
    }), 1e3);
  }
  handleSettingsIconTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }
  renderOverlay() {
    return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral([ '\n      <div class="overlay ', '">\n        <div class="icon-container">\n          <div class="icon-row">\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button"\n              @touchstart="', '"\n              @touchend="', '"\n              @touchcancel="', '">\n              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>\n            </button>\n          </div>\n        </div>\n      </div>\n    ' ])), this.showOverlay ? 'show' : '', this.toggleBrightnessCard, this.handleSettingsIconTouchStart, this.handleSettingsIconTouchEnd, this.handleSettingsIconTouchEnd);
  }
  renderBrightnessCard() {
    var brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([ '\n      <div class="brightness-card ', '" \n           style="transition: ', '">\n        <div class="brightness-control">\n          <div class="brightness-dots-container">\n            <div class="brightness-dots" \n                 @click="', '"\n                 @mousedown="', '"\n                 @mousemove="', '"\n                 @touchstart="', '"\n                 @touchmove="', '">\n              ', '\n            </div>\n          </div>\n          <span class="brightness-value">', '</span>\n        </div>\n      </div>\n    ' ])), this.showBrightnessCard ? 'show' : '', this.brightnessCardTransition, this.handleBrightnessChange, this.handleBrightnessDrag, (e => 1 === e.buttons && this.handleBrightnessDrag(e)), this.handleBrightnessDrag, this.handleBrightnessDrag, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((value => html(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral([ '\n                <div class="brightness-dot ', '" \n                     data-value="', '">\n                </div>\n              ' ])), value <= brightnessDisplayValue ? 'active' : '', value))), brightnessDisplayValue);
  }
  renderDebugInfo() {
    return this.showDebugInfo ? html(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral([ '\n      <div class="debug-info">\n        <h2>Background Card Debug Info</h2>\n        <h3>Background Card Version: 23</h3>\n        <p><strong>Night Mode:</strong> ', '</p>\n        <p><strong>Screen Width:</strong> ', '</p>\n        <p><strong>Screen Height:</strong> ', '</p>\n        <p><strong>Device Pixel Ratio:</strong> ', '</p>\n        <p><strong>Is Adjusting Brightness:</strong> ', '</p>\n        <p><strong>Current Brightness:</strong> ', '</p>\n        <p><strong>Visual Brightness:</strong> ', '</p>\n        <p><strong>Last Brightness Update:</strong> ', '</p>\n        <p><strong>Error:</strong> ', '</p>\n        <h3>Config:</h3>\n        <pre>', '</pre>\n      </div>\n    ' ])), this.isNightMode, this.screenWidth, this.screenHeight, window.devicePixelRatio || 1, this.isAdjustingBrightness, this.brightness, this.visualBrightness, new Date(this.lastBrightnessUpdateTime).toLocaleString(), this.error, JSON.stringify(this.config, null, 2)) : null;
  }
  render() {
    return this.isNightMode ? html(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral([ '<night-mode .currentTime="', '"></night-mode>' ])), (new Date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !0
    }).replace(/\s?[AP]M/, '')) : html(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral([ '\n      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">\n      <background-rotator .config="', '"></background-rotator>\n      <weather-display .hass="', '"></weather-display>\n      ', '\n      ', '\n      ', '\n    ' ])), this.config, this.hass, this.showDebugInfo ? this.renderDebugInfo() : '', this.showBrightnessCard ? '' : this.renderOverlay(), this.renderBrightnessCard());
  }
}

customElements.define('google-card', GoogleCard);

// Register the custom card with Home Assistant
window.customCards = window.customCards || [];

window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: 'A Google Nest Hub-inspired card for Home Assistant',
  preview: !0,
  documentationURL: 'https://github.com/liamtw22/google-card'
});


//# sourceMappingURL=google-card.js.map
