import { Actor } from 'apify';

await Actor.init();

const urls = [
    'https://example.com/1',
    'https://example.com/2',
    'https://example.com/3',
];

for (const url of urls) {
    // Do some expensive work (e.g. scraping, API calls)
    const result = { url, data: `Scraped data from ${url}` };

    // highlight-start
    // pushData returns a ChargeResult - check it to know if the budget ran out
    const { eventChargeLimitReached } = await Actor.pushData(
        result,
        'result-item',
    );

    if (eventChargeLimitReached) {
        console.log('Charge limit reached, stopping the Actor');
        break;
    }
    // highlight-end
}

await Actor.exit();
