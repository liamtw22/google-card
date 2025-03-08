// src/styles/NightModeStyles.js
import { css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export const nightModeStyles = css`
  .night-mode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
  }

  .night-time {
    color: white;
    font-size: 35vw;
    font-weight: 400;
    font-family: 'Product Sans Regular', sans-serif;
  }
  
  .error {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 14px;
    max-width: 80%;
    z-index: 10;
  }
`;
