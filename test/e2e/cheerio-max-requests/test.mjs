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
    maxPagesPerCrawl: 10,
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ enqueueRequest, $ }) {
            const links = $('div.UserDetailPage-publicActors > div a').toArray().map((item) => $(item).attr('href'));
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
await expect(stats.requestsFinished > 10, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 5 && datasetItems.length < 15, 'Number of dataset items');
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
