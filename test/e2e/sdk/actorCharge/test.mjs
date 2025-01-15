import assert from 'node:assert/strict';

import { ApifyClient, Dataset, KeyValueStore } from 'apify';

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

const run = await actor.call({}, { waitSecs: 15 });

const store = await KeyValueStore.open(run.defaultKeyValueStoreId, { storageClient: client });

const chargingDatasetId = await store.getValue('CHARGING_LOG_DATASET_ID');
assert.notStrictEqual(chargingDatasetId, null, 'Charging dataset ID must be present');
assert.notStrictEqual(chargingDatasetId.match(/^[0-9a-zA-Z]+$/), null, 'Charging dataset ID must be alphanumeric');

const chargingDataset = await Dataset.open(chargingDatasetId, { storageClient: client });
const chargingRecords = await chargingDataset.getData();

assert.strictEqual(chargingRecords.count, 1, `There must be exactly one item in the charging dataset (ID ${chargingDatasetId})`);
