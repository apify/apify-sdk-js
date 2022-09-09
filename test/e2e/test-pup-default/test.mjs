import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'puppeteer-scraper', {
    startUrls: [{ url: 'https://apify.com' }],
    pseudoUrls: [{ purl: 'https://apify.com[(/[\\w-]+)?]' }],
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
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: false,
    browserLog: false
});

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 50, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 50, 'Minimum number of dataset items');
await expect(datasetItems.length < 150, 'Maximum number of dataset items');
await expect(validateDataset(datasetItems, ['pageTitle']), 'Dataset items validation');
