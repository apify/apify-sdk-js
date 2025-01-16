import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient, Dataset, KeyValueStore } from 'apify';
import { sleep } from 'crawlee';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);
await actor.update({
    pricingInfos: [
        {
            pricingModel: 'PAY_PER_EVENT',
            pricingPerEvent: {
                actorChargeEvents: {
                    foobar: {
                        eventTitle: 'Foo bar',
                        eventPriceUsd: 0.1,
                        eventDescription: 'Foo foo bar bar',
                    },
                },
            },
        },
    ],
});

const runActor = async (input, options) => {
    const { id: runId } = await actor.call(input, options);
    await client.run(runId).waitForFinish();
    await sleep(6000); // wait for updates to propagate to MongoDB
    return await client.run(runId).get();
};

const openChargingDataset = async (run) => {
    const store = await KeyValueStore.open(run.defaultKeyValueStoreId, { storageClient: client });

    const chargingDatasetId = await store.getValue('CHARGING_LOG_DATASET_ID');
    assert.notStrictEqual(chargingDatasetId, null, 'Charging dataset ID must be present');
    assert.notStrictEqual(chargingDatasetId.match(/^[0-9a-zA-Z]+$/), null, 'Charging dataset ID must be alphanumeric');

    return await Dataset.open(chargingDatasetId, { storageClient: client });
};

test('basic functionality', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 10 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, { foobar: 4 });

    const chargingDataset = await openChargingDataset(run);
    const chargingRecords = await chargingDataset.getData();
    assert.strictEqual(chargingRecords.count, 4, `There must be exactly four items in the charging dataset (ID ${chargingDataset.id})`);
});

test('charge limit', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 0.2 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, { foobar: 2 });

    const chargingDataset = await openChargingDataset(run);
    const chargingRecords = await chargingDataset.getData();
    assert.strictEqual(chargingRecords.count, 2, `There must be exactly two items in the charging dataset (ID ${chargingDataset.id})`);
});

test('default charge limit 0', async () => {
    const run = await runActor({}, {});

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, { foobar: 0 });

    const chargingDataset = await openChargingDataset(run);
    const chargingRecords = await chargingDataset.getData();
    assert.strictEqual(chargingRecords.count, 0, `There must be exactly 0 items in the charging dataset (ID ${chargingDataset.id})`);
});
