// src/styles/SharedStyles.js
import { css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module';

export const sharedStyles = css`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    --theme-transition: background-color 0.3s ease, color 0.3s ease;
    --theme-background: #ffffff;
    --theme-text: #333333;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    font-family: 'Product Sans Regular', sans-serif;
    font-weight: 400;
    transition: var(--theme-transition);
  }

  :host([data-theme="dark"]) {
    --theme-background: #121212;
    --theme-text: #ffffff;
  }

  html[data-theme="dark"] {
    --theme-background: #121212;
    --theme-text: #ffffff;
  }

  .error {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 1000;
    max-width: 90%;
    word-wrap: break-word;
  }
`;
