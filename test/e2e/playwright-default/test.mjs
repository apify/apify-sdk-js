import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'playwright-scraper', {
    startUrls: [{ url: 'https://apify.com' }],
    globs: ['https://apify.com/**/*'],
    linkSelector: 'a',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { page, request, log } = context;
        const { url } = request;

        const pageTitle = await page.title();
        log.info(`URL: ${url} pageTitle: ${pageTitle}`);

        return { url, pageTitle };
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    launcher: 'chromium',
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: 'networkidle',
    debugLog: false,
    browserLog: false
});

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 50, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 50, 'Minimum number of dataset items');
await expect(datasetItems.length < 150, 'Maximum number of dataset items');
await expect(validateDataset(datasetItems, ['pageTitle']), 'Dataset items validation');
