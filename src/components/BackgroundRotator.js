// src/components/BackgroundRotator.js
import { css, LitElement, html } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { TRANSITION_BUFFER, IMAGE_SOURCE_TYPES } from '../constants';
import { sharedStyles } from '../styles/SharedStyles';

export class BackgroundRotator extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      screenWidth: { type: Number },
      screenHeight: { type: Number },
      currentImageIndex: { type: Number },
      imageList: { type: Array },
      imageA: { type: String },
      imageB: { type: String },
      activeImage: { type: String },
      isTransitioning: { type: Boolean },
      error: { type: String },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .background-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          transition: opacity var(--crossfade-time) ease-in-out;
        }
      `
    ];
  }

  constructor() {
    super();
    this.currentImageIndex = -1;
    this.imageList = [];
    this.imageA = '';
    this.imageB = '';
    this.activeImage = 'A';
    this.preloadedImage = '';
    this.isTransitioning = false;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateImageList().then(() => {
      this.startImageRotation();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.imageUpdateInterval) clearInterval(this.imageUpdateInterval);
    if (this.imageListUpdateInterval) clearInterval(this.imageListUpdateInterval);
  }

  startImageRotation() {
    // Initial update after a small delay to ensure image list is populated
    setTimeout(() => this.updateImage(), 500);
    
    // Schedule periodic updates
    this.imageUpdateInterval = setInterval(() => {
      this.updateImage();
    }, Math.max(5, this.config?.display_time || 15) * 1000);
    
    // Schedule periodic image list updates
    this.imageListUpdateInterval = setInterval(() => {
      this.updateImageList();
    }, Math.max(60, this.config?.image_list_update_interval || 3600) * 1000);
  }

  getImageSourceType() {
    if (!this.config?.image_url) return IMAGE_SOURCE_TYPES.URL;
    
    const { image_url } = this.config;
    if (image_url.startsWith('media-source://')) return IMAGE_SOURCE_TYPES.MEDIA_SOURCE;
    if (image_url.startsWith('https://api.unsplash')) return IMAGE_SOURCE_TYPES.UNSPLASH_API;
    if (image_url.startsWith('immich+')) return IMAGE_SOURCE_TYPES.IMMICH_API;
    if (image_url.includes('picsum.photos')) return IMAGE_SOURCE_TYPES.PICSUM;
    return IMAGE_SOURCE_TYPES.URL;
  }

  getImageUrl() {
    if (!this.config?.image_url) return '';
    
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

      this.requestUpdate();
      return this.imageList;
    } catch (error) {
      this.error = `Error updating image list: ${error.message}`;
      this.requestUpdate();
      return [];
    }
  }

  // Fisher-Yates shuffle algorithm
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async fetchImageList() {
    switch (this.getImageSourceType()) {
      case IMAGE_SOURCE_TYPES.MEDIA_SOURCE:
        return this.getImagesFromMediaSource();

      case IMAGE_SOURCE_TYPES.UNSPLASH_API:
        return this.getImagesFromUnsplashAPI();

      case IMAGE_SOURCE_TYPES.IMMICH_API:
        return this.getImagesFromImmichAPI();

      case IMAGE_SOURCE_TYPES.PICSUM: {
        // For Picsum, return multiple URLs to allow rotation
        return Array.from({ length: 10 }, () => this.getImageUrl());
      }

      default: {
        const url = this.getImageUrl();
        return url ? [url] : [];
      }
    }
  }

  async getImagesFromMediaSource() {
    if (!this.hass) return [this.getImageUrl()];
    
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

  async updateImage() {
    // Skip if already transitioning or if image list is empty
    if (this.isTransitioning || this.imageList.length === 0) return;

    try {
      const nextImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
      let nextImage;
      
      if (this.getImageSourceType() === IMAGE_SOURCE_TYPES.PICSUM) {
        nextImage = this.getImageUrl();
      } else {
        nextImage = this.imageList[nextImageIndex];
      }
      
      // Wait for the image to load
      nextImage = await this.preloadImage(nextImage);
      this.currentImageIndex = nextImageIndex;
      
      // Transition to new image
      this.isTransitioning = true;

      if (this.activeImage === 'A') {
        this.imageB = nextImage;
      } else {
        this.imageA = nextImage;
      }

      this.requestUpdate();

      // Short delay to ensure DOM update before transition
      await new Promise(resolve => setTimeout(resolve, TRANSITION_BUFFER));
      
      // Start transition by changing active image
      this.activeImage = this.activeImage === 'A' ? 'B' : 'A';
      this.requestUpdate();

      // Wait for transition to complete
      const transitionTime = (this.config?.crossfade_time || 3) * 1000 + TRANSITION_BUFFER;
      await new Promise(resolve => setTimeout(resolve, transitionTime));
      
      this.isTransitioning = false;
    } catch (error) {
      console.error('Error updating image:', error);
      this.isTransitioning = false;
    }
  }

  render() {
    const imageAOpacity = this.activeImage === 'A' ? 1 : 0;
    const imageBOpacity = this.activeImage === 'B' ? 1 : 0;
    const imageFit = this.config?.image_fit || 'contain';

    return html`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 background-size: ${imageFit};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 background-size: ${imageFit};"
        ></div>
      </div>
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}

customElements.define('background-rotator', BackgroundRotator);
