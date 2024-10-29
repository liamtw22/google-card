// src/styles/background.js
import { css } from 'lit-element';

export const backgroundStyles = css`
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: black;
  }

  /* Background Container */
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    z-index: 1;
  }

  /* Background Images */
  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    will-change: opacity;
    transition-property: opacity;
    transition-timing-function: ease-in-out;
  }

  /* Image Fit Options */
  .background-image.cover {
    background-size: cover;
  }

  .background-image.contain {
    background-size: contain;
  }

  .background-image.fill {
    background-size: 100% 100%;
  }

  .background-image.scale-down {
    background-size: contain;
    background-position: center;
  }

  /* Loading States */
  .background-image.loading {
    opacity: 0;
  }

  .background-image.loaded {
    opacity: 1;
  }

  /* Transition Effects */
  .background-image.fade {
    transition-duration: var(--crossfade-time, 3s);
  }

  .background-image.slide {
    transition-property: opacity, transform;
    transition-duration: var(--crossfade-time, 3s);
  }

  .background-image.slide.slide-left {
    transform: translateX(-100%);
  }

  .background-image.slide.slide-right {
    transform: translateX(100%);
  }

  /* Error States */
  .error-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: #ff4444;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    text-align: center;
    z-index: 2;
    max-width: 80%;
  }

  /* Loading Indicator */
  .loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 1s ease-in-out infinite;
    z-index: 2;
  }

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* Overlay Gradients */
  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  .gradient-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .gradient-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  /* High DPI Screen Optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .background-image {
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  }

  /* Reduced Motion Preferences */
  @media (prefers-reduced-motion: reduce) {
    .background-image {
      transition-duration: 0.5s !important;
    }
  }

  /* Dark Mode Adjustments */
  @media (prefers-color-scheme: dark) {
    .error-message {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  /* Performance Optimizations */
  .hardware-accelerated {
    transform: translateZ(0);
    will-change: transform;
  }

  /* Image Position Variants */
  .background-image.top {
    background-position: center top;
  }

  .background-image.bottom {
    background-position: center bottom;
  }

  .background-image.left {
    background-position: left center;
  }

  .background-image.right {
    background-position: right center;
  }

  /* Filter Effects */
  .background-image.blur {
    filter: blur(5px);
  }

  .background-image.brightness {
    filter: brightness(0.8);
  }

  .background-image.contrast {
    filter: contrast(1.2);
  }

  /* Animation Classes */
  .zoom-in {
    animation: zoomIn 20s ease-in-out infinite;
  }

  .zoom-out {
    animation: zoomOut 20s ease-in-out infinite;
  }

  .pan-left {
    animation: panLeft 30s linear infinite;
  }

  .pan-right {
    animation: panRight 30s linear infinite;
  }

  @keyframes zoomIn {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.1);
    }
  }

  @keyframes zoomOut {
    from {
      transform: scale(1.1);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes panLeft {
    from {
      background-position: 100% center;
    }
    to {
      background-position: 0% center;
    }
  }

  @keyframes panRight {
    from {
      background-position: 0% center;
    }
    to {
      background-position: 100% center;
    }
  }

  /* Responsive Design */
  @media screen and (max-width: 768px) {
    .gradient-top,
    .gradient-bottom {
      height: 100px;
    }
  }

  @media screen and (max-width: 480px) {
    .gradient-top,
    .gradient-bottom {
      height: 75px;
    }

    .error-message {
      font-size: 0.875rem;
      padding: 0.75rem;
    }
  }

  /* Print Styles */
  @media print {
    .background-container {
      display: none;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .zoom-in,
    .zoom-out,
    .pan-left,
    .pan-right {
      animation: none;
    }
  }

  /* Focus States */
  :host(:focus-within) .background-container {
    outline: 2px solid #ffffff;
    outline-offset: -2px;
  }

  /* Error States */
  :host([has-error]) .background-container {
    background-color: #ff000020;
  }
`;

export default backgroundStyles;
