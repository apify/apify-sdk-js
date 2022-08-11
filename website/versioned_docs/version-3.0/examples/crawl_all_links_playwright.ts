import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, enqueueLinks }) {
        console.log(request.url);
        // Add all links from page to RequestQueue
        await enqueueLinks();
    },
    maxRequestsPerCrawl: 10, // Limitation for only 10 requests (do not use if you want to crawl all links)
});

// Run the crawler
await crawler.run(['https://apify.com/']);

await Actor.exit();
