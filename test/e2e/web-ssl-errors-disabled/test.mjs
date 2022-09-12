import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'web-scraper', {
    startUrls: [{
        url: 'https://badssl.com/',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    linkSelector: '.group a.bad',
    pseudoUrls: [{
        purl: 'https://[.+].badssl.com/',
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
            log.info('Bad ssl page opened!');
        }

        async function handleDetail({ request, log, jQuery: $ }) {
            const { url } = request;
            log.info(`Scraping ${url}`);
            const title = $('title').text();
            return { url, title };
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
    debugLog: false,
    browserLog: false
});

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 5, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 5, 'Minimum number of dataset items');
await expect(validateDataset(datasetItems, ['title']), 'Dataset items validation');