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

void test('basic functionality', async () => {
    const run = await runActor();

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, undefined);

    const chargingDataset = await Dataset.open(run.defaultDatasetId, {
        storageClient: client,
    });
    const chargingRecords = await chargingDataset.getData();

    assert.strictEqual(
        chargingRecords.count,
        1,
        `There must be exactly one item in the charging dataset (ID ${chargingDataset.id})`,
    );
    assert.strictEqual(chargingRecords.items[0].chargedCount, 4);
    assert.strictEqual(chargingRecords.items[0].eventName, 'foobar');
});

void test('charge limit', async () => {
    const run = await runActor({ maxTotalChargeUsd: 2 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, undefined);

    const chargingDataset = await Dataset.open(run.defaultDatasetId, {
        storageClient: client,
    });
    const chargingRecords = await chargingDataset.getData();

    assert.strictEqual(
        chargingRecords.count,
        1,
        `There must be exactly one item in the charging dataset (ID ${chargingDataset.id})`,
    );
    assert.strictEqual(chargingRecords.items[0].chargedCount, 2);
    assert.strictEqual(chargingRecords.items[0].eventName, 'foobar');
});
