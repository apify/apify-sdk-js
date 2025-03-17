import assert from 'node:assert/strict';

import { ApifyClient } from 'apify';

const PUBLIC_DATA = { exposedData: 'test' };

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({ data: PUBLIC_DATA }, { waitSecs: 15 });
assert.equal(run.exitCode, 0);

const publicUrl = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('urlToPublicData');
const data = await fetch(publicUrl.value).then((res) => res.json());

assert.deepEqual(data, PUBLIC_DATA);
