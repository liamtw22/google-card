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

css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '
          /* CSS Custom Properties (Variables) */
          :host {
            /* Colors */
            --color-primary: #333333;
            --color-primary-light: #666666;
            --color-primary-dark: #000000;
            --color-background: #ffffff;
            --color-background-translucent: rgba(255, 255, 255, 0.95);
            --color-error: #ff3b30;
            --color-success: #34c759;
            --color-warning: #ffcc00;
            --color-info: #007aff;
            --color-text: #333333;
            --color-text-secondary: #666666;
            --color-border: #e0e0e0;
            --color-shadow: rgba(0, 0, 0, 0.1);
            --color-overlay: rgba(0, 0, 0, 0.5);
            /* Typography */
            --font-family-primary: \'Product Sans Regular\', \'Rubik\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            --font-weight-light: 300;
            --font-weight-regular: 400;
            --font-weight-medium: 500;
            --font-weight-bold: 600;
            --font-size-xs: 12px;
            --font-size-sm: 14px;
            --font-size-base: 16px;
            --font-size-lg: 18px;
            --font-size-xl: 24px;
            --font-size-2xl: 32px;
            --font-size-3xl: 40px;
            --font-size-4xl: 48px;
            --line-height-tight: 1.2;
            --line-height-normal: 1.5;
            --line-height-relaxed: 1.8;
            /* Spacing */
            --spacing-0: 0;
            --spacing-1: 4px;
            --spacing-2: 8px;
            --spacing-3: 12px;
            --spacing-4: 16px;
            --spacing-5: 20px;
            --spacing-6: 24px;
            --spacing-8: 32px;
            --spacing-10: 40px;
            --spacing-12: 48px;
            --spacing-16: 64px;
            /* Borders */
            --border-radius-sm: 4px;
            --border-radius-md: 8px;
            --border-radius-lg: 16px;
            --border-radius-xl: 24px;
            --border-radius-full: 9999px;
            --border-width-thin: 1px;
            --border-width-normal: 2px;
            --border-width-thick: 4px;
            /* Shadows */
            --shadow-sm: 0 1px 2px var(--color-shadow);
            --shadow-md: 0 2px 4px var(--color-shadow);
            --shadow-lg: 0 4px 8px var(--color-shadow);
            --shadow-xl: 0 8px 16px var(--color-shadow);
            --shadow-inner: inset 0 2px 4px var(--color-shadow);
            /* Transitions */
            --transition-duration-fast: 150ms;
            --transition-duration-normal: 300ms;
            --transition-duration-slow: 500ms;
            --transition-timing-default: cubic-bezier(0.4, 0, 0.2, 1);
            --transition-timing-in: cubic-bezier(0.4, 0, 1, 1);
            --transition-timing-out: cubic-bezier(0, 0, 0.2, 1);
            /* Z-index Scale */
            --z-index-below: -1;
            --z-index-base: 1;
            --z-index-above: 10;
            --z-index-floating: 100;
            --z-index-overlay: 1000;
            --z-index-modal: 2000;
            --z-index-popover: 3000;
            --z-index-tooltip: 4000;
            --z-index-max: 9999;
            /* Component Specific */
            --header-height: 60px;
            --footer-height: 80px;
            --sidebar-width: 280px;
            --modal-width: 500px;
            --container-max-width: 1200px;
            --card-padding: 20px;
            /* Display Properties */
            --backdrop-blur: 10px;
            --image-rendering: -webkit-optimize-contrast;
          }
          /* Base Resets */
          *,
          *::before,
          *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          /* Typography */
          h1, h2, h3, h4, h5, h6, p {
            margin: 0;
            font-weight: var(--font-weight-regular);
            line-height: var(--line-height-tight);
          }
          /* Accessibility */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .focusable:focus-visible {
            outline: var(--border-width-normal) solid var(--color-primary);
            outline-offset: var(--border-width-thin);
          }
          /* Layout Utilities */
          .container {
            width: 100%;
            max-width: var(--container-max-width);
            margin: 0 auto;
            padding: 0 var(--spacing-4);
          }
          .flex {
            display: flex;
          }
          .flex-col {
            display: flex;
            flex-direction: column;
          }
          .items-center {
            align-items: center;
          }
          .justify-center {
            justify-content: center;
          }
          .justify-between {
            justify-content: space-between;
          }
          .gap-1 { gap: var(--spacing-1); }
          .gap-2 { gap: var(--spacing-2); }
          .gap-4 { gap: var(--spacing-4); }
          /* Spacing Utilities */
          .m-0 { margin: var(--spacing-0); }
          .m-1 { margin: var(--spacing-1); }
          .m-2 { margin: var(--spacing-2); }
          .m-4 { margin: var(--spacing-4); }
          .m-8 { margin: var(--spacing-8); }
          .p-0 { padding: var(--spacing-0); }
          .p-1 { padding: var(--spacing-1); }
          .p-2 { padding: var(--spacing-2); }
          .p-4 { padding: var(--spacing-4); }
          .p-8 { padding: var(--spacing-8); }
          /* Text Utilities */
          .text-xs { font-size: var(--font-size-xs); }
          .text-sm { font-size: var(--font-size-sm); }
          .text-base { font-size: var(--font-size-base); }
          .text-lg { font-size: var(--font-size-lg); }
          .text-xl { font-size: var(--font-size-xl); }
          .text-2xl { font-size: var(--font-size-2xl); }
          .text-3xl { font-size: var(--font-size-3xl); }
          .text-4xl { font-size: var(--font-size-4xl); }
          .font-light { font-weight: var(--font-weight-light); }
          .font-normal { font-weight: var(--font-weight-regular); }
          .font-medium { font-weight: var(--font-weight-medium); }
          .font-bold { font-weight: var(--font-weight-bold); }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          /* Visual Effects */
          .backdrop-blur {
            backdrop-filter: blur(var(--backdrop-blur));
            -webkit-backdrop-filter: blur(var(--backdrop-blur));
          }
          .optimize-contrast {
            image-rendering: var(--image-rendering);
          }
          .hardware-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
          /* Animation Classes */
          .animate-fade {
            animation: fade var(--transition-duration-normal) var(--transition-timing-default);
          }
          .animate-slide-up {
            animation: slideUp var(--transition-duration-normal) var(--transition-timing-default);
          }
          @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          /* Dark Mode */
          @media (prefers-color-scheme: dark) {
            :host {
              --color-primary: #ffffff;
              --color-primary-light: #cccccc;
              --color-primary-dark: #999999;
              --color-background: #000000;
              --color-background-translucent: rgba(0, 0, 0, 0.95);
              --color-text: #ffffff;
              --color-text-secondary: #cccccc;
              --color-border: #333333;
              --color-shadow: rgba(0, 0, 0, 0.3);
              --color-overlay: rgba(0, 0, 0, 0.7);
            }
          }
          /* High Contrast Mode */
          @media (prefers-contrast: more) {
            :host {
              --color-primary: #000000;
              --color-background: #ffffff;
              --color-text: #000000;
              --color-shadow: #000000;
              --shadow-sm: none;
              --shadow-md: none;
              --shadow-lg: none;
              --shadow-xl: none;
              --backdrop-blur: 0;
            }
            .focusable:focus-visible {
              outline-width: var(--border-width-thick);
            }
          }
          /* Reduced Motion */
          @media (prefers-reduced-motion: reduce) {
            :host {
              --transition-duration-fast: 0ms;
              --transition-duration-normal: 0ms;
              --transition-duration-slow: 0ms;
            }
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
            .animate-fade,
            .animate-slide-up {
              animation: none !important;
            }
          }
          /* Print Styles */
          @media print {
            :host {
              --color-primary: #000000;
              --color-background: #ffffff;
              --color-text: #000000;
              --color-shadow: none;
              --backdrop-blur: 0;
            }
            * {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
          /* Touch Device Optimizations */
          @media (hover: none) {
            :host {
              --spacing-4: 20px;
              --spacing-6: 28px;
            }
            .focusable:focus {
              outline: none;
            }
          }
          /* RTL Support */
          :host([dir=\'rtl\']) {
            direction: rtl;
          }
          /* Responsive Breakpoints */
          @media (max-width: 1280px) {
            :host {
              --container-max-width: 1024px;
            }
          }
          @media (max-width: 1024px) {
            :host {
              --container-max-width: 768px;
              --sidebar-width: 240px;
            }
          }
          @media (max-width: 768px) {
            :host {
              --container-max-width: 100%;
              --header-height: 50px;
              --footer-height: 60px;
              --card-padding: 16px;
              --font-size-4xl: 40px;
              --font-size-3xl: 32px;
              --font-size-2xl: 28px;
              --font-size-xl: 20px;
            }
          }
          @media (max-width: 640px) {
            :host {
              --spacing-8: 24px;
              --spacing-10: 32px;
              --spacing-12: 40px;
              --spacing-16: 48px;
            }
          }
          /* Battery Optimization */
          @media (prefers-reduced-data: reduce) {
            :host {
              --backdrop-blur: 0;
              --image-rendering: auto;
            }
          }
' ])))  GOOD: {
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
css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '
                :host {
                  display: block;
                  position: relative;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  background-color: black;
                }
                .background-container {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: black;
                  z-index: 1;
                }
                .background-image {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                  will-change: opacity, transform;
                  transition-property: opacity;
                  transition-timing-function: ease-in-out;
                  transform: translateZ(0);
                  backface-visibility: hidden;
                  -webkit-backface-visibility: hidden;
                  image-rendering: -webkit-optimize-contrast;
                  image-rendering: crisp-edges;
                }
                .error-message {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background-color: var(--color-error);
                  color: white;
                  padding: var(--spacing-4);
                  border-radius: var(--border-radius-md);
                  font-size: var(--font-size-base);
                  text-align: center;
                  z-index: 2;
                  max-width: 80%;
                }
' ])))  }
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
css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '
              :host {
                display: block;
                position: relative;
                font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              .weather-component {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                width: 100%;
                max-width: 400px;
                padding: 10px;
                box-sizing: border-box;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .left-column {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                overflow: hidden;
              }
              .date {
                font-size: 25px;
                margin-bottom: 5px;
                font-weight: 400;
                margin-left: 10px;
                text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
                white-space: nowrap;
                text-overflow: ellipsis;
                transition: font-size 0.3s ease;
              }
              .time {
                font-size: 90px;
                line-height: 1;
                font-weight: 500;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                margin-left: 8px;
                transition: font-size 0.3s ease;
              }
              .right-column {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                min-width: 120px;
              }
              .weather-info {
                display: flex;
                align-items: center;
                margin-top: 10px;
                font-weight: 500;
                margin-right: -5px;
                transition: all 0.3s ease;
              }
              .weather-icon {
                width: 50px;
                height: 50px;
                margin-right: 8px;
                filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
                transition: all 0.3s ease;
              }
              .temperature {
                font-size: 35px;
                font-weight: 500;
                text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
                transition: font-size 0.3s ease;
              }
              .aqi {
                font-size: 20px;
                padding: 7px 10px 5px;
                border-radius: 8px;
                font-weight: 500;
                margin-top: 2px;
                margin-left: 25px;
                align-self: flex-end;
                min-width: 70px;
                text-align: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .error-message {
                background-color: rgba(255, 59, 48, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                margin-top: 8px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              @media (max-width: 480px) {
                .date {
                  font-size: 20px;
                  margin-left: 8px;
                }
                .time {
                  font-size: 70px;
                  margin-left: 6px;
                }
                .weather-icon {
                  width: 40px;
                  height: 40px;
                }
                .temperature {
                  font-size: 28px;
                }
                .aqi {
                  font-size: 16px;
                  padding: 5px 8px 4px;
                  margin-left: 15px;
                  min-width: 60px;
                }
              }
              @media (max-width: 360px) {
                .date {
                  font-size: 18px;
                }
                .time {
                  font-size: 60px;
                }
                .weather-icon {
                  width: 35px;
                  height: 35px;
                }
                .temperature {
                  font-size: 24px;
                }
                .aqi {
                  font-size: 14px;
                  min-width: 50px;
                }
              }
              @media (prefers-contrast: more) {
                .weather-component {
                  text-shadow: none;
                }
                .aqi {
                  border: 2px solid rgba(255, 255, 255, 0.8);
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .date,
                .time,
                .weather-info,
                .weather-icon,
                .temperature,
                .aqi {
                  transition: none;
                }
              }
              @media print {
                .weather-component {
                  color: black;
                  text-shadow: none;
                }
                .aqi {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
              }
              @media (prefers-color-scheme: dark) {
                .error-message {
                  background-color: rgba(255, 59, 48, 0.7);
                }
              }
' ])))  }
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
css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '
              :host {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
                z-index: 1000;
                font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              .night-mode {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                background-color: black;
                transition: background-color 0.5s ease-in-out;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
              }
              .night-time {
                color: white;
                font-size: 35vw;
                font-weight: 400;
                line-height: 1;
                text-align: center;
                opacity: 0.7;
                transition: opacity 2s ease-in-out, font-size 0.3s ease-in-out;
                margin: 0;
                padding: 0;
                letter-spacing: -0.02em;
                text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
              }
              .night-time.fade-dim {
                opacity: 0.4;
              }
              .error-message {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 59, 48, 0.8);
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                text-align: center;
                max-width: 80%;
              }
              .error-message.visible {
                opacity: 1;
              }
              .touch-indicator {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                background: radial-gradient(
                  circle at var(--touch-x, 50%) var(--touch-y, 50%),
                  rgba(255, 255, 255, 0.1) 0%,
                  transparent 60%
                );
              }
              .touch-indicator.active {
                opacity: 1;
              }
              .swipe-hint {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                color: rgba(255, 255, 255, 0.3);
                font-size: 16px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
              }
              .swipe-hint.visible {
                opacity: 1;
                animation: fadeInOut 3s infinite;
              }
              @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
              }
              @media (max-width: 768px) {
                .night-time {
                  font-size: 45vw;
                }
              }
              @media (max-width: 480px) {
                .night-time {
                  font-size: 55vw;
                }
                .swipe-hint {
                  bottom: 30px;
                  font-size: 14px;
                }
              }
              @media (max-height: 480px) {
                .night-time {
                  font-size: 25vh;
                }
              }
              @media (prefers-contrast: more) {
                .night-time {
                  opacity: 1;
                  text-shadow: none;
                }
                .night-time.fade-dim {
                  opacity: 0.8;
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .night-time,
                .night-time.fade-dim,
                .swipe-hint {
                  transition: none;
                  animation: none;
                }
              }
              @media (orientation: landscape) and (max-height: 500px) {
                .night-time {
                  font-size: 25vh;
                }
                .swipe-hint {
                  bottom: 20px;
                }
              }
              @media print {
                .night-mode {
                  background-color: white !important;
                }
                .night-time {
                  color: black !important;
                  opacity: 1 !important;
                  text-shadow: none !important;
                }
                .swipe-hint,
                .error-message,
                .touch-indicator {
                  display: none !important;
                }
              }
' ])))  }
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
css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral([ '
              :host {
                --overlay-height: 120px;
                --icon-size: 50px;
                --border-radius: 20px;
                --transition-timing: 0.3s ease-in-out;
                font-family: \'Product Sans Regular\', \'Rubik\', sans-serif;
              }
              .controls-container {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 1000;
                touch-action: none;
              }
              .overlay {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: var(--overlay-height);
                background-color: rgba(255, 255, 255, 0.95);
                color: #333;
                box-sizing: border-box;
                transition: transform var(--transition-timing);
                transform: translateY(100%);
                z-index: 1000;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border-top-left-radius: var(--border-radius);
                border-top-right-radius: var(--border-radius);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
              }
              .overlay.show {
                transform: translateY(0);
              }
              .icon-container {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .icon-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 85%;
              }
              .icon-button {
                background: none;
                border: none;
                cursor: pointer;
                color: #333;
                padding: 10px;
                border-radius: 50%;
                transition: background-color 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .icon-button:hover {
                background-color: rgba(0, 0, 0, 0.1);
              }
              iconify-icon {
                font-size: var(--icon-size);
                display: block;
                width: var(--icon-size);
                height: var(--icon-size);
              }
              .control-card {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: var(--border-radius);
                padding: 40px 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                transform: translateY(calc(100% + 20px));
                transition: transform var(--transition-timing);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                max-width: 600px;
                margin: 0 auto;
              }
              .control-card.show {
                transform: translateY(0);
              }
              .control-container {
                display: flex;
                align-items: center;
                width: 100%;
              }
              .dots-container {
                flex-grow: 1;
                margin-right: 10px;
                padding: 0 10px;
              }
              .dots {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 30px;
              }
              .dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #d1d1d1;
                transition: background-color 0.2s ease, transform 0.2s ease;
                cursor: pointer;
              }
              .dot.active {
                background-color: #333;
                transform: scale(1.1);
              }
              .value-display {
                min-width: 60px;
                text-align: right;
                font-size: 40px;
                color: black;
                font-weight: 300;
                margin-right: 20px;
              }
              .error-message {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 59, 48, 0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 1002;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              }
              @media (prefers-color-scheme: dark) {
                .overlay,
                .control-card {
                  background-color: rgba(30, 30, 30, 0.95);
                }
                .icon-button {
                  color: white;
                }
                .dot {
                  background-color: #666;
                }
                .dot.active {
                  background-color: white;
                }
                .value-display {
                  color: white;
                }
              }
              @media (max-width: 768px) {
                .icon-row {
                  width: 95%;
                }
                .control-card {
                  bottom: 10px;
                  left: 10px;
                  right: 10px;
                  padding: 30px 15px;
                }
                .value-display {
                  font-size: 32px;
                  min-width: 50px;
                  margin-right: 15px;
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .overlay,
                .control-card,
                .dot {
                  transition: none;
                }
              }
' ])))  }
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
    return this.showDebugInfo ? html(_templateObject || (_templateObject = _taggedTemplateLiteral([ '\n      <div class="debug-info">\n        <h2>Google Card Debug Info</h2>\n        <p><strong>Night Mode:</strong> ', '</p>\n        <p><strong>Screen Width:</strong> ', '</p>\n        <p><strong>Screen Height:</strong> ', '</p>\n        <p><strong>Device Pixel Ratio:</strong> ', '</p>\n        <p><strong>Is Adjusting Brightness:</strong> ', '</p>\n        <p><strong>Current Brightness:</strong> ', '</p>\n        <p><strong>Visual Brightness:</strong> ', '</p>\n        <p><strong>Last Brightness Update:</strong> ', '</p>\n        <p><strong>Error:</strong> ', '</p>\n        <h3>Config:</h3>\n        <pre>', '</pre>\n      </div>\n    ' ])), this.isNightMode, this.screenWidth, this.screenHeight, window.devicePixelRatio || 1, this.isAdjustingBrightness, this.brightness, this.visualBrightness, new Date(this.lastBrightnessUpdateTime).toLocaleString(), this.error, JSON.stringify(this.config, null, 2)) : null;
  }
  renderOverlay() {
    return html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral([ '\n      <div class="overlay ', '">\n        <div class="icon-container">\n          <div class="icon-row">\n            <button class="icon-button" @click="', '">\n              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:do-not-disturb-on-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button">\n              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>\n            </button>\n            <button class="icon-button"\n              @touchstart="', '"\n              @touchend="', '"\n              @touchcancel="', '">\n              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>\n            </button>\n          </div>\n        </div>\n      </div>\n    ' ])), this.showOverlay ? 'show' : '', this.toggleBrightnessCard, this.handleSettingsIconTouchStart, this.handleSettingsIconTouchEnd, this.handleSettingsIconTouchEnd);
  }
  renderBrightnessCard() {
    var brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([ '\n      <div class="brightness-card ', '" \n           style="transition: ', '">\n        <div class="brightness-control">\n          <div class="brightness-dots-container">\n            <div class="brightness-dots" \n                 @click="', '"\n                 @mousedown="', '"\n                 @mousemove="', '"\n                 @touchstart="', '"\n                 @touchmove="', '">\n              ', '\n            </div>\n          </div>\n          <span class="brightness-value">', '</span>\n        </div>\n      </div>\n    ' ])), this.showBrightnessCard ? 'show' : '', this.brightnessCardTransition, this.handleBrightnessChange, this.handleBrightnessDrag, (e => 1 === e.buttons && this.handleBrightnessDrag(e)), this.handleBrightnessDrag, this.handleBrightnessDrag, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((value => html(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral([ '\n                <div class="brightness-dot ', '" \n                     data-value="', '">\n                </div>\n              ' ])), value <= brightnessDisplayValue ? 'active' : '', value))), brightnessDisplayValue);
  }
  static get styles() {
    return [ sharedStyles, css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral([ '\n        :host {\n          --crossfade-time: 3s;\n          --overlay-height: 120px;\n          display: block;\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100vw;\n          height: 100vh;\n          z-index: var(--z-index-base);\n          font-family: var(--font-family-primary);\n          font-weight: var(--font-weight-regular);\n        }\n\n        .debug-info {\n          position: absolute;\n          top: 50%;\n          left: 50%;\n          transform: translate(-50%, -50%);\n          background: rgba(0, 0, 0, 0.8);\n          color: white;\n          padding: var(--spacing-4);\n          border-radius: var(--border-radius-lg);\n          font-size: var(--font-size-sm);\n          z-index: var(--z-index-overlay);\n          max-width: 80%;\n          max-height: 80%;\n          overflow: auto;\n        }\n\n        .debug-info h2,\n        .debug-info h3 {\n          margin-bottom: var(--spacing-2);\n        }\n\n        .debug-info p {\n          margin-bottom: var(--spacing-1);\n        }\n\n        .debug-info pre {\n          margin-top: var(--spacing-2);\n          white-space: pre-wrap;\n          word-break: break-all;\n        }\n\n        .overlay {\n          position: fixed;\n          bottom: 0;\n          left: 0;\n          width: 100%;\n          height: var(--overlay-height);\n          background-color: var(--color-background-translucent);\n          color: var(--color-text);\n          box-sizing: border-box;\n          transition: transform var(--transition-duration-normal) var(--transition-timing-default);\n          transform: translateY(100%);\n          z-index: var(--z-index-above);\n          box-shadow: var(--shadow-lg);\n          display: flex;\n          flex-direction: column;\n          justify-content: center;\n          align-items: center;\n          border-top-left-radius: var(--border-radius-lg);\n          border-top-right-radius: var(--border-radius-lg);\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n        }\n\n        .overlay.show {\n          transform: translateY(0);\n        }\n\n        .icon-container {\n          width: 100%;\n          height: 100%;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n\n        .icon-row {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          width: 85%;\n          max-width: 500px;\n        }\n\n        .icon-button {\n          background: none;\n          border: none;\n          cursor: pointer;\n          color: var(--color-text);\n          padding: var(--spacing-2);\n          border-radius: 50%;\n          transition: background-color var(--transition-duration-fast) var(--transition-timing-default);\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n\n        .icon-button:hover {\n          background-color: var(--color-overlay);\n        }\n\n        iconify-icon {\n          font-size: 50px;\n          display: block;\n          width: 50px;\n          height: 50px;\n        }\n\n        .brightness-card {\n          position: fixed;\n          bottom: var(--spacing-5);\n          left: var(--spacing-5);\n          right: var(--spacing-5);\n          background-color: var(--color-background-translucent);\n          border-radius: var(--border-radius-lg);\n          padding: var(--spacing-10) var(--spacing-5);\n          box-shadow: var(--shadow-lg);\n          z-index: var(--z-index-floating);\n          transform: translateY(calc(100% + var(--spacing-5)));\n          transition: transform var(--transition-duration-normal) var(--transition-timing-default);\n          backdrop-filter: blur(10px);\n          -webkit-backdrop-filter: blur(10px);\n          max-width: 600px;\n          margin: 0 auto;\n        }\n\n        .brightness-card.show {\n          transform: translateY(0);\n        }\n\n        .brightness-control {\n          display: flex;\n          align-items: center;\n          width: 100%;\n        }\n\n        .brightness-dots-container {\n          flex-grow: 1;\n          margin-right: var(--spacing-2);\n          padding: 0 var(--spacing-2);\n        }\n\n        .brightness-dots {\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          height: 30px;\n        }\n\n        .brightness-dot {\n          width: 12px;\n          height: 12px;\n          border-radius: 50%;\n          background-color: var(--color-border);\n          transition: all var(--transition-duration-fast) var(--transition-timing-default);\n          cursor: pointer;\n        }\n\n        .brightness-dot.active {\n          background-color: var(--color-text);\n          transform: scale(1.1);\n        }\n\n        .brightness-value {\n          min-width: 60px;\n          text-align: right;\n          font-size: var(--font-size-3xl);\n          color: var(--color-text);\n          font-weight: var(--font-weight-light);\n          margin-right: var(--spacing-5);\n        }\n\n        @media (max-width: 768px) {\n          .icon-row {\n            width: 95%;\n          }\n\n          .brightness-card {\n            bottom: var(--spacing-2);\n            left: var(--spacing-2);\n            right: var(--spacing-2);\n            padding: var(--spacing-8) var(--spacing-4);\n          }\n\n          .brightness-value {\n            font-size: var(--font-size-2xl);\n            min-width: 50px;\n            margin-right: var(--spacing-4);\n          }\n        }\n\n        @media (prefers-reduced-motion: reduce) {\n          .overlay,\n          .brightness-card,\n          .brightness-dot {\n            transition: none;\n          }\n        }\n      ' ]))) ];
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
