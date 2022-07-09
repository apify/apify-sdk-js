import { CheerioCrawler, EnqueueStrategy } from '@crawlee/cheerio';

const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 10, // Limitation for only 10 requests (do not use if you want to crawl all links)
    async requestHandler({ request, enqueueLinks }) {
        console.log(request.url);
        await enqueueLinks({
            // Setting the strategy to 'same-subdomain' will enqueue all links found that are on the same hostname
            // as request.loadedUrl or request.url
            // highlight-next-line
            strategy: EnqueueStrategy.SameHostname,
            // Alternatively, you can pass in the string 'same-hostname'
            // strategy: 'same-hostname',
        });
    },
});

await crawler.addRequests(['https://apify.com/']);

// Run the crawler
await crawler.run();
