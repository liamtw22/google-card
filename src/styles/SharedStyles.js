// src/styles/SharedStyles.js
import { css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export const sharedStyles = css`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    font-family: 'Product Sans Regular', sans-serif;
    font-weight: 400;
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
