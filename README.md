# Simple SPA

This project is a lightweight, client-side router for building Single Page Applications (SPAs). It handles page navigation, content loading, dynamic styling, and basic page transitions without requiring a full framework.

## Features

- **Metadata-Driven Routing:** Define pages and their properties (title, HTML partial, CSS classes, theme color, etc.) in the `PAGES_METADATA` object.
- **Dynamic Content Loading:** Fetches HTML partials for page content and injects them into the DOM.
- **Content Caching:** Caches loaded page partials to improve performance on subsequent visits.
- **Page Transitions:** Includes basic visual transitions (segue animations) between page loads.
- **Preloading:** Attempts to preload page content when a user hovers over an internal link.

## Core Components

The router handles URL changes and manages page navigation, working with metadata definitions to load appropriate content and update browser history state while triggering transitions.

## Installation

```
git clone https://github.com/ttiimmaacc/simple-spa.git
cd simple-spa
```

## Usage (TODO)

1. Define your pages in the `PAGES_METADATA` object
2. Create HTML partials for each page
3. ...

## Project Structure (TODO)

```
simple-spa/
├── assets
│   ├── fonts
│   │   ├── regola-book.woff2
│   │   ├── regola-light.woff2
│   │   ├── regola-medium.woff2
│   │   └── regola-regular.woff2
│   └── images
│       ├── home
│       │   ├── intro-spa-1.png
│       │   ├── intro-spa-2.png
│       │   ├── intro-spa-3.png
│       │   └── spa.png
│       ├── icons
│       │   ├── arrow-right-black.svg
│       │   ├── arrow-right-blue.svg
│       │   ├── arrow-right-white.svg
│       │   ├── box-blue.svg
│       │   ├── box-out-light-grey.svg
│       │   ├── box-video-light-grey.svg
│       │   ├── checkmark-grey.svg
│       │   ├── checkmark-white.svg
│       │   ├── chevron-grey.svg
│       │   ├── chevron-mini-grey.svg
│       │   ├── chevron-white.svg
│       │   ├── download-blue.svg
│       │   ├── info-grey-80.svg
│       │   └── xmark-grey.svg
│       ├── bullet.svg
│       └── logo.svg
├── src
│   ├── javascripts
│   │   ├── partials
│   │   │   ├── home.html
│   │   │   └── menu.html
│   │   └── index.js
│   └── stylesheets
│       ├── sections
│       │   └── hero.css
│       ├── fonts.css
│       ├── footer.css
│       └── index.css
├── README.md
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

## License

MIT
