import { css } from "lit-element";

export const backgroundRotatorStyles = css`
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    transition: opacity var(--crossfade-time) ease-in-out;
  }

  .error {
    color: red;
    padding: 16px;
  }

  .debug-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 16px;
    font-size: 14px;
    z-index: 10;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    border-radius: 8px;
  }
`;
