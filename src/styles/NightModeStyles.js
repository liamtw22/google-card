// src/styles/NightModeStyles.js
import { css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module';

export const nightModeStyles = css`
  .night-mode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 5;
    cursor: pointer;
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
  
  .tap-hint {
    position: fixed;
    bottom: 40px;
    left: 0;
    right: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    text-align: center;
    font-family: 'Rubik', sans-serif;
    font-weight: 300;
    animation: pulse 3s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.7; }
    100% { opacity: 0.3; }
  }
`;
