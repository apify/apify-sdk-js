import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

const crawler = new CheerioCrawler({
    async requestHandler({ request, pushData }) {
        // highlight-start
        // Buffered until the handler finishes, so a retried request stores the item once
        await pushData({ url: request.url });

        // Charged immediately - the key keeps a retry of this request from charging again
        await Actor.charge({
            eventName: 'result-item',
            idempotencyKey: `result-item-${request.uniqueKey}`,
        });
        // highlight-end
    },
});

await crawler.run(['https://crawlee.dev']);

await Actor.exit();
