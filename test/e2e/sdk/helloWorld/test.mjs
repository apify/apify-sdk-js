import assert from 'node:assert/strict';

import { ApifyClient } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const run = await actor.call({}, { waitSecs: 15 });

assert.equal(run.exitCode, 0);
