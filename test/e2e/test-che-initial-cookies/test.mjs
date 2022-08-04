import { getStats, run, expect } from '../tools.mjs';

await run(import.meta.url, 'cheerio-scraper', {
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
            throw new Error(`The number of the page cookies doeas not match the defined initial cookies number. Number of wrong cookies is ${initialCookiesLength - numberOfSameCookies}`);
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

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished === 1, 'All requests finished');
process.exit(0);
