import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

// Create a dataset where we will store the results.
const crawler = new CheerioCrawler({
    // Function called for each URL
    async requestHandler({ request, body }) {
        // Save data to default dataset
        await Actor.pushData({
            url: request.url,
            html: body,
        });
    },
});

// Run the crawler
await crawler.run([
    { url: 'http://www.example.com/page-1' },
    { url: 'http://www.example.com/page-2' },
    { url: 'http://www.example.com/page-3' },
]);

await Actor.exit();
