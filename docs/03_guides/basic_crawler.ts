import { Actor } from 'apify';
import { BasicCrawler } from 'crawlee';
import { gotScraping } from 'got-scraping';

await Actor.init();

// Create a dataset where we will store the results.
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
        await Actor.pushData({
            url: request.url,
            html: body,
        });
    },
});

// The initial list of URLs to crawl. Here we use just a few hard-coded URLs.
await crawler.run([
    { url: 'http://www.google.com/' },
    { url: 'http://www.example.com/' },
    { url: 'http://www.bing.com/' },
    { url: 'http://www.wikipedia.com/' },
]);

console.log('Crawler finished.');

await Actor.exit();
