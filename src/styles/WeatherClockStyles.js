// src/styles/WeatherClockStyles.js
import { css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export const weatherClockStyles = css`
  .weather-component {
    position: fixed;
    bottom: 30px;
    left: 40px;
    display: flex;
    justify-content: start;
    align-items: center;
    color: white;
    font-family: 'Product Sans Regular', sans-serif;
    width: 100%;
    max-width: 400px;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: auto;
    margin-right: 40px;
  }

  .date {
    font-size: 25px;
    margin-bottom: 5px;
    font-weight: 400;
    margin-left: 10px;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  }

  .time {
    font-size: 90px;
    line-height: 1;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .weather-info {
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: 500;
  }

  .weather-icon {
    width: 50px;
    height: 50px;
  }

  .temperature {
    font-size: 35px;
    font-weight: 500;
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
    padding-top: 2px;
  }

  .aqi {
    font-size: 20px;
    padding: 7px 15px 5px 15px;
    border-radius: 6px;
    font-weight: 500;
    margin-left: 30px;
    align-self: flex-end;
    min-width: 60px;
    text-align: center;
  }

  .error {
    color: #ff4d4d;
    margin-top: 10px;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    text-shadow: none;
  }
`;
