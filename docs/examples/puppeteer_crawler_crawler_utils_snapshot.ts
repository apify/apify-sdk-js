import { PuppeteerCrawler, puppeteerUtils } from '@crawlee/puppeteer';

// Create a PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page }) {
        // Convert the URL into a valid key
        const key = request.url.replace(/[:/]/g, '_');
        // Capture the screenshot
        await puppeteerUtils.saveSnapshot(page, { key, saveHtml: false });
    },
});

await crawler.addRequests([
    { url: 'http://www.example.com/page-1' },
    { url: 'http://www.example.com/page-2' },
    { url: 'http://www.example.com/page-3' },
]);

// Run the crawler
await crawler.run();
