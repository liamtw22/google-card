import { css } from "lit-element";

export const controlsStyles = css`
  .overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--overlay-height);
    background-color: rgba(255, 255, 255, 0.95);
    color: #333;
    box-sizing: border-box;
    transition: transform 0.3s ease-in-out;
    transform: translateY(100%);
    z-index: 4;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .overlay.show {
    transform: translateY(0);
  }

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
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #333;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
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
    z-index: 3;
    transform: translateY(calc(100% + 20px));
    transition: transform 0.3s ease-in-out;
  }

  .brightness-card.show {
    transform: translateY(0);
  }

  .brightness-control {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .brightness-dots-container {
    flex-grow: 1;
    margin-right: 10px;
    padding: 0 10px;
  }

  .brightness-dots {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
  }

  .brightness-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #d1d1d1;
    transition: background-color 0.2s ease;
    cursor: pointer;
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
  }

  iconify-icon {
    font-size: 50px;
    display: block;
    width: 50px;
    height: 50px;
  }
`;
