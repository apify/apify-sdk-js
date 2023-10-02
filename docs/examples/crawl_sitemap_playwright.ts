import { PlaywrightCrawler, downloadListOfUrls } from 'crawlee';
import { Actor } from 'apify';

await Actor.init();

const crawler = new PlaywrightCrawler({
    // Function called for each URL
    async requestHandler({ request }) {
        console.log(request.url);
    },
    maxRequestsPerCrawl: 10, // Limitation for only 10 requests (do not use if you want to crawl a sitemap)
});

const listOfUrls = await downloadListOfUrls({ url: 'https://apify.com/sitemap.xml' });

// Run the crawler
await crawler.run(listOfUrls);

await Actor.exit();
