// src/styles/controls.js
import { css } from 'lit-element';

export const controlsStyles = css`
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    --overlay-height: 120px;
    --icon-size: 50px;
    --border-radius: 20px;
    --transition-timing: 0.3s ease-in-out;
    font-family: "Product Sans Regular", "Rubik", sans-serif;
  }

  /* Base Control Container */
  .controls-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    touch-action: none;
  }

  /* Main Overlay */
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

  /* Icon Container */
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
    max-width: 500px;
  }

  /* Icon Buttons */
  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #333;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    outline: none;
  }

  .icon-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .icon-button:active {
    transform: scale(0.95);
  }

  .icon-button:focus-visible {
    box-shadow: 0 0 0 2px #333;
  }

  iconify-icon {
    font-size: var(--icon-size);
    display: block;
    width: var(--icon-size);
    height: var(--icon-size);
    transition: transform 0.2s ease;
  }

  /* Brightness and Volume Cards */
  .brightness-card,
  .volume-card {
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

  .brightness-card.show,
  .volume-card.show {
    transform: translateY(0);
  }

  /* Control Sliders */
  .brightness-control,
  .volume-control {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .brightness-dots-container,
  .volume-dots-container {
    flex-grow: 1;
    margin-right: 10px;
    padding: 0 10px;
    touch-action: none;
  }

  .brightness-dots,
  .volume-dots {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    position: relative;
  }

  /* Dots */
  .brightness-dot,
  .volume-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #d1d1d1;
    transition: background-color 0.2s ease, transform 0.2s ease;
    cursor: pointer;
    position: relative;
  }

  .brightness-dot.active,
  .volume-dot.active {
    background-color: #333;
    transform: scale(1.1);
  }

  /* Value Display */
  .brightness-value,
  .volume-value {
    min-width: 60px;
    text-align: right;
    font-size: 40px;
    color: black;
    font-weight: 300;
    margin-right: 20px;
    transition: color 0.2s ease;
  }

  /* Progress Bar */
  .progress-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background-color: #333;
    transition: width 0.1s ease-out;
  }

  /* Loading States */
  .loading {
    opacity: 0.5;
    pointer-events: none;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }

  .loading .brightness-dot,
  .loading .volume-dot {
    animation: pulse 1.5s infinite;
  }

  /* Error States */
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
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .icon-row {
      width: 95%;
    }

    .brightness-card,
    .volume-card {
      bottom: 10px;
      left: 10px;
      right: 10px;
      padding: 30px 15px;
    }

    .brightness-value,
    .volume-value {
      font-size: 32px;
      min-width: 50px;
      margin-right: 15px;
    }
  }

  @media (max-width: 480px) {
    --overlay-height: 100px;
    --icon-size: 40px;

    .brightness-dot,
    .volume-dot {
      width: 10px;
      height: 10px;
    }

    .brightness-value,
    .volume-value {
      font-size: 28px;
      min-width: 40px;
      margin-right: 10px;
    }
  }

  /* Dark Mode Support */
  @media (prefers-color-scheme: dark) {
    .overlay,
    .brightness-card,
    .volume-card {
      background-color: rgba(30, 30, 30, 0.95);
    }

    .icon-button {
      color: white;
    }

    .brightness-dot,
    .volume-dot {
      background-color: #666;
    }

    .brightness-dot.active,
    .volume-dot.active {
      background-color: white;
    }

    .brightness-value,
    .volume-value {
      color: white;
    }

    .progress-bar {
      background-color: white;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: more) {
    .overlay,
    .brightness-card,
    .volume-card {
      background-color: black;
    }

    .icon-button {
      color: white;
    }

    .brightness-dot,
    .volume-dot {
      border: 1px solid white;
    }

    .brightness-value,
    .volume-value {
      color: white;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .brightness-card,
    .volume-card {
      transition: none;
    }

    .icon-button,
    .brightness-dot,
    .volume-dot {
      transition: none;
    }

    .loading .brightness-dot,
    .loading .volume-dot {
      animation: none;
    }
  }

  /* Touch Screen Optimization */
  @media (hover: none) {
    .icon-button:hover {
      background-color: transparent;
    }

    .brightness-dots,
    .volume-dots {
      height: 44px;
    }

    .brightness-dot,
    .volume-dot {
      width: 16px;
      height: 16px;
    }
  }

  /* RTL Support */
  :host([dir="rtl"]) {
    .brightness-dots-container,
    .volume-dots-container {
      margin-right: 0;
      margin-left: 10px;
    }

    .brightness-value,
    .volume-value {
      text-align: left;
      margin-right: 0;
      margin-left: 20px;
    }
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
  :host(:focus-within) {
    outline: none;
  }

  /* Print Mode */
  @media print {
    .controls-container {
      display: none;
    }
  }
`;

export default controlsStyles;
