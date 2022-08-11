import { Dataset, PuppeteerCrawler } from '@crawlee/puppeteer';

const dataset = await Dataset.open();

// Create an instance of the PuppeteerCrawler class - a crawler
// that automatically loads the URLs in headless Chrome / Puppeteer.
const crawler = new PuppeteerCrawler({
    // Here you can set options that are passed to the launchPuppeteer() function.
    launchContext: {
        launchOptions: {
            headless: true,
            // Other Puppeteer options
        },
    },

    // Stop crawling after several pages
    maxRequestsPerCrawl: 50,

    // This function will be called for each URL to crawl.
    // Here you can write the Puppeteer scripts you are familiar with,
    // with the exception that browsers and pages are automatically managed by the Apify SDK.
    // The function accepts a single parameter, which is an object with the following fields:
    // - request: an instance of the Request class with information such as URL and HTTP method
    // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
    async requestHandler({ request, page, enqueueLinks }) {
        console.log(`Processing ${request.url}...`);

        // A function to be evaluated by Puppeteer within the browser context.
        const data = await page.$$eval('.athing', ($posts) => {
            const scrapedData = [];

            // We're getting the title, rank and URL of each post on Hacker News.
            $posts.forEach(($post) => {
                scrapedData.push({
                    title: $post.querySelector('.title a').innerText,
                    rank: $post.querySelector('.rank').innerText,
                    href: $post.querySelector('.title a').href,
                });
            });

            return scrapedData;
        });

        // Store the results to the default dataset.
        await dataset.pushData(data);

        // Find a link to the next page and enqueue it if it exists.
        const infos = await enqueueLinks({
            selector: '.morelink',
        });

        if (infos.length === 0) console.log(`${request.url} is the last page!`);
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    failedRequestHandler({ request }) {
        console.log(`Request ${request.url} failed too many times.`);
    },
});

await crawler.addRequests(['https://news.ycombinator.com/']);

// Run the crawler and wait for it to finish.
await crawler.run();

console.log('Crawler finished.');
