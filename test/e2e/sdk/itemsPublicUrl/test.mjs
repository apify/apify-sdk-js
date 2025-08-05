import assert from 'node:assert/strict';

import { ApifyClient } from 'apify';

const PUBLIC_DATA = { exposedData: 'test' };

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({ data: PUBLIC_DATA }, { waitSecs: 15 });
assert.equal(run.exitCode, 0);

const itemsPublicUrl = await client
    .keyValueStore(run.defaultKeyValueStoreId)
    .getRecord('itemsPublicUrl');

const itemsPublicUrlValue = new URL(itemsPublicUrl.value);

assert.ok(itemsPublicUrlValue.searchParams.has('signature'));

const response = await fetch(itemsPublicUrl.value);
assert.ok(response.ok);
