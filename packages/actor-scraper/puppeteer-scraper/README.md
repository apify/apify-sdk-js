# Puppeteer Scraper

Puppeteer Scraper is the most powerful scraper tool in our arsenal (aside from developing your own actors).

It uses the Puppeteer library to programmatically control a headless Chrome browser and it can make it do almost anything. If using [Web Scraper](https://apify.com/apify/web-scraper) doesn't cut it for your use case, then Puppeteer Scraper is what you need.

[Puppeteer](https://github.com/GoogleChrome/puppeteer/) is a Node.js library, so knowledge of Node.js and its paradigms is expected when working with this actor.

If you need either a faster, or a simpler tool, check out [Cheerio Scraper](https://apify.com/apify/cheerio-scraper) for optimization and speed, or [Web Scraper](https://apify.com/apify/web-scraper) for simplicity.

If you are having any difficulty deciding which of the three main Apify "Scraper" actors to use, check out the [Web-Scraper vs Puppeteer-Scraper](https://help.apify.com/en/articles/3195646-when-to-use-puppeteer-scraper) and [Cheerio-Scraper](https://blog.apify.com/how-to-super-efficiently-scrape-any-website-for-beginners/) articles on the Apify blog.

<!-- toc -->

-   [Usage](#usage)
-   [Limitations](#limitations)
-   [Input Configuration](#input-configuration)
    -   [Start URLs](#start-urls)
    -   [Link selector](#link-selector)
    -   [Pseudo-URLs](#pseudo-urls)
    -   [Clickable elements selector](#clickable-elements-selector)
    -   [Page function](#page-function)
        -   [`input`](#input)
        -   [`env`](#env)
        -   [`customData`](#customdata)
        -   [`page`](#page)
        -   [`request`](#request)
        -   [`response`](#response)
        -   [`crawler`](#crawler)
        -   [`globalStore`](#globalStore)
        -   [`log`](#log)
        -   [`Apify`](#apify)
        -   [`setValue`](#setvalue)
        -   [`getValue`](#getvalue)
        -   [`saveSnapshot`](#savesnapshot)
        -   [`skipLinks`](#skiplinks)
        -   [`enqueueRequest`](#enqueuerequest)
-   [Proxy and browser configuration](#proxy-and-browser-configuration)
-   [Advanced configuration](#advanced-configuration)
    -   [Pre-navigation hooks](#pre-navigation-hooks)
    -   [Post-navigation hooks](#post-navigation-hooks)
    -   [Debug log](#debug-log)
    -   [Browser log](#browser-log)
    -   [Custom data](#custom-data)
    -   [Custom namings](#custom-namings)
-   [Results](#results)
-   [Additional Resources](#additional-resources)
-   [Upgrading](#upgrading)

<!-- tocstop -->

## Usage

To get started with Puppeteer Scraper, you only need a few things. First, with `Start URLs`, tell the scraper which web pages it should load. Then, tell it how to handle each request and extract data from each page.

The scraper starts by loading pages specified in the [**Start URLs**](#start-urls) input setting. You can make the scraper follow page links on the fly by setting a **[Link selector](#link-selector)** and/or **[Pseudo-URLs](#pseudo-urls)** to tell the scraper which links it should add to the crawler's request queue. This is useful for the recursive crawling of entire websites (e.g. finding all products available in an online store).

To tell the scraper how to handle requests and extra data, you need to provide a **[Page function](#page-function)**, and optionally arrays of **[Pre-navigation hooks](#pre-navigation-hooks)** and **[Post-navigation hooks](#post-navigation-hooks)**. This is JavaScript code that is executed in the Node.js environment. Since the scraper uses the full-featured Chromium browser, client-side logic to be executed within the context of the web-page can be done using the **[`page`](#page)** object within the Page function's context.

In summary, Puppeteer Scraper works as follows:

1. Adds each URL from [Start URLs](#start-urls) to the request queue.
2. For each request:
    - Evaluates all hooks in [Pre-navigation hooks](#pre-navigation-hooks)
    - Executes the [Page function](#page-function) on the loaded page
    - Optionally, finds all links from the page using [Link selector](#link-selector). If a link matches any of the [Pseudo URLs](#pseudo-urls) and has not yet been requested, it is added to the queue.
    - Evaluates [Post-navigation hooks](#post-navigation-hooks)
3. If there are more items in the queue, repeats step 2. Otherwise, finishes the crawl.

Puppeteer Scraper has a number of other configuration settings to improve performance, set cookies for login to websites, mask the web browser, etc.. See [Advanced configuration](#advanced-configuration) below for the complete list of settings.

## Limitations

The actor employs a fully-featured Chromium web browser, which is resource-intensive and might be overkill for websites that do not render the content dynamically using client-side JavaScript. To achieve better performance for scraping such sites, you might prefer to use [**Cheerio Scraper**](https://apify.com/apify/cheerio-scraper), which downloads and processes raw HTML pages without the overheads of a web browser.

For non-seasoned developers, Puppeteer Scraper may be too complex. For a simpler setup process check out [Web Scraper](https://apify.com/apify/web-scraper), which also uses Puppeteer under the hood.

## Input Configuration

On input, the Puppeteer Scraper actor accepts a number of configuration settings. These can be entered either manually in the user interface in [Apify Console](https://console.apify.com), or programmatically in a JSON object using the [Apify API](https://apify.com/docs/api/v2#/reference/actors/run-collection/run-actor). For a complete list of input fields and their types, please see the outline of the actor's [Input-schema](https://apify.com/apify/puppeteer-scraper/input-schema).

### Start URLs

The **Start URLs** (`startUrls`) field represent the initial list of URLs of pages that the scraper will visit. You can either enter these URLs manually one by one, upload them in a CSV file or [link URLs from a Google Sheet](https://help.apify.com/en/articles/2906022-scraping-a-list-of-urls-from-google-spreadsheet) document. Note that each URL must start with either a `http://` or `https://` protocol prefix.

The scraper supports adding new URLs to scrape on the fly, either using the **[Link selector](#link-selector)** and **[Pseudo-URLs](#pseudo-urls)** options, or by calling `await context.enqueueRequest()`inside the **[Page function](#page-function)**.

Optionally, each URL can be associated with custom user data - a JSON object that can be referenced from your JavaScript code in **[Page function](#page-function)** under `context.request.userData`. This is useful for determining which start URL is currently loaded, allowing the ability to perform some page-specific actions. For example, when crawling an online store, you might want to perform different actions on a page listing the products vs. a product detail page. For details, refer to **[Web scraping tutorial](https://apify.com/docs/scraping/tutorial/introduction#the-start-url)** within the Apify documentation.

<!-- TODO: Describe how the queue works, unique key etc. plus link -->

### Link selector

The **Link selector** (`linkSelector`) field contains a CSS selector that is used to find links to other web pages (items with `href` attributes, e.g. `<div class="my-class" href="...">`).

On every page loaded, the scraper looks for all links matching **Link selector**, and checks that the target URL matches one of the [**Pseudo-URLs**](#pseudo-urls). If it is a match, it then adds the URL to the request queue so that it's loaded by the scraper later on.

By default, new scrapers are created with the following selector that matches all links on any page:

```
a[href]
```

If **Link selector** is empty, the page links are ignored, and the scraper only loads pages that were specified in **[Start URLs](#start-urls)** or that were manually added to the request queue by calling `await context.enqueueRequest()` in **[Page function](#page-function)**.

### Pseudo URLs

The **Pseudo-URLs** (`pseudoUrls`) field specifies which types of URLs found by **[Link selector](#link-selector)** should be added to the request queue.

A pseudo-URL is simply a URL with special directives enclosed in `[]` brackets.
Currently, the only supported directive is `[regexp]`, which defines
a JavaScript-style regular expression to match against the URL.

For example, a pseudo-URL `http://www.example.com/pages/[(\w|-)*]` will match all of the
following URLs:

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

Optionally, each pseudo-URL can be associated with user data that can be referenced from your **[Page function](#page-function)** using `context.request.userData` to determine which kind of page is currently loaded in the browser.

Note that you don't need to use the **Pseudo-URLs** setting at all, because you can completely control which pages the scraper will access by calling `await context.enqueueRequest()` from the **[Page function](#page-function)**.

### Clickable elements selector

For pages where the links you want to add to the crawler's request queue aren't included in elements with `href` attributes, you can pass a CSS Selector to the **Clickable elements selector**. This CSS selector should match elements that lead to the URL you want to queue up.

The scraper will mouse click the specified CSS selector after the page function finishes. Any triggered requests, navigations, or open tabs will be intercepted, and the target URLs will be filtered using Pseudo URLs. Finally, these filtered URLs will be added to the request queue. Leave this field empty empty to prevent the scraper from clicking in the page.

It's important to note that _using this setting can impact performance._

### Page function

Page function `context` as it appears within `Page function`:

```JavaScript
const context = {
    // USEFUL DATA
    input, // Input data in JSON format
    env, // Contains information about the run, such as actorId and runId
    customData, // Value of the 'Custom data' scraper option.

    // EXPOSED OBJECTS
    page, // Puppeteer.Page object.
    request, // Apify.Request object.
    response, // Response object holding the status code and headers.
    crawler, // Reference to the crawler object, with access to `browserPool`, `autoscaledPool`, and more
    globalStore, // Represents an in memory store that can be used to share data across pageFunction invocations
    log, // Reference to Apify.utils.log
    Apify, // Reference to the full power of Apify SDK.

    // EXPOSED FUNCTIONS
    setValue, // Reference to the Apify.setValue() function.
    getValue, // Reference to the Apify.getValue() function.
    saveSnapshot, // Saves a screenshot and full HTML of the current page to the key value store.
    skipLinks, // Prevents enqueueing more links via Pseudo URLs on the current page.
    enqueueRequest, // Adds a page to the request queue.
};
```

#### **`input`**

| Type   | Arguments | Returns      |
| ------ | --------- | ------------ |
| Object | -         | Input object |

The actor's input as it was received from the UI. Each `pageFunction` invocation gets a fresh copy. Note that the actor's input cannot be modified by changing the values in this object.

#### **`env`**

| Type   | Arguments | Returns                                                                              |
| ------ | --------- | ------------------------------------------------------------------------------------ |
| Object | -         | Return value of [`Apify.getEnv()`](https://sdk.apify.com/docs/api/apify#apifygetenv) |

A map of all the relevant environment variables that you may want to use.

#### **`customData`**

| Type   | Arguments | Returns            |
| ------ | --------- | ------------------ |
| Object | -         | Custom data object |

Since the input UI is fixed, it does not support adding of other fields that may be needed for all specific use cases. If you need to pass arbitrary data to the scraper, use the [Custom data](#custom-data) input field within [Advanced configuration](#advanced-configuration) and its contents will be available under the `customData` context key as an object.

#### **`page`**

| Type   | Arguments | Returns                                                                           |
| ------ | --------- | --------------------------------------------------------------------------------- |
| Object | -         | [Puppeteer Page](https://pptr.dev/#?product=Puppeteer&show=api-class-page) object |

This is a reference to the Puppeteer Page object, which enables you to use the full power of Puppeteer in your Page functions. If you are not familiar with the Page API already, you can refer to [their documentation](https://pptr.dev/#?product=Puppeteer&show=api-class-page).

#### **`request`**

| Type   | Arguments | Returns                                                        |
| ------ | --------- | -------------------------------------------------------------- |
| Object | -         | Apify [Request](https://sdk.apify.com/docs/api/request) object |

An object with metadata about the currently crawled page, such as its URL, headers, and the number of retries.

```JavaScript
const request = {
    id,
    url,
    loadedUrl,
    uniqueKey,
    method,
    payload,
    noRetry,
    retryCount,
    errorMessages,
    headers,
    userData,
    handledAt
}
```

See the [Request class](https://sdk.apify.com/docs/api/request) for a preview of the structure and full documentation.

#### **`response`**

| Type   | Arguments | Returns         |
| ------ | --------- | --------------- |
| Object | -         | Response object |

The response object is produced by Puppeteer. Currently, we only pass the response's HTTP status code and headers to the `response` object.

#### **`crawler`**

| Type   | Arguments | Returns                                                                                   |
| ------ | --------- | ----------------------------------------------------------------------------------------- |
| Object | -         | Apify [PuppeteerCrawler](https://sdk.apify.com/docs/api/puppeteer-crawler#docsNav) object |

To access the current `AutoscaledPool` or `BrowserPool` instance, we can use the `crawler` object. This object includes the following properties:

```JavaScript
const crawler = {
    stats,
    requestList,
    requestQueue,
    sessionPool,
    proxyConfiguration,
    browserPool,
    autoscaledPool
}
```

Refer to the [official documentation](https://sdk.apify.com/docs/api/puppeteer-crawler#docsNav) for more information.

#### **`globalStore`**

| Type   | Arguments | Returns               |
| ------ | --------- | --------------------- |
| Object | -         | Global store contents |

`globalStore` represents an instance of a very simple in-memory store that is not scoped to the individual `pageFunction` invocation. This enables you to easily share global data such as API responses and tokens between all requests. Since the stored data needs to cross from the browser to the Node.js process, it must be formatted into JSON stringifiable objects. You cannot store DOM objects, functions, circular objects, etc.

#### **`log`**

| Type   | Arguments | Returns                                                              |
| ------ | --------- | -------------------------------------------------------------------- |
| Object | -         | [Apify.utils.log](https://sdk.apify.com/docs/api/log#docsNav) object |

This should be used instead of JavaScript's built in `console.log` when logging in the Node.js context, as it automatically color-tags your logs, as well as allows the toggling of the visibility of log messages using options such as [Debug log](#debug-log) in [Advanced configuration](#advanced-configuration).

The most common `log` methods include:

-   `context.log.info()`
-   `context.log.debug()`
-   `context.log.warning()`
-   `context.log.error()`
-   `context.log.exception()`

#### **`Apify`**

| Type   | Arguments | Returns                                                    |
| ------ | --------- | ---------------------------------------------------------- |
| Object | -         | [Apify class](https://sdk.apify.com/docs/api/apify) object |

A reference to the full power of the Apify SDK. See [the docs](https://sdk.apify.com/docs/api/apify) for more information and all the available methods and classes.

> Caution: Since we're making the full SDK available with this option, and Puppeteer Scraper already runs using the SDK, some edge case manipulations may lead to inconsistencies. Use `Apify` with caution, and avoid making global changes unless you know what you're doing.

#### **`setValue`**

| Type     | Arguments                                          | Returns          |
| -------- | -------------------------------------------------- | ---------------- |
| Function | (key: _string_, data: _object_, options: _object_) | _Promise\<void>_ |

> This function is async! Don't forget the `await` keyword!

Allows you to save data to the default key-value store. The `key` is the name of the item in the store (which can later be used to retrieve this storeddata), and the `data` is an object containing all of the data you want to store.

Usage:

```JavaScript
await context.setValue('my-value', { message: 'hello' })
```

Refer to Apify's [Key-Value store documentation](https://sdk.apify.com/docs/api/key-value-store#keyvaluestoregetvaluekey) for more information.

#### **`getValue`**

| Type     | Arguments       | Returns            |
| -------- | --------------- | ------------------ |
| Function | (key: _string_) | _Promise\<object>_ |

> This function is async! Don't forget the `await` keyword!

Retrieve previously saved data in the key-value store via the `key` specified when using the [`setValue`](#setvalue) function.

Usage:

```JavaScript
const { message } = await context.getValue('my-value')
```

Refer to Apify's [Key-Value store documentation](https://sdk.apify.com/docs/api/key-value-store#keyvaluestoregetvaluekey) for more information.

#### **`saveSnapshot`**

| Type     | Arguments | Returns          |
| -------- | --------- | ---------------- |
| Function | ()        | _Promise\<void>_ |

> This function is async! Don't forget the `await` keyword!

A helper function that enables saving a snapshot of the current page's HTML and a screenshot of the current page into the default key-value store. Each snapshot overwrites the previous one, and the `pageFunction`'s invocations will also be throttled if `saveSnapshot` is invoked more than once in 2 seconds (this is a measure put in place to prevent abuse). _Make sure you don't call it for every single request._

Usage:

```JavaScript
await context.saveSnapshot()
```

You can find the latest screenshot under the `SNAPSHOT-SCREENSHOT` key and the HTML under the `SNAPSHOT-BODY` key.

#### **`skipLinks`**

| Type     | Arguments | Returns          |
| -------- | --------- | ---------------- |
| Function | ()        | _Promise\<void>_ |

> This function is async! Don't forget the `await` keyword!

With each invocation of the pageFunction, the scraper attempts to extract new URLs from the page using the Link selector and PseudoURLs provided in the input UI. If you want to prevent this behavior in certain cases, call the `skipLinks` function, and no URLs will be added to the queue for the given page.

Usage:

```JavaScript
await context.skipLinks()
```

#### **`enqueueRequest`**

| Type     | Arguments                    | Returns          |
| -------- | ---------------------------- | ---------------- |
| Function | (request: _Request\|object_) | _Promise\<void>_ |

> This function is async! Don't forget the `await` keyword!

To enqueue a specific URL manually instead of automatically by a combination of a Link selector and a Pseudo URL, use the enqueueRequest function. It accepts a plain object as argument that needs to have the structure to construct a [Request object](https://sdk.apify.com/docs/api/request), but frankly, you just need an object with a `url` key.

Usage:

```JavaScript
await context.enqueueRequest({ url: 'https://www.example.com' })
```

This method is a nice shorthand for

```JavaScript
await context.crawler.requestQueue.addRequest({ url: 'https://foo.bar/baz' })
```

## Proxy Configuration

The **Proxy configuration** (`proxyConfiguration`) option enables you to set proxies that will be used by the scraper in order to prevent its detection by target websites.
You can use both [Apify Proxy](https://apify.com/proxy)
as well as custom HTTP or SOCKS5 proxy servers.

The following table lists the available options of the proxy configuration setting:

| Option                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| None                          | The scraper will not use any proxies. All web pages will be loaded directly from IP addresses of Apify servers running on Amazon Web Services.                                                                                                                                                                                                                                                                                                                                                            |
| Apify Proxy                   | The scraper will load all web pages using [Apify Proxy](https://apify.com/proxy) in the automatic mode. In this mode, the proxy uses all proxy groups that are available to the user, and for each new web page it automatically selects the proxy that hasn't been used in the longest time for the specific hostname, in order to reduce the chance of detection by the website. You can view the list of available proxy groups on the [Proxy](https://console.apify.com/proxy) page in Apify Console. |
| Apify Proxy (selected groups) | The scraper will load all web pages using [Apify Proxy](https://apify.com/proxy) with specific groups of target proxy servers.                                                                                                                                                                                                                                                                                                                                                                            |
| Custom proxies                | The scraper will use a custom list of proxy servers. The proxies must be specified in the `scheme://user:password@host:port` format, and multiple proxies should be separated by a space of a new line. The URL scheme can be either `http` or `socks5`. Username and password can be omitted if the proxy doesn't require authorization, but the port must always be present.                                                                                                                            |

Custom proxy example:

```
http://bob:password@proxy1.example.com:8000
http://bobby:password123@proxy2.example.com:3001
```

The proxy configuration can be set programmatically when calling the actor using the API by setting the `proxyConfiguration` field. It accepts a JSON object with the following structure:

```JavaScript
{
    // Indicates whether to use Apify Proxy or not.
    "useApifyProxy": Boolean,

    // Array of Apify Proxy groups, only used if "useApifyProxy" is true.
    // If missing or null, Apify Proxy will use the automatic mode.
    "apifyProxyGroups": String[],

    // Array of custom proxy URLs, in "scheme://user:password@host:port" format.
    // If missing or null, custom proxies are not used.
    "proxyUrls": String[],
}
```

## Advanced Configuration

### Pre-navigation hooks

This is an array of functions that will be executed **BEFORE** the main `pageFunction` is run. A similar `context` object is passed into each of these functions as is passed into the `pageFunction`; however, a second "[DirectNavigationOptions](https://sdk.apify.com/docs/typedefs/direct-navigation-options)" object is also passed in.

The available options can be seen here:

```JavaScript
preNavigationHooks: [
    async ({ id, request, session, proxyInfo, customData, Apify }, { timeout, waitUntil, referer }) => {}
]
```

Check out the docs for [Pre-navigation hooks](https://sdk.apify.com/docs/typedefs/puppeteer-crawler-options#prenavigationhooks) and the [PuppeteerHook type](https://sdk.apify.com/docs/typedefs/puppeteer-hook) for more info regarding the objects passed into these functions. The available properties are extended with `Apify` and `customData` in this scraper.

### Post-navigation hooks

An array of functions that will be executed **AFTER** the main `pageFunction` is run. The only available parameter is the [CrawlingContext](https://sdk.apify.com/docs/typedefs/crawling-context) object. The available properties are extended with `Apify` and `customData` in this scraper.

```JavaScript
postNavigationHooks: [
    async ({ id, request, session, proxyInfo, response, customData, Apify }) => {}
]
```

Check out the docs for [Post-navigation hooks](https://sdk.apify.com/docs/typedefs/puppeteer-crawler-options#postnavigationhooks) and the [PuppeteerHook type](https://sdk.apify.com/docs/typedefs/puppeteer-hook) for more info regarding the objects passed into these functions.

### Debug log

_boolean_

When set to true, debug messages will be included in the log. Use `context.log.debug('message')` to log your own debug messages.

### Browser log

_boolean_

When set to true, console messages from the browser will be included in the actor's log. This may result in the log being flooded by error messages, warnings and other messages of little value (especially with a high concurrency).

### Custom data

Since the input UI is fixed, it does not support adding of other fields that may be needed for all specific use cases. If you need to pass arbitrary data to the scraper, use the [Custom data](#custom-data) input field within [Advanced configuration](#advanced-configuration) and its contents will be available under the `customData` context key as an object within the [pageFunction](#page-function).

### Custom namings:

With the final three options in the **Advanced configuration**, you can set custom names for the following:

-   Dataset
    -   Leave your dataset unnamed if you only want the data within it to be persisted on the Apify platform for 7 days (after which, it will expire). Named datasets are retained indefinitely. Additionally, using a named dataset allows you to share it across multiple runs (e.g. Instead of having 10 different unnamed datasets for 10 different runs, all the data from all 10 runs can be accumulated into a single named dataset). Learn more [here](https://docs.apify.com/storage#named-and-unnamed-storages).
-   Key-value store
    -   Similarly to datasets, named key-value stores never expire, and unnamed ones expire after 7 days.
-   Request queue

## Results

The scraping results returned by **[Page function](#page-function)** are stored in the default dataset associated with the actor run, from which you can export them to formats such as JSON, XML, CSV or Excel.
For each object returned by the **[Page function](#page-function)**, Puppeteer Scraper pushes one record into the dataset, and extends it with metadata such as the URL of the web page where the results come from.

For example, if you were scraping the HTML `<title>` of [Apify](https://apify.com) and returning the following object from the `pageFunction`:

```JavaScript
return {
  title: "Web Scraping, Data Extraction and Automation - Apify"
}
```

The full object stored in the dataset would look as follows (in JSON format, including the metadata fields `#error` and `#debug`):

```JSON
{
  "title": "Web Scraping, Data Extraction and Automation - Apify",
  "#error": false,
  "#debug": {
    "requestId": "fvwscO2UJLdr10B",
    "url": "https://apify.com",
    "loadedUrl": "https://apify.com/",
    "method": "GET",
    "retryCount": 0,
    "errorMessages": null,
    "statusCode": 200
  }
}
```

To download the results, call the [Get dataset items](https://apify.com/docs/api/v2#/reference/datasets/item-collection) API endpoint:

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=json
```

`[DATASET_ID]` is the ID of the actor's run dataset, in which you can find the Run object returned when starting the actor. Alternatively, you'll find the download links for the results in Apify Console.

To skip the `#error` and `#debug` metadata fields from the results and not include empty result records, simply add the `clean=true` query parameter to the API URL, or select the **Clean items** option when downloading the dataset in Apify Console.

To get the results in other formats, set the `format` query parameter to `xml`, `xlsx`, `csv`, `html`, etc.
For more information, see [Datasets](https://apify.com/docs/storage#dataset) in documentationm or the [Get dataset items](https://apify.com/docs/api/v2#/reference/datasets/item-collection) endpoint in the Apify API reference.

## Additional Resources

That's it! You might also want to check out these other resources:

-   [Actors documentation](https://apify.com/docs/actor) - Documentation for the Apify Actors cloud computing platform.
-   [Apify SDK](https://sdk.apify.com) - Learn how to build a new web scraping actor from scratch using the world's most popular web crawling and scraping library for Node.js.
-   [Cheerio Scraper](https://apify.com/apify/cheerio-scraper) - Another web scraping actor that downloads and processes pages in raw HTML for much higher performance.
-   [Web Scraper](https://apify.com/apify/web-scraper) - A similar web scraping actor to Puppeteer Scraper, but is simpler to use and only runs in the context of the browser. Still uses the [Puppeteer](https://github.com/GoogleChrome/puppeteer) library.

## Upgrading

v2 introduced several minor breaking changes, you can read about those in the [migration guide](https://github.com/apify/actor-scraper/blob/master/MIGRATIONS.md).
