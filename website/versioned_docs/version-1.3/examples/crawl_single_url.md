---
id_old: version-1.3-crawl-single-url
title: Crawl a single URL
id: crawl-single-url
---

This example uses the [`Apify.utils.requestAsBrowser()`](/docs/1.3/api/utils#utilsrequestasbrowseroptions) function to grab the HTML of a web page.

```javascript
const Apify = require('apify');

Apify.main(async () => {
    // Get the HTML of a web page
    const { body } = await Apify.utils.requestAsBrowser({
        url: 'https://www.example.com',
    });
    console.log(body);
});
```

If you don't want to hard-code the URL into the script, refer to the [Accept User Input](accept-user-input) example.
