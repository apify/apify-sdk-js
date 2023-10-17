import { getTestDir, getStats, run, expect, getDatasetItems } from '../tools.mjs';

const testDir = getTestDir(import.meta.url);

const { exit } = process;
process.exit = () => {};

await run(testDir, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://api.apify.com/v2/browser-info',
        method: 'GET',
    }],
    keepUrlFragments: false,
    linkSelector: 'a[href]',
    pageFunction: async function pageFunction(context) {
        const { log, json, input } = context;

        const { initialCookies } = input;
        const initialCookiesLength = initialCookies.length;

        const cookieString = json.headers.cookie;
        const pageCookies = cookieString.split(';').map((cookie) => {
            const name = cookie.split('=')[0].trim();
            const value = cookie.split('=')[1].trim();
            return { name, value };
        });

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

        context.log.info('All cookies were successfully checked.');

        return { initialCookiesLength, numberOfMatchingCookies };
    },
    proxyConfiguration: { useApifyProxy: false },
    additionalMimeTypes: ['application/json'],
    debugLog: false,
    ignoreSslErrors: false,
    initialCookies: [
        {
            name: 'test',
            value: 'testing cookies',
        },
        {
            name: 'store',
            value: 'value store',
        },
        {
            name: 'market_place',
            value: 'value market place',
        },
    ],
});

process.exit = exit;

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 1, 'All requests finished');

const datasetItems = await getDatasetItems(testDir);
await expect(datasetItems[0].numberOfMatchingCookies === 3, 'Number of page cookies');
await expect(
    datasetItems[0].numberOfMatchingCookies === datasetItems[0].initialCookiesLength,
    `Page cookies match the initially provided cookies. Number of non-matching cookies is `
    + `${datasetItems[0].initialCookiesLength - datasetItems[0].numberOfMatchingCookies}`,
);

process.exit(0);
