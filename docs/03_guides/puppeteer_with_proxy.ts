import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

// Proxy connection is automatically established in the Crawler
const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PuppeteerCrawler({
    proxyConfiguration,
    async requestHandler({ page }) {
        const status = await page.$eval('td.status', (el) => el.textContent);
        console.log(`Proxy Status: ${status}`);
    },
});

console.log('Running Puppeteer script...');

await crawler.run(['http://proxy.apify.com']);

console.log('Puppeteer closed.');

await Actor.exit();
