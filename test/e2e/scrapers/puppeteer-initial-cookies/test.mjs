import { getTestDir, getStats, run, expect, getDatasetItems } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://api.apify.com/v2/browser-info',
        method: 'GET',
    }],
    pageFunction: async function pageFunction(context) {
        const { page, input, log } = context;

        const { initialCookies } = input;
        const initialCookiesLength = initialCookies.length;

        const pageCookies = await page.cookies();

        log.info('Checking cookies names and values...');
        let numberOfMatchingCookies = 0;
        pageCookies.forEach((cookieObject) => {
            initialCookies.forEach((initialCookieObject) => {
                if (cookieObject.name === initialCookieObject.name && cookieObject.value === initialCookieObject.value) {
                    numberOfMatchingCookies++;
                }
            });
        });

        if (numberOfMatchingCookies !== initialCookiesLength) {
            throw new Error(`The number of the page cookies does not match the defined initial cookies number. Number of wrong cookies is ${initialCookiesLength - numberOfMatchingCookies}`);
        }

        log.info('All cookies were successfully checked.');

        return { initialCookiesLength, numberOfMatchingCookies };
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    initialCookies: [{
        name: 'test',
        value: 'testing cookies',
    }, {
        name: 'store',
        value: 'value store',
    }, {
        name: 'market_place',
        value: 'value market place',
    }],
    useChrome: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: false,
    browserLog: false,
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 1, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems[0].numberOfMatchingCookies === 3, 'Number of page cookies');
await expect(
    datasetItems[0].numberOfMatchingCookies === datasetItems[0].initialCookiesLength,
    `Page cookies match the initial defined cookies. Number of non-matching cookies is `
    + `${datasetItems[0].initialCookiesLength - datasetItems[0].numberOfMatchingCookies}`,
);

process.exit(0);
