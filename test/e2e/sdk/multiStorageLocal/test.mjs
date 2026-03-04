import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient, Dataset } from 'apify';
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

test('aliased storages work locally with alias as name', async () => {
    const run = await runActor();

    assert.strictEqual(run.status, 'SUCCEEDED');

    const dataset = await Dataset.open(run.defaultDatasetId, {
        storageClient: client,
    });
    const data = await dataset.getData();

    assert.strictEqual(
        data.count,
        1,
        'There must be exactly one summary item in the dataset',
    );

    const summary = data.items[0];

    // The dataset should have 3 items total (2 from first open + 1 from second open),
    // proving that the second open did NOT purge the data
    assert.strictEqual(
        summary.datasetItemCount,
        3,
        'Aliased dataset should have 3 items (purge only happened on first open)',
    );

    // Verify the actual items
    assert.strictEqual(summary.datasetItems[0].url, 'https://example.com');
    assert.strictEqual(summary.datasetItems[0].title, 'Example');
    assert.strictEqual(summary.datasetItems[1].url, 'https://example.org');
    assert.strictEqual(summary.datasetItems[1].title, 'Example Org');
    assert.strictEqual(summary.datasetItems[2].url, 'https://example.net');
    assert.strictEqual(summary.datasetItems[2].title, 'Example Net');
});

test('purge-on-first-open works across runs', async () => {
    // Run the actor a second time — the aliased storages should be purged again
    // at the start of this new run (since purgedStorageAliases resets per Actor instance)
    const run = await runActor();

    assert.strictEqual(run.status, 'SUCCEEDED');

    const dataset = await Dataset.open(run.defaultDatasetId, {
        storageClient: client,
    });
    const data = await dataset.getData();

    assert.strictEqual(
        data.count,
        1,
        'There must be exactly one summary item in the dataset',
    );

    const summary = data.items[0];

    // Should again be 3 items, not 6 — because the first open purged the stale data from the previous run
    assert.strictEqual(
        summary.datasetItemCount,
        3,
        'Aliased dataset should have 3 items (previous run data was purged)',
    );
});
