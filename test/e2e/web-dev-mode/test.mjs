import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset, skipTest } from '../tools.mjs';

skipTest('httpstat.us is very unstable');

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'web-scraper', {
    runMode: 'DEVELOPMENT',
    startUrls: [{
        url: 'http://httpstat.us/',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pseudoUrls: [{
        purl: 'http://httpstat.us/[200|401|403|429|500]',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
    linkSelector: 'a[href]',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log }) {
            log.info('The https stats page successfully opened!');
        }

        async function handleDetail({ request, log, jQuery: $ }) {
            const { url } = request;
            log.info(`Scraping ${url}`);

            const text = $('pre').text();

            return { url, text };
        }
    },
    injectJQuery: true,
    injectUnderscore: false,
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
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 5, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length >= 5, 'Minimum number of dataset items');
await expect(validateDataset(datasetItems, ['url', 'text']), 'Dataset items validation');

process.exit(0);
