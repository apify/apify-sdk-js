---
id_old: version-1.3-screenshots
title: Screenshots
id: screenshots
---

This example demonstrates how to read and write data to the default key-value store using [`Apify.getValue()`](/docs/api/apify#apifygetvaluekey) and
[`Apify.setValue()`](/docs/api/apify#apifysetvaluekey-value-options).

The script crawls a list of URLs using Puppeteer, captures a screenshot of each page, and saves it to the store. The list of URLs is provided as actor
input that is also read from the store.

In local configuration, the input is stored in the default key-value store's directory as a JSON file at
`./apify_storage/key_value_stores/default/INPUT.json`. You need to create the file and set it with the following content:

```json
{ "sources": [{ "url": "https://www.google.com" }, { "url": "https://www.duckduckgo.com" }] }
```

On the Apify cloud, the input can be either set manually in the UI app or passed as the POST payload to the
[Run actor API call](https://apify.com/docs/api/v2#/reference/actors/run-collection/run-actor). For more details, see
[Input and output](https://docs.apify.com/actor/run#input-and-output) in the Apify Actor documentation.

> To run this example on the Apify Platform, select the `Node.js 12 + Chrome on Debian (apify/actor-node-chrome)` base image on the source tab of your
> actor configuration.

```javascript
const Apify = require('apify');

Apify.main(async () => {
    // Read the actor input configuration containing the URLs for the screenshot.
    // By convention, the input is present in the actor's default key-value store under the "INPUT" key.
    const input = await Apify.getInput();
    if (!input) throw new Error('Have you passed the correct INPUT ?');

    const { sources } = input;

    const requestList = new Apify.RequestList({ sources });
    await requestList.initialize();

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        handlePageFunction: async ({ page, request }) => {
            console.log(`Processing ${request.url}...`);

            // This is a Puppeteer function that takes a screenshot of the page and returns its buffer.
            const screenshotBuffer = await page.screenshot();

            // The record key may only include the following characters: a-zA-Z0-9!-_.'()
            const key = request.url.replace(/[:/]/g, '_');

            // Save the screenshot. Choosing the right content type will automatically
            // assign the local file the right extension, in this case .png.
            // The screenshots will be stored in ./apify_storage/key_value_stores/default/
            await Apify.setValue(key, screenshotBuffer, { contentType: 'image/png' });
            console.log(`Screenshot of ${request.url} saved.`);
        },
    });

    // Run crawler.
    await crawler.run();

    console.log('Crawler finished.');
});
```
