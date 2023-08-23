# Change Log

## 1.0.11 (2023-08-22)

- Updated Crawlee version to v3.5.2.
- Updated Node.js version to v18.
- Added new options:
  - **Dismiss cookie modals** (`closeCookieModals`): Using the [I don't care about cookies](https://addons.mozilla.org/en-US/firefox/addon/i-dont-care-about-cookies/) browser extension. When on, the crawler will automatically try to dismiss cookie consent modals. This can be useful when crawling European websites that show cookie consent modals.
  - **Maximum scrolling distance in pixels** (`maxScrollHeightPixels`): The crawler will scroll down the page until all content is loaded or the maximum scrolling distance is reached. Setting this to `0` disables scrolling altogether.
  - **Exclude Glob Patterns** (`excludes`): Glob patterns to match links in the page that you want to exclude from being enqueued.

## 1.0

- Initial version built on Crawlee.
- Proxy usage is now required.
