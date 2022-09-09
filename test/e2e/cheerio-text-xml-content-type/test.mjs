import { getTestDir, getStats, run, expect } from '../tools.mjs';
import { setTimeout } from 'node:timers/promises';

const testDir = getTestDir(import.meta.url);

await run(testDir, 'cheerio-scraper', {
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

await setTimeout(1e3);

const stats = await getStats(testDir);
await expect(stats.requestsFinished === 1, 'All requests finished');
