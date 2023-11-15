import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'playwright-scraper', {
    startUrls: [{ url: 'https://crawlee.dev' }],
    globs: ['https://crawlee.dev/*/*'],
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
    browserLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 15, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 15 && datasetItems.length < 25, 'Number of dataset items');
await expect(validateDataset(datasetItems, ['url', 'pageTitle']), 'Dataset items validation');

process.exit(0);
