import { getStats, run, expect } from '../tools.mjs';

await run(import.meta.url, 'cheerio-scraper', {
    startUrls: [{
        url: 'https://apify.com/sitemap.xml',
        method: 'GET'
    }],
    keepUrlFragments: false,
    linkSelector: 'a[href]',
    pageFunction: async function pageFunction(context) {
        const { $, request, log } = context;
        const { url } = request;

        const pageTitle = $('title').first().text();

        log.info('Page scraped', { url, pageTitle });

        return { url, pageTitle };
    },
    proxyConfiguration: { useApifyProxy: false },
    proxyRotation: 'RECOMMENDED',
    additionalMimeTypes: ['text/xml'],
    forceResponseEncoding: false,
    ignoreSslErrors: false,
    debugLog: false
});

const stats = await getStats(import.meta.url);
expect(stats.requestsFinished === 1, 'All requests finished');
process.exit(0);
