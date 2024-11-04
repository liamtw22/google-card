// src/styles/shared.js
import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

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
    --color-info: #007aff;
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-border: #e0e0e0;
    --color-shadow: rgba(0, 0, 0, 0.1);
    --color-overlay: rgba(0, 0, 0, 0.5);

    /* Typography */
    --font-family-primary: 'Product Sans Regular', 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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

  .focusable:focus {
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

  .p-0 { padding: var(--spacing-0); }
  .p-1 { padding: var(--spacing-1); }
  .p-2 { padding: var(--spacing-2); }
  .p-4 { padding: var(--spacing-4); }

  /* Text Utilities */
  .text-sm { font-size: var(--font-size-sm); }
  .text-base { font-size: var(--font-size-base); }
  .text-lg { font-size: var(--font-size-lg); }
  .text-xl { font-size: var(--font-size-xl); }

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
    }

    .focusable:focus {
      outline-width: var(--border-width-thick);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
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
  :host([dir='rtl']) {
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
    }
  }

  @media (max-width: 640px) {
    :host {
      --font-size-xl: 20px;
      --font-size-2xl: 28px;
      --font-size-3xl: 36px;
      --spacing-8: 24px;
      --spacing-10: 32px;
      --spacing-12: 40px;
    }
  }
`;

export default sharedStyles;
