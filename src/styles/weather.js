// src/styles/weather.js
import { css } from 'lit-element';

export const weatherStyles = css`
  :host {
    display: block;
    position: relative;
    font-family: 'Product Sans Regular', 'Rubik', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Main Container */
  .weather-component {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    width: 100%;
    max-width: 400px;
    padding: 10px;
    box-sizing: border-box;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Left Column - Date & Time */
  .left-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
  }

  .date {
    font-size: 25px;
    margin-bottom: 5px;
    font-weight: 400;
    margin-left: 10px;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: font-size 0.3s ease;
  }

  .time {
    font-size: 90px;
    line-height: 1;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    margin-left: 8px;
    transition: font-size 0.3s ease;
  }

  /* Right Column - Weather & AQI */
  .right-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 120px;
  }

  /* Weather Info Section */
  .weather-info {
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: 500;
    margin-right: -5px;
    transition: all 0.3s ease;
  }

  .weather-icon {
    width: 50px;
    height: 50px;
    margin-right: 8px;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }

  .weather-icon.loading {
    opacity: 0.5;
    animation: pulse 1.5s infinite;
  }

  .temperature {
    font-size: 35px;
    font-weight: 500;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
    transition: font-size 0.3s ease;
  }

  /* AQI Section */
  .aqi {
    font-size: 20px;
    padding: 7px 10px 5px;
    border-radius: 8px;
    font-weight: 500;
    margin-top: 2px;
    margin-left: 25px;
    align-self: flex-end;
    min-width: 70px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* AQI Color Classes */
  .aqi.good {
    background-color: #68a03a;
  }

  .aqi.moderate {
    background-color: #f9bf33;
  }

  .aqi.unhealthy-sensitive {
    background-color: #f47c06;
  }

  .aqi.unhealthy {
    background-color: #c43828;
  }

  .aqi.very-unhealthy {
    background-color: #ab1457;
  }

  .aqi.hazardous {
    background-color: #83104c;
  }

  /* Loading States */
  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.5;
    }
  }

  .loading {
    opacity: 0.7;
    animation: pulse 1.5s infinite;
  }

  /* Error States */
  .error-message {
    background-color: rgba(255, 59, 48, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    margin-top: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Weather Description */
  .weather-description {
    font-size: 16px;
    margin-top: 4px;
    opacity: 0.9;
    text-align: right;
  }

  /* Hover Effects */
  .weather-info:hover .weather-icon {
    transform: scale(1.1);
  }

  .aqi:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease forwards;
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .weather-component {
      padding: 8px;
      max-width: 100%;
    }

    .date {
      font-size: 20px;
      margin-left: 8px;
    }

    .time {
      font-size: 70px;
      margin-left: 6px;
    }

    .weather-icon {
      width: 40px;
      height: 40px;
    }

    .temperature {
      font-size: 28px;
    }

    .aqi {
      font-size: 16px;
      padding: 5px 8px 4px;
      margin-left: 15px;
      min-width: 60px;
    }
  }

  @media (max-width: 360px) {
    .date {
      font-size: 18px;
    }

    .time {
      font-size: 60px;
    }

    .weather-icon {
      width: 35px;
      height: 35px;
    }

    .temperature {
      font-size: 24px;
    }

    .aqi {
      font-size: 14px;
      min-width: 50px;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: more) {
    .weather-component {
      text-shadow: none;
    }

    .aqi {
      border: 2px solid rgba(255, 255, 255, 0.8);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .weather-info:hover .weather-icon {
      transform: none;
    }

    .aqi:hover {
      transform: none;
    }

    .loading {
      animation: none;
      opacity: 0.7;
    }
  }

  /* Print Styles */
  @media print {
    .weather-component {
      color: black;
      text-shadow: none;
    }

    .aqi {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }

  /* Dark Mode Adjustments */
  @media (prefers-color-scheme: dark) {
    .error-message {
      background-color: rgba(255, 59, 48, 0.7);
    }
  }

  /* Focus States for Accessibility */
  :host(:focus-within) {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  /* RTL Support */
  :host([dir='rtl']) {
    .left-column {
      align-items: flex-end;
    }

    .right-column {
      align-items: flex-start;
    }

    .date,
    .time {
      margin-left: 0;
      margin-right: 10px;
    }

    .aqi {
      margin-left: 0;
      margin-right: 25px;
    }

    .weather-info {
      margin-right: 0;
      margin-left: -5px;
    }
  }

  /* Utility Classes */
  .hidden {
    display: none !important;
  }

  .invisible {
    visibility: hidden !important;
  }

  .no-wrap {
    white-space: nowrap;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default weatherStyles;
