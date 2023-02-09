import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const exit = process.exit;
process.exit = () => {};

await run(testDir, 'jsdom-scraper', {
    startUrls: [{
        url: 'https://apify.com/apify',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    maxPagesPerCrawl: 10,
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ enqueueRequest, window }) {
            const { document } =    window;
            const links = Array.from(document.querySelectorAll('.ActorStoreItem')).map(x => x.href);
            for (const link of links) {
                await enqueueRequest({
                    url: link,
                    userData: { label: 'DETAIL' },
                });
            }
        }

        async function handleDetail({ request, log, skipLinks, window }) {
            const { url } = request;
            const { document } = window;
            log.info(`Scraping ${url}`);
            await skipLinks();

            const uniqueIdentifier = url.split('/').slice(-2).join('/');

            const title = document.querySelector('header h1').textContent;
            const description = document.querySelector('header span.actor-description').textContent;
            const modifiedDate = document.querySelector('ul.ActorHeader-stats time').getAttribute('datetime');
            const runCount = document.querySelector('ul.ActorHeader-stats > li:nth-of-type(3)').textContent.match(/[\d,]+/)[0].replace(/,/g, '');

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
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 10, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 5 && datasetItems.length < 15, 'Number of dataset items');
await expect(
    validateDataset(datasetItems, ['url', 'title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation',
);

process.exit(0);
