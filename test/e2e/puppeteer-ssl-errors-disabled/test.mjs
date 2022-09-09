import { getTestDir, getStats, getDatasetItems, run, expect, validateDataset } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://badssl.com/',
        method: 'GET',
        userData: { label: 'START' },
    }],
    pseudoUrls: [{
        purl: 'https://[.+].badssl.com/',
        method: 'GET',
        userData: { label: 'DETAIL' },
    }],
    linkSelector: '.group a.bad',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { request: { userData: { label } } } = context;

        switch (label) {
            case 'START': return handleStart(context);
            case 'DETAIL': return handleDetail(context);
        }

        async function handleStart({ log }) {
            log.info('Bad ssl page opened!');
        }

        async function handleDetail({ request, log, page }) {
            const { url } = request;
            log.info(`Scraping ${url}`);
            const title = await page.title();
            return { url, title };
        }
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: true,
    browserLog: false
});

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished > 5, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems.length > 5, 'Minimum number of dataset items');
await expect(validateDataset(datasetItems, ['title']), 'Dataset items validation');
