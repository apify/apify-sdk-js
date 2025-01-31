import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'cheerio-scraper', {
    startUrls: [{ url: 'https://crawlee.dev' }],
    keepUrlFragments: false,
    globs: ['https://crawlee.dev/*/*'],
    linkSelector: 'a',
    pageFunction: async function pageFunction(context) {
        const { $, request, log } = context;
        const { url } = request;

        const pageTitle = $('title').first().text();
        log.info(`URL: ${url} TITLE: ${pageTitle}`);

        return { url, pageTitle };
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 15, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 15 && datasetItems.length < 25, 'Number of dataset items');
await expect(validateDataset(datasetItems, ['url', 'pageTitle']), 'Dataset items validation');

process.exit(0);
