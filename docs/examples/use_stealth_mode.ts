import { Dataset, PuppeteerCrawler } from '@crawlee/puppeteer';

const dataset = await Dataset.open();

const crawler = new PuppeteerCrawler({
    launchContext: {
        useChrome: true,
        stealth: true,
        launchOptions: {
            headless: true,
        },
        // You can override default stealth options
        // stealthOptions: {
        //     addLanguage: false,
        // },
    },
    async requestHandler({ page }) {
        const data = await page.$$eval('.athing', ($posts) => {
            const scrapedData = [];
            // Get the title of each post on Hacker News
            $posts.forEach(($post) => {
                const title = $post.querySelector('.title a').innerText;
                scrapedData.push({
                    title: `The title is: ${title}`,
                });
            });
            return scrapedData;
        });
            // Save the data array to the Apify dataSet
        await dataset.pushData(data);
    },
});

await crawler.addRequests(['https://news.ycombinator.com/']);

await crawler.run();
