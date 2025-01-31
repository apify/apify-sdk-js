import assert from 'node:assert/strict';

import { ApifyClient, Dataset } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({}, { waitSecs: 15 });
assert.equal(run.exitCode, 0);

const dataset = await Dataset.open(run.defaultDatasetId, { storageClient: client });
const data = await dataset.getData();
assert.deepEqual(data.items, [{ hello: 'world' }]);
