import { Dataset, CheerioCrawler, log, LogLevel } from '@crawlee/cheerio';

const dataset = await Dataset.open();

// Crawlers come with various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
log.setLevel(LogLevel.DEBUG);

// Create an instance of the CheerioCrawler class - a crawler
// that automatically loads the URLs and parses their HTML using the cheerio library.
const crawler = new CheerioCrawler({
    // The crawler downloads and processes the web pages in parallel, with a concurrency
    // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
    // Here we define some hard limits for the concurrency.
    minConcurrency: 10,
    maxConcurrency: 50,

    // On error, retry each page at most once.
    maxRequestRetries: 1,

    // Increase the timeout for processing of each page.
    requestHandlerTimeoutSecs: 30,

    // Limit to 10 requests per one crawl
    maxRequestsPerCrawl: 10,

    // This function will be called for each URL to crawl.
    // It accepts a single parameter, which is an object with options as:
    // https://sdk.apify.com/docs/typedefs/cheerio-crawler-options#handlepagefunction
    // We use for demonstration only 2 of them:
    // - request: an instance of the Request class with information such as URL and HTTP method
    // - $: the cheerio object containing parsed HTML
    async requestHandler({ request, $ }) {
        log.debug(`Processing ${request.url}...`);

        // Extract data from the page using cheerio.
        const title = $('title').text();
        const h1texts = [];
        $('h1').each((index, el) => {
            h1texts.push({
                text: $(el).text(),
            });
        });

        // Store the results to the dataset. In local configuration,
        // the data will be stored as JSON files in ./apify_storage/datasets/default
        await dataset.pushData({
            url: request.url,
            title,
            h1texts,
        });
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    failedRequestHandler({ request }) {
        log.debug(`Request ${request.url} failed twice.`);
    },
});

// Run the crawler and wait for it to finish.
await crawler.run();

log.debug('Crawler finished.');
