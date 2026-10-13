import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const runParent = async (mode) => {
    const { total: runsBefore } = await actor.runs().list();
    const run = await actor.call({ mode });
    const { total: runsAfter } = await actor.runs().list();
    const verified = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('VERIFIED');

    return { run, startedRuns: runsAfter - runsBefore, verified: verified?.value === true };
};

test('a named child run is reattached after a reboot', async () => {
    const { run, startedRuns, verified } = await runParent('reattach');

    assert.equal(run.status, 'SUCCEEDED');
    assert.ok(verified, 'the parent did not get past the reboot');
    // The parent run and the one child run it reattached to.
    assert.equal(startedRuns, 2);
});

test('a named aborted child run is resurrected after a reboot', async () => {
    const { run, startedRuns, verified } = await runParent('resurrect');

    assert.equal(run.status, 'SUCCEEDED');
    assert.ok(verified, 'the parent did not get past the reboot');
    // The parent run and the one child run it resurrected.
    assert.equal(startedRuns, 2);
});
