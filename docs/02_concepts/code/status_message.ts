import { Actor } from 'apify';

await Actor.init();

// highlight-start
await Actor.setStatusMessage('Fetching the list of URLs...');
// highlight-end

// Simulate some work
const urls = [
    'https://example.com/1',
    'https://example.com/2',
    'https://example.com/3',
];

for (let i = 0; i < urls.length; i++) {
    // Process each URL...
    // highlight-start
    await Actor.setStatusMessage(`Processing ${i + 1} of ${urls.length} URLs`);
    // highlight-end
}

// highlight-start
// Mark the final status message as terminal
await Actor.setStatusMessage('All URLs processed successfully!', {
    isStatusMessageTerminal: true,
});
// highlight-end

await Actor.exit();
