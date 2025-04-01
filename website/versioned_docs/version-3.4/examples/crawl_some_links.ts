import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

// Create a CheerioCrawler
const crawler = new CheerioCrawler({
    // Limits the crawler to only 10 requests (do not use if you want to crawl all links)
    maxRequestsPerCrawl: 10,
    // Function called for each URL
    async requestHandler({ request, enqueueLinks }) {
        console.log(request.url);
        // Add some links from page to the crawler's RequestQueue
        await enqueueLinks({
            pseudoUrls: ['http[s?]://apify.com/[.+]/[.+]'],
        });
    },
});

// Define the starting URL and run the crawler
await crawler.run(['https://apify.com/store']);

await Actor.exit();
