JSDOM Scraper is a ready-made solution for crawling websites using plain HTTP requests. It retrieves the HTML pages, parses them using the [JSDOM](https://github.com/jsdom/jsdom) Node.js library and lets you extract any data from them using the Window API you know from browsers. Fast.

JSDOM is a server-side emulation of the standard browser Window API. It does not require a browser; instead, it constructs a DOM tree from a provided HTML string. The user is then presented with an API to work with that DOM tree.

JSDOM Scraper is ideal for scraping web pages which utilize light client-side JavaScript to serve their content - it can be up to 20x faster than using a full-browser solution such as Puppeteer!

If you're unfamiliar with web scraping or web development in general, you might prefer to start with [**Scraping with Web Scraper**](https://docs.apify.com/tutorials/apify-scrapers/web-scraper) tutorial from the Apify documentation, a tutorial which will walk you through all the steps and provide a number of examples.

## How do I use JSDOM Scraper?

To get started with JSDOM Scraper, you only need two things. First, tell the scraper which web pages it should load. Second, tell it how to extract data from each page.

The scraper starts by loading the pages specified in the [**Start URLs**](#start-urls) field. You can make the scraper follow page links on the fly by setting a [**Link selector**](#link-selector), **[Glob Patterns](#glob-patterns)** and/or **[Pseudo-URLs](#pseudo-urls)** to tell the scraper which links it should add to the crawling queue. This is useful for the recursive crawling of entire websites, e.g. to find all products in an online store.

To tell the scraper how to extract data from web pages, you need to provide a [**Page function**](#page-function). This is JavaScript code that is executed for every web page loaded. Since the scraper does not use the full web browser, writing the **Page function** is equivalent to writing server-side Node.js code - it uses the server-side library [JSDOM](https://github.com/jsdom/jsdom).

## How does JSDOM Scraper work?

1. Adds each [Start URL](#start-urls) to the crawling queue.
2. Fetches the first URL from the queue and constructs a DOM from the fetched HTML string.
3. Executes the [**Page function**](#page-function) on the loaded page and saves its results.
4. Optionally, finds all links from the page using the [**Link selector**](#link-selector). If a link matches any of the **[Glob Patterns](#glob-patterns)** and/or **[Pseudo-URLs](#pseudo-urls)** and has not yet been visited, adds it to the queue.
5. If there are more items in the queue, repeats step 2, otherwise finishes.

JSDOM Scraper has a number of advanced configuration settings to improve performance, set cookies for login to websites, limit the number of records, etc. See their tooltips for more information.

Under the hood, JSDOM Scraper is built using the [`JSDOMCrawler`](https://crawlee.dev/api/jsdom-crawler/class/JSDOMCrawler) class
from Crawlee. If you'd like to learn more about the inner workings of the scraper, see the respective documentation.

## Content types JSDOM Scraper works with

By default, JSDOM Scraper only processes web pages with the `text/html`, `application/json`, `application/xml`, `application/xhtml+xml` MIME content types (as reported by the `Content-Type` HTTP header), and skips pages with other content types. If you want the crawler to process other content types, use the **Additional MIME types** (`additionalMimeTypes`) input option.

Note that while the default `Accept` HTTP header will allow any content type to be received, HTML and XML are preferred over JSON and other types. Thus, if you're allowing additional MIME types, and you're still receiving invalid responses, be sure to override the `Accept` HTTP header setting in the requests from the scraper, either in [**Start URLs**](#start-urls), [**Pseudo URLs**](#pseudo-urls) or in the **Prepare request function**.

The web pages with various content types are parsed differently and thus the `context` parameter of the [**Page function**](#page-function) will have different values:

| **Content types**                                       | [`context.body`](#body-stringbuffer) | [`context.window`](#-object) | [`context.json`](#json-object) |
|---------------------------------------------------------|--------------------------------------|---------------------------|--------------------------------|
| `text/html`, `application/xhtml+xml`, `application/xml` | `String`                             | `Object`                | `null`                         |
| `application/json`                                      | `String`                             | `null`                    | `Object`                       |
| Other                                                   | `Buffer`                             | `null`                    | `null`                         |

The `Content-Type` HTTP header of the web page is parsed using the
<a href="https://www.npmjs.com/package/content-type" target="_blank">content-type</a> NPM package and the result is stored in the [`context.contentType`](#contenttype-object) object.

## Limitations of JSDOM Scraper 

The actor does not employ a full-featured web browser such as Chromium or Firefox, so it will not be sufficient for web pages that render their content dynamically using client-side JavaScript. To scrape such sites, you might prefer to use [**Web Scraper**](https://apify.com/apify/web-scraper) (`apify/web-scraper`), which loads pages in a full browser and renders dynamic content.

Since JSDOM Scraper's **Page function** is executed in the context of the server, it only supports server-side code running in Node.js. If you need to combine client- and server-side libraries in Chromium using the [Puppeteer](https://github.com/puppeteer/puppeteer) library, you might prefer to use [**Puppeteer Scraper**](https://apify.com/apify/puppeteer-scraper) (`apify/puppeteer-scraper`). If you prefer Firefox and/or [Playwright](https://github.com/microsoft/playwright), check out [**Playwright Scraper**](https://apify.com/apify/playwright-scraper) (`apify/playwright-scraper`). For even more flexibility and control, you might develop a new actor from scratch in Node.js using [Apify SDK](https://sdk.apify.com/) and [Crawlee](https://crawlee.dev).

In the [**Page function**](#page-function) and **Prepare request function**, you can only use NPM modules that are already installed in this actor. If you require other modules for your scraping, you'll need to develop a completely new actor. You can use the [`JSDOMCrawler`](https://crawlee.dev/api/jsdom-crawler/class/JSDOMCrawler) class from Crawlee to get most of the functionality of JSDOM Scraper out of the box.

## Input configuration

As input, JSDOM Scraper actor accepts a number of configurations. These can be entered either manually in the user interface in [Apify Console](https://console.apify.com), or programmatically in a JSON object using the [Apify API](https://apify.com/docs/api/v2#/reference/actors/run-collection/run-actor). For a complete list of input fields and their types, please visit the [Input](https://apify.com/apify/jsdom-scraper/input-schema) tab.

### Start URLs

The **Start URLs** (`startUrls`) field represents the initial list of pages that the scraper will visit. You can either enter the URLs manually one by one, upload them in a CSV file, or [link URLs from a Google Sheet](https://help.apify.com/en/articles/2906022-scraping-a-list-of-urls-from-a-google-sheets-document) document. Each URL must start with either a `http://` or `https://` protocol prefix.

The scraper supports adding new URLs to scrape on the fly, either using the [**Link selector**](#link-selector) and **[Glob Patterns](#glob-patterns)**/**[Pseudo-URLs](#pseudo-urls)** options or by calling `context.enqueueRequest()` inside the [**Page function**](#page-function).

Optionally, each URL can be associated with custom user data - a JSON object that can be referenced from your JavaScript code in the [**Page function**](#page-function) under `context.request.userData`. This is useful for determining which start URL is currently loaded, in order to perform some page-specific actions. For example, when crawling an online store, you might want to perform different actions on a page listing the products vs. a product detail page. For details, see the [**Web scraping tutorial**](https://docs.apify.com/tutorials/apify-scrapers/getting-started#the-start-url) in the Apify documentation.

<!-- TODO: Describe how the queue works, unique key etc. plus link -->

### Link selector

The **Link selector** (`linkSelector`) field contains a CSS selector that is used to find links to other web pages, i.e. `<a>` elements with the `href` attribute. On every page loaded, the scraper looks for all links matching the **Link selector**. It checks that the target URL matches one of the [**Glob Patterns**](#glob-patterns)/[**Pseudo-URLs**](#pseudo-urls), and if so then adds the URL to the request queue, to be loaded by the scraper later.

By default, new scrapers are created with the following selector that matches all links:

```
a[href]
```

If the **Link selector** is empty, page links are ignored, and the scraper only loads pages that were specified in the [**Start URLs**](#start-urls) input or that were manually added to the request queue by calling `context.enqueueRequest()` in the [**Page function**](#page-function).

### Glob Patterns

The **Glob Patterns** (`globs`) field specifies which types of URLs found by **[Link selector](#link-selector)** should be added to the request queue.

A glob pattern is simply a string with wildcard characters.

For example, a glob pattern `http://www.example.com/pages/**/*` will match all the
following URLs:

-   `http://www.example.com/pages/deeper-level/page`
-   `http://www.example.com/pages/my-awesome-page`
-   `http://www.example.com/pages/something`

Note that you don't need to use the **Glob Patterns** setting at all, because you can completely control which pages the scraper will access by calling `await context.enqueueRequest()` from the **[Page function](#page-function)**.

### Pseudo-URLs

The **Pseudo-URLs** (`pseudoUrls`) field specifies which types of URLs found by **[Link selector](#link-selector)** should be added to the request queue.

A pseudo-URL is simply a URL with special directives enclosed in `[]` brackets. Currently, the only supported directive is `[regexp]`, which defines a JavaScript-style regular expression to match against the URL.

For example, a pseudo-URL `http://www.example.com/pages/[(\w|-)*]` will match all the following URLs:

-   `http://www.example.com/pages/`
-   `http://www.example.com/pages/my-awesome-page`
-   `http://www.example.com/pages/something`

If either "`[`" or "`]`" are part of the normal query string, the symbol must be encoded as `[\x5B]` or `[\x5D]`, respectively. For example, the following pseudo-URL:

```
http://www.example.com/search?do[\x5B]load[\x5D]=1
```

will match the URL:

```
http://www.example.com/search?do[load]=1
```

Optionally, each pseudo-URL can be associated with user data that can be referenced from your **[Page function](#page-function)** using `context.request.label` to determine which kind of page is currently loaded in the browser.

Note that you don't need to use the **Pseudo-URLs** setting at all, because you can completely control which pages the scraper will access by calling `await context.enqueueRequest()` from the **[Page function](#page-function)**.

### Page function

The **Page function** (`pageFunction`) field contains a single JavaScript function that enables the user to extract data from the web page, access its DOM, add new URLs to the request queue, and otherwise control JSDOM Scraper's operation.

Example:

```javascript
async function pageFunction(context) {
    const { window, request, log } = context;

    // The "window" property contains the JSDOM object which is useful
    // for querying DOM elements and extracting data from them.
    const pageTitle = window.document.title;

    // The "request" property contains various information about the web page loaded.
    const url = request.url;

    // Use "log" object to print information to actor log.
    log.info('Page scraped', { url, pageTitle });

    // Return an object with the data extracted from the page.
    // It will be stored to the resulting dataset.
    return {
        url,
        pageTitle
    };
}
```

The code runs in [Node.js 16](https://nodejs.org/) and the function accepts a single argument, the `context` object, whose properties are listed below.

The return value of the page function is an object (or an array of objects) representing the data extracted from the web page. The return value must be stringify-able to JSON, i.e. it can only contain basic types and no circular references. If you prefer not to extract any data from the page and skip it in the clean results, simply return `null` or `undefined`.

The **Page function** supports the JavaScript ES6 syntax and is asynchronous, which means you can use the `await` keyword to wait for background operations to finish. To learn more about `async` functions, visit the [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

**Properties of the `context` object:**

- ##### **`window: Object`**

A reference to the [JSDOM](https://github.com/jsdom/jsdom)'s object representing the root scope of the DOM of the current HTML page.

This object is the starting point for traversing the DOM document and extracting data from it. Just like with regular client-side Javascript, you can use the `window.document` object to access the DOM elements and their properties.

  For more information, see the [JSDOM](https://github.com/jsdom/jsdom) documentation.

  Example:

  ```html
  <ul id="movies">
    <li class="fun-movie">Fun Movie</li>
    <li class="sad-movie">Sad Movie</li>
    <li class="horror-movie">Horror Movie</li>
  </ul>
  ```

  ```javascript
  window.document.querySelector('#movies .fun-movie').innerText;
  //=> Fun Movie
  window.document.querySelector('ul .sad-movie').className;
  //=> sad-movie
  window.document.querySelector('li[class=horror-movie]').innerHTML;
  //=> Horror Movie
  ```

- ##### **`Actor: Object`**

A reference to the [Actor](https://sdk.apify.com/api/apify/class/Actor) object from [Apify SDK](https://sdk.apify.com/).
  This is equivalent to:

  ```javascript
  import { Actor } from 'apify';
  ```

- ##### **`Apify: Object`**

A reference to the [Actor](https://sdk.apify.com/api/apify/class/Actor) object from [Apify SDK](https://sdk.apify.com/). Included for backward compatibility.

- ##### **`crawler: Object`**

A reference to the `JSDOMCrawler` object, see [Crawlee docs](https://crawlee.dev/api/jsdom-crawler/class/JSDOMCrawler) for more information.

- ##### **`body: String|Buffer`**

 The body from the target web page. If the web page is in HTML or XML format, the `body` will be a string that contains the HTML or XML content. In other cases, the `body` with be a [Buffer](https://nodejs.org/api/buffer.html). If you need to process the `body` as a string, you can use the information from `contentType` property to convert
  the binary data into a string.

  Example:

  ```javascript
  const stringBody = context.body.toString(context.contentType.encoding)
  ```

- ##### **`contentType: Object`**

The `Content-Type` HTTP header parsed into an object with 2 properties, `type` and `encoding`.

  Example:

  ```javascript
  // Content-Type: application/json; charset=utf-8
  const mimeType = contentType.type; // "application/json"
  const encoding = contentType.encoding; // "utf-8"
  ```

- ##### **`customData: Object`**

 Contains the object provided in the **Custom data** (`customData`) input field.
  This is useful for passing dynamic parameters to your JSDOM Scraper using API.

- ##### **`enqueueRequest(request, [options]): AsyncFunction`**

Adds a new URL to the request queue, if it wasn't already there.

The `request` parameter is an object containing details of the request, with properties such as `url`, `userData`, `headers` etc. For the full list of the supported properties, see the [`Request`](https://crawlee.dev/api/core/class/Request) object's constructor in Crawlee's documentation.

  The optional `options` parameter is an object with additional options. Currently, it only supports the `forefront` boolean flag. If `true`, the request is added to the beginning of the queue. By default, requests are added to the end.

  Example:

  ```javascript
  await context.enqueueRequest({ url: 'https://www.example.com' });
  await context.enqueueRequest({ url: 'https://www.example.com/first' }, { forefront: true });
  ```

- ##### **`env: Object`**

A map of all relevant values set by the Apify platform to the actor run via the `APIFY_` environment variable. For example, here you can find information such as actor run ID, timeouts, actor run memory, etc. For the full list of available values, see the [`Actor.getEnv()`](https://sdk.apify.com/api/apify/class/Actor#getEnv) function in the Apify SDK documentation.

  Example:

  ```javascript
  console.log(`Actor run ID: ${context.env.actorRunId}`);
  ```

- ##### **`getValue(key): AsyncFunction`**

Gets a value from the default key-value store associated with the actor run. The key-value store is useful for persisting named data records, such as state objects, files, etc. The function is very similar to the [`Actor.getValue()`](https://sdk.apify.com/api/apify/class/Actor#getValue) function in Apify SDK.

To set the value, use the dual function `context.setValue(key, value)`.

Example:

  ```javascript
  const value = await context.getValue('my-key');
  console.dir(value);
  ```

- ##### **`globalStore: Object`**

Represents an in-memory store that can be used to share data across page function invocations, e.g. state variables, API responses, or other data. The `globalStore` object has an interface similar to JavaScript's [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object, with a few important differences:
    - All `globalStore` functions are `async`; use `await` when calling them.
    - Keys must be strings and values must be JSON stringify-able.
    - The `forEach()` function is not supported.

Note that stored data is not persisted. If the actor run is restarted or migrated to another worker server, the content of `globalStore` is reset. Therefore, never depend on a specific value to be present in the store.

  Example:

  ```javascript
  let movies = await context.globalStore.get('cached-movies');
  if (!movies) {
    movies = await fetch('http://example.com/movies.json');
    await context.globalStore.set('cached-movies', movies);
  }
  console.dir(movies);
  ```

- ##### **`input: Object`**

An object containing the actor run input, i.e. JSDOM Scraper's configuration. Each page function invocation gets a fresh copy of the `input` object, so changing its properties has no effect.

- ##### **`json: Object`**

The parsed object from a JSON string if the response contains the content type `application/json`.

- ##### **`log: Object`**

An object containing logging functions, with the same interface as provided by the
  [`crawlee.utils.log`](https://crawlee.dev/api/core/class/Log) object in Crawlee. The log messages are written directly to the actor run log, which is useful for monitoring and debugging. Note that `log.debug()` only logs messages if the **Debug log** input setting is set.

  Example:

  ```javascript
  const log = context.log;
  log.debug('Debug message', { hello: 'world!' });
  log.info('Information message', { all: 'good' });
  log.warning('Warning message');
  log.error('Error message', { details: 'This is bad!' });
  try {
    throw new Error('Not good!');
  } catch (e) {
    log.exception(e, 'Exception occurred', { details: 'This is really bad!' });
  }
  ```

- ##### **`saveSnapshot(): AsyncFunction`**

Saves the full HTML of the current page to the key-value store associated with the actor run, under the `SNAPSHOT-BODY` key. This feature is useful when debugging your scraper.

Note that each snapshot overwrites the previous one and the `saveSnapshot()` calls are throttled to at most one call in two seconds, in order to avoid excess consumption of resources and slowdown of the actor.

- ##### **`setValue(key, data, options): AsyncFunction`**

Sets a value to the default key-value store associated with the actor run. The key-value store is useful for persisting named data records, such as state objects, files, etc. The function is very similar to the [`Actor.setValue()`](https://sdk.apify.com/api/apify/class/Actor#setValue) function in Apify SDK.

  To get the value, use the dual function `context.getValue(key)`.

  Example:

  ```javascript
  await context.setValue('my-key', { hello: 'world' });
  ```

- ##### **`skipLinks(): AsyncFunction`**

Calling this function ensures that page links from the current page will not be added to the request queue, even if they match the [**Link selector**](#link-selector) and/or **[Glob Patterns](#glob-patterns)**/**[Pseudo-URLs](#pseudo-urls)** settings. This is useful to programmatically stop recursive crawling, e.g. if you know there are no more interesting links on the current page to follow.

- ##### **`request: Object`**

An object containing information about the currently loaded web page, such as the URL, number of retries, a unique key, etc. Its properties are equivalent to the [`Request`](https://crawlee.dev/api/core/class/Request) object in Crawlee.

- ##### **`response: Object`**

An object containing information about the HTTP response from the web server. Currently, it only contains the `status` and `headers` properties. For example:

  ```javascript
  {
    // HTTP status code
    status: 200,

    // HTTP headers
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'date': 'Wed, 06 Nov 2019 16:01:53 GMT',
      'cache-control': 'no-cache',
      'content-encoding': 'gzip',
    }
  }
  ```

<!-- TODO: We're missing more detailed description for prepareRequestFunction, what is it good for?
Give some example, also better prefill -->

## How to set proxies for JSDOM Scraper

The **Proxy configuration** (`proxyConfiguration`) option enables you to set
proxies that will be used by the scraper in order to prevent its detection by target web pages. You can use both the [Apify Proxy](https://apify.com/proxy) and custom HTTP or SOCKS5 proxy servers.

Proxy is required to run the scraper. The following table lists the available options of the proxy configuration setting:

<table class="table table-bordered table-condensed">
    <tbody>
    <tr>
        <th><b>Apify&nbsp;Proxy&nbsp;(automatic)</b></td>
        <td>
            The scraper will load all web pages using the <a href="https://apify.com/proxy">Apify Proxy</a>
            in automatic mode. In this mode, the proxy uses all proxy groups that are available to the user. For each new web page it automatically selects the proxy that hasn't been used in the longest time for the specific hostname in order to reduce the chance of detection by the web page.
            You can view the list of available proxy groups on the <a href="https://console.apify.com/proxy" target="_blank" rel="noopener">Proxy</a> page in Apify Console.
        </td>
    </tr>
    <tr>
        <th><b>Apify&nbsp;Proxy&nbsp;(selected&nbsp;groups)</b></td>
        <td>
            The scraper will load all web pages using the <a href="https://apify.com/proxy">Apify Proxy</a>
            with specific groups of target proxy servers.
        </td>
    </tr>
    <tr>
        <th><b>Custom&nbsp;proxies</b></td>
        <td>
            <p>
            The scraper will use a custom list of proxy servers.
            The proxies must be specified in the <code>scheme://user:password@host:port</code> format.
            Multiple proxies should be separated by a space or new line. The URL scheme can be either <code>http</code> or <code>socks5</code>. User and password might be omitted, but the port must always be present.
            </p>
            <p>
                Example:
            </p>
            <pre><code class="language-none">http://bob:password@proxy1.example.com:8000<br>http://bob:password@proxy2.example.com:8000</code></pre>
        </td>
    </tr>
    </tbody>
</table>

The proxy configuration can be set programmatically when calling the actor using the API by setting the `proxyConfiguration` field. It accepts a JSON object with the following structure:

```javascript
{
    // Indicates whether to use the Apify Proxy or not.
    "useApifyProxy": Boolean,

    // Array of Apify Proxy groups, only used if "useApifyProxy" is true.
    // If missing or null, the Apify Proxy will use automatic mode.
    "apifyProxyGroups": String[],

    // Array of custom proxy URLs, in "scheme://user:password@host:port" format.
    // If missing or null, custom proxies are not used.
    "proxyUrls": String[],
}
```

## Advanced configuration

### Pre-navigation hooks

<!-- todo request as browser is out -->
This is an array of functions that will be executed **BEFORE** the main `pageFunction` is run. A similar `context` object is passed into each of these functions as is passed into the `pageFunction`; however, a second `gotOptions` object is also passed in.

The available options can be seen here:

```JavaScript
preNavigationHooks: [
    async ({ id, request, session, proxyInfo, customData, Actor }, { url, method, headers, proxyUrl }) => {}
]
```

Check out the docs for [Pre-navigation hooks](https://crawlee.dev/api/jsdom-crawler/interface/JSDOMCrawlerOptions#preNavigationHooks) and the [JSDOM Hook type](https://crawlee.dev/api/jsdom-crawler#JSDOMHook) for more info regarding the objects passed into these functions. The available properties are extended with `Actor` (alternatively `Apify`) and `customData` in this scraper.

### Post-navigation hooks

An array of functions that will be executed **AFTER** the main `pageFunction` is run. The only available parameter is the [CrawlingContext](https://crawlee.dev/api/jsdom-crawler/interface/JSDOMCrawlingContext) object. The available properties are extended with `Actor` (alternatively `Apify`) and `customData` in this scraper.

```JavaScript
postNavigationHooks: [
    async ({ id, request, session, proxyInfo, response, customData, Actor }) => {}
]
```

Check out the docs for [Pre-navigation hooks](https://crawlee.dev/api/jsdom-crawler/interface/JSDOMCrawlerOptions#preNavigationHooks) for more info regarding the objects passed into these functions.

## Results

The scraping results returned by [**Page function**](#page-function) are stored in the default dataset associated with the actor run, from where you can export them to formats such as JSON, XML, CSV or Excel. For each object returned by the [**Page function**](#page-function), JSDOM Scraper pushes one record into the dataset and extends it with metadata such as the URL of the web page where the results come from.

For example, if your page function returned the following object:

```js
{
  message: 'Hello world!'
}
```

The full object stored in the dataset will look as follows (in JSON format, including the metadata fields `#error` and `#debug`):

```json
{
  "message": "Hello world!",
  "#error": false,
  "#debug": {
    "requestId": "fvwscO2UJLdr10B",
    "url": "https://www.example.com/",
    "loadedUrl": "https://www.example.com/",
    "method": "GET",
    "retryCount": 0,
    "errorMessages": null,
    "statusCode": 200
  }
}
```

To download the results, call the [Get dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection) API endpoint:

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=json
```

where `[DATASET_ID]` is the ID of the actor's run dataset, in which you can find the Run object returned when starting the actor. Alternatively, you'll find the download links for the results in Apify Console.

To skip the `#error` and `#debug` metadata fields from the results and not include empty result records, simply add the `clean=true` query parameter to the API URL, or select the  **Clean items** option when downloading the dataset in Apify Console.

To get the results in other formats, set the `format` query parameter to `xml`, `xlsx`, `csv`, `html`, etc. For more information, see [Datasets](https://docs.apify.com/storage#dataset) in documentation or the [Get dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection) endpoint in Apify API reference.

## Additional resources 

Congratulations! You've learned how JSDOM Scraper works. You might also want to see these other resources:

- [Web scraping tutorial](https://docs.apify.com/tutorials/apify-scrapers) - an introduction to web scraping with Apify.
- [Scraping with JSDOM Scraper](https://docs.apify.com/tutorials/apify-scrapers/jsdom-scraper) - a step-by-step tutorial on how to use JSDOM Scraper, with a detailed explanation and examples.
- **Web Scraper** ([apify/web-scraper](https://apify.com/apify/web-scraper)) - Apify's basic tool for web crawling and scraping. It uses a full Chrome browser to render dynamic content. A similar web scraping actor to Puppeteer Scraper, but is simpler to use and only runs in the context of the browser. Uses the [Puppeteer](https://github.com/GoogleChrome/puppeteer) library.
- **Cheerio Scraper** ([apify/cheerio-scraper](https://apify.com/apify/cheerio-scraper)) - a lightweight web scraping actor similar to JSDOM Scraper, but using the [Cheerio](https://cheerio.js.org/) library instead.
- **Puppeteer Scraper** ([apify/puppeteer-scraper](https://apify.com/apify/puppeteer-scraper)) - an actor similar to Web Scraper, which provides lower-level control of the underlying [Puppeteer](https://github.com/GoogleChrome/puppeteer) library and the ability to use server-side libraries.
- **Playwright Scraper** ([apify/playwright-scraper](https://apify.com/apify/playwright-scraper)) - a similar web scraping actor to Puppeteer Scraper, but using the [Playwright](https://github.com/microsoft/playwright) library instead.
- [Actors documentation](https://docs.apify.com/actors) - documentation for the Apify Actors cloud computing platform.
- [Crawlee documentation](https://crawlee.dev) - learn how to build a new web scraping project from scratch using the world's most popular web crawling and scraping library for Node.js.
