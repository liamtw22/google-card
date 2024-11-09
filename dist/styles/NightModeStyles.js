import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

const nightModeStyles = css`
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
`;

export { nightModeStyles };
//# sourceMappingURL=NightModeStyles.js.map
