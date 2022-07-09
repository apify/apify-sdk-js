import { BasicCrawler, Dataset } from '@crawlee/basic';
import { gotScraping } from 'got-scraping';

// Create a dataset where we will store the results.
const dataset = await Dataset.open();

// Create a BasicCrawler - the simplest crawler that enables
// users to implement the crawling logic themselves.
const crawler = new BasicCrawler({
    // This function will be called for each URL to crawl.
    async requestHandler({ request }) {
        const { url } = request;
        console.log(`Processing ${url}...`);

        // Fetch the page HTML via Apify utils gotScraping
        const { body } = await gotScraping({ url });

        // Store the HTML and URL to the default dataset.
        await dataset.pushData({
            url: request.url,
            html: body,
        });
    },
});

// The initial list of URLs to crawl. Here we use just a few hard-coded URLs.
await crawler.addRequests([
    { url: 'http://www.google.com/' },
    { url: 'http://www.example.com/' },
    { url: 'http://www.bing.com/' },
    { url: 'http://www.wikipedia.com/' },
]);

// Run the crawler and wait for it to finish.
await crawler.run();

console.log('Crawler finished.');
