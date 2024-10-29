# Google Card for Home Assistant

A sleek, Google Nest Hub-inspired card for Home Assistant dashboards.

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)

## Overview

Google Card brings the elegant design of Google Nest Hub to your Home Assistant dashboard. It features a rotating background image gallery, weather information, time display, and interactive controls for brightness and volume.

## Features

- Dynamic background image rotation with smooth transitions
- Real-time weather and AQI display
- Interactive brightness and volume controls
- Night mode with large clock display
- Touch-optimized interface
- Responsive design for all screen sizes

## Installation

### HACS Installation
1. Search for "Google Card" in HACS
2. Click Install
3. Add configuration to your dashboard

### Manual Installation
1. Download the `google-card.js` file from the latest release
2. Copy it to your `www/community` folder
3. Add the resource to your dashboard configuration

## Usage

Add to your dashboard:

```yaml
type: custom:google-card
entity: weather.your_weather_entity
image_url: "your_image_url"
```

### Configuration Options

|
 Name 
|
 Type 
|
 Default 
|
 Description 
|
|
------
|
------
|
---------
|
-------------
|
|
 entity 
|
 string 
|
 Required 
|
 Weather entity ID 
|
|
 image_url 
|
 string 
|
 Required 
|
 URL for background images 
|
|
 display_time 
|
 number 
|
 15 
|
 Time to display each image (seconds) 
|
|
 crossfade_time 
|
 number 
|
 3 
|
 Transition duration between images 
|
|
 image_fit 
|
 string 
|
 "contain" 
|
 Image fitting mode (contain/cover) 
|
|
 show_debug 
|
 boolean 
|
 false 
|
 Enable debug information 
|

## Examples

Basic configuration:
```yaml
type: custom:google-card
entity: weather.home
image_url: "https://source.unsplash.com/random"
```

Advanced configuration:
```yaml
type: custom:google-card
entity: weather.home
image_url: "https://source.unsplash.com/random"
display_time: 20
crossfade_time: 2
image_fit: "cover"
show_debug: true
```

## Support

Having issues? Open an issue on GitHub or join our discussion.

[releases-shield]: https://img.shields.io/github/release/your-username/google-card-mod.svg?style=for-the-badge
[releases]: https://github.com/your-username/google-card-mod/releases
[license-shield]: https://img.shields.io/github/license/your-username/google-card-mod.svg?style=for-the-badge
