import { getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

await run(import.meta.url, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://apify.com/store',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    pseudoUrls: [{
        purl: 'https://apify.com/[.+]/[.+]',
        method: 'GET',
        userData: { label: 'DETAIL' }
    }],
    linkSelector: 'a',
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, waitFor, $ }) {
            log.info('Store opened!');

            const dataJson = $('#__NEXT_DATA__').html();
            const data = JSON.parse(dataJson);
            const { props: { pageProps: { items } } } = data;

            for (const item of items) {
                const { name, username } = item;
                const actorDetailUrl = `https://apify.com/${username}/${name}`;
                await context.enqueueRequest({
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
    maxPagesPerCrawl: 750
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished > 700, 'All requests finished');

const datasetItems = await getDatasetItems(import.meta.url);
expect(datasetItems.length > 700, 'Minimum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(datasetItems.length < 1000, 'Maximum number of dataset items');
await new Promise((resolve) => setTimeout(resolve, 100));
expect(validateDataset(datasetItems, ['title', 'uniqueIdentifier', 'description', 'modifiedDate', 'runCount']),
    'Dataset items validation');

process.exit(0);
