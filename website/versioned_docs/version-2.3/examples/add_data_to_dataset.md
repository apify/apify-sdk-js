---
id: add-data-to-dataset
title: Add data to dataset
---

This example saves data to the default dataset. If the dataset doesn't exist, it will be created.
You can save data to custom datasets by using [`Apify.openDataset()`](../api/apify#opendataset)

```javascript
const { Actor } = require('apify');
const { CheerioCrawler } = require('crawlee');

Actor.main(async () => {
    // Function called for each URL
    const requestHandler = async ({ request, body }) => {
        // Save data to default dataset
        await Actor.pushData({
            url: request.url,
            html: body,
        });
    };

    const crawler = new CheerioCrawler({
        requestHandler,
    });

    // Run the crawler
    await crawler.run([
        { url: 'http://www.example.com/page-1' },
        { url: 'http://www.example.com/page-2' },
        { url: 'http://www.example.com/page-3' },
    ]);
});
```

Each item in this dataset will be saved to its own file in the following directory:

```bash
{PROJECT_FOLDER}/apify_storage/datasets/default/
```
