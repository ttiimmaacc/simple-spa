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
├── index.html
├── assets/
├── src/
└── README.md
```

## License

MIT
