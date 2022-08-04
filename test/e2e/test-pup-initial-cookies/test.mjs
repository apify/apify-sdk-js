import { getStats, run, expect } from '../tools.mjs';

await run(import.meta.url, 'puppeteer-scraper', {
    startUrls: [{
        url: 'https://api.apify.com/v2/browser-info',
        method: 'GET'
    }],
    linkSelector: 'a',
    keepUrlFragments: false,
    pageFunction: async function pageFunction(context) {
        const { page, input, log } = context;

        const initialCookies = input.initialCookies;
        const initialCookiesLength = initialCookies.length;

        const pageCookies = await page.cookies();

        log.info('Checking cookies names and values...');
        let numberOfSameCookies = 0;
        pageCookies.forEach(cookieObject => {
            initialCookies.forEach(initialCookieObject => {
                if(cookieObject.name === initialCookieObject.name && cookieObject.value === initialCookieObject.value) {
                    numberOfSameCookies++;
                }
            })
        });

        if (numberOfSameCookies !== initialCookiesLength) {
            throw new Error(`The number of the page cookies doeas not match the defined initial cookies number. Number of wrong cookies is ${initialCookiesLength - numberOfSameCookies}`);
        }

        log.info('All cookies were successfully checked.');

    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    initialCookies: [{
        name: 'test',
        value: 'testing cookies'
    }, {
        name: 'store',
        value: 'value store'
    }, {
        name: 'market_place',
        value: 'value market place'
    }],
    useChrome: false,
    useStealth: false,
    ignoreSslErrors: false,
    ignoreCorsAndCsp: false,
    downloadMedia: true,
    downloadCss: true,
    waitUntil: ['networkidle2'],
    debugLog: false,
    browserLog: false
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished === 1, 'All requests finished');
process.exit(0);
