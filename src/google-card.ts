// src/google-card.ts

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, GridOptions, ConfigFormReturn } from './types';
import { GoogleCardConfig, NightModeSource } from './types/card-config';
import { sharedStyles } from './styles/shared-styles';
import { 
  DEFAULT_CONFIG, 
  DEFAULT_BRIGHTNESS,
  OVERLAY_DISMISS_TIMEOUT,
  SWIPE_THRESHOLD,
  NIGHT_MODE_LIGHT_THRESHOLD,
  BRIGHTNESS_STABILIZE_DELAY
} from './constants';

// Import components
import './components/background-rotator';
import './components/weather-clock';
import './components/controls';
import './components/night-mode';

// Import editor
import './editor';
import { getConfigForm } from './editor';

/**
 * Google Card - A Home Assistant card that mimics Google's UI for photo frame displays
 * 
 * Features:
 * - Rotating background images from various sources
 * - Weather and AQI display
 * - Night mode with automatic light sensor detection
 * - Brightness control
 * - Visual configuration editor following HA best practices
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

  /**
   * Returns the configuration element for the card editor
   * Uses the built-in Home Assistant form editor for best practices
   */
  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('google-card-editor');
  }

  /**
   * Returns the form schema for the built-in Home Assistant form editor
   */
  static getConfigForm = getConfigForm;

  /**
   * Returns a stub configuration for new card creation
   */
  static getStubConfig(): Omit<GoogleCardConfig, 'type'> {
    return {
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

  constructor() {
    super();
    this._boundUpdateScreenSize = this._updateScreenSize.bind(this);
    this._isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._boundHandleThemeChange = this._handleThemeChange.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._updateScreenSize();
    this._updateTime();
    
    window.addEventListener('resize', this._boundUpdateScreenSize!);
    this._themeMediaQuery?.addEventListener('change', this._boundHandleThemeChange!);
    
    this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._boundUpdateScreenSize!);
    this._themeMediaQuery?.removeEventListener('change', this._boundHandleThemeChange!);
    
    this._clearTimers();
  }

  private _clearTimers(): void {
    if (this._overlayDismissTimer) clearTimeout(this._overlayDismissTimer);
    if (this._brightnessCardDismissTimer) clearTimeout(this._brightnessCardDismissTimer);
    if (this._brightnessStabilizeTimer) clearTimeout(this._brightnessStabilizeTimer);
    if (this._timeUpdateInterval) clearInterval(this._timeUpdateInterval);
    if (this._nightModeReactivationTimer) clearTimeout(this._nightModeReactivationTimer);
  }

  public setConfig(config: GoogleCardConfig): void {
    if (!config.image_url) {
      throw new Error('Image URL required');
    }
    this._config = { ...DEFAULT_CONFIG, ...config } as GoogleCardConfig;
    this._showDebugInfo = this._config.show_debug ?? false;
    this._updateCssVariables();
  }

  public getCardSize(): number {
    return 1;
  }

  public getGridOptions(): GridOptions {
    return {
      rows: 'full' as unknown as number,
      columns: 'full',
    };
  }

  private _updateScreenSize(): void {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
  }

  private _updateTime(): void {
    const now = new Date();
    this._currentTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/\s?(AM|PM)$/i, '');
  }

  private _handleThemeChange(): void {
    this._isDarkMode = this._themeMediaQuery?.matches ?? false;
    this._updateCssVariables();
    this.requestUpdate();
  }

  private _updateCssVariables(): void {
    if (!this._config) return;
    
    this.style.setProperty('--crossfade-time', `${this._config.crossfade_time ?? 3}s`);
    this.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease');
    this.style.setProperty('--theme-background', this._isDarkMode ? '#121212' : '#ffffff');
    this.style.setProperty('--theme-text', this._isDarkMode ? '#ffffff' : '#333333');
    
    this.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');
  }

  private _inEditor(): boolean {
    return this._editMode || 
      this.parentElement?.tagName === 'HUI-CARD-PREVIEW' ||
      this.parentElement?.classList.contains('element-preview') ||
      this.getRootNode() instanceof ShadowRoot && 
        (this.getRootNode() as ShadowRoot).host?.tagName === 'HUI-CARD-PREVIEW';
  }

  // Touch handling
  private _handleTouchStart(e: TouchEvent): void {
    if (this._isNightMode) return;
    
    const touch = e.touches[0];
    this._touchStartY = touch.clientY;
    this._touchStartX = touch.clientX;
    this._touchStartTime = Date.now();
  }

  private _handleTouchEnd(e: TouchEvent): void {
    if (this._isNightMode) return;
    
    const touch = e.changedTouches[0];
    const deltaY = this._touchStartY - touch.clientY;
    const deltaX = touch.clientX - this._touchStartX;
    const deltaTime = Date.now() - this._touchStartTime;
    
    // Swipe up to show overlay
    if (deltaY > SWIPE_THRESHOLD && Math.abs(deltaX) < SWIPE_THRESHOLD && deltaTime < 300) {
      this._showControlOverlay();
    }
    
    // Swipe down to hide overlay
    if (deltaY < -SWIPE_THRESHOLD && Math.abs(deltaX) < SWIPE_THRESHOLD && deltaTime < 300) {
      this._hideControlOverlay();
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
        this._isOverlayVisible = true;
        this._startOverlayDismissTimer();
        this.requestUpdate();
        
        setTimeout(() => {
          this._isOverlayTransitioning = false;
          this.requestUpdate();
        }, 300);
      });
    } else {
      this._startOverlayDismissTimer();
    }
  }

  private _hideControlOverlay(): void {
    if (this._showOverlay) {
      this._isOverlayTransitioning = true;
      this._isOverlayVisible = false;
      
      setTimeout(() => {
        this._showOverlay = false;
        this._isOverlayTransitioning = false;
        this.requestUpdate();
      }, 300);
    }
  }

  private _startOverlayDismissTimer(): void {
    if (this._overlayDismissTimer) {
      clearTimeout(this._overlayDismissTimer);
    }
    
    this._overlayDismissTimer = window.setTimeout(() => {
      this._hideControlOverlay();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  private _dismissBrightnessCard(): void {
    this._isBrightnessCardTransitioning = true;
    this._isBrightnessCardVisible = false;
    
    setTimeout(() => {
      this._showBrightnessCard = false;
      this._isBrightnessCardTransitioning = false;
      this.requestUpdate();
    }, 300);
  }

  private _startBrightnessCardDismissTimer(): void {
    if (this._brightnessCardDismissTimer) {
      clearTimeout(this._brightnessCardDismissTimer);
    }
    
    this._brightnessCardDismissTimer = window.setTimeout(() => {
      this._dismissBrightnessCard();
    }, OVERLAY_DISMISS_TIMEOUT);
  }

  // Event handlers for child components
  private _handleBrightnessCardToggle(event: CustomEvent): void {
    const shouldShow = event.detail;
    
    if (shouldShow && !this._showBrightnessCard) {
      // Hide overlay first if showing
      if (this._showOverlay) {
        this._isOverlayVisible = false;
        this._showOverlay = false;
        this._isOverlayTransitioning = false;
        
        if (this._overlayDismissTimer) {
          clearTimeout(this._overlayDismissTimer);
        }
      }
      
      // Then show brightness card
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
    
    // Reset brightness card dismiss timer
    this._startBrightnessCardDismissTimer();
    
    // Clear previous stabilize timer
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
    this._handleNightModeTransition(false, 'manual');
  }

  // Night mode handling
  private _updateNightMode(): void {
    if (!this.hass || !this._config?.light_sensor_entity) return;
    
    const lightSensorState = this.hass.states[this._config.light_sensor_entity];
    if (!lightSensorState) return;
    
    const lightLevel = parseFloat(lightSensorState.state);
    if (isNaN(lightLevel)) return;
    
    const shouldBeInNightMode = lightLevel <= NIGHT_MODE_LIGHT_THRESHOLD;
    
    // Update dark mode based on light level
    if ((lightLevel <= 10) !== this._isDarkMode) {
      this._isDarkMode = lightLevel <= 10;
      this.setAttribute('data-theme', this._isDarkMode ? 'dark' : 'light');
      this._updateCssVariables();
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

  private async _handleNightModeTransition(newNightMode: boolean, source: NightModeSource = 'sensor'): Promise<void> {
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
        const restoreBrightness = this._previousBrightness > 0 
          ? this._previousBrightness 
          : DEFAULT_BRIGHTNESS;
        
        await this.hass.callService('number', 'set_value', {
          entity_id: brightnessEntity,
          value: restoreBrightness,
        });
        
        this._nightModeSource = null;
      }
      
      this._isInNightMode = newNightMode;
      this._isNightMode = newNightMode;
      this.requestUpdate();
    } catch (error) {
      // On error, restore the previous state
      this._isInNightMode = !newNightMode;
      this._isNightMode = !newNightMode;
      this.requestUpdate();
    }
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('hass') && this.hass && !this._isAdjustingBrightness && !this._inEditor()) {
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
    }
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html`<div class="error">No configuration found</div>`;
    }
    
    // Show placeholder in editor mode
    if (this._inEditor()) {
      return html`
        <div class="editor-placeholder">
          <h3>Google Card</h3>
          <p>This card displays rotating background images with weather information.</p>
          <p><strong>Image URL:</strong> ${this._config.image_url}</p>
        </div>
      `;
    }

    return html`
      <div
        class="touch-container"
        @touchstart=${this._handleTouchStart}
        @touchend=${this._handleTouchEnd}
      >
        <div class="content-wrapper">
          ${this._isNightMode
            ? html`
                <night-mode
                  .hass=${this.hass}
                  .config=${this._config}
                  .currentTime=${this._currentTime}
                  .brightness=${this._brightness}
                  .isInNightMode=${this._isInNightMode}
                  .previousBrightness=${this._previousBrightness}
                  .nightModeSource=${this._nightModeSource}
                  @nightModeExit=${this._handleNightModeExit}
                ></night-mode>
              `
            : html`
                <background-rotator
                  .hass=${this.hass}
                  .config=${this._config}
                  .screenWidth=${this._screenWidth}
                  .screenHeight=${this._screenHeight}
                  .showDebugInfo=${this._showDebugInfo}
                ></background-rotator>

                <weather-clock
                  .hass=${this.hass}
                  .config=${this._config}
                ></weather-clock>

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
                ></google-controls>
              `}
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
  description: 'A card that mimics Google\'s UI for photo frame displays',
  preview: true,
  documentationURL: 'https://github.com/liamtw22/google-card',
});

declare global {
  interface HTMLElementTagNameMap {
    'google-card': GoogleCard;
  }
}
