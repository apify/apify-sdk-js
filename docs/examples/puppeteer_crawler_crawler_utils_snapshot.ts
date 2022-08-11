import { PuppeteerCrawler, puppeteerUtils } from 'crawlee';
import { Actor } from 'apify';

await Actor.init();

// Create a PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page }) {
        // Convert the URL into a valid key
        const key = request.url.replace(/[:/]/g, '_');
        // Capture the screenshot
        await puppeteerUtils.saveSnapshot(page, { key, saveHtml: false });
    },
});

// Run the crawler
await crawler.run([
    { url: 'http://www.example.com/page-1' },
    { url: 'http://www.example.com/page-2' },
    { url: 'http://www.example.com/page-3' },
]);

await Actor.exit();
