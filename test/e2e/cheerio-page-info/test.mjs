import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://apify.com/apify',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    pseudoUrls: [{
        purl: 'https://apify.com/apify/web-scraper',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
    linkSelector: 'a',
    pageFunction: async function pageFunction(context) {
        const { request, log, skipLinks, $ } = context;
        const { userData: { label } } = request;

        if (label === 'START') {
            log.info('Store opened!');
        }

        if (label === 'DETAIL') {
            const { url } = request;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');
            const title = $('header h1').text();
            const description = $('div.Section-body > div > p').text();
            const modifiedDate = $('div:nth-of-type(2) > ul > li:nth-of-type(3)').text();
            const runCount = $('div:nth-of-type(2) > ul > li:nth-of-type(2)').text();

            return {
                url,
                uniqueIdentifier,
                title,
                description,
                modifiedDate,
                runCount,
            };
        }
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 2, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length === 1, 'Number of dataset items');
await expect(
    validateDataset(
        datasetItems,
        [
            'url',
            'title',
            'uniqueIdentifier',
            'description',
            // Skip modifiedAt and runCount since they changed
            // 'modifiedDate',
            // 'runCount',
        ],
    ),
    'Dataset items validation',
);

process.exit(0);
