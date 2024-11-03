// src/styles/shared.js
import { css } from 'lit-element';

export const sharedStyles = css`
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
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-border: #e0e0e0;
    --color-shadow: rgba(0, 0, 0, 0.1);

    /* Typography */
    --font-family-primary: 'Product Sans Regular', 'Rubik', sans-serif;
    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 600;
    --font-size-small: 14px;
    --font-size-regular: 16px;
    --font-size-large: 18px;
    --font-size-xlarge: 24px;
    --font-size-xxlarge: 32px;
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --line-height-loose: 1.8;

    /* Spacing */
    --spacing-xxsmall: 4px;
    --spacing-xsmall: 8px;
    --spacing-small: 12px;
    --spacing-medium: 16px;
    --spacing-large: 24px;
    --spacing-xlarge: 32px;
    --spacing-xxlarge: 48px;

    /* Borders */
    --border-radius-small: 4px;
    --border-radius-medium: 8px;
    --border-radius-large: 16px;
    --border-radius-xlarge: 24px;
    --border-width-thin: 1px;
    --border-width-regular: 2px;
    --border-width-thick: 4px;

    /* Shadows */
    --shadow-small: 0 2px 4px var(--color-shadow);
    --shadow-medium: 0 4px 8px var(--color-shadow);
    --shadow-large: 0 8px 16px var(--color-shadow);
    --shadow-xlarge: 0 12px 24px var(--color-shadow);

    /* Transitions */
    --transition-duration-fast: 0.15s;
    --transition-duration-normal: 0.3s;
    --transition-duration-slow: 0.5s;
    --transition-timing: ease-in-out;

    /* Z-index */
    --z-index-base: 1;
    --z-index-overlay: 1000;
    --z-index-modal: 2000;
    --z-index-tooltip: 3000;
    --z-index-maximum: 9999;

    /* Component-specific */
    --overlay-height: 120px;
    --icon-size-small: 24px;
    --icon-size-medium: 36px;
    --icon-size-large: 48px;
    --header-height: 60px;
    --footer-height: 80px;
  }

  /* Base Styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Typography Reset */
  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
    font-weight: var(--font-weight-regular);
  }

  /* Common Text Styles */
  .text-small {
    font-size: var(--font-size-small);
    line-height: var(--line-height-tight);
  }

  .text-regular {
    font-size: var(--font-size-regular);
    line-height: var(--line-height-normal);
  }

  .text-large {
    font-size: var(--font-size-large);
    line-height: var(--line-height-normal);
  }

  /* Common Layout Classes */
  .flex {
    display: flex;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .flex-around {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .flex-grow {
    flex-grow: 1;
  }

  /* Common Spacing Classes */
  .m-0 { 
    margin: 0; 
  }
  .p-0 { 
    padding: 0; 
  }
  .m-1 { 
    margin: var(--spacing-xsmall); 
  }
  .p-1 { 
    padding: var(--spacing-xsmall); 
  }
  .m-2 { 
    margin: var(--spacing-small); 
  }
  .p-2 { 
    padding: var(--spacing-small); 
  }
  .m-3 { 
    margin: var(--spacing-medium); 
  }
  .p-3 { 
    padding: var(--spacing-medium); 
  }
  .m-4 { 
    margin: var(--spacing-large); 
  }
  .p-4 { 
    padding: var(--spacing-large); 
  }

  /* Common Animation Classes */
  .fade-in {
    animation: fadeIn var(--transition-duration-normal) var(--transition-timing);
  }

  .fade-out {
    animation: fadeOut var(--transition-duration-normal) var(--transition-timing);
  }

  @keyframes fadeIn {
    from { 
      opacity: 0; 
    }
    to { 
      opacity: 1; 
    }
  }

  @keyframes fadeOut {
    from { 
      opacity: 1; 
    }
    to { 
      opacity: 0; 
    }
  }

  /* Common Utility Classes */
  .hidden {
    display: none !important;
  }

  .invisible {
    visibility: hidden !important;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  /* Accessibility */
  .screen-reader-only {
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

  /* Focus States */
  :focus-visible {
    outline: var(--border-width-regular) solid var(--color-primary);
    outline-offset: var(--border-width-thin);
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
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: more) {
    :host {
      --color-primary: #000000;
      --color-background: #ffffff;
      --color-text: #000000;
      --color-border: #000000;
      --shadow-small: none;
      --shadow-medium: none;
      --shadow-large: none;
      --shadow-xlarge: none;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Print Styles */
  @media print {
    :host {
      --color-primary: #000000;
      --color-background: #ffffff;
      --color-text: #000000;
      --shadow-small: none;
      --shadow-medium: none;
      --shadow-large: none;
      --shadow-xlarge: none;
    }
  }

  /* RTL Support */
  :host([dir='rtl']) {
    direction: rtl;
  }

  /* Touch Device Optimization */
  @media (hover: none) {
    :host {
      --spacing-small: 16px;
      --spacing-medium: 20px;
      --spacing-large: 28px;
    }
  }
`;

export default sharedStyles;
