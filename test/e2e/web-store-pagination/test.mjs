import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{
        url: 'https://apify.com/store?page=1',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pseudoUrls: [{
        purl: 'https://apify.com/store?page=[2|3]',
        method: 'GET',
        userData: { label: 'START' },
    }],
    linkSelector: 'a',
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, request, enqueueRequest, waitFor, jQuery: $ }) {
            log.info(`${request.url} opened!`);
            await waitFor('div.ActorStore-main div > a');
            const urls = $('div.ActorStore-main div > a')
                .toArray()
                .map((link) => `https://apify.com/${$(link).attr('href')}`);
            log.info(`${request.url} | Enqueueing ${urls.length} actor pages`);
            for (const url of urls) {
                await enqueueRequest({ url, label: 'DETAIL' });
            }
        }

        async function handleDetail({ request, log, skipLinks, jQuery: $ }) {
            const { url } = request;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');
            const title = $('header h1').text();
            const description = $('div.Section-body > div > p').text();
            const modifiedDate = $('div:nth-of-type(2) > ul > li:nth-of-type(3)').text();
            const runCount = $('div:nth-of-type(2) > ul > li:nth-of-type(2)').text();

            return {
                url,
                uniqueIdentifier,
                title,
                description,
                modifiedDate,
                runCount,
            };
        }
    },
    injectJQuery: true,
    injectUnderscore: false,
    preNavigationHooks: "[\n    ({ session, request }) => {\n        session?.setCookies([{ name: 'OptanonAlertBoxClosed', value: new Date().toISOString() }], request.url);\n    }\n]",
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    breakpointLocation: 'NONE',
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
