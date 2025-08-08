import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient, KeyValueStore } from 'apify';
import { sleep } from 'crawlee';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const runActor = async (input, options) => {
    const { id: runId } = await actor.call(input, options);
    await client.run(runId).waitForFinish();
    await sleep(6000); // wait for updates to propagate to MongoDB
    return await client.run(runId).get();
};

test('defaults work', async () => {
    const run = await runActor({}, {});

    assert.strictEqual(run.status, 'SUCCEEDED');

    const store = await KeyValueStore.open(run.defaultKeyValueStoreId, {
        storageClient: client,
    });

    const receivedInput = await store.getValue('RECEIVED_INPUT');
    assert.deepEqual(receivedInput, { foo: 'bar' });
});

test('input is passed through', async () => {
    const run = await runActor({ foo: 'baz' }, {});

    assert.strictEqual(run.status, 'SUCCEEDED');

    const store = await KeyValueStore.open(run.defaultKeyValueStoreId, {
        storageClient: client,
    });

    const receivedInput = await store.getValue('RECEIVED_INPUT');
    assert.deepEqual(receivedInput, { foo: 'baz' });
});
