import { Actor, ApifyClient, Dataset } from 'apify';

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

// Open storages by alias — locally, this should use the alias as the storage name
const resultsDataset = await actor.openDataset({ alias: 'results' });

// Write data to the aliased storages
await resultsDataset.pushData([
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://example.org', title: 'Example Org' },
]);

// Verify purge-on-first-open: open the same alias again and write more data.
// The previously written data should still be there (no second purge).
const resultsDatasetAgain = await actor.openDataset({ alias: 'results' });
await resultsDatasetAgain.pushData([
    { url: 'https://example.net', title: 'Example Net' },
]);

// Read back all data from the aliased dataset
const allData = await resultsDatasetAgain.getData();

// Transfer results to the platform's default dataset so the test script can verify
const run = await client.run(process.env.ACTOR_RUN_ID).get();
const platformDataset = await Dataset.open(run.defaultDatasetId, {
    storageClient: client,
});

await platformDataset.pushData([
    {
        datasetItemCount: allData.count,
        datasetItems: allData.items,
    },
]);

await actor.exit();
