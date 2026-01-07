// src/components/background-rotator.ts

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, BrowseMediaSource, MediaSourceItem } from '../types';
import { GoogleCardConfig, ImageSourceType, DebugInfo } from '../types/card-config';
import { sharedStyles } from '../styles/shared-styles';
import { TRANSITION_BUFFER, IMAGE_SOURCE_PATTERNS } from '../constants';

@customElement('background-rotator')
export class BackgroundRotator extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: GoogleCardConfig;
  @property({ type: Number }) public screenWidth = 0;
  @property({ type: Number }) public screenHeight = 0;
  @property({ type: Boolean }) public showDebugInfo = false;

  @state() private _currentImageIndex = -1;
  @state() private _imageList: string[] = [];
  @state() private _imageA = '';
  @state() private _imageB = '';
  @state() private _activeImage: 'A' | 'B' = 'A';
  @state() private _preloadedImage = '';
  @state() private _error: string | null = null;
  @state() private _isTransitioning = false;

  private _imageUpdateInterval?: number;
  private _imageListUpdateInterval?: number;
  private _debugInfo: DebugInfo = {};

  static styles = [
    sharedStyles,
    css`
      .background-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .background-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        transition: opacity var(--crossfade-time) ease;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._startImageRotation();
    this._startImageListUpdates();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearTimers();
  }

  private _clearTimers(): void {
    if (this._imageUpdateInterval) {
      clearInterval(this._imageUpdateInterval);
    }
    if (this._imageListUpdateInterval) {
      clearInterval(this._imageListUpdateInterval);
    }
  }

  private _startImageListUpdates(): void {
    this._updateImageList();
    this._imageListUpdateInterval = window.setInterval(() => {
      this._updateImageList();
    }, (this.config.image_list_update_interval ?? 3600) * 1000);
  }

  private _startImageRotation(): void {
    this._updateImage();
    this._imageUpdateInterval = window.setInterval(() => {
      this._updateImage();
    }, (this.config.display_time ?? 15) * 1000);
  }

  private _getImageSourceType(): ImageSourceType {
    const { image_url } = this.config;
    if (IMAGE_SOURCE_PATTERNS.MEDIA_SOURCE.test(image_url)) return 'media-source';
    if (IMAGE_SOURCE_PATTERNS.UNSPLASH_API.test(image_url)) return 'unsplash-api';
    if (IMAGE_SOURCE_PATTERNS.IMMICH_API.test(image_url)) return 'immich-api';
    if (IMAGE_SOURCE_PATTERNS.PICSUM.test(image_url)) return 'picsum';
    return 'url';
  }

  private _getImageUrl(): string {
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    return this.config.image_url
      .replace(/\${width}/g, String(this.screenWidth))
      .replace(/\${height}/g, String(this.screenHeight))
      .replace(/\${timestamp_ms}/g, String(timestamp_ms))
      .replace(/\${timestamp}/g, String(timestamp));
  }

  private async _updateImageList(): Promise<void> {
    if (!this.screenWidth || !this.screenHeight) {
      this._error = 'Screen dimensions not set';
      this.requestUpdate();
      return;
    }

    try {
      const newImageList = await this._fetchImageList();
      this._imageList =
        this.config.image_order === 'random'
          ? newImageList.sort(() => 0.5 - Math.random())
          : newImageList.sort();

      // Set initial image if first load
      if (this._currentImageIndex === -1 && this._imageList.length > 0) {
        this._imageA = await this._preloadImage(this._imageList[0]);
        this._currentImageIndex = 0;
      }

      this._error = null;
      this._debugInfo.imageList = this._imageList;
    } catch (error) {
      this._error = `Error updating image list: ${(error as Error).message}`;
    }
    this.requestUpdate();
  }

  private async _fetchImageList(): Promise<string[]> {
    const sourceType = this._getImageSourceType();
    switch (sourceType) {
      case 'media-source':
        return this._getImagesFromMediaSource();
      case 'unsplash-api':
        return this._getImagesFromUnsplashAPI();
      case 'immich-api':
        return this._getImagesFromImmichAPI();
      default:
        return [this._getImageUrl()];
    }
  }

  private async _getImagesFromMediaSource(): Promise<string[]> {
    if (!this.hass) return [];

    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, '');
      const result = await this.hass.callWS<BrowseMediaSource>({
        type: 'media_source/browse_media',
        media_content_id: mediaContentId,
      });

      const images = this._extractImagesFromMediaSource(result);
      return images;
    } catch (error) {
      console.error('Error fetching media source images:', error);
      this._error = `Media source error: ${(error as Error).message}`;
      return [];
    }
  }

  private _extractImagesFromMediaSource(item: BrowseMediaSource | MediaSourceItem): string[] {
    const images: string[] = [];

    if (item.media_class === 'image' && item.media_content_id) {
      images.push(`/media-source/local${item.media_content_id.replace(/^media-source:\/\/media_source\/local/, '')}`);
    }

    if (item.children) {
      for (const child of item.children) {
        images.push(...this._extractImagesFromMediaSource(child));
      }
    }

    return images;
  }

  private async _getImagesFromUnsplashAPI(): Promise<string[]> {
    try {
      const response = await fetch(this.config.image_url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((img: { urls?: { raw?: string } }) => img.urls?.raw ?? '').filter(Boolean);
      }
      return [data.urls?.raw ?? this.config.image_url];
    } catch (error) {
      console.error('Error fetching Unsplash images:', error);
      return [this._getImageUrl()];
    }
  }

  private async _getImagesFromImmichAPI(): Promise<string[]> {
    try {
      const url = this.config.image_url.replace(/^immich\+/, '');
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((img: { thumbnailUrl?: string }) => img.thumbnailUrl ?? '').filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error('Error fetching Immich images:', error);
      return [];
    }
  }

  private _preloadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private async _updateImage(): Promise<void> {
    if (this._imageList.length === 0) return;
    if (this._isTransitioning) return;

    try {
      const nextIndex = (this._currentImageIndex + 1) % this._imageList.length;
      const nextImageUrl = this._imageList[nextIndex];
      const preloadedUrl = await this._preloadImage(nextImageUrl);

      this._isTransitioning = true;
      this._preloadedImage = preloadedUrl;

      // Transition to next image
      if (this._activeImage === 'A') {
        this._imageB = preloadedUrl;
        this._activeImage = 'B';
      } else {
        this._imageA = preloadedUrl;
        this._activeImage = 'A';
      }

      this._currentImageIndex = nextIndex;

      // Reset transition flag after crossfade completes
      const crossfadeTime = ((this.config.crossfade_time ?? 3) * 1000) + TRANSITION_BUFFER;
      setTimeout(() => {
        this._isTransitioning = false;
        this.requestUpdate();
      }, crossfadeTime);

      this.requestUpdate();
    } catch (error) {
      console.error('Error updating image:', error);
      this._error = `Image load error: ${(error as Error).message}`;
    }
  }

  protected render(): TemplateResult {
    const imageFit = this.config.image_fit ?? 'contain';

    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="
            background-image: url('${this._imageA}');
            background-size: ${imageFit};
            opacity: ${this._activeImage === 'A' ? 1 : 0};
          "
        ></div>
        <div
          class="background-image"
          style="
            background-image: url('${this._imageB}');
            background-size: ${imageFit};
            opacity: ${this._activeImage === 'B' ? 1 : 0};
          "
        ></div>
      </div>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${this.showDebugInfo ? this._renderDebugInfo() : nothing}
    `;
  }

  private _renderDebugInfo(): TemplateResult {
    return html`
      <div class="debug-info">
        <h2>Background Rotator Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Image A:</strong> ${this._imageA}</p>
        <p><strong>Image B:</strong> ${this._imageB}</p>
        <p><strong>Active Image:</strong> ${this._activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this._preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this._isTransitioning}</p>
        <p><strong>Current Image Index:</strong> ${this._currentImageIndex}</p>
        <p><strong>Error:</strong> ${this._error ?? 'None'}</p>
        <h3>Image List:</h3>
        <pre>${JSON.stringify(this._imageList, null, 2)}</pre>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'background-rotator': BackgroundRotator;
  }
}
