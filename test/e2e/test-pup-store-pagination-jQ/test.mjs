import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://apify.com/store',
        method: 'GET',
        userData: { label: 'START'}
    }],
    pseudoUrls: [{
        purl: 'https://apify.com/[.+]/[.+]',
        method: 'GET',
        userData: { label: 'DETAIL' }
    }],
    linkSelector: 'a',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, page }) {
            log.info('Store opened!');
            let timeout;
            const buttonSelector = 'div.show-more > button';
            while (true) {
                log.info('Waiting for the Show more button.');
                try {
                    await page.waitForSelector(buttonSelector, { timeout });
                    timeout = 2000;
                } catch (err) {
                    log.info(`Could not find the Show more button, we've reached the end.`);
                    break;
                }

                log.info('Clicking the Show more button.');
                await page.evaluate(buttonSelector => document.querySelector(buttonSelector).click(), buttonSelector);
            }
        }

        async function handleDetail({ request, log, skipLinks, page, puppeteerUtils }) {
            await puppeteerUtils.injectJQuery(page);

            const { url } = request;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');

            const results = await page.evaluate(() => ({
                title: $('header h1').text(),
                description: $('header span.actor-description').text(),
                modifiedDate: new Date(Number($('ul.ActorHeader-stats time').attr('datetime'))).toISOString(),
                runCount: Number($('ul.ActorHeader-stats > li:nth-of-type(3)').text().match(/[\d,]+/)[0].replace(/,/g, '')),
            }));

            return { url, uniqueIdentifier, ...results };
        }
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    useChrome: false,
    useStealth: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: false,
    browserLog: false,
    maxPagesPerCrawl: 750
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished > 700, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length > 700, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(datasetItems.length < 1000, 'Maximum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation');

process.exit(0);
