import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 10, // Limitation for only 10 requests (do not use if you want to crawl all links)
    async requestHandler({ request, enqueueLinks }) {
        console.log(request.url);
        await enqueueLinks({
            // Setting the strategy to 'all' will enqueue all links found
            // highlight-next-line
            strategy: 'all',
        });
    },
});

// Run the crawler
await crawler.run(['https://apify.com/']);

await Actor.exit();
