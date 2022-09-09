import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{
        url: 'https://apify.com/store',
        method: 'GET',
        userData: { label: 'START' }
    }],
    keepUrlFragments: false,
    linkSelector: 'div.item > a',
    pseudoUrls: [{
        purl: 'https://apify.com/[.+]/[.+]',
        method: 'GET',
        userData: { label: 'DETAIL' }
    }],
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, waitFor, jQuery: $ }) {
            log.info('Store opened!');

            let timeoutMillis;
            const buttonSelector = 'div.show-more > button';
            while (true) {
                log.info('Waiting for the Show more button.');
                try {
                    await waitFor(buttonSelector, { timeoutMillis });
                    timeoutMillis = 2000;
                } catch (err) {
                    log.info(`Could not find the Show more button, we\'ve reached the end.`, err.message);
                    break;
                }
                log.info('Clicking the Show more button.');
                $(buttonSelector).click();
            }
        }

        async function handleDetail({ request, log, skipLinks, jQuery: $ }) {
            const { url } = request;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');
            const title = $('header h1').text();
            const description = $('header span.actor-description').text();
            const modifiedDate = $('ul.ActorHeader-stats time').attr('datetime')
            const runCount = $('ul.ActorHeader-stats li:nth-of-type(3)').text().match(/[\d,]+/)[0].replace(/,/g, '');

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
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    breakpointLocation: 'NONE',
    debugLog: false,
    browserLog: false,
    maxPagesPerCrawl: 750,
});

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 700, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 700, 'Minimum number of dataset items');
await expect(datasetItems.length < 1000, 'Maximum number of dataset items');
await expect(
    validateDataset(datasetItems, ['title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation',
);
