# Apify Puppeteer Scraper

<!-- toc -->

- [How it works](#how-it-works)
- [Input](#input)
- [Page function](#page-function)
- [`context`](#context)
  * [Data structures](#data-structures)
  * [Functions](#functions)
  * [Class instances and namespaces](#class-instances-and-namespaces)
    + [Page](#page)
    + [Request](#request)
    + [Response](#response)
    + [PuppeteerPool](#puppeteerpool)
    + [AutoscaledPool](#autoscaledpool)
    + [Global Store](#global-store)
    + [Log](#log)
    + [Apify](#apify)
- [Output](#output)
  * [Dataset](#dataset)
- [Upgrading](#upgrading)

<!-- tocstop -->

## How it works
Puppeteer Scraper is the most powerful scraper tool in our arsenal (aside from developing your own actors).
It uses the Puppeteer library to programmatically control a headless Chrome browser and it can make it do
almost anything. If using the Web Scraper does not cut it, Puppeteer Scraper is what you need.

[Puppeteer](https://github.com/GoogleChrome/puppeteer/) is a Node.js library,
so knowledge of Node.js and its paradigms is expected when working with the Puppeteer Scraper.

If you need either a faster, or a simpler tool, see the 
[Cheerio Scraper](https://apify.com/apify/cheerio-scraper) for speed,
or [Web Scraper](https://apify.com/apify/web-scraper) for simplicity.

## Input
Input is provided via the pre-configured UI. See the tooltips for more info on the available options.

## Page function
Page function is a single JavaScript function that enables the user to control the Scraper's operation,
manipulate the visited pages and extract data as needed.  The code runs in Node.js 12.
It is invoked with a `context` object containing the following properties:

```js
const context = {
    // USEFUL DATA
    input, // Unaltered original input as parsed from the UI
    env, // Contains information about the run such as actorId or runId
    customData, // Value of the 'Custom data' scraper option.
    
    // EXPOSED OBJECTS
    page, // Reference to the Puppeteer.Page.
    request, // Apify.Request object.
    response, // Response object holding the status code and headers.
    crawler, // Reference to the crawler object, with access to `browserPool`, `autoscaledPool` and others
    globalStore, // Represents an in memory store that can be used to share data across pageFunction invocations.
    log, // Reference to Apify.utils.log
    Apify, // Reference to the full power of Apify SDK.
    
    // EXPOSED FUNCTIONS
    setValue, // Reference to the Apify.setValue() function.
    getValue, // Reference to the Apify.getValue() function.
    saveSnapshot, // Saves a screenshot and full HTML of the current page to the key value store.
    skipLinks, // Prevents enqueueing more links via Pseudo URLs on the current page.
    enqueueRequest, // Adds a page to the request queue.
    
}
```
## `context`
The following tables describe the `context` object in more detail.

### Data structures
<table>
<thead>
    <tr><td>Argument</td><td>Type</td></tr>
</thead>
<tbody>
    <tr><td><code>input</code></td><td><code>Object</code></td></tr>
    <tr><td colspan="2">
        Input as it was received from the UI. Each <code>pageFunction</code> invocation gets a fresh
        copy and you can not modify the input by changing the values in this object.
    </td></tr>
    <tr><td><code>env</code></td><td><code>Object</code></td></tr>
    <tr><td colspan="2">
        A map of all the relevant environment variables that you may want to use. See the
        <a href="https://sdk.apify.com/docs/api/apify#getenv" target="_blank"><code>Apify.getEnv()</code></a>
        function for a preview of the structure and full documentation.
    </td></tr>
    <tr><td><code>customData</code></td><td><code>Object</code></td></tr>
    <tr><td colspan="2">
        Since the input UI is fixed, it does not support adding of other fields that may be needed for all
        specific use cases. If you need to pass arbitrary data to the scraper, use the Custom data input field
        and its contents will be available under the <code>customData</code> context key.
    </td></tr>
</tbody>
</table>

### Functions
The `context` object provides several helper functions that make scraping and saving data easier
and more streamlined. All of the functions are `async` so make sure to use `await` with their invocations.

<table>
<thead>
    <tr><td>Argument</td><td>Arguments</td></tr>
</thead>
<tbody>
    <tr><td><code>setValue</code></td><td><code>(key: string, data: Object, options: Object)</code></td></tr>
    <tr><td colspan="2">
        To save data to the default key-value store, you can use the <code>setValue</code> function.
        See the full documentation:
        <a href="https://sdk.apify.com/docs/api/apify#setvalue" target="_blank">
            <code>Apify.setValue()</code>
        </a> function.
    </td></tr>
    <tr><td><code>getValue</code></td><td><code>(key: string)</code></td></tr>
    <tr><td colspan="2">
        To read data from the default key-value store, you can use the <code>getValue</code> function.
        See the full documentation:
        <a href="https://sdk.apify.com/docs/api/apify#getvalue" target="_blank">
            <code>Apify.getValue()</code>
        </a> function.
    </td></tr>
    <tr><td><code>saveSnapshot</code></td><td></td></tr>
    <tr><td colspan="2">
        A helper function that enables saving a snapshot of the current page's HTML and its screenshot
        into the default key value store. Each snapshot overwrites the previous one and the function's
        invocations will also be throttled if invoked more than once in 2 seconds, to prevent abuse.
        So make sure you don't call it for every single request. You can find the screenshot under
        the SNAPSHOT-SCREENSHOT key and the HTML under the SNAPSHOT-BODY key.
    </td></tr>
    <tr><td><code>skipLinks</code></td><td></td></tr>
    <tr><td colspan="2">
        With each invocation of the <code>pageFunction</code> the scraper attempts to extract
        new URLs from the page using the Link selector and PseudoURLs provided in the input UI.
        If you want to prevent this behavior in certain cases, call the <code>skipLinks</code>
        function and no URLs will be added to the queue for the given page.
    </td></tr>
    <tr><td><code>enqueueRequest</code></td><td><code>(request: Request|Object, options: Object)</code></td></tr>
    <tr><td colspan="2">
        To enqueue a specific URL manually instead of automatically by a combination of a Link selector
        and a Pseudo URL, use the <code>enqueueRequest</code> function. It accepts a plain object as argument
        that needs to have the structure to construct a
        <a href="https://sdk.apify.com/docs/api/request" target="_blank"><code>Request</code></a> object.
        But frankly, you just need a URL: <code>{ url: 'https://www.example.com }</code>
    </td></tr>
</tbody>
</table>

### Class instances and namespaces
The following are either class instances or namespaces, which is just a way of saying objects
with functions on them.

#### Page
Reference to the Puppeteer 
<a href="https://pptr.dev/#?product=Puppeteer&show=api-class-page" target="_blank">Page</a>
object, which enables you to use the full power of Puppeteer in your Page functions.

#### Request
Apify uses a `request` object to represent metadata about the currently crawled page,
such as its URL or the number of retries. See the
<a href="https://sdk.apify.com/docs/api/request" target="_blank"><code>Request</code></a>
class for a preview of the structure and full documentation.

#### Response
The `response` object is produced by Puppeteer. Currently, we only pass the HTTP status code
and the response headers to the `context`.

#### Crawler object
To access current `AutoscaledPool` or `BrowserPool` instance we can use the 
`crawler` object, which is a `PuppeteerCrawler` instance. See 
[Apify SDK docs](https://sdk.apify.com/docs/api/puppeteer-crawler)
for more information.

#### Global Store
`globalStore` represents an instance of a very simple in memory store that is not scoped to the individual
`pageFunction` invocation. This enables you to easily share global data such as API responses, tokens and other.
Since the stored data need to cross from the Browser to the Node.js process, it cannot be any kind of data,
but only JSON stringifiable objects. You cannot store DOM objects, functions, circular objects and so on.

`globalStore` in Puppeteer Scraper is just a 
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map" target="_blank">
<code>Map</code></a>.

#### Log
`log` is a reference to
<a href="https://sdk.apify.com/docs/api/log" target="_blank"><code>Apify.utils.log</code></a>.
You can use any of the logging methods such as <code>log.info</code> or <code>log.exception</code>.
<code>log.debug</code> is special, because you can trigger visibility of those messages in the
scraper's Log by the provided **Debug log** input option.

#### Apify
A reference to the full power of the Apify SDK. See
<a href="https://sdk.apify.com/docs/api/apify" target="_blank">the docs</a>
for more information and all the available functions and classes.

**Caution:** Since we're making the full SDK available, and Puppeteer Scraper
runs using the SDK, some edge case manipulations may lead to inconsistencies.
Use `Apify` with caution and avoid making global changes unless you know what you're doing.

## Output
Output is a dataset containing extracted data for each scraped page. To save data into
the dataset, return an `Object` or an `Object[]` from the `pageFunction`.

### Dataset
For each of the scraped URLs, the dataset contains an object with results and some metadata.
If you were scraping the HTML `<title>` of [Apify](https://apify.com/) and returning
the following object from the `pageFunction`

```js
return {
  title: "Web Scraping, Data Extraction and Automation - Apify"
}
```

it would look like this:

```json
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

You can remove the metadata (and results containing only metadata) from the results
by selecting the **Clean items** option when downloading the dataset.

The result will look like this:

```json
{
  "title": "Web Scraping, Data Extraction and Automation - Apify"
}
```

## Upgrading

v2 introduced several minor breaking changes, you can read about those in the
[migration guide](https://github.com/apify/actor-scraper/blob/master/MIGRATIONS.md).
