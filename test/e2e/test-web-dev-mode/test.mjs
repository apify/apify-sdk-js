import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'web-scraper', {
    runMode: 'DEVELOPMENT',
    startUrls: [{
        url: 'http://httpstat.us/',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    linkSelector: 'a[href]',
    pseudoUrls: [{
        purl: 'http://httpstat.us/[200|401|403|429|500]',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
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
    browserLog: false
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished > 5, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length >= 5, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['text']), 'Dataset items validation');

process.exit(0);
