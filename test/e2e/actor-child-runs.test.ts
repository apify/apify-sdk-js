import type { strict } from 'node:assert';

import { type RunTestResult, testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

export const main = async () => {
    // TS needs an explicit annotation to use an imported `assert` as an assertion function.
    const assert: typeof strict = (await import('node:assert/strict')).default;
    const { setTimeout } = await import('node:timers/promises');
    const { Actor } = await import('apify');

    await Actor.init();

    const { mode, childSleepSecs } = (await Actor.getInput<{ mode?: string; childSleepSecs?: number }>()) ?? {};
    const { actorId } = Actor.getEnv();
    const childInput = { childSleepSecs: mode === 'resurrect' ? 300 : 20 };
    const childRunId = await Actor.getValue<string>('CHILD_RUN_ID');

    if (childSleepSecs !== undefined) {
        // The child only waits, so that the parent can reboot while it is running.
        await setTimeout(childSleepSecs * 1000);
    } else if (!childRunId) {
        const run = await Actor.start(actorId!, childInput, { runName: 'child' });
        await Actor.setValue('CHILD_RUN_ID', run.id);

        if (mode === 'resurrect') {
            await Actor.apifyClient.run(run.id).abort();
            const abortedRun = await Actor.apifyClient.run(run.id).waitForFinish();
            assert.equal(abortedRun.status, 'ABORTED');
        }

        // The container gets killed while this waits, the run continues from the top.
        await Actor.reboot();
    } else if (mode === 'resurrect') {
        const run = await Actor.start(actorId!, childInput, { runName: 'child' });
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

        const run = await Actor.call(actorId!, childInput, { runName: 'child' });
        assert.equal(run.id, childRunId);
        assert.equal(run.status, 'SUCCEEDED');
        await Actor.setValue('VERIFIED', true);
    }

    await Actor.exit();
};

const actor = sdkActor('actor-child-runs', import.meta.filename, main);

type Run = (options: { input: { mode: string } }) => Promise<RunTestResult>;

const runParent = async (run: Run, mode: 'reattach' | 'resurrect') => {
    const result = await run({ input: { mode } });
    const verified = await result.getKeyValueStoreClient().getRecord('VERIFIED');

    return { result, verified: verified?.value === true };
};

// A second child run fails the parent's run ID assertions: the SDK either reuses the tracked run or starts a new one,
// never both.
testActor(actor, 'a named child run is reattached after a reboot', async ({ expect, run }) => {
    const { result, verified } = await runParent(run, 'reattach');

    expect(result.status).toBe('SUCCEEDED');
    expect(verified, 'the parent did not get past the reboot').toBe(true);
});

testActor(actor, 'a named aborted child run is resurrected after a reboot', async ({ expect, run }) => {
    const { result, verified } = await runParent(run, 'resurrect');

    expect(result.status).toBe('SUCCEEDED');
    expect(verified, 'the parent did not get past the reboot').toBe(true);
});
