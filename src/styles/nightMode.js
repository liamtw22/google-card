// src/styles/nightMode.js
import { css } from 'lit-element';

export const nightModeStyles = css`
  :host {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    z-index: 1000;
    font-family: 'Product Sans Regular', 'Rubik', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Main Container */
  .night-mode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: black;
    transition: background-color 0.5s ease-in-out;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  /* Time Display */
  .night-time {
    color: white;
    font-size: 35vw;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    opacity: 0.7;
    transition: opacity 2s ease-in-out, font-size 0.3s ease-in-out;
    margin: 0;
    padding: 0;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }

  /* Fade Animation */
  .night-time.fade-dim {
    opacity: 0.4;
    transition: opacity 2s ease-in-out;
  }

  /* Error Message */
  .error-message {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 59, 48, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    text-align: center;
    max-width: 80%;
  }

  .error-message.visible {
    opacity: 1;
  }

  /* Touch Feedback */
  .touch-indicator {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    background: radial-gradient(
      circle at var(--touch-x, 50%) var(--touch-y, 50%),
      rgba(255, 255, 255, 0.1) 0%,
      transparent 60%
    );
  }

  .touch-indicator.active {
    opacity: 1;
  }

  /* Swipe Hint */
  .swipe-hint {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.3);
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .swipe-hint.visible {
    opacity: 1;
    animation: fadeInOut 3s infinite;
  }

  /* Exit Animation */
  .night-mode.exiting {
    animation: fadeOut 0.5s ease-in-out forwards;
  }

  /* Entry Animation */
  .night-mode.entering {
    animation: fadeIn 0.5s ease-in-out forwards;
  }

  /* Animations */
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

  @keyframes fadeInOut {
    0%, 
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 
    100% {
      opacity: 0.7;
    }
    50% {
      opacity: 0.4;
    }
  }

  /* Loading State */
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .night-time {
      font-size: 45vw;
    }
  }

  @media (max-width: 480px) {
    .night-time {
      font-size: 55vw;
    }

    .swipe-hint {
      bottom: 30px;
      font-size: 14px;
    }
  }

  @media (max-height: 480px) {
    .night-time {
      font-size: 25vh;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: more) {
    .night-time {
      opacity: 1;
      text-shadow: none;
    }

    .night-time.fade-dim {
      opacity: 0.8;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .night-time {
      transition: none;
    }

    .night-time.fade-dim {
      transition: none;
    }

    .swipe-hint {
      animation: none;
    }

    .night-mode.entering,
    .night-mode.exiting {
      animation: none;
    }
  }

  /* Dark Mode Optimization */
  @media (prefers-color-scheme: dark) {
    .night-mode {
      background-color: #000000;
    }

    .night-time {
      opacity: 0.8;
    }

    .night-time.fade-dim {
      opacity: 0.5;
    }
  }

  /* RTL Support */
  :host([dir='rtl']) {
    .swipe-hint {
      transform: translateX(50%);
    }

    .error-message {
      transform: translateX(50%);
    }
  }

  /* Print Mode */
  @media print {
    .night-mode {
      background-color: white !important;
    }

    .night-time {
      color: black !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    .swipe-hint,
    .error-message,
    .touch-indicator {
      display: none !important;
    }
  }

  /* Landscape Mode */
  @media (orientation: landscape) and (max-height: 500px) {
    .night-time {
      font-size: 25vh;
    }

    .swipe-hint {
      bottom: 20px;
    }
  }

  /* Touch Screen Optimization */
  @media (hover: none) {
    .touch-indicator {
      display: none;
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
  :host(:focus-within) .night-mode {
    outline: 2px solid white;
    outline-offset: -2px;
  }

  /* Battery Optimization */
  @media (prefers-reduced-data: reduce) {
    .night-time {
      text-shadow: none;
    }
  }
`;

export default nightModeStyles;
