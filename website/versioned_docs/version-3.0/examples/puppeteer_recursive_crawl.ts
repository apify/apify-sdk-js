import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page, enqueueLinks }) {
        const title = await page.title();
        console.log(`Title of ${request.url}: ${title}`);

        await enqueueLinks({
            pseudoUrls: ['https://www.iana.org/[.*]'],
        });
    },
    maxRequestsPerCrawl: 10,
});

await crawler.run(['https://www.iana.org/']);

await Actor.exit();
