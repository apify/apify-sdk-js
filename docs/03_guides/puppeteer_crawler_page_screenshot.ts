import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

// Create a PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page }) {
        // Capture the screenshot with Puppeteer
        const screenshot = await page.screenshot();
        // Convert the URL into a valid key
        const key = request.url.replace(/[:/]/g, '_');
        // Save the screenshot to the default key-value store
        await Actor.setValue(key, screenshot, { contentType: 'image/png' });
    },
});

// Run the crawler
await crawler.run([
    { url: 'http://www.example.com/page-1' },
    { url: 'http://www.example.com/page-2' },
    { url: 'http://www.example.com/page-3' },
]);

await Actor.exit();
