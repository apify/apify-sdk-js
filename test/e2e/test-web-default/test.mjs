import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{ url: 'https://apify.com' }],
    keepUrlFragments: false,
    pseudoUrls: [{ purl: 'https://apify.com[(/[\\w-]+)?]' }],
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
    linkSelector: 'a[href]',
    injectJQuery: true,
    useChrome: false,
    useStealth: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    breakpointLocation: 'NONE',
    browserLog: false,
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished > 50, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length > 50, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(datasetItems.length < 150, 'Maximum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['pageTitle']), 'Dataset items validation');

process.exit(0);
