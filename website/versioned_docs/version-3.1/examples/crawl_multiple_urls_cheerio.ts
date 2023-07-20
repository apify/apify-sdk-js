import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

const crawler = new CheerioCrawler({
    // Function called for each URL
    async requestHandler({ request, $ }) {
        const title = $('title').text();
        console.log(`URL: ${request.url}\nTITLE: ${title}`);
    },
});

// Run the crawler
await crawler.run([
    'http://www.example.com/page-1',
    'http://www.example.com/page-2',
    'http://www.example.com/page-3',
]);

await Actor.exit();
