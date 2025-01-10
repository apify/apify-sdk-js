import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{
        url: 'https://api.apify.com/v2/browser-info',
        method: 'GET',
        userData: { enqueueRequests: true },
    }],
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { request, jQuery: $, enqueueRequest, setValue, getValue } = context;
        const { url, userData } = request;

        const pageContent = JSON.parse($('pre').first().text());
        const { clientIp } = pageContent;

        if (userData.enqueueRequests) {
            for (let i = 0; i < 4; i++) {
                await enqueueRequest({ url: 'https://api.apify.com/v2/browser-info', method: 'GET', uniqueKey: `${i}` });
            }
            userData.isReady = false;
        }

        if (await getValue(clientIp)) throw new Error(`The ip address ${clientIp} was already used. Proxy rotation does not work properly.`);
        await setValue(clientIp, url);

        return { url, clientIp };
    },
    injectJQuery: true,
    injectUnderscore: false,
    proxyConfiguration: { useApifyProxy: true },
    proxyRotation: 'PER_REQUEST',
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    maxConcurrency: 1,
    waitUntil: ['networkidle2'],
    breakpointLocation: 'NONE',
    debugLog: false,
    browserLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 5, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length === 5, 'Number of dataset items');
await expect(validateDataset(datasetItems, ['url', 'clientIp']), 'Dataset items validation');

process.exit(0);
