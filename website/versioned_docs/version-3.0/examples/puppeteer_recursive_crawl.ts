import { PuppeteerCrawler } from '@crawlee/puppeteer';

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

await crawler.addRequests(['https://www.iana.org/']);

await crawler.run();
