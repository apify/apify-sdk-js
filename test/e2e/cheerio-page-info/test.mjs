import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://warehouse-theme-metal.myshopify.com/collections/all-tvs',
        method: 'GET',
        userData: { label: 'START' },
    }],
    keepUrlFragments: false,
    pseudoUrls: [{
        purl: 'https://warehouse-theme-metal.myshopify.com/products/sony-xbr-65x950g-65-class-64-5-diag-bravia-4k-hdr-ultra-hd-tv',
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

            const urlPart = url.split('/').slice(-1); // ['sennheiser-mke-440-professional-stereo-shotgun-microphone-mke-440']
            const manufacturer = urlPart[0].split('-')[0]; // 'sennheiser'
            const title = $('.product-meta h1').text();
            const sku = $('span.product-meta__sku-number').text();

            const rawPrice = $('span.price')
                .filter((_, el) => $(el).text().includes('$'))
                .first()
                .text()
                .split('$')[1];
            const price = Number(rawPrice.replaceAll(',', ''));

            const inStock = $('span.product-form__inventory')
                .first()
                .filter((_, el) => $(el).text().includes('In stock'))
                .length !== 0;

            return {
                url,
                manufacturer,
                title,
                sku,
                currentPrice: price,
                availableInStock: inStock,
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
            'manufacturer',
            'title',
            'sku',
            'currentPrice',
            'availableInStock',
        ],
    ),
    'Dataset items validation',
);

process.exit(0);
