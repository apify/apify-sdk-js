import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{ url: 'https://crawlee.dev' }],
    pseudoUrls: [{ purl: 'https://crawlee.dev[(/[\\w-]+){2}]' }],
    linkSelector: 'a[href]',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const $ = context.jQuery;

        const pageTitle = $('title').first().text();
        context.log.info(`URL: ${context.request.url}, TITLE: ${pageTitle}`);

        context.enqueueRequest({ url: 'http://www.example.com' });

        return { url: context.request.url, pageTitle };
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false,
    injectJQuery: true,
    useChrome: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    breakpointLocation: 'NONE',
    browserLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 15, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 15 && datasetItems.length < 25, 'Number of dataset items');
await expect(validateDataset(datasetItems, ['url', 'pageTitle']), 'Dataset items validation');

process.exit(0);
