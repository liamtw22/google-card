// src/styles/shared-styles.ts

import { css } from 'lit';

export const sharedStyles = css`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    --theme-transition: background-color 0.3s ease, color 0.3s ease;
    --theme-background: #ffffff;
    --theme-text: #333333;
    --overlay-background: rgba(255, 255, 255, 0.95);
    --control-text-color: #333333;
    --brightness-dot-color: #d1d1d1;
    --brightness-dot-active: #333333;
    --background-blur: 10px;

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

  :host([data-theme='dark']) {
    --theme-background: #121212;
    --theme-text: #ffffff;
    --overlay-background: rgba(32, 33, 36, 0.95);
    --control-text-color: #ffffff;
    --brightness-dot-color: #5f6368;
    --brightness-dot-active: #ffffff;
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

  .debug-info {
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
  }

  .debug-info h2 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #00ffff;
  }

  .debug-info h3 {
    margin: 10px 0 5px 0;
    font-size: 12px;
    color: #ffff00;
  }

  .debug-info p {
    margin: 5px 0;
  }

  .debug-info pre {
    margin: 5px 0;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }

  .debug-info strong {
    color: #00ffff;
  }
`;

export const editorStyles = css`
  .form-container {
    padding: 16px;
  }

  .card {
    margin-bottom: 16px;
    background: var(--card-background-color, var(--ha-card-background));
    border-radius: var(--ha-card-border-radius, 4px);
    box-shadow: var(
      --ha-card-box-shadow,
      0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 1px 5px 0 rgba(0, 0, 0, 0.12),
      0 3px 1px -2px rgba(0, 0, 0, 0.2)
    );
    color: var(--primary-text-color);
    padding: 16px;
  }

  .card-header {
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, 24px);
    font-weight: 400;
    color: var(--ha-card-header-color, --primary-text-color);
    padding: 4px 0 12px;
    line-height: 1.2;
  }

  .card-section {
    margin-bottom: 16px;
  }

  .section-header {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 8px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    padding-bottom: 4px;
  }

  .row {
    display: flex;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .input-group {
    padding: 8px 0;
    box-sizing: border-box;
    flex: 1 0 200px;
    max-width: 100%;
    margin-right: 16px;
  }

  .input-group:last-child {
    margin-right: 0;
  }

  .input-group.full-width {
    flex: 1 0 100%;
    max-width: 100%;
  }

  .input-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .input-desc {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .switch-group {
    padding: 8px 16px 8px 0;
    box-sizing: border-box;
  }

  ha-textfield,
  ha-select {
    width: 100%;
  }

  ha-formfield {
    display: flex;
    align-items: center;
  }

  ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color, var(--primary-color));
  }
`;
