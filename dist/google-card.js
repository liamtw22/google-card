// Google Card for Home Assistant
// MIT License

import { css, LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

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

var _templateObject$5, _templateObject$4, _templateObject2$4, _templateObject3$4, _templateObject$3, _templateObject2$3, _templateObject3$3, _templateObject4$2, _templateObject5$2, _templateObject6$2, _templateObject$2, _templateObject2$2, _templateObject3$2, _templateObject$1, _templateObject2$1, _templateObject3$1, _templateObject4$1, _templateObject5$1, _templateObject6$1, _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, sharedStyles = css(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral([ '\n  /* CSS Custom Properties (Variables) */\n  :host {\n    /* Colors */\n    --color-primary: #333333;\n    --color-primary-light: #666666;\n    --color-primary-dark: #000000;\n    --color-background: #ffffff;\n    --color-background-translucent: rgba(255, 255, 255, 0.95);\n    --color-error: #ff3b30;\n    --color-success: #34c759;\n    --color-warning: #ffcc00;\n    --color-info: #007aff;\n    --color-text: #333333;\n    --color-text-secondary: #666666;\n    --color-border: #e0e0e0;\n    --color-shadow: rgba(0, 0, 0, 0.1);\n    --color-overlay: rgba(0, 0, 0, 0.5);\n\n    /* Typography */\n    --font-family-primary: \'Product Sans Regular\', \'Rubik\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    --font-weight-light: 300;\n    --font-weight-regular: 400;\n    --font-weight-medium: 500;\n    --font-weight-bold: 600;\n    --font-size-xs: 12px;\n    --font-size-sm: 14px;\n    --font-size-base: 16px;\n    --font-size-lg: 18px;\n    --font-size-xl: 24px;\n    --font-size-2xl: 32px;\n    --font-size-3xl: 40px;\n    --font-size-4xl: 48px;\n    --line-height-tight: 1.2;\n    --line-height-normal: 1.5;\n    --line-height-relaxed: 1.8;\n\n    /* Spacing */\n    --spacing-0: 0;\n    --spacing-1: 4px;\n    --spacing-2: 8px;\n    --spacing-3: 12px;\n    --spacing-4: 16px;\n    --spacing-5: 20px;\n    --spacing-6: 24px;\n    --spacing-8: 32px;\n    --spacing-10: 40px;\n    --spacing-12: 48px;\n    --spacing-16: 64px;\n\n    /* Borders */\n    --border-radius-sm: 4px;\n    --border-radius-md: 8px;\n    --border-radius-lg: 16px;\n    --border-radius-xl: 24px;\n    --border-radius-full: 9999px;\n    --border-width-thin: 1px;\n    --border-width-normal: 2px;\n    --border-width-thick: 4px;\n\n    /* Shadows */\n    --shadow-sm: 0 1px 2px var(--color-shadow);\n    --shadow-md: 0 2px 4px var(--color-shadow);\n    --shadow-lg: 0 4px 8px var(--color-shadow);\n    --shadow-xl: 0 8px 16px var(--color-shadow);\n    --shadow-inner: inset 0 2px 4px var(--color-shadow);\n\n    /* Transitions */\n    --transition-duration-fast: 150ms;\n    --transition-duration-normal: 300ms;\n    --transition-duration-slow: 500ms;\n    --transition-timing-default: cubic-bezier(0.4, 0, 0.2, 1);\n    --transition-timing-in: cubic-bezier(0.4, 0, 1, 1);\n    --transition-timing-out: cubic-bezier(0, 0, 0.2, 1);\n\n    /* Z-index Scale */\n    --z-index-below: -1;\n    --z-index-base: 1;\n    --z-index-above: 10;\n    --z-index-floating: 100;\n    --z-index-overlay: 1000;\n    --z-index-modal: 2000;\n    --z-index-popover: 3000;\n    --z-index-tooltip: 4000;\n    --z-index-max: 9999;\n\n    /* Component Specific */\n    --header-height: 60px;\n    --footer-height: 80px;\n    --sidebar-width: 280px;\n    --modal-width: 500px;\n    --container-max-width: 1200px;\n    --card-padding: 20px;\n  }\n\n  /* Base Resets */\n  *,\n  *::before,\n  *::after {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n  }\n\n  /* Typography */\n  h1, h2, h3, h4, h5, h6, p {\n    margin: 0;\n    font-weight: var(--font-weight-regular);\n    line-height: var(--line-height-tight);\n  }\n\n  /* Accessibility */\n  .sr-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n\n  .focusable:focus {\n    outline: var(--border-width-normal) solid var(--color-primary);\n    outline-offset: var(--border-width-thin);\n  }\n\n  /* Layout Utilities */\n  .container {\n    width: 100%;\n    max-width: var(--container-max-width);\n    margin: 0 auto;\n    padding: 0 var(--spacing-4);\n  }\n\n  .flex {\n    display: flex;\n  }\n\n  .flex-col {\n    display: flex;\n    flex-direction: column;\n  }\n\n  .items-center {\n    align-items: center;\n  }\n\n  .justify-center {\n    justify-content: center;\n  }\n\n  .justify-between {\n    justify-content: space-between;\n  }\n\n  .gap-1 { gap: var(--spacing-1); }\n  .gap-2 { gap: var(--spacing-2); }\n  .gap-4 { gap: var(--spacing-4); }\n\n  /* Spacing Utilities */\n  .m-0 { margin: var(--spacing-0); }\n  .m-1 { margin: var(--spacing-1); }\n  .m-2 { margin: var(--spacing-2); }\n  .m-4 { margin: var(--spacing-4); }\n\n  .p-0 { padding: var(--spacing-0); }\n  .p-1 { padding: var(--spacing-1); }\n  .p-2 { padding: var(--spacing-2); }\n  .p-4 { padding: var(--spacing-4); }\n\n  /* Text Utilities */\n  .text-sm { font-size: var(--font-size-sm); }\n  .text-base { font-size: var(--font-size-base); }\n  .text-lg { font-size: var(--font-size-lg); }\n  .text-xl { font-size: var(--font-size-xl); }\n\n  .font-light { font-weight: var(--font-weight-light); }\n  .font-normal { font-weight: var(--font-weight-regular); }\n  .font-medium { font-weight: var(--font-weight-medium); }\n  .font-bold { font-weight: var(--font-weight-bold); }\n\n  .text-center { text-align: center; }\n  .text-left { text-align: left; }\n  .text-right { text-align: right; }\n\n  .truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n\n  /* Animation Classes */\n  .animate-fade {\n    animation: fade var(--transition-duration-normal) var(--transition-timing-default);\n  }\n\n  .animate-slide-up {\n    animation: slideUp var(--transition-duration-normal) var(--transition-timing-default);\n  }\n\n  @keyframes fade {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }\n\n  @keyframes slideUp {\n    from {\n      transform: translateY(20px);\n      opacity: 0;\n    }\n    to {\n      transform: translateY(0);\n      opacity: 1;\n    }\n  }\n\n  /* Dark Mode */\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --color-primary: #ffffff;\n      --color-primary-light: #cccccc;\n      --color-primary-dark: #999999;\n      --color-background: #000000;\n      --color-background-translucent: rgba(0, 0, 0, 0.95);\n      --color-text: #ffffff;\n      --color-text-secondary: #cccccc;\n      --color-border: #333333;\n      --color-shadow: rgba(0, 0, 0, 0.3);\n      --color-overlay: rgba(0, 0, 0, 0.7);\n    }\n  }\n\n  /* High Contrast Mode */\n  @media (prefers-contrast: more) {\n    :host {\n      --color-primary: #000000;\n      --color-background: #ffffff;\n      --color-text: #000000;\n      --color-shadow: #000000;\n      --shadow-sm: none;\n      --shadow-md: none;\n      --shadow-lg: none;\n      --shadow-xl: none;\n    }\n\n    .focusable:focus {\n      outline-width: var(--border-width-thick);\n    }\n  }\n\n  /* Reduced Motion */\n  @media (prefers-reduced-motion: reduce) {\n    *,\n    *::before,\n    *::after {\n      animation-duration: 0.01ms !important;\n      animation-iteration-count: 1 !important;\n      transition-duration: 0.01ms !important;\n      scroll-behavior: auto !important;\n    }\n\n    .animate-fade,\n    .animate-slide-up {\n      animation: none !important;\n    }\n  }\n\n  /* Print Styles */\n  @media print {\n    :host {\n      --color-primary: #000000;\n      --color-background: #ffffff;\n      --color-text: #000000;\n      --color-shadow: none;\n    }\n\n    * {\n      print-color-adjust: exact;\n      -webkit-print-color-adjust: exact;\n    }\n\n    .no-print {\n      display: none !important;\n    }\n  }\n\n  /* Touch Device Optimizations */\n  @media (hover: none) {\n    :host {\n      --spacing-4: 20px;\n      --spacing-6: 28px;\n    }\n\n    .focusable:focus {\n      outline: none;\n    }\n  }\n\n  /* RTL Support */\n  :host([dir=\'rtl\']) {\n    direction: rtl;\n  }\n\n  /* Responsive Breakpoints */\n  @media (max-width: 1280px) {\n    :host {\n      --container-max-width: 1024px;\n    }\n  }\n\n  @media (max-width: 1024px) {\n    :host {\n      --container-max-width: 768px;\n      --sidebar-width: 240px;\n    }\n  }\n\n  @media (max-width: 768px) {\n    :host {\n      --container-max-width: 100%;\n      --header-height: 50px;\n      --footer-height: 60px;\n      --card-padding: 16px;\n    }\n  }\n\n  @media (max-width: 640px) {\n    :host {\n      --font-size-xl: 20px;\n      --font-size-2xl: 28px;\n      --font-size-3xl: 36px;\n      --spacing-8: 24px;\n      --spacing-10: 32px;\n      --spacing-12: 40px;\n    }\n  }\n' ]))), TIMING_OVERLAY_DISMISS_TIMEOUT = 1e4, TIMING_LONG_PRESS_TIMEOUT = 1e3, TIMING_NIGHT_MODE_TRANSITION_DELAY = 100, BRIGHTNESS_DEFAULT = 128, BRIGHTNESS_MAX = 255, BRIGHTNESS_MIN = 1, BRIGHTNESS_DOTS = 10, BRIGHTNESS_NIGHT_MODE = 1, VOLUME_DEFAULT = 50, VOLUME_MAX = 100, VOLUME_MIN = 0, VOLUME_DOTS = 10, UI_SWIPE_THRESHOLD = 50, AQI_COLORS = {
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
      },
      displayTime: {
        type: Number
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
    this.displayTime = DEFAULT_CONFIG.display_time;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.error = null;
    this.imageList = [];
    this.currentImageIndex = -1;
    this.imageUpdateInterval = null;
    this.imageListUpdateInterval = null;
  }
  static get styles() {
    return [ sharedStyles, css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '\n        :host {\n          display: block;\n          position: relative;\n          width: 100%;\n          height: 100%;\n          overflow: hidden;\n          background-color: black;\n        }\n\n        .background-container {\n          position: absolute;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background-color: black;\n          z-index: 1;\n        }\n\n        .background-image {\n          position: absolute;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background-size: cover;\n          background-position: center;\n          background-repeat: no-repeat;\n          will-change: opacity, transform;\n          transition-property: opacity;\n          transition-timing-function: ease-in-out;\n          transform: translateZ(0);\n          backface-visibility: hidden;\n          -webkit-backface-visibility: hidden;\n          image-rendering: -webkit-optimize-contrast;\n          image-rendering: crisp-edges;\n        }\n\n        .error-message {\n          position: absolute;\n          top: 50%;\n          left: 50%;\n          transform: translate(-50%, -50%);\n          background-color: var(--color-error);\n          color: white;\n          padding: var(--spacing-4);\n          border-radius: var(--border-radius-md);\n          font-size: var(--font-size-base);\n          text-align: center;\n          z-index: 2;\n          max-width: 80%;\n        }\n      ' ]))) ];
  }
  connectedCallback() {
    var _superprop_getConnectedCallback = () => super.connectedCallback, _this = this;
    return _asyncToGenerator((function*() {
      _superprop_getConnectedCallback().call(_this);
      window.addEventListener('resize', _this.boundUpdateScreenSize);
      yield _this.initializeImageList();
      yield _this.startImageRotation();
    }))();
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
    this.screenWidth = Math.ceil(window.innerWidth * pixelRatio);
    this.screenHeight = Math.ceil(window.innerHeight * pixelRatio);
    // Force image update when screen size changes
        this.updateImage();
    this.dispatchEvent(new CustomEvent('screen-size-update', {
      bubbles: !0,
      composed: !0,
      detail: {
        width: this.screenWidth,
        height: this.screenHeight
      }
    }));
    this.requestUpdate();
  }
  getImageUrl(template) {
    var pixelRatio = window.devicePixelRatio || 1, width = 100 * Math.ceil(this.screenWidth * pixelRatio / 100), height = 100 * Math.ceil(this.screenHeight * pixelRatio / 100), timestamp_ms = Date.now(), timestamp = Math.floor(timestamp_ms / 1e3);
    // Multiply dimensions by pixel ratio and round up to nearest 100 for better caching
        return template.replace(/\${width}/g, width).replace(/\${height}/g, height).replace(/\${timestamp_ms}/g, timestamp_ms).replace(/\${timestamp}/g, timestamp);
  }
  initializeImageList() {
    var _this2 = this;
    return _asyncToGenerator((function*() {
      var _this2$config;
      if (null !== (_this2$config = _this2.config) && void 0 !== _this2$config && _this2$config.image_url) try {
        var imageUrl = _this2.getImageUrl(_this2.config.image_url);
        _this2.imageList = [ imageUrl ];
        _this2.currentImageIndex = -1;
        _this2.error = null;
        // Load initial image
                yield _this2.preloadImage(imageUrl);
      } catch (error) {
        console.error('Error initializing image list:', error);
        _this2.error = 'Error initializing images';
      } else _this2.error = 'No image URL configured';
    }))();
  }
  startImageRotation() {
    var _this3 = this;
    return _asyncToGenerator((function*() {
      try {
        yield _this3.updateImage();
 // Initial image load
                _this3.imageUpdateInterval = setInterval((() => {
          _this3.updateImage();
        }), 1e3 * _this3.displayTime);
      } catch (error) {
        console.error('Error starting image rotation:', error);
        _this3.error = 'Error starting image rotation';
        _this3.requestUpdate();
      }
    }))();
  }
  updateImage() {
    var _this4 = this;
    return _asyncToGenerator((function*() {
      if (_this4.isTransitioning) console.log('Skipping update - transition in progress'); else try {
        var newImage = yield _this4.getNextImage();
        if (newImage) {
          yield _this4.transitionToNewImage(newImage);
          yield _this4.preloadNextImage();
        }
      } catch (error) {
        console.error('Error updating image:', error);
        _this4.error = 'Error updating image: '.concat(error.message);
        _this4.requestUpdate();
      }
    }))();
  }
  getNextImage() {
    var _this5 = this;
    return _asyncToGenerator((function*() {
      var _this5$config;
      if (null === (_this5$config = _this5.config) || void 0 === _this5$config || !_this5$config.image_url) throw new Error('No image URL configured');
      // Generate a new image URL with current timestamp
            var nextImageUrl = _this5.getImageUrl(_this5.config.image_url);
      try {
        // Ensure the image is loaded before returning
        yield _this5.preloadImage(nextImageUrl);
        return nextImageUrl;
      } catch (error) {
        throw new Error('Failed to load image: '.concat(nextImageUrl));
      }
    }))();
  }
  preloadImage(url) {
    return _asyncToGenerator((function*() {
      return url ? new Promise(((resolve, reject) => {
        var img = new Image;
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to load image: '.concat(url)));
        img.src = url;
      })) : null;
    }))();
  }
  transitionToNewImage(newImage) {
    var _this6 = this;
    return _asyncToGenerator((function*() {
      if (_this6.isTransitioning) console.log('Transition already in progress'); else {
        _this6.isTransitioning = !0;
        try {
          // Set new image
          'A' === _this6.activeImage ? _this6.imageB = newImage : _this6.imageA = newImage;
          // Force a reflow before changing opacity
                    _this6.requestUpdate();
          yield _this6.updateComplete;
          yield new Promise((resolve => setTimeout(resolve, 50)));
          // Switch active image
                    _this6.activeImage = 'A' === _this6.activeImage ? 'B' : 'A';
          // Wait for transition to complete
                    yield new Promise((resolve => setTimeout(resolve, 1e3 * _this6.crossfadeTime + 50)));
        } finally {
          _this6.isTransitioning = !1;
          _this6.requestUpdate();
        }
      }
    }))();
  }
  preloadNextImage() {
    var _this7 = this;
    return _asyncToGenerator((function*() {
      var _this7$config;
      if (null !== (_this7$config = _this7.config) && void 0 !== _this7$config && _this7$config.image_url) try {
        var nextImageUrl = _this7.getImageUrl(_this7.config.image_url);
        _this7.preloadedImage = yield _this7.preloadImage(nextImageUrl);
      } catch (error) {
        console.error('Error preloading next image:', error);
        _this7.preloadedImage = '';
      }
    }))();
  }
  setConfig(config) {
    this.config = config;
    this.crossfadeTime = config.crossfade_time || DEFAULT_CONFIG.crossfade_time;
    this.displayTime = config.display_time || DEFAULT_CONFIG.display_time;
    this.initializeImageList();
    this.requestUpdate();
  }
  render() {
    var _this$config, imageFit = (null === (_this$config = this.config) || void 0 === _this$config ? void 0 : _this$config.image_fit) || DEFAULT_CONFIG.image_fit;
    return html(_templateObject2$4 || (_templateObject2$4 = _taggedTemplateLiteral([ '\n      <div class="background-container">\n        ', '\n        <div\n          class="background-image"\n          style="\n            background-image: url(\'', '\');\n            opacity: ', ';\n            transition-duration: ', 's;\n            background-size: ', ';\n            image-rendering: -webkit-optimize-contrast;\n            image-rendering: crisp-edges;\n          "\n        ></div>\n        <div\n          class="background-image"\n          style="\n            background-image: url(\'', '\');\n            opacity: ', ';\n            transition-duration: ', 's;\n            background-size: ', ';\n            image-rendering: -webkit-optimize-contrast;\n            image-rendering: crisp-edges;\n          "\n        ></div>\n      </div>\n    ' ])), this.error ? html(_templateObject3$4 || (_templateObject3$4 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : '', this.imageA || '', 'A' === this.activeImage ? 1 : 0, this.crossfadeTime, imageFit, this.imageB || '', 'B' === this.activeImage ? 1 : 0, this.crossfadeTime, imageFit);
  }
  // Public methods for external control
  forceImageUpdate() {
    var _this8 = this;
    return _asyncToGenerator((function*() {
      yield _this8.updateImage();
    }))();
  }
  pauseRotation() {
    this.clearTimers();
  }
  resumeRotation() {
    this.startImageRotation();
  }
});

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
      },
      updateTimer: {
        type: Object
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }
  bindMethods() {
    this.updateWeather = this.updateWeather.bind(this);
    this.updateDateTime = this.updateDateTime.bind(this);
    this.handleWeatherIconError = this.handleWeatherIconError.bind(this);
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
    return css(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral([ '\n      :host {\n        display: block;\n        position: relative;\n        font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n        -webkit-font-smoothing: antialiased;\n        -moz-osx-font-smoothing: grayscale;\n      }\n\n      .weather-component {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        color: white;\n        width: 100%;\n        max-width: 400px;\n        padding: 10px;\n        box-sizing: border-box;\n        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .left-column {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-start;\n        overflow: hidden;\n      }\n\n      .date {\n        font-size: 25px;\n        margin-bottom: 5px;\n        font-weight: 400;\n        margin-left: 10px;\n        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);\n        white-space: nowrap;\n        text-overflow: ellipsis;\n        transition: font-size 0.3s ease;\n      }\n\n      .time {\n        font-size: 90px;\n        line-height: 1;\n        font-weight: 500;\n        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);\n        margin-left: 8px;\n        transition: font-size 0.3s ease;\n      }\n\n      .right-column {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-end;\n        min-width: 120px;\n      }\n\n      .weather-info {\n        display: flex;\n        align-items: center;\n        margin-top: 10px;\n        font-weight: 500;\n        margin-right: -5px;\n        transition: all 0.3s ease;\n      }\n\n      .weather-icon {\n        width: 50px;\n        height: 50px;\n        margin-right: 8px;\n        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));\n        transition: all 0.3s ease;\n      }\n\n      .temperature {\n        font-size: 35px;\n        font-weight: 500;\n        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);\n        transition: font-size 0.3s ease;\n      }\n\n      .aqi {\n        font-size: 20px;\n        padding: 7px 10px 5px;\n        border-radius: 8px;\n        font-weight: 500;\n        margin-top: 2px;\n        margin-left: 25px;\n        align-self: flex-end;\n        min-width: 70px;\n        text-align: center;\n        transition: all 0.3s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .error-message {\n        background-color: rgba(255, 59, 48, 0.9);\n        color: white;\n        padding: 8px 12px;\n        border-radius: 6px;\n        font-size: 14px;\n        margin-top: 8px;\n        text-align: center;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      @media (max-width: 480px) {\n        .date {\n          font-size: 20px;\n          margin-left: 8px;\n        }\n\n        .time {\n          font-size: 70px;\n          margin-left: 6px;\n        }\n\n        .weather-icon {\n          width: 40px;\n          height: 40px;\n        }\n\n        .temperature {\n          font-size: 28px;\n        }\n\n        .aqi {\n          font-size: 16px;\n          padding: 5px 8px 4px;\n          margin-left: 15px;\n          min-width: 60px;\n        }\n      }\n\n      @media (max-width: 360px) {\n        .date {\n          font-size: 18px;\n        }\n\n        .time {\n          font-size: 60px;\n        }\n\n        .weather-icon {\n          width: 35px;\n          height: 35px;\n        }\n\n        .temperature {\n          font-size: 24px;\n        }\n\n        .aqi {\n          font-size: 14px;\n          min-width: 50px;\n        }\n      }\n\n      @media (prefers-contrast: more) {\n        .weather-component {\n          text-shadow: none;\n        }\n\n        .aqi {\n          border: 2px solid rgba(255, 255, 255, 0.8);\n        }\n      }\n\n      @media (prefers-reduced-motion: reduce) {\n        .date,\n        .time,\n        .weather-info,\n        .weather-icon,\n        .temperature,\n        .aqi {\n          transition: none;\n        }\n      }\n\n      @media print {\n        .weather-component {\n          color: black;\n          text-shadow: none;\n        }\n\n        .aqi {\n          print-color-adjust: exact;\n          -webkit-print-color-adjust: exact;\n        }\n      }\n\n      @media (prefers-color-scheme: dark) {\n        .error-message {\n          background-color: rgba(255, 59, 48, 0.7);\n        }\n      }\n    ' ])));
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
    this.updateWeather();
    this.updateDateTime();
    this.updateTimer = setInterval((() => {
      this.updateDateTime();
      Date.now() - this.lastUpdate >= 6e4 && 
      // Update weather every minute
      this.updateWeather();
    }), 1e3);
 // Update time every second
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
    this.date = now.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
    this.time = now.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS).replace(/\s?[AP]M/, '');
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
    var temp = weatherEntity.attributes.temperature;
    this.temperature = ''.concat(Math.round(temp), '°');
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
    if (isNaN(aqiValue)) return AQI_COLORS.HAZARDOUS.color;
    for (var [level, data] of Object.entries(AQI_COLORS)) if (!data.max || aqiValue <= data.max) return data.color;
    return AQI_COLORS.HAZARDOUS.color;
  }
  getAqiDescription(aqi) {
    var aqiValue = parseInt(aqi);
    return isNaN(aqiValue) ? 'Unknown' : aqiValue <= AQI_COLORS.GOOD.max ? 'Good' : aqiValue <= AQI_COLORS.MODERATE.max ? 'Moderate' : aqiValue <= AQI_COLORS.UNHEALTHY_SENSITIVE.max ? 'Unhealthy for Sensitive Groups' : aqiValue <= AQI_COLORS.UNHEALTHY.max ? 'Unhealthy' : aqiValue <= AQI_COLORS.VERY_UNHEALTHY.max ? 'Very Unhealthy' : 'Hazardous';
  }
  handleWeatherIconError(e) {
    console.error('Error loading weather icon');
    e.target.src = 'https://basmilius.github.io/weather-icons/production/fill/all/'.concat(WEATHER_ICONS.default, '.svg');
  }
  renderDateTime() {
    return html(_templateObject2$3 || (_templateObject2$3 = _taggedTemplateLiteral([ '\n      <div class="left-column">\n        <div class="date">', '</div>\n        <div class="time">', '</div>\n      </div>\n    ' ])), this.date, this.time);
  }
  renderWeatherInfo() {
    return html(_templateObject3$3 || (_templateObject3$3 = _taggedTemplateLiteral([ '\n      <div class="weather-info">\n        <img\n          src="https://basmilius.github.io/weather-icons/production/fill/all/', '.svg"\n          class="weather-icon"\n          alt="Weather icon for ', '"\n          @error=', '\n        />\n        <span class="temperature">', '</span>\n      </div>\n    ' ])), this.weatherIcon, this.weatherState, this.handleWeatherIconError, this.temperature);
  }
  renderAQI() {
    if (!this.aqi) return null;
    var aqiColor = this.getAqiColor(this.aqi), aqiDescription = this.getAqiDescription(this.aqi);
    return html(_templateObject4$2 || (_templateObject4$2 = _taggedTemplateLiteral([ '\n      <div class="aqi" \n           style="background-color: ', '" \n           title="', '">\n        ', ' AQI\n      </div>\n    ' ])), aqiColor, aqiDescription, this.aqi);
  }
  renderError() {
    return this.error ? html(_templateObject5$2 || (_templateObject5$2 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : null;
  }
  render() {
    return html(_templateObject6$2 || (_templateObject6$2 = _taggedTemplateLiteral([ '\n      <div class="weather-component">\n        ', '\n        <div class="right-column">\n          ', '\n          ', '\n        </div>\n        ', '\n      </div>\n    ' ])), this.renderDateTime(), this.renderWeatherInfo(), this.renderAQI(), this.renderError());
  }
  // Public methods for external control
  forceUpdate() {
    this.updateWeather();
    this.updateDateTime();
  }
  refreshWeather() {
    this.updateWeather();
  }
  updateTime() {
    this.updateDateTime();
  }
});

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
      },
      touchStartY: {
        type: Number
      },
      updateTimer: {
        type: Object
      },
      fadeTimer: {
        type: Object
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }
  initializeProperties() {
    this.currentTime = this.formatTime(new Date);
    this.brightness = BRIGHTNESS_NIGHT_MODE;
    this.isAnimating = !1;
    this.error = null;
    this.touchStartY = null;
    this.updateTimer = null;
    this.fadeTimer = null;
  }
  bindMethods() {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.updateTime = this.updateTime.bind(this);
  }
  static get styles() {
    return css(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral([ '\n      :host {\n        display: block;\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100vw;\n        height: 100vh;\n        background-color: black;\n        z-index: 1000;\n        font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n        -webkit-font-smoothing: antialiased;\n        -moz-osx-font-smoothing: grayscale;\n      }\n\n      .night-mode {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        flex-direction: column;\n        background-color: black;\n        transition: background-color 0.5s ease-in-out;\n        user-select: none;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n      }\n\n      .night-time {\n        color: white;\n        font-size: 35vw;\n        font-weight: 400;\n        line-height: 1;\n        text-align: center;\n        opacity: 0.7;\n        transition: opacity 2s ease-in-out, font-size 0.3s ease-in-out;\n        margin: 0;\n        padding: 0;\n        letter-spacing: -0.02em;\n        text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);\n      }\n\n      .night-time.fade-dim {\n        opacity: 0.4;\n      }\n\n      .error-message {\n        position: absolute;\n        bottom: 20px;\n        left: 50%;\n        transform: translateX(-50%);\n        background-color: rgba(255, 59, 48, 0.8);\n        color: white;\n        padding: 8px 16px;\n        border-radius: 8px;\n        font-size: 14px;\n        opacity: 0;\n        transition: opacity 0.3s ease-in-out;\n        text-align: center;\n        max-width: 80%;\n      }\n\n      .error-message.visible {\n        opacity: 1;\n      }\n\n      .touch-indicator {\n        position: absolute;\n        width: 100%;\n        height: 100%;\n        pointer-events: none;\n        opacity: 0;\n        transition: opacity 0.3s ease-in-out;\n        background: radial-gradient(\n          circle at var(--touch-x, 50%) var(--touch-y, 50%),\n          rgba(255, 255, 255, 0.1) 0%,\n          transparent 60%\n        );\n      }\n\n      .touch-indicator.active {\n        opacity: 1;\n      }\n\n      .swipe-hint {\n        position: absolute;\n        bottom: 40px;\n        left: 50%;\n        transform: translateX(-50%);\n        color: rgba(255, 255, 255, 0.3);\n        font-size: 16px;\n        opacity: 0;\n        transition: opacity 0.3s ease-in-out;\n      }\n\n      .swipe-hint.visible {\n        opacity: 1;\n        animation: fadeInOut 3s infinite;\n      }\n\n      @keyframes fadeInOut {\n        0%, 100% { opacity: 0; }\n        50% { opacity: 1; }\n      }\n\n      @media (max-width: 768px) {\n        .night-time {\n          font-size: 45vw;\n        }\n      }\n\n      @media (max-width: 480px) {\n        .night-time {\n          font-size: 55vw;\n        }\n        \n        .swipe-hint {\n          bottom: 30px;\n          font-size: 14px;\n        }\n      }\n\n      @media (max-height: 480px) {\n        .night-time {\n          font-size: 25vh;\n        }\n      }\n\n      @media (prefers-contrast: more) {\n        .night-time {\n          opacity: 1;\n          text-shadow: none;\n        }\n\n        .night-time.fade-dim {\n          opacity: 0.8;\n        }\n      }\n\n      @media (prefers-reduced-motion: reduce) {\n        .night-time,\n        .night-time.fade-dim,\n        .swipe-hint {\n          transition: none;\n          animation: none;\n        }\n      }\n\n      @media (orientation: landscape) and (max-height: 500px) {\n        .night-time {\n          font-size: 25vh;\n        }\n\n        .swipe-hint {\n          bottom: 20px;\n        }\n      }\n\n      @media print {\n        .night-mode {\n          background-color: white !important;\n        }\n\n        .night-time {\n          color: black !important;\n          opacity: 1 !important;\n          text-shadow: none !important;\n        }\n\n        .swipe-hint,\n        .error-message,\n        .touch-indicator {\n          display: none !important;\n        }\n      }\n    ' ])));
  }
  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
    this.startTimeUpdate();
    this.startFadeAnimation();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.stopTimeUpdate();
    this.stopFadeAnimation();
  }
  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }
  cleanupEventListeners() {
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
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
    // Update touch indicator position
        var touchIndicator = this.shadowRoot.querySelector('.touch-indicator');
    if (touchIndicator) {
      touchIndicator.style.setProperty('--touch-x', ''.concat(e.touches[0].clientX, 'px'));
      touchIndicator.style.setProperty('--touch-y', ''.concat(e.touches[0].clientY, 'px'));
      touchIndicator.classList.add('active');
    }
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
    // Remove touch indicator
        var touchIndicator = this.shadowRoot.querySelector('.touch-indicator');
    touchIndicator && touchIndicator.classList.remove('active');
  }
  setBrightness(value) {
    this.brightness = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_NIGHT_MODE, value));
    this.requestUpdate();
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
  render() {
    return html(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral([ '\n      <div class="night-mode"\n           @touchstart="', '"\n           @touchmove="', '"\n           @touchend="', '">\n        <div class="night-time ', '">', '</div>\n        <div class="touch-indicator"></div>\n        <div class="swipe-hint ', '">Swipe up to exit night mode</div>\n        ', '\n      </div>\n    ' ])), this.handleTouchStart, this.handleTouchMove, this.handleTouchEnd, this.isAnimating ? 'fade-dim' : '', this.currentTime, this.error ? '' : 'visible', this.error ? html(_templateObject3$2 || (_templateObject3$2 = _taggedTemplateLiteral([ '<div class="error-message visible">', '</div>' ])), this.error) : '');
  }
  // Public methods for external control
  forceUpdate() {
    this.updateTime();
  }
  updateTimeDisplay() {
    this.updateTime();
  }
  setNightBrightness(value) {
    this.setBrightness(value);
  }
  toggleFadeAnimation() {
    this.toggleAnimation();
  }
});

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
    this.bindMethods();
  }
  bindMethods() {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleVolumeDrag = this.handleVolumeDrag.bind(this);
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
    return css(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral([ '\n      :host {\n        --overlay-height: 120px;\n        --icon-size: 50px;\n        --border-radius: 20px;\n        --transition-timing: 0.3s ease-in-out;\n        font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;\n      }\n\n      .controls-container {\n        position: fixed;\n        bottom: 0;\n        left: 0;\n        width: 100%;\n        z-index: 1000;\n        touch-action: none;\n      }\n\n      .overlay {\n        position: fixed;\n        bottom: 0;\n        left: 0;\n        width: 100%;\n        height: var(--overlay-height);\n        background-color: rgba(255, 255, 255, 0.95);\n        color: #333;\n        box-sizing: border-box;\n        transition: transform var(--transition-timing);\n        transform: translateY(100%);\n        z-index: 1000;\n        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);\n        display: flex;\n        flex-direction: column;\n        justify-content: center;\n        align-items: center;\n        border-top-left-radius: var(--border-radius);\n        border-top-right-radius: var(--border-radius);\n        backdrop-filter: blur(10px);\n        -webkit-backdrop-filter: blur(10px);\n      }\n\n      .overlay.show {\n        transform: translateY(0);\n      }\n\n      .icon-container {\n        width: 100%;\n        height: 100%;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n      }\n\n      .icon-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        width: 85%;\n        max-width: 500px;\n      }\n\n      .icon-button {\n        background: none;\n        border: none;\n        cursor: pointer;\n        color: #333;\n        padding: 10px;\n        border-radius: 50%;\n        transition: background-color 0.2s ease;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .icon-button:hover {\n        background-color: rgba(0, 0, 0, 0.1);\n      }\n\n      iconify-icon {\n        font-size: var(--icon-size);\n        display: block;\n        width: var(--icon-size);\n        height: var(--icon-size);\n      }\n\n      .control-card {\n        position: fixed;\n        bottom: 20px;\n        left: 20px;\n        right: 20px;\n        background-color: rgba(255, 255, 255, 0.95);\n        border-radius: var(--border-radius);\n        padding: 40px 20px;\n        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n        z-index: 1001;\n        transform: translateY(calc(100% + 20px));\n        transition: transform var(--transition-timing);\n        backdrop-filter: blur(10px);\n        -webkit-backdrop-filter: blur(10px);\n        max-width: 600px;\n        margin: 0 auto;\n      }\n\n      .control-card.show {\n        transform: translateY(0);\n      }\n\n      .control-container {\n        display: flex;\n        align-items: center;\n        width: 100%;\n      }\n\n      .dots-container {\n        flex-grow: 1;\n        margin-right: 10px;\n        padding: 0 10px;\n      }\n\n      .dots {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        height: 30px;\n      }\n\n      .dot {\n        width: 12px;\n        height: 12px;\n        border-radius: 50%;\n        background-color: #d1d1d1;\n        transition: background-color 0.2s ease, transform 0.2s ease;\n        cursor: pointer;\n      }\n\n      .dot.active {\n        background-color: #333;\n        transform: scale(1.1);\n      }\n\n      .value-display {\n        min-width: 60px;\n        text-align: right;\n        font-size: 40px;\n        color: black;\n        font-weight: 300;\n        margin-right: 20px;\n      }\n\n      .error-message {\n        position: fixed;\n        bottom: 100px;\n        left: 50%;\n        transform: translateX(-50%);\n        background-color: rgba(255, 59, 48, 0.9);\n        color: white;\n        padding: 8px 16px;\n        border-radius: 8px;\n        font-size: 14px;\n        z-index: 1002;\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n      }\n\n      @media (prefers-color-scheme: dark) {\n        .overlay,\n        .control-card {\n          background-color: rgba(30, 30, 30, 0.95);\n        }\n\n        .icon-button {\n          color: white;\n        }\n\n        .dot {\n          background-color: #666;\n        }\n\n        .dot.active {\n          background-color: white;\n        }\n\n        .value-display {\n          color: white;\n        }\n      }\n\n      @media (max-width: 768px) {\n        .icon-row {\n          width: 95%;\n        }\n\n        .control-card {\n          bottom: 10px;\n          left: 10px;\n          right: 10px;\n          padding: 30px 15px;\n        }\n\n        .value-display {\n          font-size: 32px;\n          min-width: 50px;\n          margin-right: 15px;\n        }\n      }\n\n      @media (prefers-reduced-motion: reduce) {\n        .overlay,\n        .control-card,\n        .dot {\n          transition: none;\n        }\n      }\n    ' ])));
  }
  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.clearAllTimers();
  }
  setupEventListeners() {
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
  }
  cleanupEventListeners() {
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
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
  updateVolumeValue(value) {
    var _this2 = this;
    return _asyncToGenerator((function*() {
      _this2.isAdjustingVolume = !0;
      _this2.visualVolume = Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.round(value)));
      try {
        yield _this2.setVolume(value);
        _this2.startVolumeCardDismissTimer();
      } catch (error) {
        _this2.handleError('Failed to update volume', error);
        _this2.visualVolume = _this2.volume;
      }
      _this2.requestUpdate();
    }))();
  }
  setBrightness(value) {
    var _this3 = this;
    return _asyncToGenerator((function*() {
      if (!_this3.hass) throw new Error('Home Assistant not available');
      var brightnessValue = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_MAX, Math.round(value)));
      yield _this3.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_screen_brightness_level',
        data: {
          command: brightnessValue
        }
      });
      yield _this3.hass.callService('notify', 'mobile_app_liam_s_room_display', {
        message: 'command_update_sensors'
      });
      _this3.brightness = brightnessValue;
      _this3.emitBrightnessChange(brightnessValue);
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
    var clickedDot = e.target.closest('.dot');
    if (clickedDot) {
      var newBrightness = parseInt(clickedDot.dataset.value);
      this.updateBrightnessValue(newBrightness * (BRIGHTNESS_MAX / BRIGHTNESS_DOTS));
    }
  }
  handleVolumeChange(e) {
    var clickedDot = e.target.closest('.dot');
    if (clickedDot) {
      var newVolume = parseInt(clickedDot.dataset.value);
      this.updateVolumeValue(newVolume * (VOLUME_MAX / VOLUME_DOTS));
    }
  }
  handleBrightnessDrag(e) {
    var rect = this.shadowRoot.querySelector('.dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * BRIGHTNESS_DOTS);
    this.updateBrightnessValue(newValue * (BRIGHTNESS_MAX / BRIGHTNESS_DOTS));
  }
  handleVolumeDrag(e) {
    var rect = this.shadowRoot.querySelector('.dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * VOLUME_DOTS);
    this.updateVolumeValue(newValue * (VOLUME_MAX / VOLUME_DOTS));
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
    return html(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral([ '\n      <div class="overlay ', '">\n        <div class="icon-container">\n          <div class="icon-row">\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button"\n              @touchstart="', '"\n              @touchend="', '"\n              @touchcancel="', '">\n              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>\n            </button>\n          </div>\n        </div>\n      </div>\n    ' ])), this.showOverlay ? 'show' : '', this.toggleBrightnessCard, this.toggleVolumeCard, this.handleSettingsIconTouchStart, this.handleSettingsIconTouchEnd, this.handleSettingsIconTouchEnd);
  }
  renderControlCard(type) {
    var isVolume = 'volume' === type, value = isVolume ? this.visualVolume : this.visualBrightness, max = isVolume ? VOLUME_MAX : BRIGHTNESS_MAX, dots = isVolume ? VOLUME_DOTS : BRIGHTNESS_DOTS, displayValue = Math.round(value / (max / dots)), show = isVolume ? this.showVolumeCard : this.showBrightnessCard, transition = isVolume ? this.volumeCardTransition : this.brightnessCardTransition, handler = isVolume ? this.handleVolumeChange : this.handleBrightnessChange, dragHandler = isVolume ? this.handleVolumeDrag : this.handleBrightnessDrag;
    return html(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral([ '\n      <div class="control-card ', '" \n           style="transition: ', '">\n        <div class="control-container">\n          <div class="dots-container">\n            <div class="dots" \n                 @click="', '"\n                 @mousedown="', '"\n                 @mousemove="', '"\n                 @touchstart="', '"\n                 @touchmove="', '">\n              ', '\n            </div>\n          </div>\n          <span class="value-display">', '</span>\n        </div>\n      </div>\n    ' ])), show ? 'show' : '', transition, handler, dragHandler, (e => 1 === e.buttons && dragHandler(e)), dragHandler, dragHandler, [ ...Array(dots) ].map(((_, i) => html(_templateObject4$1 || (_templateObject4$1 = _taggedTemplateLiteral([ '\n                <div class="dot ', '" \n                     data-value="', '">\n                </div>\n              ' ])), i < displayValue ? 'active' : '', i + 1))), displayValue);
  }
  renderError() {
    return this.error ? html(_templateObject5$1 || (_templateObject5$1 = _taggedTemplateLiteral([ '<div class="error-message">', '</div>' ])), this.error) : null;
  }
  render() {
    return html(_templateObject6$1 || (_templateObject6$1 = _taggedTemplateLiteral([ '\n      <div class="controls-container">\n        ', '\n        ', '\n        ', '\n        ', '\n      </div>\n    ' ])), this.renderError(), this.showBrightnessCard || this.showVolumeCard ? '' : this.renderOverlay(), this.showBrightnessCard ? this.renderControlCard('brightness') : '', this.showVolumeCard ? this.renderControlCard('volume') : '');
  }
  // Public methods for external control
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
      },
      screenWidth: {
        type: Number
      },
      screenHeight: {
        type: Number
      }
    };
  }
  constructor() {
    super();
    this.initializeProperties();
    this.bindMethods();
  }
  initializeProperties() {
    // Properties initialization
    this.error = null;
    this.debugInfo = {};
    this.showDebugInfo = !1;
    this.isNightMode = !1;
    this.brightness = 128;
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
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }
  bindMethods() {
    this.boundUpdateScreenSize = this.updateScreenSize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
    this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this);
    this.handleScreenSizeUpdate = this.handleScreenSizeUpdate.bind(this);
    this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this);
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
  }
  setConfig(config) {
    if (!config.image_url) throw new Error('You need to define an image_url');
    this.config = _objectSpread2(_objectSpread2({}, DEFAULT_CONFIG), config);
    this.showDebugInfo = this.config.show_debug;
    this.debugInfo = {
      config: this.config,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundUpdateScreenSize);
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchmove', this.handleTouchMove);
    this.addEventListener('touchend', this.handleTouchEnd);
    this.addEventListener('screen-size-update', this.handleScreenSizeUpdate);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundUpdateScreenSize);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchmove', this.handleTouchMove);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.removeEventListener('screen-size-update', this.handleScreenSizeUpdate);
    this.clearAllTimers();
  }
  clearAllTimers() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer);
    this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer);
    this.brightnessUpdateTimer && clearTimeout(this.brightnessUpdateTimer);
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer);
    this.longPressTimer && clearTimeout(this.longPressTimer);
  }
  updateScreenSize() {
    var pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio);
    this.screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.debugInfo = _objectSpread2(_objectSpread2({}, this.debugInfo), {}, {
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight
    });
    this.requestUpdate();
  }
  handleScreenSizeUpdate(e) {
    this.screenWidth = e.detail.width;
    this.screenHeight = e.detail.height;
    this.debugInfo = _objectSpread2(_objectSpread2({}, this.debugInfo), {}, {
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight
    });
    this.requestUpdate();
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
  updated(changedProperties) {
    if (changedProperties.has('hass') && !this.isAdjustingBrightness) {
      if (Date.now() - this.lastBrightnessUpdateTime > 2e3) {
        this.updateNightMode();
        this.updateBrightness();
      }
    }
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
    var rect = this.shadowRoot.querySelector('.brightness-dots').getBoundingClientRect(), x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX, relativeX = Math.max(0, Math.min(x - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * 10);
    this.updateBrightnessValue(25.5 * newValue);
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
  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }
  renderDebugInfo() {
    return this.showDebugInfo ? html(_templateObject || (_templateObject = _taggedTemplateLiteral([ '\n      <div class="debug-info">\n        <h2>Background Card Debug Info</h2>\n        <h3>Background Card Version: 23</h3>\n        <p><strong>Night Mode:</strong> ', '</p>\n        <p><strong>Screen Width:</strong> ', '</p>\n        <p><strong>Screen Height:</strong> ', '</p>\n        <p><strong>Device Pixel Ratio:</strong> ', '</p>\n        <p><strong>Is Adjusting Brightness:</strong> ', '</p>\n        <p><strong>Current Brightness:</strong> ', '</p>\n        <p><strong>Visual Brightness:</strong> ', '</p>\n        <p><strong>Last Brightness Update:</strong> ', '</p>\n        <p><strong>Error:</strong> ', '</p>\n        <h3>Config:</h3>\n        <pre>', '</pre>\n      </div>\n    ' ])), this.isNightMode, this.screenWidth, this.screenHeight, window.devicePixelRatio || 1, this.isAdjustingBrightness, this.brightness, this.visualBrightness, new Date(this.lastBrightnessUpdateTime).toLocaleString(), this.error, JSON.stringify(this.config, null, 2)) : null;
  }
  renderOverlay() {
    return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral([ '\n      <div class="overlay ', '">\n        <div class="icon-container">\n          <div class="icon-row">\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button"\n              @touchstart="', '"\n              @touchend="', '"\n              @touchcancel="', '">\n              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>\n            </button>\n          </div>\n        </div>\n      </div>\n    ' ])), this.showOverlay ? 'show' : '', this.toggleBrightnessCard, this.handleSettingsIconTouchStart, this.handleSettingsIconTouchEnd, this.handleSettingsIconTouchEnd);
  }
  renderBrightnessCard() {
    var brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([ '\n      <div class="brightness-card ', '" \n           style="transition: ', '">\n        <div class="brightness-control">\n          <div class="brightness-dots-container">\n            <div class="brightness-dots" \n                 @click="', '"\n                 @mousedown="', '"\n                 @mousemove="', '"\n                 @touchstart="', '"\n                 @touchmove="', '">\n              ', '\n            </div>\n          </div>\n          <span class="brightness-value">', '</span>\n        </div>\n      </div>\n    ' ])), this.showBrightnessCard ? 'show' : '', this.brightnessCardTransition, this.handleBrightnessChange, this.handleBrightnessDrag, (e => 1 === e.buttons && this.handleBrightnessDrag(e)), this.handleBrightnessDrag, this.handleBrightnessDrag, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((value => html(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral([ '\n                <div class="brightness-dot ', '" \n                     data-value="', '">\n                </div>\n              ' ])), value <= brightnessDisplayValue ? 'active' : '', value))), brightnessDisplayValue);
  }
  static get styles() {
    return [ sharedStyles, css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral([ '\n        :host {\n          --crossfade-time: 3s;\n          --overlay-height: 120px;\n          display: block;\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100vw;\n          height: 100vh;\n          z-index: 1;\n          font-family: var(--font-family-primary);\n          font-weight: var(--font-weight-regular);\n        }\n\n        .debug-info {\n          position: absolute;\n          top: 50%;\n          left: 50%;\n          transform: translate(-50%, -50%);\n          background: rgba(0, 0, 0, 0.8);\n          color: white;\n          padding: var(--spacing-4);\n          border-radius: var(--border-radius-lg);\n          font-size: var(--font-size-sm);\n          z-index: var(--z-index-overlay);\n          max-width: 80%;\n          max-height: 80%;\n          overflow: auto;\n        }\n\n        .debug-info h2,\n        .debug-info h3 {\n          margin-bottom: var(--spacing-2);\n        }\n\n        .debug-info p {\n          margin-bottom: var(--spacing-1);\n        }\n\n        .debug-info pre {\n          margin-top: var(--spacing-2);\n          white-space: pre-wrap;\n          word-break: break-all;\n        }\n\n        .overlay {\n          position: fixed;\n          bottom: 0;\n          left: 0;\n          width: 100%;\n          height: var(--overlay-height);\n          background-color: var(--color-background-translucent);\n          color: var(--color-text);\n          box-sizing: border-box;\n          transition: transform var(--transition-duration-normal) var(--transition-timing-default);\n          transform: translateY(100%);\n          z-index: var(--z-index-floating);\n          box-shadow: var(--shadow-lg);\n          display: flex;\n          flex-direction: column;\n          justify-content: center;\n          align-items: center;\n          border-top-left-radius: var(--border-radius-lg);\n          border-top-right-radius: var(--border-radius-lg);\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n        }\n\n        .overlay.show {\n          transform: translateY(0);\n        }\n\n        .icon-container {\n          width: 100%;\n          height: 100%;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n\n        .icon-row {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          width: 85%;\n          max-width: 500px;\n        }\n\n        .icon-button {\n          background: none;\n          border: none;\n          cursor: pointer;\n          color: var(--color-text);\n          padding: var(--spacing-2);\n          border-radius: 50%;\n          transition: background-color var(--transition-duration-fast) var(--transition-timing-default);\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n\n        .icon-button:hover {\n          background-color: var(--color-overlay);\n        }\n\n        iconify-icon {\n          font-size: 50px;\n          display: block;\n          width: 50px;\n          height: 50px;\n        }\n\n        .brightness-card {\n          position: fixed;\n          bottom: var(--spacing-5);\n          left: var(--spacing-5);\n          right: var(--spacing-5);\n          background-color: var(--color-background-translucent);\n          border-radius: var(--border-radius-lg);\n          padding: var(--spacing-10) var(--spacing-5);\n          box-shadow: var(--shadow-lg);\n          z-index: var(--z-index-floating);\n          transform: translateY(calc(100% + var(--spacing-5)));\n          transition: transform var(--transition-duration-normal) var(--transition-timing-default);\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n          max-width: 600px;\n          margin: 0 auto;\n        }\n\n        .brightness-card.show {\n          transform: translateY(0);\n        }\n\n        .brightness-control {\n          display: flex;\n          align-items: center;\n          width: 100%;\n        }\n\n        .brightness-dots-container {\n          flex-grow: 1;\n          margin-right: var(--spacing-2);\n          padding: 0 var(--spacing-2);\n        }\n\n        .brightness-dots {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          height: 30px;\n        }\n\n        .brightness-dot {\n          width: 12px;\n          height: 12px;\n          border-radius: 50%;\n          background-color: var(--color-border);\n          transition: all var(--transition-duration-fast) var(--transition-timing-default);\n          cursor: pointer;\n        }\n\n        .brightness-dot.active {\n          background-color: var(--color-text);\n          transform: scale(1.1);\n        }\n\n        .brightness-value {\n          min-width: 60px;\n          text-align: right;\n          font-size: var(--font-size-3xl);\n          color: var(--color-text);\n          font-weight: var(--font-weight-light);\n          margin-right: var(--spacing-5);\n        }\n\n        @media (max-width: 768px) {\n          .icon-row {\n            width: 95%;\n          }\n\n          .brightness-card {\n            bottom: var(--spacing-2);\n            left: var(--spacing-2);\n            right: var(--spacing-2);\n            padding: var(--spacing-8) var(--spacing-4);\n          }\n\n          .brightness-value {\n            font-size: var(--font-size-2xl);\n            min-width: 50px;\n            margin-right: var(--spacing-4);\n          }\n        }\n\n        @media (prefers-reduced-motion: reduce) {\n          .overlay,\n          .brightness-card,\n          .brightness-dot {\n            transition: none;\n          }\n        }\n      ' ]))) ];
  }
  render() {
    return this.isNightMode ? html(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral([ '<night-mode .currentTime="', '"></night-mode>' ])), (new Date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !0
    }).replace(/\s?[AP]M/, '')) : html(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral([ '\n      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet">\n      <background-rotator \n        .config="', '"\n        .hass="', '"\n        @screen-size-update="', '"\n      ></background-rotator>\n      <weather-display .hass="', '"></weather-display>\n      ', '\n      ', '\n      ', '\n    ' ])), this.config, this.hass, this.handleScreenSizeUpdate, this.hass, this.showDebugInfo ? this.renderDebugInfo() : '', this.showBrightnessCard ? '' : this.renderOverlay(), this.renderBrightnessCard());
  }
}

customElements.define('google-card', GoogleCard);

window.customCards = window.customCards || [];

window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: 'A Google Nest Hub-inspired card for Home Assistant',
  preview: !0,
  documentationURL: 'https://github.com/liamtw22/google-card'
});


//# sourceMappingURL=google-card.js.map
