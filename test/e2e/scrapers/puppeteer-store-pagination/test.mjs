import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://warehouse-theme-metal.myshopify.com/collections/all-tvs',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log, page, enqueueLinks }) {
            log.info('Store opened');
            const nextButtonSelector = '.pagination__next';
            // enqueue product details from the first three pages of the store
            for (let pageNo = 1; pageNo < 3; pageNo++) {
                // Wait for network events to finish
                await page.waitForNetworkIdle();
                // Enqueue all loaded links
                await enqueueLinks({
                    selector: 'a.product-item__image-wrapper',
                    label: 'DETAIL',
                    globs: ['https://warehouse-theme-metal.myshopify.com/*/*'],
                });
                log.info(`Enqueued actors for page ${pageNo}`);
                log.info('Loading the next page');
                await page.evaluate((el) => document.querySelector(el)?.click(), nextButtonSelector);
            }
        }

        async function handleDetail({ request: { url }, log, page }) {
            log.info(`Scraping ${url}`);

            const urlPart = url.split('/').slice(-1); // ['sennheiser-mke-440-professional-stereo-shotgun-microphone-mke-440']
            const manufacturer = urlPart[0].split('-')[0]; // 'sennheiser'

            const results = await page.evaluate(() => {
                const rawPrice = document.querySelector('span.price').textContent.split('$')[1];
                const price = Number(rawPrice.replaceAll(',', ''));

                const inStock = document.querySelector('span.product-form__inventory').textContent.includes('In stock');

                return {
                    title: document.querySelector('.product-meta h1').textContent,
                    sku: document.querySelector('span.product-meta__sku-number').textContent,
                    currentPrice: price,
                    availableInStock: inStock,
                };
            });

            return {
                url,
                manufacturer,
                ...results,
            };
        }
    },
    preNavigationHooks: `[
        async ({ page }, goToOptions) => {
            await page.evaluateOnNewDocument(() => {
                localStorage.setItem('themeExitPopup', 'true');
            });
            goToOptions.waitUntil = ['networkidle2'];
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
    debugLog: false,
    browserLog: false,
    maxPagesPerCrawl: 30,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 30, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 25 && datasetItems.length < 40, 'Number of dataset items');
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
