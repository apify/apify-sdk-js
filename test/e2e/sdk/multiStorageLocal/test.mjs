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

test('aliased storages work locally with purge-on-first-open across restarts', async () => {
    // The actor runs two lifecycle processes in sequence, sharing the same filesystem.
    // Each lifecycle creates a fresh Actor instance (resetting purgedStorageAliases),
    // opens the aliased dataset (triggering purge on first open), writes data, and
    // pushes a summary to the platform default dataset.
    const run = await runActor();

    assert.strictEqual(run.status, 'SUCCEEDED');

    const dataset = await Dataset.open(run.defaultDatasetId, {
        storageClient: client,
    });
    const data = await dataset.getData();

    assert.strictEqual(
        data.count,
        2,
        'There must be exactly two summary items (one per lifecycle)',
    );

    // First lifecycle: fresh local storage, writes 3 items total (2 + 1 from second open)
    const firstSummary = data.items[0];
    assert.strictEqual(
        firstSummary.datasetItemCount,
        3,
        'First lifecycle: aliased dataset should have 3 items (purge only happened on first open)',
    );
    assert.strictEqual(firstSummary.datasetItems[0].url, 'https://example.com');
    assert.strictEqual(firstSummary.datasetItems[0].title, 'Example');
    assert.strictEqual(firstSummary.datasetItems[1].url, 'https://example.org');
    assert.strictEqual(firstSummary.datasetItems[1].title, 'Example Org');
    assert.strictEqual(firstSummary.datasetItems[2].url, 'https://example.net');
    assert.strictEqual(firstSummary.datasetItems[2].title, 'Example Net');

    // Second lifecycle: the aliased dataset from the first lifecycle is still on disk.
    // The second lifecycle's first openDataset({ alias: 'results' }) should purge it,
    // then write 3 fresh items. If purge didn't work, there would be 6 items.
    const secondSummary = data.items[1];
    assert.strictEqual(
        secondSummary.datasetItemCount,
        3,
        'Second lifecycle: aliased dataset should have 3 items (stale data from first lifecycle was purged)',
    );
});
