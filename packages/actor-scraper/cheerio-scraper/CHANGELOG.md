# Change Log

## 3.0.15 (2024-10-07)

- Updated Crawlee version to v3.11.5 and SDK v3.2.6
- Updated Node to v22

## 3.0.14 (2024-04-09)

- Updated Crawlee version to v3.8.0.
- Updated to use new request queue in scraper

## 3.0.11 (2023-08-22)

- Updated Crawlee version to v3.5.2.
- Updated Node.js version to v18.
- Added new options:
  - **Exclude Glob Patterns** (`excludes`): Glob patterns to match links in the page that you want to exclude from being enqueued.

## 3.0 (`version-3`)

- Rewrite from Apify SDK to Crawlee, see the [v3 migration guide](https://sdk.apify.com/docs/upgrading/upgrading-to-v3) for more details.
- Proxy usage is now required.

## 2.0 (`version-2`)

Main difference between v1 and v2 of the scrapers is the upgrade of SDK to v2, which requires node v15.10+. SDK v2 uses http2 to do the requests with cheerio-scraper, and the http2 support in older node versions were too buggy, so we decided to drop support for those. If you need to run on older node version, use SDK v1.

Please refer to the SDK 1.0 migration guide for more details about functional changes in the SDK. SDK v2 basically only changes the required node version and has no other breaking changes.

- deprecated `useRequestQueue` option has been removed
    - `RequestQueue` will be always used
- deprecated `context.html` getter from the `cheerio-scraper` has been removed
    - use `context.body` instead
- deprecated prepareRequestFunction input option
    - use `pre/postNavigationHooks` instead
- removed `puppeteerPool/autoscaledPool` from the crawlingContext object
    - `puppeteerPool` was replaced by `browserPool`
    - `autoscaledPool` and `browserPool` and available on the `crawler` property of `crawlingContext` object
- custom "Key-value store name" option in Advanced configuration is now fixed, previously the default store was always used
