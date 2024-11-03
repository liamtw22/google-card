# Google Nest Hub-Inspired Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

A custom card for Home Assistant that mimics the style of a Google Nest Hub display, providing a clean and modern interface for your smart home controls.

![Example Card](https://raw.githubusercontent.com/liamtw22/google-card/main/images/example-card.png)

## Features

- Clean, modern design inspired by Google Nest Hub
- Customizable display options
- Responsive layout
- Easy integration with Home Assistant

## Installation

### HACS (Recommended)

1. Make sure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance
2. Add this repository to HACS:
   - Click on HACS in the sidebar
   - Click on "Frontend" section
   - Click the menu in the top right corner
   - Select "Custom repositories"
   - Add URL: `https://github.com/liamtw22/google-card`
   - Category: "Plugin"
3. Click "Install"
4. Refresh your browser

### Manual Installation

1. Download `google-card.js` from the latest release
2. Copy it to your `config/www` folder
3. Add the resource in your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/google-card.js
      type: module
```

## Usage

Add the card to your dashboard:

```yaml
type: custom:google-card
entity: weather.home
# Add other configuration options as needed
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| entity | string | required | Weather entity ID |
| name | string | optional | Custom name for the card |
| show_forecast | boolean | true | Show weather forecast |

## Screenshots

### Weather Display
![Weather Display](https://raw.githubusercontent.com/liamtw22/google-card/main/images/weather.png)

### Forecast View
![Forecast View](https://raw.githubusercontent.com/liamtw22/google-card/main/images/forecast.png)

## Contributing

Feel free to submit issues and pull requests!

## Support

If you're having issues or need help, please:
1. Check the [FAQ](https://github.com/liamtw22/google-card/wiki/FAQ) section
2. Open an [issue](https://github.com/liamtw22/google-card/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
