import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const crawler = new PlaywrightCrawler({
    // Function called for each URL
    async requestHandler({ request, page }) {
        const title = await page.title();
        console.log(`URL: ${request.url}\nTITLE: ${title}`);
    },
});

// Run the crawler
await crawler.run([
    'http://www.example.com/page-1',
    'http://www.example.com/page-2',
    'http://www.example.com/page-3',
]);

await Actor.exit();
