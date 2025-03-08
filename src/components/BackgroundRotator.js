// src/components/BackgroundRotator.js
import { LitElement, html } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
import { backgroundRotatorStyles } from '../styles/BackgroundRotatorStyles';
import { sharedStyles } from '../styles/SharedStyles';
import { TRANSITION_BUFFER } from '../constants';

export class BackgroundRotator extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      showDebugInfo: { type: Boolean },
      currentImageIndex: { type: Number },
      imageList: { type: Array },
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      preloadedImage: { type: String },
      error: { type: String },
      debugInfo: { type: Object },
      isTransitioning: { type: Boolean },
      pendingImageUpdate: { type: Boolean },
      imageUpdateRetries: { type: Number },
      maxRetries: { type: Number },
    };
  }

  static get styles() {
    return [backgroundRotatorStyles, sharedStyles];
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.error = null;
    this.debugInfo = {};
    this.isTransitioning = false;
    this.pendingImageUpdate = false;
    this.imageUpdateRetries = 0;
    this.maxRetries = 3;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startImageRotation();
    this.startImageListUpdates();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimers();
  }

  clearTimers() {
    if (this.imageUpdateInterval) clearInterval(this.imageUpdateInterval);
    if (this.imageListUpdateInterval) clearInterval(this.imageListUpdateInterval);
    if (this.pendingImageUpdateTimeout) clearTimeout(this.pendingImageUpdateTimeout);
  }

  startImageListUpdates() {
    // Immediate initial update
    this.updateImageList();
    
    // Schedule periodic updates
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, Math.max(60, this.config?.image_list_update_interval || 3600) * 1000);
  }

  startImageRotation() {
    // Initial update after a small delay to ensure image list is populated
    setTimeout(() => this.updateImage(), 500);
    
    // Schedule periodic updates
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, Math.max(5, this.config?.display_time || 15) * 1000);
  }

  getImageSourceType() {
    if (!this.config?.image_url) return 'url';
    
    const { image_url } = this.config;
    if (image_url.startsWith('media-source://')) return 'media-source';
    if (image_url.startsWith('https://api.unsplash')) return 'unsplash-api';
    if (image_url.startsWith('immich+')) return 'immich-api';
    if (image_url.includes('picsum.photos')) return 'picsum';
    return 'url';
  }

  getImageUrl() {
    if (!this.config?.image_url) {
      return '';
    }
    
    const timestamp_ms = Date.now();
    const timestamp = Math.floor(timestamp_ms / 1000);
    const width = this.screenWidth || 1280;
    const height = this.screenHeight || 720;
    
    return this.config.image_url
      .replace(/\${width}/g, width)
      .replace(/\${height}/g, height)
      .replace(/\${timestamp_ms}/g, timestamp_ms)
      .replace(/\${timestamp}/g, timestamp);
  }

  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) {
      this.error = 'Screen dimensions not set';
      this.requestUpdate();
      return;
    }

    try {
      const newImageList = await this.fetchImageList();
      
      // Ensure we have valid image URLs
      if (!Array.isArray(newImageList) || newImageList.length === 0) {
        throw new Error('No valid images found');
      }
      
      // Apply sorting/randomization
      this.imageList = this.config?.image_order === 'random'
        ? this.shuffleArray([...newImageList])
        : [...newImageList].sort();

      // Set initial image if first load
      if (this.currentImageIndex === -1 && this.imageList.length > 0) {
        try {
          this.imageA = await this.preloadImage(this.imageList[0]);
          this.currentImageIndex = 0;
          this.error = null;
        } catch (error) {
          this.error = `Error loading initial image: ${error.message}`;
        }
      }

      this.debugInfo.imageList = this.imageList;
      this.requestUpdate();
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
      this.requestUpdate();
    }
  }

  // Fisher-Yates shuffle algorithm for better randomization
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async fetchImageList() {
    const sourceType = this.getImageSourceType();
    switch (sourceType) {
      case 'media-source': {
        return this.getImagesFromMediaSource();
      }
      case 'unsplash-api': {
        return this.getImagesFromUnsplashAPI();
      }
      case 'immich-api': {
        return this.getImagesFromImmichAPI();
      }
      case 'picsum': {
        // For Picsum, we'll return multiple URLs to allow rotation
        return Array.from({ length: 10 }, () => this.getImageUrl());
      }
      default: {
        const url = this.getImageUrl();
        return url ? [url] : [];
      }
    }
  }
  }

  async getImagesFromMediaSource() {
    if (!this.hass) {
      return [this.getImageUrl()];
    }
    
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, '');
      const result = await this.hass.callWS({
        type: 'media_source/browse_media',
        media_content_id: mediaContentId,
      });
      
      if (!result || !Array.isArray(result.children)) {
        throw new Error('Invalid response from media source');
      }
      
      return result.children
        .filter(child => child.media_class === 'image')
        .map(child => child.media_content_id);
    } catch (error) {
      console.error('Error fetching images from media source:', error);
      const fallback = this.getImageUrl();
      return fallback ? [fallback] : [];
    }
  }

  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      
      if (!response.ok) {
        throw new Error(`Unsplash API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response from Unsplash API');
      }
      
      return data.map(image => image.urls.regular);
    } catch (error) {
      console.error('Error fetching images from Unsplash API:', error);
      const fallback = this.getImageUrl();
      return fallback ? [fallback] : [];
    }
  }

  async getImagesFromImmichAPI() {
    try {
      if (!this.config.immich_api_key) {
        throw new Error('Immich API key not configured');
      }
      
      const apiUrl = this.config.image_url.replace(/^immich\+/, '');
      const response = await fetch(`${apiUrl}/albums`, {
        headers: {
          'x-api-key': this.config.immich_api_key,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Immich API returned status ${response.status}`);
      }
      
      const albums = await response.json();
      
      if (!Array.isArray(albums)) {
        throw new Error('Invalid response from Immich API');
      }

      const imagePromises = albums.map(async (album) => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            'x-api-key': this.config.immich_api_key,
          },
        });
        
        if (!albumResponse.ok) {
          throw new Error(`Immich API album fetch returned status ${albumResponse.status}`);
        }
        
        const albumData = await albumResponse.json();
        
        if (!albumData || !Array.isArray(albumData.assets)) {
          return [];
        }
        
        return albumData.assets
          .filter(asset => asset.type === 'IMAGE')
          .map(asset => `${apiUrl}/assets/${asset.id}/original`);
      });

      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      console.error('Error fetching images from Immich API:', error);
      const fallback = this.getImageUrl();
      return fallback ? [fallback] : [];
    }
  }

  async preloadImage(url) {
    if (!url) {
      throw new Error('Invalid image URL');
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, 30000); // 30 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }

  async preloadNextImage() {
    if (this.imageList.length === 0) return;

    try {
      const nextImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
      let nextImageToPreload;
      
      if (this.getImageSourceType() === 'picsum') {
        nextImageToPreload = this.getImageUrl();
      } else {
        nextImageToPreload = this.imageList[nextImageIndex];
      }

      this.preloadedImage = await this.preloadImage(nextImageToPreload);
      this.debugInfo.preloadedImage = this.preloadedImage;
      this.requestUpdate();
    } catch (error) {
      console.error('Error preloading next image:', error);
      this.preloadedImage = '';
      this.debugInfo.preloadError = error.message;
      this.requestUpdate();
    }
  }

  async getNextImage() {
    if (this.imageList.length === 0) return null;

    let newImage;
    try {
      // Use preloaded image if available
      if (this.preloadedImage) {
        newImage = this.preloadedImage;
        this.preloadedImage = '';
      } else {
        // Otherwise load a new image
        if (this.getImageSourceType() === 'picsum') {
          newImage = this.getImageUrl();
        } else {
          this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
          newImage = this.imageList[this.currentImageIndex];
        }
        
        // Wait for the image to load
        newImage = await this.preloadImage(newImage);
      }
      
      this.imageUpdateRetries = 0;
      return newImage;
    } catch (error) {
      console.error('Error getting next image:', error);
      this.imageUpdateRetries++;
      
      // If we've tried too many times, reset the index and try again with the first image
      if (this.imageUpdateRetries > this.maxRetries) {
        this.imageUpdateRetries = 0;
        this.currentImageIndex = -1;
        return null;
      }
      
      // Try the next image after a short delay
      setTimeout(() => this.updateImage(), 2000);
      return null;
    }
  }

  async updateImage() {
    // Skip if already transitioning or if image list is empty
    if (this.isTransitioning || this.pendingImageUpdate || this.imageList.length === 0) return;

    try {
      this.pendingImageUpdate = true;
      const newImage = await this.getNextImage();
      
      if (newImage) {
        await this.transitionToNewImage(newImage);
        // Start preloading next image after current transition finishes
        setTimeout(() => this.preloadNextImage(), this.config?.crossfade_time * 1000 + TRANSITION_BUFFER);
      }
    } catch (error) {
      console.error('Error updating image:', error);
    } finally {
      this.pendingImageUpdate = false;
    }
  }

  async transitionToNewImage(newImage) {
    this.isTransitioning = true;

    if (this.activeImage === 'A') {
      this.imageB = newImage;
    } else {
      this.imageA = newImage;
    }

    this.updateDebugInfo();
    this.requestUpdate();

    // Short delay to ensure DOM update before transition
    await new Promise(resolve => setTimeout(resolve, TRANSITION_BUFFER));
    
    // Start transition by changing active image
    this.activeImage = this.activeImage === 'A' ? 'B' : 'A';
    this.requestUpdate();

    // Wait for transition to complete plus a small buffer
    const transitionTime = (this.config?.crossfade_time || 3) * 1000 + TRANSITION_BUFFER;
    await new Promise(resolve => setTimeout(resolve, transitionTime));
    
    this.isTransitioning = false;
  }

  updateDebugInfo() {
    this.debugInfo = {
      imageA: this.imageA,
      imageB: this.imageB,
      activeImage: this.activeImage,
      preloadedImage: this.preloadedImage,
      imageList: this.imageList,
      currentImageIndex: this.currentImageIndex,
      config: this.config,
      error: this.error,
      isTransitioning: this.isTransitioning,
      pendingImageUpdate: this.pendingImageUpdate,
      imageUpdateRetries: this.imageUpdateRetries,
    };
  }

  render() {
    const imageAOpacity = this.activeImage === 'A' ? 1 : 0;
    const imageBOpacity = this.activeImage === 'B' ? 1 : 0;
    const transitionDuration = `${this.config?.crossfade_time || 3}s`;
    const imageFit = this.config?.image_fit || 'contain';

    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 transition-duration: ${transitionDuration};
                 background-size: ${imageFit};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 transition-duration: ${transitionDuration};
                 background-size: ${imageFit};"
        ></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.showDebugInfo ? this.renderDebugInfo() : ''}
    `;
  }

  renderDebugInfo() {
    return html`
      <div class="debug-info">
        <h2>Background Rotator Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Source Type:</strong> ${this.getImageSourceType()}</p>
        <p><strong>Image A:</strong> ${this.imageA}</p>
        <p><strong>Image B:</strong> ${this.imageB}</p>
        <p><strong>Active Image:</strong> ${this.activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this.preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this.isTransitioning}</p>
        <p><strong>Current Image Index:</strong> ${this.currentImageIndex}</p>
        <p><strong>Image List Length:</strong> ${this.imageList?.length || 0}</p>
        <p><strong>Error:</strong> ${this.error}</p>
        <h3>Image List:</h3>
        <pre>${JSON.stringify(this.imageList?.slice(0, 5), null, 2)}${this.imageList?.length > 5 ? '...' : ''}</pre>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
}

customElements.define('background-rotator', BackgroundRotator);
