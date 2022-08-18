---
id: playwright
title: utils.playwright
---

<a name="playwright"></a>

A namespace that contains various utilities for [Playwright](https://github.com/microsoft/playwright) - the headless Chrome Node API.

**Example usage:**

```javascript
const Apify = require('apify');
const { playwright } = Apify.utils;

// Navigate to https://www.example.com in Playwright with a POST request
const browser = await Apify.launchPlaywright();
const page = await browser.newPage();
await playwright.gotoExtended(page, {
    url: 'https://example.com,
    method: 'POST',
});
```

---

<a name="gotoextended"></a>

## `playwright.gotoExtended`

Extended version of Playwright's `page.goto()` allowing to perform requests with HTTP method other than GET, with custom headers and POST payload.
URL, method, headers and payload are taken from request parameter that must be an instance of Apify.Request class.

_NOTE:_ In recent versions of Playwright using requests other than GET, overriding headers and adding payloads disables browser cache which degrades
performance.

**Parameters**:

-   **`page`**: `Page` - Playwright [`Page`](https://playwright.dev/docs/api/class-page) object.
-   **`request`**: [`Request`](../api/request)
-   **`[gotoOptions]`**: [`DirectNavigationOptions`](../typedefs/direct-navigation-options) - Custom options for `page.goto()`.

**Returns**:

`Promise<(Response|null)>`

---

<a name="injectfile"></a>

## `playwright.injectFile(page, filePath, [options])`

Injects a JavaScript file into a Playright page. Unlike Playwright's `addScriptTag` function, this function works on pages with arbitrary Cross-Origin
Resource Sharing (CORS) policies.

File contents are cached for up to 10 files to limit file system access.

**Parameters**:

-   **`page`**: `Page` - Playwright [`Page`](https://playwright.dev/docs/api/class-page) object.
-   **`filePath`**: `string` - File path
-   **`[options]`**: `object`
    -   **`[surviveNavigations]`**: `boolean` - Enables the injected script to survive page navigations and reloads without need to be re-injected
        manually. This does not mean, however, that internal state will be preserved. Just that it will be automatically re-injected on each
        navigation before any other scripts get the chance to execute.

**Returns**:

`Promise<*>`

---

<a name="injectjquery"></a>

## `playwright.injectJQuery(page)`

Injects the [jQuery](https://jquery.com/) library into a Playwright page. jQuery is often useful for various web scraping and crawling tasks. For
example, it can help extract text from HTML elements using CSS selectors.

Beware that the injected jQuery object will be set to the `window.$` variable and thus it might cause conflicts with other libraries included by the
page that use the same variable name (e.g. another version of jQuery). This can affect functionality of page's scripts.

The injected jQuery will survive page navigations and reloads.

**Example usage:**

```javascript
await Apify.utils.playwright.injectJQuery(page);
const title = await page.evaluate(() => {
    return $('head title').text();
});
```

Note that `injectJQuery()` does not affect the Playwright [`page.$()`](https://playwright.dev/docs/api/class-page#page-query-selector) function in any
way.

**Parameters**:

-   **`page`**: `Page` - Playwright [`Page`](https://playwright.dev/docs/api/class-page) object.

**Returns**:

`Promise<*>`

---
