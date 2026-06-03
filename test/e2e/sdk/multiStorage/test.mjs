import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient } from 'apify';
import { sleep } from 'crawlee';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const runActor = async (input = {}, options = {}) => {
    const { id: runId } = await actor.call(input, options);
    await client.run(runId).waitForFinish();
    await sleep(6000); // wait for updates to propagate to MongoDB
    return await client.run(runId).get();
};

test('aliased storages are resolved and written to correctly', async () => {
    const run = await runActor();

    assert.strictEqual(run.status, 'SUCCEEDED');

    // Read the aliased storage IDs that the actor stored in the default KVS
    const aliasedDatasetIdRecord = await client
        .keyValueStore(run.defaultKeyValueStoreId)
        .getRecord('ALIASED_DATASET_ID');
    const aliasedDatasetId = aliasedDatasetIdRecord?.value ?? null;

    assert.ok(aliasedDatasetId, 'Aliased dataset ID must be present');

    // The aliased storages should be different from the default ones
    assert.notEqual(aliasedDatasetId, run.defaultDatasetId, 'Aliased dataset should differ from the default dataset');

    // Verify data in the aliased dataset
    const datasetData = await client.dataset(aliasedDatasetId).listItems();

    assert.strictEqual(datasetData.count, 2, 'Aliased dataset should have 2 items');
    assert.strictEqual(datasetData.items[0].url, 'https://example.com');
    assert.strictEqual(datasetData.items[0].title, 'Example');
    assert.strictEqual(datasetData.items[1].url, 'https://example.org');
    assert.strictEqual(datasetData.items[1].title, 'Example Org');
});
