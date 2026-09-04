import { Actor, ApifyClient } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

// Simulate local environment by removing platform env vars
delete process.env.APIFY_IS_AT_HOME;
delete process.env.ACTOR_STORAGES_JSON;

const actor = new Actor({
    isAtHome: false,
    logLevel: 'DEBUG',
});

await actor.init();

// Open storages by alias — locally, an alias gets an unnamed storage of its own
const resultsDataset = await actor.openDataset({ alias: 'results' });

// Write data to the aliased storages
await resultsDataset.pushData([
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://example.org', title: 'Example Org' },
]);

// Aliased storages are purged by `init()`, not on open: opening the same alias again and writing
// more data must leave the previously written data in place.
const resultsDatasetAgain = await actor.openDataset({ alias: 'results' });
await resultsDatasetAgain.pushData([{ url: 'https://example.net', title: 'Example Net' }]);

// Read back all data from the aliased dataset
const allData = await resultsDatasetAgain.getData();

// Transfer results to the platform's default dataset so the test script can verify
const run = await client.run(process.env.ACTOR_RUN_ID).get();
await client.dataset(run.defaultDatasetId).pushItems([
    {
        datasetItemCount: allData.count,
        datasetItems: allData.items,
    },
]);

await actor.exit();
