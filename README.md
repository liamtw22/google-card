# Google Nest Hub-Inspired Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

A custom card for Home Assistant that mimics the style of a Google Nest Hub display, providing a clean and modern interface for your smart home controls.

![Example Card](https://github.com/liamtw22/google-card/blob/main/images/example-card.png)

## Features

- Clean, modern design inspired by Google Nest Hub
- Rotating background images from various sources (local, Unsplash, Immich, Picsum)
- Weather and AQI display
- Automatic night mode with light sensor support
- Brightness control overlay
- **Visual configuration editor** following Home Assistant best practices
- Responsive layout
- TypeScript for type safety and better developer experience

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

Add the card to your dashboard using the visual editor or YAML:

### Visual Editor

1. Go to your dashboard
2. Click "Edit Dashboard"
3. Click "+ Add Card"
4. Search for "Google Card"
5. Configure the card using the visual editor

### YAML Configuration

```yaml
type: custom:google-card
image_url: media-source://media_source/local/backgrounds
weather_entity: weather.home
aqi_entity: sensor.air_quality_index
light_sensor_entity: sensor.light_sensor
brightness_control_entity: number.display_brightness
display_time: 15
crossfade_time: 3
```

## Configuration Options

The card supports a visual editor that follows Home Assistant best practices. All options are configurable through the UI.

### Image Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `image_url` | string | **required** | Image URL or media source path |
| `display_time` | number | 15 | Seconds to display each image |
| `crossfade_time` | number | 3 | Crossfade animation duration (seconds) |
| `image_fit` | string | contain | How images fit: contain, cover, fill, none, scale-down |
| `image_order` | string | sorted | Image order: sorted or random |
| `image_list_update_interval` | number | 3600 | Seconds between image list refreshes |

### Display Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_date` | boolean | true | Show current date |
| `show_time` | boolean | true | Show current time |
| `show_weather` | boolean | true | Show weather information |
| `show_aqi` | boolean | true | Show air quality index |

### Entity Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `weather_entity` | string | - | Weather entity for temperature display |
| `aqi_entity` | string | - | Air quality index sensor entity |
| `light_sensor_entity` | string | - | Light sensor for auto night mode |
| `brightness_sensor_entity` | string | - | Brightness sensor entity |
| `brightness_control_entity` | string | - | Entity to control display brightness |

### Device Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `device_name` | string | - | Device identifier for notifications |
| `sensor_update_delay` | number | 500 | Delay before reading sensors (ms) |
| `show_debug` | boolean | false | Show debug information overlay |

## Image Sources

The card supports multiple image sources:

### Media Source (Local Images)
```yaml
image_url: media-source://media_source/local/backgrounds
```

### Unsplash API
```yaml
image_url: https://api.unsplash.com/photos/random?client_id=YOUR_KEY&query=nature
```

### Picsum
```yaml
image_url: https://picsum.photos/${width}/${height}?random=${timestamp}
```

### Immich
```yaml
image_url: immich+https://your-immich-server/api/assets/random
```

### Direct URL
```yaml
image_url: https://example.com/image.jpg
```

## Gestures

- **Swipe up**: Show control overlay
- **Swipe down**: Hide control overlay
- **Tap in night mode**: Exit night mode
- **Long press settings icon**: Toggle debug mode

## Development

This project uses TypeScript for type safety and follows Home Assistant custom card best practices.

### Building

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Watch mode
npm run watch
```

### Project Structure

```
src/
├── components/
│   ├── background-rotator.ts  # Image rotation component
│   ├── weather-clock.ts       # Weather and time display
│   ├── controls.ts            # Control overlay
│   ├── night-mode.ts          # Night mode display
│   └── index.ts
├── styles/
│   └── shared-styles.ts       # Shared CSS styles
├── types/
│   ├── home-assistant.ts      # HA type definitions
│   ├── card-config.ts         # Card configuration types
│   └── index.ts
├── constants.ts               # Constants and defaults
├── editor.ts                  # Visual editor with form schema
└── google-card.ts            # Main card component
```

## Contributing

Feel free to submit issues and pull requests!

## Support

If you're having issues or need help, please:
1. Check the [FAQ](https://github.com/liamtw22/google-card/wiki/FAQ) section
2. Open an [issue](https://github.com/liamtw22/google-card/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
