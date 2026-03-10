import { Actor } from 'apify';

const actor = new Actor();

await actor.init();

// Open storages by alias — these should resolve via ACTOR_STORAGES_JSON
const resultsDataset = await actor.openDataset({ alias: 'results' });

// Write data to the aliased dataset
await resultsDataset.pushData([
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://example.org', title: 'Example Org' },
]);

// Store the ID so the test script can find them
await Actor.setValue('ALIASED_DATASET_ID', resultsDataset.id);

await actor.exit();
