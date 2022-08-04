import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://badssl.com/',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    pseudoUrls: [{
        purl: 'https://[.+].badssl.com/',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
    linkSelector: '.group a.bad',
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, waitFor, $ }) {
            log.info('Bad ssl page opened!');
        }

        async function handleDetail({ request, log, $ }) {
            const { url } = request;
            log.info(`Scraping ${url}`);
            const title = $('title').text();
            return { url, title };
        }
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    debugLog: false,
    ignoreSslErrors: true
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished > 20, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length > 5, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['title']), 'Dataset items validation');

process.exit(0);
