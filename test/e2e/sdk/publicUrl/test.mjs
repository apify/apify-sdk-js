import assert from 'node:assert/strict';

import { createHmacSignature } from '@apify/utilities';
import { ApifyClient, Dataset } from 'apify';

// Also needs to be changed in main.mjs
const PUBLIC_RECORD_KEY = 'public-record-key';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({}, { waitSecs: 15 });
assert.equal(run.exitCode, 0);

const keyValueStore = await client.keyValueStore(run.defaultKeyValueStoreId).get();

const dataset = await Dataset.open(run.defaultDatasetId, { storageClient: client });
const data = await dataset.getData();
assert.deepEqual(data.items, [{ publicUrl: `https://api.apify.com/v2/key-value-stores/${keyValueStore.id}/records/${PUBLIC_RECORD_KEY}?signature=${createHmacSignature(keyValueStore.urlSigningSecretKey, PUBLIC_RECORD_KEY)}` }]);
