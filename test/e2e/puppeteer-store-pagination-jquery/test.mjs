import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://apify.com/store',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, page, enqueueLinks }) {
            log.info('Store opened!');
            const nextButtonSelector = '[data-test="pagination-button-next"]:not([disabled])';
            // enqueue actor details from the first three pages of the store
            for (let pageNo = 1; pageNo <= 3; pageNo++) {
                // Wait for network events to finish
                await page.waitForNetworkIdle();
                // Enqueue all loaded links
                await enqueueLinks({
                    selector: 'div.ActorStore-main div > a',
                    label: 'DETAIL',
                    globs: [{ glob: 'https://apify.com/*/*' }],
                });
                log.info(`Enqueued actors for page ${pageNo}`);
                log.info('Loading the next page');
                await page.evaluate((el) => document.querySelector(el)?.click(), nextButtonSelector);
            }
        }

        async function handleDetail({ request: { url }, log, page, injectJQuery }) {
            log.info(`Scraping ${url}`);
            await injectJQuery();
            const uniqueIdentifier = url.split('/').slice(-2).join('/');
            const results = await page.evaluate(() => ({
                title: $('header h1').text(),
                description: $('div.Section-body > div > p').text(),
                modifiedDate: $('div:nth-of-type(2) > ul > li:nth-of-type(3)').text(),
                runCount: $('div:nth-of-type(2) > ul > li:nth-of-type(2)').text(),
            }));

            return { url, uniqueIdentifier, ...results };
        }
    },
    preNavigationHooks: "[\n    ({ session, request }, goToOptions) => {\n        session?.setCookies([{ name: 'OptanonAlertBoxClosed', value: new Date().toISOString() }], request.url);\n        goToOptions.waitUntil = ['networkidle2'];\n    }\n]",
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: false,
    browserLog: false,
    maxPagesPerCrawl: 30,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 30, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 25 && datasetItems.length < 35, 'Number of dataset items');
await expect(
    validateDataset(
        datasetItems,
        [
            'url',
            'title',
            'uniqueIdentifier',
            'description',
            // Skip modifiedAt and runCount since they changed
            // 'modifiedDate',
            // 'runCount',
        ],
    ),
    'Dataset items validation',
);

process.exit(0);
