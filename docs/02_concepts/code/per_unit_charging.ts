import { Actor } from 'apify';

await Actor.init();

const urls = [
    'https://example.com/1',
    'https://example.com/2',
    'https://example.com/3',
];

// highlight-start
// ✅ Preferred: charge one event at a time
for (const url of urls) {
    const { eventChargeLimitReached } = await Actor.charge({
        eventName: 'page-scraped',
    });

    if (eventChargeLimitReached) break;

    const result = { url, data: `Scraped data from ${url}` };
    await Actor.pushData(result);
}
// highlight-end

// highlight-start
// ⚠️ Avoid: batching charges and then doing the work
const { chargedCount } = await Actor.charge({
    eventName: 'page-scraped',
    count: urls.length,
});
// chargedCount may be less than urls.length if the budget is insufficient —
// make sure to only process chargedCount items, not all of them!
for (let i = 0; i < chargedCount; i++) {
    const result = { url: urls[i], data: `Scraped data from ${urls[i]}` };
    await Actor.pushData(result);
}
// highlight-end

await Actor.exit();
