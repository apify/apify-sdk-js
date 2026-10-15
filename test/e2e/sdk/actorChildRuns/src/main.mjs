import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

import { Actor } from 'apify';

await Actor.init();

const { mode, childSleepSecs } = (await Actor.getInput()) ?? {};
const { actorId } = Actor.getEnv();
const childInput = { childSleepSecs: mode === 'resurrect' ? 300 : 20 };
const childRunId = await Actor.getValue('CHILD_RUN_ID');

if (childSleepSecs !== undefined) {
    // The child only waits, so that the parent can reboot while it is running.
    await setTimeout(childSleepSecs * 1000);
} else if (!childRunId) {
    const run = await Actor.start(actorId, childInput, { runName: 'child' });
    await Actor.setValue('CHILD_RUN_ID', run.id);

    if (mode === 'resurrect') {
        await Actor.apifyClient.run(run.id).abort();
        const abortedRun = await Actor.apifyClient.run(run.id).waitForFinish();
        assert.equal(abortedRun.status, 'ABORTED');
    }

    // The container gets killed while this waits, the run continues from the top.
    await Actor.reboot();
} else if (mode === 'resurrect') {
    const run = await Actor.start(actorId, childInput, { runName: 'child' });
    try {
        assert.equal(run.id, childRunId);
        assert.ok(['READY', 'RUNNING'].includes(run.status), `run.status=${run.status}`);
    } finally {
        await Actor.apifyClient.run(run.id).abort();
    }
    await Actor.setValue('VERIFIED', true);
} else {
    assert.deepEqual(Object.keys(Actor.childRuns), ['child']);
    assert.equal(Actor.childRuns.child.id, childRunId);

    const run = await Actor.call(actorId, childInput, { runName: 'child' });
    assert.equal(run.id, childRunId);
    assert.equal(run.status, 'SUCCEEDED');
    await Actor.setValue('VERIFIED', true);
}

await Actor.exit();
