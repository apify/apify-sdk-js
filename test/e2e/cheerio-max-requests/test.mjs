import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'cheerio-scraper', {
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

        async function handleStart({ enqueueRequest, $ }) {
            const links = $('.ActorStoreItem').toArray().map((item) => $(item).attr('href'));
            for (const link of links) {
                const actorDetailUrl = `https://apify.com${link}`;
                await enqueueRequest({
                    url: actorDetailUrl,
                    userData: { label: 'DETAIL' },
                });
            }
        }

        async function handleDetail({ request, log, skipLinks, $ }) {
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
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false,
});

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 10, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 5 && datasetItems.length < 15, 'Number of dataset items');
await expect(
    validateDataset(datasetItems, ['url', 'title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation',
);
