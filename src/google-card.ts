// src/google-card.ts

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, GridOptions } from './types';
import { GoogleCardConfig, NightModeSource } from './types/card-config';
import { sharedStyles } from './styles/shared-styles';
import {
  DEFAULT_CONFIG,
  DEFAULT_BRIGHTNESS,
  OVERLAY_DISMISS_TIMEOUT,
  SWIPE_THRESHOLD,
  NIGHT_MODE_LIGHT_THRESHOLD,
  BRIGHTNESS_STABILIZE_DELAY,
} from './constants';

// Import components
import './components/background-rotator';
import './components/weather-clock';
import './components/controls';
import './components/night-mode';

// Import editor and getConfigForm
import './editor';
import { getConfigForm } from './editor';

/**
 * Google Card - A Home Assistant card that mimics Google's UI for photo frame displays
 */
@customElement('google-card')
export class GoogleCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: GoogleCardConfig;
  @state() private _screenWidth = 0;
  @state() private _screenHeight = 0;
  @state() private _showDebugInfo = false;
  @state() private _showOverlay = false;
  @state() private _isOverlayVisible = false;
  @state() private _isOverlayTransitioning = false;
  @state() private _brightness = DEFAULT_BRIGHTNESS;
  @state() private _visualBrightness = DEFAULT_BRIGHTNESS;
  @state() private _showBrightnessCard = false;
  @state() private _isBrightnessCardVisible = false;
  @state() private _isBrightnessCardTransitioning = false;
  @state() private _isNightMode = false;
  @state() private _currentTime = '';
  @state() private _isInNightMode = false;
  @state() private _previousBrightness = DEFAULT_BRIGHTNESS;
  @state() private _isAdjustingBrightness = false;
  @state() private _lastBrightnessUpdateTime = 0;
  @state() private _touchStartY = 0;
  @state() private _touchStartX = 0;
  @state() private _touchStartTime = 0;
  @state() private _isDarkMode = false;
  @state() private _editMode = false;

  private _nightModeSource: NightModeSource = null;
  private _overlayDismissTimer?: number;
  private _brightnessCardDismissTimer?: number;
  private _brightnessStabilizeTimer?: number;
  private _timeUpdateInterval?: number;
  private _nightModeReactivationTimer?: number;
  private _themeMediaQuery?: MediaQueryList;
  private _boundHandleThemeChange?: () => void;
  private _boundUpdateScreenSize?: () => void;

  // Static methods for HA integration
  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('google-card-editor');
  }

  static getStubConfig(): GoogleCardConfig {
    return {
      type: 'custom:google-card',
      image_url: 'https://source.unsplash.com/random',
      display_time: 15,
      crossfade_time: 3,
      image_fit: 'contain',
      show_date: true,
      show_time: true,
      show_weather: true,
      show_aqi: true,
      weather_entity: '',
      aqi_entity: '',
      device_name: '',
      light_sensor_entity: '',
      brightness_sensor_entity: '',
      brightness_control_entity: '',
    };
  }

  // Expose getConfigForm for HA form-based editor
  static getConfigForm = getConfigForm;

  constructor() {
    super();

    this._boundUpdateScreenSize = this._updateScreenSize.bind(this);
    this._isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._boundHandleThemeChange = this._handleThemeChange.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this._inEditor()) {
      this.style.position = 'static';
      this.style.height = 'auto';
      return;
    }

    this._updateScreenSize();
    this._startTimeUpdates();

    window.addEventListener('resize', this._boundUpdateScreenSize!);
    this._themeMediaQuery?.addEventListener('change', this._boundHandleThemeChange!);

    // Set initial theme on document
    document.documentElement.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');

    // Delayed initial night mode check
    setTimeout(() => this._updateNightMode(), 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this._inEditor()) return;

    this._clearTimers();
    window.removeEventListener('resize', this._boundUpdateScreenSize!);
    this._themeMediaQuery?.removeEventListener('change', this._boundHandleThemeChange!);
  }

  firstUpdated(): void {
    if (this._inEditor()) return;

    const touchContainer = this.shadowRoot?.querySelector('.touch-container');
    if (touchContainer) {
      touchContainer.addEventListener(
        'touchstart',
        ((e: Event) => this._handleTouchStart(e as TouchEvent)) as EventListener,
        { passive: true }
      );
      touchContainer.addEventListener(
        'touchmove',
        ((e: Event) => this._handleTouchMove(e as TouchEvent)) as EventListener,
        { passive: false }
      );
      touchContainer.addEventListener(
        'touchend',
        ((e: Event) => this._handleTouchEnd(e as TouchEvent)) as EventListener,
        { passive: true }
      );
    }

    this._refreshComponents();
  }

  setConfig(config: GoogleCardConfig): void {
    if (!config.image_url) {
      throw new Error('Image URL required');
    }
    this._config = { ...DEFAULT_CONFIG, ...config } as GoogleCardConfig;
    this._showDebugInfo = this._config.show_debug ?? false;
    this._updateCssVariables();
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): GridOptions {
    return { rows: 'full', columns: 'full' };
  }

  private _clearTimers(): void {
    if (this._overlayDismissTimer) clearTimeout(this._overlayDismissTimer);
    if (this._brightnessCardDismissTimer) clearTimeout(this._brightnessCardDismissTimer);
    if (this._brightnessStabilizeTimer) clearTimeout(this._brightnessStabilizeTimer);
    if (this._timeUpdateInterval) clearInterval(this._timeUpdateInterval);
    if (this._nightModeReactivationTimer) clearTimeout(this._nightModeReactivationTimer);
  }

  private _updateScreenSize(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    this._screenWidth = Math.round(window.innerWidth * pixelRatio);
    this._screenHeight = Math.round(window.innerHeight * pixelRatio);
    this.requestUpdate();
  }

  private _startTimeUpdates(): void {
    this._updateTime();
    this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1000);
  }

  private _updateTime(): void {
    const now = new Date();
    this._currentTime = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\s?[AP]M/, '');
  }

  private _handleThemeChange(): void {
    this._isDarkMode = this._themeMediaQuery?.matches ?? false;
    this._updateCssVariables();
    this._refreshComponents();
    this.requestUpdate();
  }

  private _updateCssVariables(): void {
    if (!this._config) return;

    this.style.setProperty('--crossfade-time', `${this._config.crossfade_time ?? 3}s`);
    this.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
    this.style.setProperty('--theme-background', this._isDarkMode ? '#121212' : '#ffffff');
    this.style.setProperty('--theme-text', this._isDarkMode ? '#ffffff' : '#333333');

    this.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');

    // Also set on document for child components that check document theme
    document.documentElement.style.setProperty(
      '--theme-transition',
      'background-color 0.3s ease, color 0.3s ease'
    );
    document.documentElement.style.setProperty(
      '--theme-background',
      this._isDarkMode ? '#121212' : '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--theme-text',
      this._isDarkMode ? '#ffffff' : '#333333'
    );
  }

  private _refreshComponents(): void {
    if (this._inEditor()) return;

    document.documentElement.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');

    const backgroundRotator = this.shadowRoot?.querySelector('background-rotator');
    const weatherClock = this.shadowRoot?.querySelector('weather-clock');
    const controls = this.shadowRoot?.querySelector('google-controls');

    if (backgroundRotator) (backgroundRotator as LitElement).requestUpdate();
    if (weatherClock) (weatherClock as LitElement).requestUpdate();
    if (controls) (controls as LitElement).requestUpdate();
  }

  private _inEditor(): boolean {
    return (
      this._editMode ||
      this.parentElement?.tagName === 'HUI-CARD-PREVIEW' ||
      this.parentElement?.classList.contains('element-preview') ||
      (this.getRootNode() instanceof ShadowRoot &&
        (this.getRootNode() as ShadowRoot).host?.tagName === 'HUI-CARD-PREVIEW')
    );
  }

  // Touch handling
  private _handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    this._touchStartY = e.touches[0].clientY;
    this._touchStartX = e.touches[0].clientX;
    this._touchStartTime = Date.now();
  }

  private _handleTouchMove(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    // Prevent default when overlays are open
    if (this._showBrightnessCard || this._showOverlay) {
      e.preventDefault();
    }
  }

  private _handleTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length !== 1) return;

    const deltaY = this._touchStartY - e.changedTouches[0].clientY;
    const deltaX = this._touchStartX - e.changedTouches[0].clientX;
    const deltaTime = Date.now() - this._touchStartTime;
    const velocityY = Math.abs(deltaY) / deltaTime;
    const velocityX = Math.abs(deltaX) / deltaTime;

    // Night mode tap to exit
    if (
      this._isNightMode &&
      Math.abs(deltaX) < SWIPE_THRESHOLD &&
      Math.abs(deltaY) < SWIPE_THRESHOLD
    ) {
      this._handleNightModeExit();
      return;
    }

    // Swipe left from left edge to enter night mode manually
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      velocityX > 0.2 &&
      this._touchStartX < window.innerWidth * 0.25 &&
      deltaX < 0
    ) {
      if (!this._isNightMode) {
        this._handleNightModeTransition(true, 'manual');
      }
      return;
    }

    // Vertical swipe gestures for overlay
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > SWIPE_THRESHOLD && velocityY > 0.2) {
      if (deltaY > 0 && !this._showBrightnessCard && !this._showOverlay) {
        // Swipe up to show overlay
        this._showControlOverlay();
      } else if (deltaY < 0) {
        // Swipe down to dismiss
        if (this._showBrightnessCard) {
          this._dismissBrightnessCard();
        } else if (this._showOverlay) {
          this._hideControlOverlay();
        }
      }
    }
  }

  private _showControlOverlay(): void {
    if (this._showBrightnessCard) {
      this._dismissBrightnessCard();
      return;
    }

    if (!this._showOverlay) {
      this._showOverlay = true;
      this._isOverlayTransitioning = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._isOverlayVisible = true;
          this._startOverlayDismissTimer();
          this.requestUpdate();

          setTimeout(() => {
            this._isOverlayTransitioning = false;
            this.requestUpdate();
          }, 300);
        });
      });
    } else {
      this._startOverlayDismissTimer();
    }
  }

  private _hideControlOverlay(): void {
    if (this._showOverlay && !this._isOverlayTransitioning) {
      this._isOverlayTransitioning = true;
      this._isOverlayVisible = false;

      if (this._overlayDismissTimer) clearTimeout(this._overlayDismissTimer);

      requestAnimationFrame(() => {
        this.requestUpdate();
        setTimeout(() => {
          this._showOverlay = false;
          this._isOverlayTransitioning = false;
          this.requestUpdate();
        }, 300);
      });
    }
  }

  private _startOverlayDismissTimer(): void {
    if (this._overlayDismissTimer) clearTimeout(this._overlayDismissTimer);
    this._overlayDismissTimer = window.setTimeout(() => {
      this._hideControlOverlay();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  private _dismissBrightnessCard(): void {
    if (this._isBrightnessCardTransitioning) return;

    this._isBrightnessCardTransitioning = true;
    this._isBrightnessCardVisible = false;

    if (this._brightnessCardDismissTimer) clearTimeout(this._brightnessCardDismissTimer);

    requestAnimationFrame(() => {
      this.requestUpdate();
      setTimeout(() => {
        this._showBrightnessCard = false;
        this._isBrightnessCardTransitioning = false;
        this.requestUpdate();
      }, 300);
    });
  }

  private _startBrightnessCardDismissTimer(): void {
    if (this._brightnessCardDismissTimer) clearTimeout(this._brightnessCardDismissTimer);
    this._brightnessCardDismissTimer = window.setTimeout(() => {
      this._dismissBrightnessCard();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  // Event handlers from child components
  private _handleBrightnessCardToggle(event: CustomEvent): void {
    const shouldShow = event.detail;

    if (shouldShow && !this._showBrightnessCard) {
      // Dismiss overlay first
      if (this._showOverlay) {
        this._isOverlayVisible = false;
        this._showOverlay = false;
        this._isOverlayTransitioning = false;
        if (this._overlayDismissTimer) clearTimeout(this._overlayDismissTimer);
      }

      this._showBrightnessCard = true;
      this._isBrightnessCardTransitioning = true;

      requestAnimationFrame(() => {
        this._isBrightnessCardVisible = true;
        this._startBrightnessCardDismissTimer();
        this.requestUpdate();

        setTimeout(() => {
          this._isBrightnessCardTransitioning = false;
          this.requestUpdate();
        }, 300);
      });
    } else if (!shouldShow && this._showBrightnessCard) {
      this._dismissBrightnessCard();
    }
  }

  private _handleBrightnessChange(event: CustomEvent): void {
    const newBrightness = event.detail;
    this._isAdjustingBrightness = true;
    this._visualBrightness = newBrightness;
    this._lastBrightnessUpdateTime = Date.now();

    this._startBrightnessCardDismissTimer();

    if (this._brightnessStabilizeTimer) {
      clearTimeout(this._brightnessStabilizeTimer);
    }

    this._brightnessStabilizeTimer = window.setTimeout(() => {
      this._isAdjustingBrightness = false;
      this.requestUpdate();
    }, BRIGHTNESS_STABILIZE_DELAY);

    this.requestUpdate();
  }

  private _handleBrightnessChangeComplete(event: CustomEvent): void {
    const newBrightness = event.detail;
    this._brightness = newBrightness;

    if (!this._isNightMode && newBrightness > 0) {
      this._previousBrightness = newBrightness;
    }
  }

  private _handleDebugToggle(): void {
    this._showDebugInfo = !this._showDebugInfo;
    this.requestUpdate();
  }

  private _handleNightModeExit(): void {
    this._isNightMode = false;
    this._isInNightMode = false;

    const lightSensorEntity = this._config?.light_sensor_entity;
    if (lightSensorEntity && this.hass && this.hass.states[lightSensorEntity]) {
      const lightLevel = parseInt(this.hass.states[lightSensorEntity].state);
      if (lightLevel === 0) {
        // If still dark, set reactivation timer
        if (this._nightModeReactivationTimer) clearTimeout(this._nightModeReactivationTimer);
        this._nightModeReactivationTimer = window.setTimeout(() => {
          this._updateNightMode();
        }, 30000);
      }
    }

    this._restorePreviousBrightness();
    this.requestUpdate();
  }

  private async _restorePreviousBrightness(): Promise<void> {
    if (!this.hass || !this._config?.brightness_control_entity) return;

    const restoreBrightness =
      this._previousBrightness && this._previousBrightness > 0
        ? this._previousBrightness
        : DEFAULT_BRIGHTNESS;

    await this.hass.callService('number', 'set_value', {
      entity_id: this._config.brightness_control_entity,
      value: restoreBrightness,
    });

    this._brightness = restoreBrightness;
    this._visualBrightness = restoreBrightness;
  }

  // Night mode handling
  private _updateNightMode(): void {
    if (!this.hass || !this._config?.light_sensor_entity) return;

    const lightSensorState = this.hass.states[this._config.light_sensor_entity];
    if (!lightSensorState) return;
    if (lightSensorState.state === 'unavailable' || lightSensorState.state === 'unknown') return;

    const lightLevel = parseFloat(lightSensorState.state);
    if (isNaN(lightLevel)) return;

    const shouldBeInNightMode = lightLevel <= NIGHT_MODE_LIGHT_THRESHOLD;

    // Update dark mode theme based on light level
    if (shouldBeInNightMode !== this._isDarkMode) {
      this._isDarkMode = shouldBeInNightMode;
      document.documentElement.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');
      this._updateCssVariables();
      this._refreshComponents();
      this.requestUpdate();
    }

    // If night mode was manually activated, don't let sensor readings deactivate it
    if (this._isInNightMode && this._nightModeSource === 'manual') {
      return;
    }

    // Otherwise, follow light sensor for automatic night mode
    if (shouldBeInNightMode !== this._isInNightMode) {
      this._handleNightModeTransition(shouldBeInNightMode, 'sensor');
    }
  }

  private async _handleNightModeTransition(
    newNightMode: boolean,
    source: NightModeSource = 'sensor'
  ): Promise<void> {
    if (newNightMode === this._isInNightMode && this._nightModeSource === source) return;

    try {
      const brightnessEntity = this._config?.brightness_control_entity;
      if (!brightnessEntity || !this.hass) return;

      if (newNightMode) {
        // Save current brightness before entering night mode
        if (!this._isInNightMode && this.hass.states[brightnessEntity]) {
          const currentValue = parseFloat(this.hass.states[brightnessEntity].state);
          if (currentValue > 0) {
            this._previousBrightness = currentValue;
          }
        }

        // Set brightness to 0
        await this.hass.callService('number', 'set_value', {
          entity_id: brightnessEntity,
          value: 0,
        });

        this._nightModeSource = source;
      } else {
        // Restore previous brightness
        const restoreBrightness =
          this._previousBrightness > 0 ? this._previousBrightness : DEFAULT_BRIGHTNESS;

        await this.hass.callService('number', 'set_value', {
          entity_id: brightnessEntity,
          value: restoreBrightness,
        });

        this._nightModeSource = null;
      }

      this._isInNightMode = newNightMode;
      this._isNightMode = newNightMode;

      // Sync night mode component if it exists
      const nightModeComponent = this.shadowRoot?.querySelector('night-mode') as LitElement & {
        isInNightMode: boolean;
        previousBrightness: number;
        nightModeSource: NightModeSource;
      };
      if (nightModeComponent) {
        nightModeComponent.isInNightMode = newNightMode;
        nightModeComponent.previousBrightness = this._previousBrightness;
        nightModeComponent.nightModeSource = this._nightModeSource;
      }

      this.requestUpdate();
    } catch (error) {
      // On error, restore the previous state
      this._isInNightMode = !newNightMode;
      this._isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (
      changedProperties.has('hass') &&
      this.hass &&
      !this._isAdjustingBrightness &&
      !this._inEditor()
    ) {
      // Monitor brightness entity changes
      const brightnessEntity = this._config?.brightness_control_entity;
      if (brightnessEntity && this.hass.states[brightnessEntity]) {
        const newBrightness = parseFloat(this.hass.states[brightnessEntity].state);
        if (this._brightness !== newBrightness) {
          this._brightness = newBrightness;
          this._visualBrightness = newBrightness;

          if (!this._isNightMode && newBrightness > 0) {
            this._previousBrightness = newBrightness;
          }

          this.requestUpdate();
        }
      }

      // Check if it's time to update night mode
      const timeSinceLastUpdate = Date.now() - this._lastBrightnessUpdateTime;
      if (timeSinceLastUpdate > 2000) {
        this._updateNightMode();
      }
    }

    if (changedProperties.has('_isDarkMode') || changedProperties.has('hass')) {
      this._updateCssVariables();
      this._refreshComponents();
    }
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        overflow: hidden;
      }

      .touch-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        touch-action: none;
      }

      .content-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .editor-placeholder {
        padding: 16px;
        font-family: var(--primary-font-family, Roboto);
        font-size: 14px;
        color: var(--primary-text-color);
        background: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
        margin: 8px;
      }
    `,
  ];

  protected render(): TemplateResult {
    if (!this._config) {
      return html`<div class="error">No configuration found</div>`;
    }

    // Show placeholder in editor mode
    if (this._inEditor()) {
      return html`
        <div class="editor-placeholder">
          <h3>Google Card</h3>
          <div>Image Source: ${this._config?.image_url || 'Not configured'}</div>
          <div>Current Mode: ${this._config?.image_fit || 'contain'}</div>
        </div>
      `;
    }

    return html`
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src:
            local('Product Sans'),
            local('ProductSans-Regular'),
            url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2)
              format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      </style>

      <div class="touch-container">
        <div class="content-wrapper">
          <background-rotator
            .hass=${this.hass}
            .config=${this._config}
            .screenWidth=${this._screenWidth}
            .screenHeight=${this._screenHeight}
          ></background-rotator>

          <weather-clock
            .hass=${this.hass}
            .config=${this._config}
            style="${this._isNightMode ? 'display: none;' : ''}"
          ></weather-clock>

          ${this._isNightMode
            ? html`
                <night-mode
                  .currentTime=${this._currentTime}
                  .hass=${this.hass}
                  .config=${this._config}
                  .brightness=${this._brightness}
                  .previousBrightness=${this._previousBrightness}
                  .isInNightMode=${this._isInNightMode}
                  .nightModeSource=${this._nightModeSource}
                  @nightModeExit=${this._handleNightModeExit}
                ></night-mode>
              `
            : ''}

          <google-controls
            .hass=${this.hass}
            .config=${this._config}
            .showOverlay=${this._showOverlay}
            .isOverlayVisible=${this._isOverlayVisible}
            .isOverlayTransitioning=${this._isOverlayTransitioning}
            .showBrightnessCard=${this._showBrightnessCard}
            .isBrightnessCardVisible=${this._isBrightnessCardVisible}
            .isBrightnessCardTransitioning=${this._isBrightnessCardTransitioning}
            .brightness=${this._brightness}
            .visualBrightness=${this._visualBrightness}
            .isAdjustingBrightness=${this._isAdjustingBrightness}
            @brightnessCardToggle=${this._handleBrightnessCardToggle}
            @brightnessChange=${this._handleBrightnessChange}
            @brightnessChangeComplete=${this._handleBrightnessChangeComplete}
            @debugToggle=${this._handleDebugToggle}
            style="${this._isNightMode ? 'display: none;' : ''}"
          ></google-controls>
        </div>
      </div>
    `;
  }
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'google-card',
  name: 'Google Card',
  description: "A card that mimics Google's UI for photo frame displays",
  preview: true,
  documentationURL: 'https://github.com/liamtw22/google-card',
});

declare global {
  interface HTMLElementTagNameMap {
    'google-card': GoogleCard;
  }
}
