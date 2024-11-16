import { css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export const controlsStyles = css`
  :host {
    --control-z-index: 1000;
    --overlay-transition-duration: 0.3s;
  }

  .controls-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: auto;
    z-index: var(--control-z-index);
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
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden;
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear var(--overlay-transition-duration);
    z-index: calc(var(--control-z-index) + 1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity, visibility;
  }

  .overlay.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear 0s;
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
    opacity: 0;
    transform: translateY(20px);
    transition: 
      opacity var(--overlay-transition-duration) ease,
      transform var(--overlay-transition-duration) ease;
  }

  .overlay.show .icon-row {
    opacity: 1;
    transform: translateY(0);
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #333;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    touch-action: none;
    width: 52px;
    height: 52px;
  }

  .icon-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .icon-button:active {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .brightness-card {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: calc(var(--control-z-index) + 2);
    transform: translateY(calc(100% + 20px));
    opacity: 0;
    visibility: hidden;
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear var(--overlay-transition-duration);
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity, visibility;
  }

  .brightness-card.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    transition: 
      transform var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--overlay-transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0s linear 0s;
  }

  .brightness-control {
    display: flex;
    align-items: center;
    width: 100%;
    pointer-events: auto;
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
  }

  .brightness-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #d1d1d1;
    transition: background-color 0.2s ease;
    cursor: pointer;
    pointer-events: auto;
  }

  .brightness-dot.active {
    background-color: #333;
  }

  .brightness-value {
    min-width: 60px;
    text-align: right;
    font-size: 40px;
    color: black;
    font-weight: 300;
    margin-right: 20px;
    pointer-events: none;
  }

  iconify-icon {
    font-size: 32px;
    width: 32px;
    height: 32px;
    display: block;
    color: #333;
    pointer-events: none;
  }

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
`;
