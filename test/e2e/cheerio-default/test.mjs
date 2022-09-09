import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

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

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 15, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 15, 'Minimum number of dataset items');
await expect(datasetItems.length < 25, 'Maximum number of dataset items');
await expect(validateDataset(datasetItems, ['pageTitle']), 'Dataset items validation');
