import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'web-scraper', {
    runMode: 'PRODUCTION',
    startUrls: [{
        url: 'https://warehouse-theme-metal.myshopify.com/collections/all-tvs',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pseudoUrls: [{
        purl: 'https://warehouse-theme-metal.myshopify.com/collections/all-tvs?page=[2|3]',
        method: 'GET',
        userData: { label: 'START' },
    }],
    linkSelector: 'a',
    pageFunction: async function pageFunction(context) {
        switch (context.request.userData.label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, request, enqueueRequest, waitFor, jQuery: $ }) {
            log.info(`${request.url} opened!`);

            await waitFor('a.product-item__image-wrapper');
            const urls = $('a.product-item__image-wrapper')
                .toArray()
                .map((link) => `https://warehouse-theme-metal.myshopify.com/${$(link).attr('href')}`);

            log.info(`${request.url} | Enqueueing ${urls.length} actor pages`);

            for (const url of urls) {
                await enqueueRequest({ url, label: 'DETAIL' });
            }
        }

        async function handleDetail({ request, log, skipLinks, jQuery: $ }) {
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
    injectJQuery: true,
    injectUnderscore: false,
    preNavigationHooks: `[
        async ({ page }) => {
            await page.evaluateOnNewDocument(() => {
                localStorage.setItem('themeExitPopup', 'true');
            });
        }
    ]`,
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
    maxPagesPerCrawl: 30,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 30, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 25 && datasetItems.length < 35, 'Number of dataset items');
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
