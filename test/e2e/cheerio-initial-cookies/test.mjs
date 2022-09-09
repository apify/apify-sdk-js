import { getTestDir, getStats, run, expect } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

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
        const pageCookies = cookieString.split(";").map(cookie => {
            const name = cookie.split("=")[0].trim();
            const value = cookie.split("=")[1].trim();
            return { name, value };
        });

        log.info('Checking cookies names and values...');
        let numberOfSameCookies = 0;
        pageCookies.forEach(cookieObject => {
            initialCookies.forEach(initialCookieObject => {
                if (cookieObject.name === initialCookieObject.name && cookieObject.value === initialCookieObject.value) {
                    numberOfSameCookies++;
                }
            })
        });

        if (numberOfSameCookies !== initialCookiesLength) {
            throw new Error(`The number of the page cookies does not match the defined initial cookies number. Number of wrong cookies is ${initialCookiesLength - numberOfSameCookies}`);
        }

        context.log.info('All cookies were successfully checked.');
    },
    proxyConfiguration: { useApifyProxy: false },
    additionalMimeTypes: ['application/json'],
    debugLog: false,
    ignoreSslErrors: false,
    initialCookies: [{
        name: 'test',
        value: 'testing cookies',
    }, {
        name: 'store',
        value: 'value store'
    }, {
        name: 'market_place',
        value: 'value market place'
    }],
});

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 1, 'All requests finished');
