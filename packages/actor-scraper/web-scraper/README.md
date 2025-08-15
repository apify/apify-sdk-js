# Web Scraper

## What is Web Scraper?

Web Scraper is a tool for extracting data from any website. It can navigate pages, render JavaScript, and extract structured data using a few simple commands. Whether you need to scrape product prices, real estate data, or social media profiles, this Actor turns any web page into an API.

- Configurable with an **intuitive user interface**
- Can handle almost **any website** and can scrape dynamic content
- Scrape a list of **URLs or crawl an entire website** by following links
- Runs entirely on the **Apify platform**; no need to manage servers or proxies
- Set your scraper to **run on a schedule** and get data delivered automatically
- Can be used as a template to **create your own scraper**

## What can Web Scraper data be used for?

Web Scraper can extract almost any data from any site, effectively turning any site into a data source. All data can be exported into **JSON, CSV, HTML, and Excel** formats. 

Here are some examples:

- **Extract reviews** from sites like Yelp or Amazon
- Gather **real estate data** from Zillow or local realtor pages
- Get **contact details** and social media accounts from local businesses
- **Monitor mentions** of a brand or person on specific sites
- **Collect and monitor product prices** on e-commerce websites

As a generic tool, Web Scraper can also serve as a template to **build your own scraper** which you can then market on Apify Store. 

## How much does the Web Scraper cost?

Web Scraper is free to use, but you do pay for Apify platform usage, which is calculated in [compute units](https://help.apify.com/en/articles/3490384-what-is-a-compute-unit?ref=apify) (CU). On the free plan, these are charged at $0.04 per CU. CUs get cheaper with higher subscription plans - [see our pricing page](https://apify.com/pricing) for more details. 

With our free plan, you get **$5 in platform credits every month**, which is enough to scrape from 500 to 1,000 **web pages**. If you sign up to our Starter plan, you can expect to scrape thousands.

## How to use Web Scraper

1. [Create](https://console.apify.com/actors/moJRLRc85AitArpNN?addFromActorId=moJRLRc85AitArpNN) a free Apify account using your email and open [Web Scraper](https://apify.com/apify/web-scraper)
2. Add one or more URLs you want to scrape
3. Set paths that you’d like to include or exclude from crawling by configuring glob patterns or pseudo-URLs
4. Configure the page function that determines the data that needs to be scraped
5. Click the “Start” button and wait for the data to be extracted
6. Download your data in JSON, XML, CSV, Excel, or HTML

For more in-depth instructions, please read our article on [scraping with Web Scraper](https://docs.apify.com/tutorials/apify-scrapers/web-scraper), which features step-by-step instructions on how to use Web Scraper on the basis of real-life examples.

## Using Web Scraper with the Apify API

The Apify API gives you programmatic access to the Apify platform. The API is organized around RESTful HTTP endpoints that enable you to manage, schedule, and run Apify Actors. The API also lets you access any datasets, monitor actor performance, fetch results, create and update versions, and more. 

To access the API using Node.js, use the `apify-client` [NPM package](https://apify.com/apify/web-scraper/api/javascript). To access the API using Python, use the `apify-client` [PyPI package](https://apify.com/apify/web-scraper/api/python).

Click on the [API tab](https://apify.com/apify/web-scraper/api/python) for code examples, or check out the [Apify API reference](https://docs.apify.com/api/v2) docs for all the details.

## Web Scraper and MCP Server

With Apify API, you can use almost any Actor in conjunction with an MCP server. You can connect to the MCP server using clients like ClaudeDesktop and LibreChat, or even build your own. Read all about how you can [set up Apify Actors with MCP](https://blog.apify.com/how-to-use-mcp/). 

For Web Scraper, go to the [MCP tab](https://apify.com/apify/web-scraper/api/mcp) and then go through the following steps:

1. Start a Server-Sent Events (SSE) session to receive a `sessionId`
2. Send API messages using that `sessionId` to trigger the scraper
3. The message starts the Web Scraper with the provided input
4. The response should be: `Accepted`

## Integrating Web Scraper into your workflows

You can integrate Web Scraper with almost any cloud service or web app. We offer integrations with **Make, Zapier, Slack, Airbyte, GitHub, Google Sheets, Google Drive**, [and plenty more](https://docs.apify.com/integrations). 

Alternatively, you could use [webhooks](https://docs.apify.com/integrations/webhooks) to carry out an action whenever an event occurs, such as getting a notification whenever Web Scraper successfully finishes a run.

## Advanced configuration settings

Below you’ll find detailed instructions on more advanced configuration settings for Web Scraper.

## Input configurations

On input, the Web Scraper Actor accepts a number of configuration settings. These can be entered either manually in the user interface in [Apify Console](https://console.apify.com/), or programmatically in a JSON object using the [Apify API](https://docs.apify.com/api/v2#/reference/actors/run-collection/run-actor). 

For a complete list of input fields and their type, please see the [input tab](https://apify.com/apify/web-scraper/input-schema).

### Run mode

Run mode allows you to switch between two modes of operation for Web Scraper.

**PRODUCTION** mode gives you full control and full performance. You should always switch Web Scraper to production mode once you're done making changes to your scraper.

When starting to develop your Scraper, you want to be able to inspect what's happening in the browser and debug your code. You can do that with the scraper's **DEVELOPMENT** mode. It allows you to directly control the browser using Chrome DevTools. Open the Live View tab to access the DevTools. It will also limit concurrency and prevent timeouts to improve your DevTools experience. Other debugging related options can be configured in the **Advanced configuration** section.

### Start URLs

The **Start URLs** (`startUrls`) field represent the initial list of URLs of pages that the scraper will visit. You can either enter these URLs manually one by one, upload them in a CSV file or
[link URLs from the Google Sheets](https://help.apify.com/en/articles/2906022-scraping-a-list-of-urls-from-a-google-sheets-document) document. Each URL must start with either a `http://` or `https://` protocol prefix.

The scraper supports adding new URLs to scrape on the fly, either using the [**Link selector**](#link-selector) and [**Glob Patterns**](#glob-patterns)/[**Pseudo-URLs**](#pseudo-urls) options or by calling `await context.enqueueRequest()` inside [**Page function**](#page-function).

Optionally, each URL can be associated with custom user data - a JSON object that can be referenced from your JavaScript code in [**Page function**](#page-function) under `context.request.userData`. This is useful for determining which start URL is currently loaded, in order to perform some page-specific actions. For example, when crawling an online store, you might want to perform different
actions on a page listing the products vs. a product detail page. For details, see our [web scraping tutorial](https://docs.apify.com/tutorials/apify-scrapers/getting-started#the-start-url).

<!-- TODO: Describe how the queue works, unique key etc. plus link -->

### Link selector

The **Link selector** (`linkSelector`) field contains a CSS selector that is used to find links to other web pages, i.e. `<a>` elements with the `href` attribute.

On every page loaded, the scraper looks for all links matching **Link selector**, checks that the target URL matches one of the [**Glob Patterns**](#glob-patterns)/[**Pseudo-URLs**](#pseudo-urls), and if so then adds the URL to the request queue, so that it's loaded by the scraper later.

By default, new scrapers are created with the following selector that matches all links:

```
a[href]

```

If **Link selector** is empty, the page links are ignored, and the scraper only loads pages that were specified in [**Start URLs**](#start-urls) or that were manually added to the request queue by calling `await context.enqueueRequest()` in [**Page function**](#page-function).

### Glob Patterns

The **Glob Patterns** (`globs`) field specifies which types of URLs found by [**Link selector**](#link-selector) should be added to the request queue.

A glob pattern is simply a string with wildcard characters.

For example, a glob pattern `http://www.example.com/pages/**/*` will match all the
following URLs:

- `http://www.example.com/pages/deeper-level/page`
- `http://www.example.com/pages/my-awesome-page`
- `http://www.example.com/pages/something`

Note that you don't need to use the **Glob Patterns** setting at all, because you can completely control which pages the scraper will access by calling `await context.enqueueRequest()` from the [**Page function**](#page-function).

### Pseudo-URLs

The **Pseudo-URLs** (`pseudoUrls`) field specifies what kind of URLs found by [**Link selector**](#link-selector) should be added to the request queue.

A pseudo-URL is simply a URL with special directives enclosed in `[]` brackets. Currently, the only supported directive is `[regexp]`, which defines a JavaScript-style regular expression to match against the URL.

For example, a pseudo-URL `http://www.example.com/pages/[(\w|-)*]` will match all the
following URLs:

- `http://www.example.com/pages/`
- `http://www.example.com/pages/my-awesome-page`
- `http://www.example.com/pages/something`

If either `[` or `]` is part of the normal query string, it must be encoded as `[\x5B]` or `[\x5D]`, respectively. For example, the following pseudo-URL:

```
http://www.example.com/search?do[\x5B]load[\x5D]=1

```

will match the URL:

```
http://www.example.com/search?do[load]=1

```

Optionally, each pseudo-URL can be associated with user data that can be referenced from
your [**Page function**](#page-function) using `context.request.label` to determine which kind of page is currently loaded in the browser.

Note that you don't need to use the **Pseudo-URLs** setting at all, because you can completely control which pages the scraper will access by calling `await context.enqueueRequest()` from [**Page function**](#page-function).

### Page function

The **Page function** (`pageFunction`) field contains a JavaScript function that is executed in the context of every page loaded in the Chromium browser. The purpose of this function is to extract
data from the web page, manipulate the DOM by clicking elements, add new URLs to the request queue and otherwise control Web Scraper's operation.

Example:

```jsx
async function pageFunction(context) {
    // jQuery is handy for finding DOM elements and extracting data from them.
    // To use it, make sure to enable the "Inject jQuery" option.
    const $ = context.jQuery;
    const pageTitle = $('title').first().text();

    // Print some information to Actor log
    context.log.info(`URL: ${context.request.url}, TITLE: ${pageTitle}`);

    // Manually add a new page to the scraping queue.
    await context.enqueueRequest({ url: 'http://www.example.com' });

    // Return an object with the data extracted from the page.
    // It will be stored to the resulting dataset.
    return {
        url: context.request.url,
        pageTitle,
    };
}

```

The page function accepts a single argument, the `context` object, whose properties are listed in the table below. Since the function is executed in the context of the web page, it can access the DOM, e.g. using the `window` or `document` global variables.

The return value of the page function is an object (or an array of objects) representing the data extracted from the web page. The return value must be stringify-able to JSON, i.e. it can only contain basic types and no circular references. If you don't want to extract any data from the page and skip it in the clean results, simply return `null` or `undefined`.

The page function supports the JavaScript ES6 syntax and is asynchronous, which means you can use the `await` keyword to wait for background operations to finish. To learn more about `async` functions, see <a href="[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)">Mozilla documentation</a>.

**Properties of the `context` object:**

- **`customData: Object`**
    
    Contains the object provided in the **Custom data** (`customData`) input setting. This is useful for passing dynamic parameters to your Web Scraper using API.
    
- **`enqueueRequest(request, [options]): AsyncFunction`**
    
    Adds a new URL to the request queue, if it wasn't already there. The `request` parameter is an object containing details of the request, with properties such as `url`, `label`, `userData`, `headers` etc. For the full list of the supported properties, see the <a href="[https://crawlee.dev/api/core/class/Request](https://crawlee.dev/api/core/class/Request)" target="_blank">`Request`</a> object's constructor in Crawlee documentation.
    
    The optional `options` parameter is an object with additional options. Currently, it only supports the `forefront` boolean flag. If it's `true`, the request is added to the beginning of the queue. By default, requests are added to the end.
    
    Example:
    
    ```jsx
    await context.enqueueRequest({ url: 'https://www.example.com' });
    await context.enqueueRequest(
        { url: 'https://www.example.com/first' },
        { forefront: true },
    );
    
    ```
    
- **`env: Object`**
    
    A map of all relevant values set by the Apify platform to the Actor run via the `APIFY_` environment variables. For example, you can find here information such as Actor run ID, timeouts, Actor run memory, etc. 
    
    For the full list of available values, see
    <a href="[https://sdk.apify.com/api/apify/interface/ApifyEnv](https://sdk.apify.com/api/apify/interface/ApifyEnv)" target="_blank">`ApifyEnv`</a> interface in Apify SDK.
    
    Example:
    
    ```jsx
    console.log(`Actor run ID: ${context.env.actorRunId}`);
    
    ```
    
- **`getValue(key): AsyncFunction`**
    
    Gets a value from the default key-value store associated with the Actor run. The key-value store is useful for persisting named data records, such as state objects, files, etc. The function is very similar to <a href="[https://sdk.apify.com/api/apify/class/Actor#getValue](https://sdk.apify.com/api/apify/class/Actor#getValue)" target="_blank">`Actor.getValue()`</a> function in Apify SDK.
    
    To set the value, use the dual function `context.setValue(key, value)`.
    
    Example:
    
    ```jsx
    const value = await context.getValue('my-key');
    console.dir(value);
    
    ```
    
- **`globalStore: Object`**
    
    Represents an in-memory store that can be used to share data across page function invocations, e.g. state variables, API responses or other data. The `globalStore` object has an equivalent interface as JavaScript's <a href="[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)" target="_blank">`Map`</a> object, with a few important differences:
    
    - All functions of `globalStore` are `async`; use `await` when calling them.
    - Keys must be strings and values need to be JSON stringify-able.
    - `forEach()` function is not supported.
    
    Note that the stored data is not persisted. If the Actor run is restarted or migrated to another worker server, the content of `globalStore` is reset. Therefore, never depend on a specific value to be present in the store.
    
    Example:
    
    ```jsx
    let movies = await context.globalStore.get('cached-movies');
    if (!movies) {
        movies = await fetch('http://example.com/movies.json');
        await context.globalStore.set('cached-movies', movies);
    }
    console.dir(movies);
    
    ```
    
- **`input: Object`**
    
    An object containing the Actor run input, i.e. the Web Scraper's configuration. Each page function invocation gets a fresh copy of the `input` object, so changing its properties has no effect.
    
- **`jQuery: Function`**
    
    A reference to the <a href="[https://api.jquery.com/](https://api.jquery.com/)" target="_blank">`jQuery`</a> library, which is extremely useful for DOM traversing, manipulation, querying and data extraction. This field is only available if the **Inject jQuery** option is enabled.
    
    Typically, the jQuery function is registered under a global variable called <code>$</code>.
    However, the web page might use this global variable for something else. To avoid conflicts, the jQuery object is not registered globally and is only available through the `context.jQuery` property.
    
    Example:
    
    ```jsx
    const $ = context.jQuery;
    const pageTitle = $('title').first().text();
    
    ```
    
- **`log: Object`**
    
    An object containing logging functions, with the same interface as provided by the <a href="[https://crawlee.dev/api/core/class/Log](https://crawlee.dev/api/core/class/Log)" target="_blank">`Crawlee.utils.log`</a> object in Crawlee. The log messages are written directly to the Actor run log, which is useful for monitoring and debugging. Note that `log.debug()` only prints messages to the log if the **Enable debug log** input setting is set.
    
    Example:
    
    ```jsx
    const log = context.log;
    log.debug('Debug message', { hello: 'world!' });
    log.info('Information message', { all: 'good' });
    log.warning('Warning message');
    log.error('Error message', { details: 'This is bad!' });
    try {
        throw new Error('Not good!');
    } catch (e) {
        log.exception(e, 'Exception occurred', {
            details: 'This is really bad!',
        });
    }
    
    ```
    
- **`request: Object`**
    
    An object containing information about the currently loaded web page, such as the URL, number of retries, a unique key, etc. Its properties are equivalent to the <a href="[https://crawlee.dev/api/core/class/Request](https://crawlee.dev/api/core/class/Request)" target="_blank">`Request`</a> object in Crawlee.
    
- **`response: Object`**
    
    An object containing information about the HTTP response from the web server. Currently, it only contains the `status` and `headers` properties. For example:
    
    ```jsx
    {
      // HTTP status code
      status: 200,
    
      // HTTP headers
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'date': 'Wed, 06 Nov 2019 16:01:53 GMT',
        'cache-control': 'no-cache',
        'content-encoding': 'gzip',
      },
    }
    
    ```
    
- **`saveSnapshot(): AsyncFunction`**
    
    Saves a screenshot and full HTML of the current page to the key-value store
    associated with the Actor run, under the `SNAPSHOT-SCREENSHOT` and `SNAPSHOT-HTML` keys, respectively. This feature is useful when debugging your scraper.
    
    Note that each snapshot overwrites the previous one and the `saveSnapshot()` calls are throttled to at most one call in two seconds, in order to avoid excess consumption of resources and slowdown of the Actor.
    
- **`setValue(key, data, options): AsyncFunction`**
    
    Sets a value to the default key-value store associated with the Actor run. The key-value store is useful for persisting named data records, such as state objects, files, etc. The function is very similar to <a href="[https://crawlee.dev/api/core/class/KeyValueStore#setValue](https://crawlee.dev/api/core/class/KeyValueStore#setValue)" target="_blank">`KeyValueStore.setValue()`</a> function in Crawlee.
    
    To get the value, use the dual function `await context.getValue(key)`.
    
    Example:
    
    ```jsx
    await context.setValue('my-key', { hello: 'world' });
    
    ```
    
- **`skipLinks(): AsyncFunction`**
    
    Calling this function ensures that page links from the current page will not be added to the request queue, even if they match the [**Link selector**](https://www.notion.so/Web-Scraper-231f39950a22806da3a2e5206794df3e?pvs=21) and/or [**Glob Patterns**](https://www.notion.so/Web-Scraper-231f39950a22806da3a2e5206794df3e?pvs=21)/[**Pseudo-URLs**](https://www.notion.so/Web-Scraper-231f39950a22806da3a2e5206794df3e?pvs=21) settings. This is useful to programmatically stop recursive crawling, e.g. if you know there are no more interesting links on the current page to follow.
    
- **`waitFor(task, options): AsyncFunction`**
    
    A helper function that waits either a specific amount of time (in milliseconds), for an element specified using a CSS selector to appear in the DOM or for a provided function to return `true`.
    This is useful for extracting data from web pages with dynamic content, where the content might not be available at the time when the page function is called.
    
    The `options` parameter is an object with the following properties and default values:
    
    ```jsx
    {
      // Maximum time to wait
      timeoutMillis: 20000,
    
      // How often to check if the condition changes
      pollingIntervalMillis: 50,
    }
    
    ```
    
    Example:
    
    ```jsx
    // Wait for selector
    await context.waitFor('.foo');
    // Wait for 1 second
    await context.waitFor(1000);
    // Wait for predicate
    await context.waitFor(() => !!document.querySelector('.foo'), {
        timeoutMillis: 5000,
    });
    
    ```
    

## Proxy configuration

The **Proxy configuration** (`proxyConfiguration`) option enables you to set proxies that will be used by the scraper in order to prevent its detection by target websites. You can use both [Apify Proxy](https://apify.com/proxy) and custom HTTP or SOCKS5 proxy servers.

Proxy is required to run the scraper. The following table lists the available options of the proxy configuration setting:

<table class="table table-bordered table-condensed">
<tbody>
<tr>
<th><b>Apify Proxy (automatic)</b></td>
<td>
The scraper will load all web pages using <a href="https://apify.com/proxy">Apify Proxy</a> in the automatic mode. In this mode, the proxy uses all proxy groups that are available to the user, and for each new web page it automatically selects the proxy that hasn't been used in the longest time for the specific hostname, in order to reduce the chance of detection by the website. You can view the list of available proxy groups on the <a href="https://console.apify.com/proxy" target="_blank" rel="noopener">Proxy</a> page in Apify Console.
</td>
</tr>
<tr>
<th><b>Apify Proxy (selected groups)</b></td>
<td>
The scraper will load all web pages using <a href="https://apify.com/proxy">Apify Proxy</a> with specific groups of target proxy servers.
</td>
</tr>
<tr>
<th><b>Custom proxies</b></td>
<td>
<p>
The scraper will use a custom list of proxy servers. The proxies must be specified in the `scheme://user:password@host:port` format, multiple proxies should be separated by a space or new line. The URL scheme can be either `HTTP` or `SOCKS5`. User and password might be omitted, but the port must always be present.
</p>
<p>
Example:
</p>
<pre><code class="language-none">http://bob:password@proxy1.example.com:8000
    http://bob:password@proxy2.example.com:8000</code></pre>
</td>
</tr>
</tbody>
</table>

The proxy configuration can be set programmatically when calling the Actor using the API
by setting the `proxyConfiguration` field. It accepts a JSON object with the following structure:

```jsx
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

### Logging into websites with Web Scraper

The **Initial cookies** field allows you to set cookies that will be used by the scraper to log into websites. Cookies are small text files that are stored on your computer by your web browser. Various websites use cookies to store information about your current session. By transferring this information to the scraper, it will be able to log into websites using your credentials. To learn more about logging into websites by transferring cookies, check out our [tutorial](https://docs.apify.com/tutorials/log-in-by-transferring-cookies).

Be aware that cookies usually have a limited lifespan and will expire after a certain period of time. This means that you will have to update the cookies periodically in order to keep the scraper logged in. Alternative approach is to make the scraper actively log in to the website in the Page function. For more info about this approach, check out our [tutorial](https://docs.apify.com/tutorials/log-into-a-website-using-puppeteer) on logging into websites using Puppeteer.

The scraper expects the cookies in the **Initial cookies** field to be stored as separate JSON objects in a JSON array, see example below:

```json
[
    {
        "name": " ga",
        "value": "GA1.1.689972112. 1627459041",
        "domain": ".apify.com",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "expirationDate": 1695304183,
        "storelId": "firefox-default",
        "id": 1
    }
]

```

## Advanced configuration

### Pre-navigation hooks

This is an array of functions that will be executed **BEFORE** the main `pageFunction` is run. A similar `context` object is passed into each of these functions as is passed into the `pageFunction`; however, a second "[DirectNavigationOptions](https://crawlee.dev/api/puppeteer-crawler/namespace/puppeteerUtils#DirectNavigationOptions)" object is also passed in.

The available options can be seen here:

```
preNavigationHooks: [
    async ({ id, request, session, proxyInfo }, { timeout, waitUntil, referer }) => {}
]

```

> Unlike with playwright, puppeteer and cheerio scrapers, in web scraper we don't have the Actor object available in the hook parameters, as the hook is executed inside the browser.
> 

Check out the docs for [Pre-navigation hooks](https://crawlee.dev/api/puppeteer-crawler/interface/PuppeteerCrawlerOptions#preNavigationHooks) and the [PuppeteerHook type](https://crawlee.dev/api/puppeteer-crawler/interface/PuppeteerHook) for more info regarding the objects passed into these functions.

### Post-navigation hooks

An array of functions that will be executed **AFTER** the main `pageFunction` is run. The only available parameter is the `CrawlingContext` object.

```
postNavigationHooks: [
    async ({ id, request, session, proxyInfo, response }) => {}
]

```

> Unlike with playwright, puppeteer and cheerio scrapers, in web scraper we don't have the Actor object available in the hook parameters, as the hook is executed inside the browser.
> 

Check out the docs for [Post-navigation hooks](https://crawlee.dev/api/puppeteer-crawler/interface/PuppeteerCrawlerOptions#postNavigationHooks) and the [PuppeteerHook type](https://crawlee.dev/api/puppeteer-crawler/interface/PuppeteerHook) for more info regarding the objects passed into these functions.

### Insert breakpoint

This property has no effect if [Run mode](#run-mode) is set to **PRODUCTION**. When set to **DEVELOPMENT** it inserts a breakpoint at the selected location in every page the scraper visits. Execution of code stops at the breakpoint until manually resumed in the DevTools window accessible via Live View tab or Container URL. Additional breakpoints can be added by adding debugger; statements within your Page function.

### Debug log

When set to true, debug messages will be included in the log. Use `context.log.debug('message')` to log your own debug messages.

### Browser log

When set to true, console messages from the browser will be included in the Actor's log. This may result in the log being flooded by error messages, warnings and other messages of little value (especially with a high concurrency).

### Custom data

Since the input UI is fixed, it does not support adding of other fields that may be needed for all specific use cases. If you need to pass arbitrary data to the scraper, use the [Custom data](#custom-data) input field within [Advanced configuration](#advanced-configuration) and its contents will be available under the `customData` context key as an object within the [pageFunction](#page-function).

### Custom names

With the final three options in the **Advanced configuration**, you can set custom names for the following:

- Dataset
- Key-value store
- Request queue

Leave the storage unnamed if you only want the data within it to be persisted on the Apify platform for a number of days corresponding to your [plan](https://apify.com/pricing) (after which it will expire). Named storages are retained indefinitely. Additionally, using a named storage allows you to share it across multiple runs (e.g. instead of having 10 different unnamed datasets for 10 different runs, all the data from all 10 runs can be accumulated into a single named dataset). Learn more [here](https://docs.apify.com/storage#named-and-unnamed-storages).

## Results

All scraping results returned by [**Page function**](#page-function) are stored in the default dataset associated with the Actor run, and can be saved in several different formats, such as JSON, XML, CSV or Excel. For each object returned by [**Page function**](#page-function), Web Scraper pushes one record into the dataset, and extends it with metadata such as the URL of the web page where the results come from.

For example, if your page function returned the following object:

```
{
    message: 'Hello world!';
}

```

The full object stored in the dataset will look as follows
(in JSON format, including the metadata fields `#error` and `#debug`):

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

where `[DATASET_ID]` is the ID of the Actor's run dataset, in which you can find the Run object returned when starting the Actor. Alternatively, you'll find the download links for the results in Apify Console.

To skip the `#error` and `#debug` metadata fields from the results and not include empty result records, simply add the `clean=true` query parameter to the API URL, or select the **Clean items** option when downloading the dataset in Apify Console.

To get the results in other formats, set the `format` query parameter to `xml`, `xlsx`, `csv`, `html`, etc. For more information, see [Datasets](https://apify.com/docs/storage#dataset) in documentation or the [Get dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection) endpoint in Apify API reference.

## Additional resources

If you’d like to learn more about Web Scraper or Apify’s other Actors and tools, check out these resources:

- [Cheerio Scraper](https://apify.com/apify/cheerio-scraper), another web scraping Actor that downloads and processes pages in raw HTML for much higher performance.
- [Playwright Scraper](https://apify.com/apify/playwright-scraper), a similar web scraping Actor to Web Scraper, which provides lower-level control of the underlying [Playwright](https://github.com/microsoft/playwright) library and the ability to use server-side libraries.
- [Puppeteer Scraper](https://apify.com/apify/puppeteer-scraper), an Actor similar to Web Scraper, which provides lower-level control of the underlying [Puppeteer](https://github.com/puppeteer/puppeteer) library and the ability to use server-side libraries.
- [Actors documentation](https://apify.com/docs/actor) for the Apify cloud computing platform.
- [Apify SDK documentation](https://sdk.apify.com/), where you can learn more about the tools required to run your own Apify Actors.
- [Crawlee documentation](https://crawlee.dev/?__hstc=160404322.4ff1f55e48512a0b19aa0955767abc98.1753772621636.1753781308751.1753783813114.4&__hssc=160404322.2.1753783813114&__hsfp=3081399490), how to build a new web scraping project from scratch using the world's most popular web crawling and scraping library for Node.js.

## Frequently asked questions

### Are there any limitations to using Web Scraper?

Web Scraper is designed to be user-friendly and generic, which may affect its performance and flexibility compared to more specialized solutions. It uses a resource-intensive Chromium browser to supports client-side JavaScript code.

### Is web scraping legal?

It is legal to scrape any non-personal data. Personal data is protected by the [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers. You can also read our blog post on the [legality of web scraping](https://blog.apify.com/is-web-scraping-legal/).

### Can I control the crawling behavior of Web Scraper?

Yes, you can control the crawling behavior of Web Scraper. You can specify start URLs, define link selectors, enter pseudo-URLs to guide the scraper in following specific page links, and plenty of other configurations options. This allows recursive crawling of websites or targeted extraction of data.

### Is it possible to use proxies with Web Scraper?

Yes, you can configure proxies for Web Scraper. You have the option to use [Apify Proxy](https://apify.com/proxy), which under the free plan is set up for you. On paid plans, you can configure them yourself, or even set up your own.

### How can I access and export the data scraped by Web Scraper?

The data scraped by Web Scraper is stored in a dataset which you can access and export in various formats such as JSON, XML, CSV, or as an Excel spreadsheet. The results can be downloaded using the Apify API or through the Apify Console.

### Your feedback

We’re always working on improving the performance of our Actors. If you have any technical feedback for Web Scraper or found a bug, please create an issue in the [Issues tab](https://apify.com/apify/web-scraper/issues/open).
