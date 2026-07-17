import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';

import { ApifyClient } from 'apify';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);

const PARENT_TIMEOUT_SECS = 120;
const PARENT_WAIT_MILLIS = 5000;

test(`Actor.call() with timeout 'inherit' passes the parent's remaining time in seconds`, async () => {
    const parentRun = await actor.call(
        { role: 'parent', waitMillis: PARENT_WAIT_MILLIS },
        { timeout: PARENT_TIMEOUT_SECS },
    );

    assert.strictEqual(parentRun.status, 'SUCCEEDED');

    const parentOutput = (await client.keyValueStore(parentRun.defaultKeyValueStoreId).getRecord('OUTPUT'))?.value;
    assert.ok(parentOutput, 'The parent run did not produce an OUTPUT record');
    console.log('Parent output:', JSON.stringify(parentOutput));

    assert.strictEqual(parentOutput.childStatus, 'SUCCEEDED');

    const { childTimeoutSecs } = parentOutput;
    const remainingSecsBeforeCall = parentOutput.remainingMillisBeforeCall / 1000;

    // The timeout must be a whole number of seconds, computed as the parent's remaining
    // time at the moment of the call, rounded up. Before the fix, the remaining time was
    // passed in milliseconds (~115000 here), so it must never exceed the parent's own timeout.
    assert.ok(
        Number.isInteger(childTimeoutSecs),
        `The child timeout ${childTimeoutSecs} is not a whole number of seconds`,
    );
    assert.ok(
        childTimeoutSecs <= PARENT_TIMEOUT_SECS,
        `The child timeout ${childTimeoutSecs}s exceeds the parent timeout ${PARENT_TIMEOUT_SECS}s - the remaining time was likely passed in milliseconds`,
    );
    assert.ok(
        childTimeoutSecs <= Math.ceil(remainingSecsBeforeCall),
        `The child timeout ${childTimeoutSecs}s exceeds the parent's remaining time of ${remainingSecsBeforeCall}s measured right before the call`,
    );
    assert.ok(
        childTimeoutSecs >= remainingSecsBeforeCall - 10,
        `The child timeout ${childTimeoutSecs}s is much lower than the parent's remaining time of ${remainingSecsBeforeCall}s measured right before the call`,
    );

    await sleep(6000); // wait for updates to propagate to MongoDB

    // Cross-check the timeout stored by the platform for the child run, independently of the SDK.
    const childRun = await client.run(parentOutput.childRunId).get();
    assert.strictEqual(childRun.options.timeoutSecs, childTimeoutSecs);

    // The child must observe the same timeout from the inside.
    const childOutput = (await client.keyValueStore(childRun.defaultKeyValueStoreId).getRecord('OUTPUT'))?.value;
    assert.ok(childOutput, 'The child run did not produce an OUTPUT record');
    console.log('Child output:', JSON.stringify(childOutput));

    assert.strictEqual(childOutput.timeoutSecs, childTimeoutSecs);

    const childObservedTimeoutSecs =
        (new Date(childOutput.timeoutAtEnv).getTime() - new Date(childOutput.startedAt).getTime()) / 1000;
    assert.ok(
        Math.abs(childObservedTimeoutSecs - childTimeoutSecs) <= 2,
        `The deadline observed by the child (${childObservedTimeoutSecs}s after its start) does not match its timeout of ${childTimeoutSecs}s`,
    );
});
