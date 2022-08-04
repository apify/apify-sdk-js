import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{
        url: 'https://apify.com/store',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    linkSelector: 'div.item > a',
    pseudoUrls: [{
        purl: 'https://apify.com/apify/web-scraper',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
    pageFunction: async function pageFunction(context) {
        const { request, log, skipLinks, jQuery: $ } = context;

        if (request.userData.label === 'START') {
            log.info('Store opened!');
        }

        if (request.userData.label === 'DETAIL') {
            const { url } = request;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');
            const title = $('header h1').text();
            const description = $('header span.actor-description').text();
            const modifiedDate = $('ul.ActorHeader-stats time').attr('datetime');
            const runCount = $('ul.ActorHeader-stats > li:nth-of-type(3)').text().match(/[\d,]+/)[0].replace(/,/g, '');

            return {
                url,
                uniqueIdentifier,
                title,
                description,
                modifiedDate: new Date(Number(modifiedDate)),
                runCount: Number(runCount),
            };
        }
    },
    injectJQuery: true,
    injectUnderscore: false,
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    useChrome: false,
    useStealth: false,
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
expect(stats.requestsFinished === 2, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length === 1, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(datasetItems.length === 1, 'Maximum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation');

process.exit(0);
