import assert from 'node:assert/strict';

import { ApifyClient } from 'apify';

const PUBLIC_DATA = { exposedData: 'test' };

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({ data: PUBLIC_DATA }, { waitSecs: 15 });
assert.equal(run.exitCode, 0);

const keysPublicUrl = await client
    .keyValueStore(run.defaultKeyValueStoreId)
    .getRecord('keysPublicUrl');

const keysPublicUrlValue = new URL(keysPublicUrl.value);

assert.ok(keysPublicUrlValue.searchParams.has('signature'));

const response = await fetch(keysPublicUrl.value);
assert.ok(response.ok);
