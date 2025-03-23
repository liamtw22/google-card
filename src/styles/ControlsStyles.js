// src/styles/ControlsStyles.js
import { css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module';

export const controlsStyles = css`
  :host {
    --control-z-index: 1000;
    --overlay-transition-duration: 0.3s;
    --overlay-height: 120px;
    --brightness-card-height: 70px;
    --icon-size: 50px;
    --icon-button-size: 60px;
    --brightness-dot-size: 12px;
    --brightness-value-size: 40px;
    --border-radius: 20px;
    --background-blur: 10px;
    --background-opacity: 0.95;
    --overlay-background: rgba(255, 255, 255, var(--background-opacity));
    --control-text-color: #333;
    --brightness-dot-color: #d1d1d1;
    --brightness-dot-active: #333;
  }

  html[data-theme="dark"], :host([data-theme="dark"]) {
    --overlay-background: rgba(32, 33, 36, var(--background-opacity));
    --control-text-color: #fff;
    --brightness-dot-color: #5f6368;
    --brightness-dot-active: #fff;
  }

  .controls-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: none;
    z-index: var(--control-z-index);
    touch-action: none;
  }

  .overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--overlay-height);
    background-color: var(--overlay-background);
    -webkit-backdrop-filter: blur(var(--background-blur));
    backdrop-filter: blur(var(--background-blur));
    color: var(--control-text-color);
    box-sizing: border-box;
    transform: translateY(calc(100% + 20px));
    opacity: 0;
    transition: none;
    z-index: calc(var(--control-z-index) + 1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity;
  }

  .overlay.transitioning {
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  }

  .overlay.show {
    transform: translateY(0);
    opacity: 1;
  }

  .icon-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
  }

  .icon-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 85%;
    pointer-events: auto;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--control-text-color);
    padding: 10px;
    border-radius: 50%;
    transition: 
      background-color 0.2s ease,
      transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    touch-action: none;
    width: var(--icon-button-size);
    height: var(--icon-button-size);
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  .icon-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .icon-button:active {
    background-color: rgba(0, 0, 0, 0.2);
    transform: scale(0.95);
  }

  .brightness-card {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    height: var(--brightness-card-height);
    background-color: var(--overlay-background);
    -webkit-backdrop-filter: blur(var(--background-blur));
    backdrop-filter: blur(var(--background-blur));
    color: var(--control-text-color);
    border-radius: var(--border-radius);
    padding: 40px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: calc(var(--control-z-index) + 2);
    transform: translateY(calc(100% + 20px));
    opacity: 0;
    transition: none;
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity;
  }

  .brightness-card.transitioning {
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  }

  .brightness-card.show {
    transform: translateY(0);
    opacity: 1;
  }

  .brightness-control {
    display: flex;
    align-items: center;
    width: 100%;
    pointer-events: auto;
    height: 100%;
  }

  .brightness-dots-container {
    flex-grow: 1;
    margin-right: 10px;
    padding: 0 10px;
    pointer-events: auto;
  }

  .brightness-dots {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    pointer-events: auto;
    touch-action: none;
    padding: 10px 0;
  }

  .brightness-dot {
    width: var(--brightness-dot-size);
    height: var(--brightness-dot-size);
    border-radius: 50%;
    background-color: var(--brightness-dot-color);
    transition: 
      background-color 0.2s ease,
      transform 0.2s ease;
    cursor: pointer;
    pointer-events: auto;
  }

  .brightness-dot:hover {
    transform: scale(1.2);
  }

  .brightness-dot.active {
    background-color: var(--brightness-dot-active);
  }

  .brightness-value {
    min-width: 60px;
    text-align: right;
    font-size: var(--brightness-value-size);
    color: var(--control-text-color);
    font-weight: 300;
    margin-right: 20px;
    pointer-events: none;
    font-family: 'Rubik', sans-serif;
  }

  iconify-icon {
    font-size: var(--icon-size);
    width: var(--icon-size);
    height: var(--icon-size);
    display: block;
    color: var(--control-text-color);
    pointer-events: none;
  }

  /* iOS specific adjustments */
  @supports (-webkit-touch-callout: none) {
    .controls-container {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .overlay {
      padding-bottom: env(safe-area-inset-bottom, 0);
      height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
    }

    .brightness-card {
      padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
      margin-bottom: env(safe-area-inset-bottom, 0);
    }
  }

  /* PWA standalone mode adjustments */
  @media (display-mode: standalone) {
    .controls-container {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .overlay {
      padding-bottom: env(safe-area-inset-bottom, 0);
      height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
    }

    .brightness-card {
      padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
      margin-bottom: env(safe-area-inset-bottom, 0);
    }
  }

  /* Accessibility: reduce animation */
  @media (prefers-reduced-motion: reduce) {
    *,
    .overlay,
    .brightness-card,
    .overlay.transitioning,
    .brightness-card.transitioning {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  /* High contrast mode */
  @media (forced-colors: active) {
    .icon-button:hover,
    .icon-button:active {
      border: 1px solid ButtonText;
    }

    .brightness-dot {
      border: 1px solid ButtonText;
    }

    .brightness-dot.active {
      background-color: ButtonText;
    }
  }

  @keyframes button-press {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  .icon-button:active {
    animation: button-press 0.2s ease;
  }
`;
