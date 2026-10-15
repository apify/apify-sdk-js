import { MemoryStorageBackend } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { Actor } from 'apify';
import type { Run as ActorRun } from 'apify-client';
import { ActorClient, RunClient, TaskClient } from 'apify-client';
import type { MockInstance } from 'vitest';
import { onTestFinished } from 'vitest';

import { ACTOR_ENV_VARS, APIFY_ENV_VARS } from '@apify/consts';
import log from '@apify/log';

import type { TrackedChildRun } from '../../src/child_run_tracker.js';
import { createIsolatedActor } from '../createIsolatedActor.js';

// Skips the delays between the lookups of a tracked run that the API reports as missing.
vitest.mock('@crawlee/utils', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    sleep: vitest.fn(async () => {}),
}));

const globalOptions = {
    token: 'some-token',
    actId: 'some-act-id',
    defaultKeyValueStoreId: 'some-store-id',
    input: { foo: 'bar' },
    contentType: 'application/json',
    outputKey: 'OUTPUT',
    outputValue: 'some-output',
    build: 'xxx',
    taskId: 'some-task-id',
    runId: 'some-run-id',
    targetActorId: 'some-target-actor-id',
};

describe('child run tracking with `runName`', () => {
    const { input, actId, taskId } = globalOptions;
    const runName = 'child';
    const startedAt = new Date('2026-01-01T00:00:00.000Z');
    const startedRun = { id: 'child-run', status: 'RUNNING', startedAt } as ActorRun;
    const finishedRun = { ...startedRun, status: 'SUCCEEDED' } as ActorRun;
    const trackedInfo = { runId: startedRun.id, status: 'RUNNING', startedAt: startedAt.toISOString() };
    const stored = { ...trackedInfo, checksum: expect.any(String) };

    let storage: MemoryStorageBackend;
    let startSpy: MockInstance;
    let taskStartSpy: MockInstance;
    let getSpy: MockInstance;
    let waitForFinishSpy: MockInstance;
    let getStreamedLogSpy: MockInstance;
    let resurrectSpy: MockInstance;

    const getChildRunLedger = async (actor: Actor) =>
        (await actor.openKeyValueStore()).getValue<Record<string, TrackedChildRun>>('__ACTOR_CHILD_RUNS');
    const newActor = () => createIsolatedActor({ storageClient: storage }).actor;

    beforeEach(() => {
        storage = new MemoryStorageBackend();
        startSpy = vitest.spyOn(ActorClient.prototype, 'start').mockResolvedValue(startedRun);
        taskStartSpy = vitest.spyOn(TaskClient.prototype, 'start').mockResolvedValue(startedRun);
        getSpy = vitest.spyOn(RunClient.prototype, 'get').mockResolvedValue(startedRun);
        waitForFinishSpy = vitest.spyOn(RunClient.prototype, 'waitForFinish').mockResolvedValue(finishedRun);
        getStreamedLogSpy = vitest.spyOn(RunClient.prototype, 'getStreamedLog').mockResolvedValue(undefined);
        resurrectSpy = vitest.spyOn(RunClient.prototype, 'resurrect').mockResolvedValue(startedRun);
    });

    test('start() without a run name does not track the run', async () => {
        const actor = newActor();

        await actor.start(actId, input);

        expect(startSpy).toBeCalledTimes(1);
        expect(await getChildRunLedger(actor)).toBeNull();
    });

    test('start() starts a new run and tracks it', async () => {
        const actor = newActor();

        const run = await actor.start(actId, input, { runName });

        expect(run).toEqual(startedRun);
        expect(startSpy).toBeCalledTimes(1);
        expect(await getChildRunLedger(actor)).toEqual({
            [runName]: { ...stored, history: [] },
        });
    });

    test.each(['READY', 'RUNNING', 'SUCCEEDED'] as const)(
        'start() respects an existing Actor run with %s status',
        async (status) => {
            await newActor().start(actId, input, { runName });
            startSpy.mockClear();
            getSpy.mockResolvedValue({ ...startedRun, status });

            const actor = newActor();
            const run = await actor.start(actId, input, { runName });

            expect(startSpy).not.toBeCalled();
            expect(run).toEqual({ ...startedRun, status });
            expect(getSpy).toBeCalledTimes(1);
            expect(await getChildRunLedger(actor)).toEqual({ [runName]: { ...stored, status, history: [] } });
        },
    );

    test('start() starts a new run when the tracked run failed and keeps the old one in the history', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();
        getSpy.mockResolvedValue({ ...startedRun, status: 'FAILED' });
        const replacement = { id: 'replacement-run', status: 'RUNNING', startedAt } as ActorRun;
        startSpy.mockResolvedValue(replacement);

        const actor = newActor();
        const run = await actor.start(actId, input, { runName });

        expect(startSpy).toBeCalledTimes(1);
        expect(resurrectSpy).not.toBeCalled();
        expect(run).toEqual(replacement);
        expect(await getChildRunLedger(actor)).toEqual({
            [runName]: {
                ...stored,
                runId: replacement.id,
                history: [{ ...trackedInfo, status: 'FAILED' }],
            },
        });
    });

    test.each(['ABORTED', 'TIMED-OUT'] as const)(
        'start() resurrects a tracked run in the %s status with the resurrect options of the call',
        async (status) => {
            await newActor().start(actId, input, { runName });
            startSpy.mockClear();
            getSpy.mockResolvedValue({ ...startedRun, status });

            const actor = newActor();
            const run = await actor.start(actId, input, {
                runName,
                build: 'beta',
                memory: 1024,
                timeout: 60,
                maxItems: 10,
                webhooks: [],
            });

            expect(startSpy).not.toBeCalled();
            expect(resurrectSpy).toBeCalledWith({ build: 'beta', memory: 1024, runTimeoutSecs: 60, maxItems: 10 });
            expect(run).toEqual(startedRun);
            expect(await getChildRunLedger(actor)).toEqual({ [runName]: { ...stored, history: [] } });
        },
    );

    test.each([
        ['ABORTING', 'ABORTED'],
        ['TIMING-OUT', 'TIMED-OUT'],
    ] as const)(
        'start() waits for a tracked run in the %s status to finish before resurrecting it',
        async (status, finalStatus) => {
            await newActor().start(actId, input, { runName });
            startSpy.mockClear();
            getSpy.mockResolvedValue({ ...startedRun, status });
            waitForFinishSpy.mockResolvedValue({ ...startedRun, status: finalStatus });

            await newActor().start(actId, input, { runName });

            expect(waitForFinishSpy).toBeCalledTimes(1);
            expect(resurrectSpy).toBeCalledTimes(1);
            expect(startSpy).not.toBeCalled();
        },
    );

    test("start() resurrects a tracked run with the remaining time of this run with `timeout: 'inherit'`", async () => {
        await newActor().start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, status: 'TIMED-OUT' });
        vitest.setSystemTime(startedAt);
        process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
        process.env[ACTOR_ENV_VARS.TIMEOUT_AT] = new Date(startedAt.getTime() + 60_000).toISOString();
        onTestFinished(() => {
            delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
            delete process.env[ACTOR_ENV_VARS.TIMEOUT_AT];
            vitest.useRealTimers();
        });

        await newActor().start(actId, input, { runName, timeout: 'inherit' });

        expect(resurrectSpy).toBeCalledWith(expect.objectContaining({ runTimeoutSecs: 60 }));
    });

    test('start() starts a new run when the tracked run no longer exists and records the old one as lost', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();
        getSpy.mockResolvedValue(undefined);
        startSpy.mockResolvedValue({ ...startedRun, id: 'replacement-run' });

        const actor = newActor();
        await actor.start(actId, input, { runName });

        expect(startSpy).toBeCalledTimes(1);
        expect(getSpy).toBeCalledTimes(13);
        expect(sleep).toBeCalledWith(250);
        expect((await getChildRunLedger(actor))![runName].history).toEqual([{ ...trackedInfo, status: 'LOST' }]);
    });

    test('start() looks a missing tracked run up again, as it may not have reached every API replica yet', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();
        getSpy.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);

        const run = await newActor().start(actId, input, { runName });

        expect(run).toEqual(startedRun);
        expect(getSpy).toBeCalledTimes(3);
        expect(startSpy).not.toBeCalled();
    });

    test('repeated replacements accumulate in the history, oldest first', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, status: 'FAILED' });
        startSpy.mockResolvedValueOnce({ ...startedRun, id: 'second' });
        await actor.start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, id: 'second', status: 'FAILED' });
        startSpy.mockResolvedValueOnce({ ...startedRun, id: 'third' });
        await actor.start(actId, input, { runName });

        const tracked = (await getChildRunLedger(actor))![runName];
        expect(tracked.runId).toBe('third');
        expect(tracked.history.map(({ runId, status }) => [runId, status])).toEqual([
            [startedRun.id, 'FAILED'],
            ['second', 'FAILED'],
        ]);
    });

    test('start() tracks different run names independently', async () => {
        const actor = newActor();
        startSpy.mockResolvedValueOnce({ ...startedRun, id: 'first' }).mockResolvedValueOnce({
            ...startedRun,
            id: 'second',
        });

        await Promise.all([actor.start(actId, input, { runName: 'a' }), actor.start(actId, input, { runName: 'b' })]);

        expect(Object.fromEntries(Object.entries(actor.childRuns).map(([name, { id }]) => [name, id]))).toEqual({
            a: 'first',
            b: 'second',
        });
    });

    test('childRuns returns a client for the current run under each name', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, status: 'FAILED' });
        startSpy.mockResolvedValueOnce({ ...startedRun, id: 'replacement-run' });
        await actor.start(actId, input, { runName });

        const runClient = actor.childRuns[runName];

        expect(runClient.id).toBe('replacement-run');
        expect(await runClient.waitForFinish()).toEqual(finishedRun);
    });

    test('init() loads the child runs tracked before a migration', async () => {
        await newActor().start(actId, input, { runName });

        const actor = newActor();
        await actor.init();

        expect(Object.keys(actor.childRuns)).toEqual([runName]);
        expect(actor.childRuns[runName].id).toBe(startedRun.id);
    });

    test('init() throws when the stored child runs are malformed', async () => {
        await (await newActor().openKeyValueStore()).setValue('__ACTOR_CHILD_RUNS', { [runName]: { runId: 42 } });

        await expect(newActor().init()).rejects.toThrow(/__ACTOR_CHILD_RUNS.*malformed/);
    });

    test('childRuns uses the token a run was started with in this process', async () => {
        await newActor().start(actId, input, { runName: 'before-migration' });

        const actor = newActor();
        await actor.init();
        await actor.start(actId, input, { runName: 'custom-token', token: 'custom-token' });

        expect(actor.childRuns['before-migration'].apifyClient).toBe(actor.apifyClient);
        expect(actor.childRuns['custom-token'].apifyClient.token).toBe('custom-token');
    });

    test('childRuns warns when accessed before init()', () => {
        const warningSpy = vitest.spyOn(log, 'warning');

        expect(newActor().childRuns).toEqual({});
        expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Actor.init()'));
    });

    test('reusing a run name for a different Actor in the same process throws', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });

        await expect(actor.start('other-actor', input, { runName })).rejects.toThrow(/already used/);
        await expect(actor.callTask(taskId, input, { runName })).rejects.toThrow(/already used/);
        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with a different input in the same process throws', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });

        await expect(actor.start(actId, { foo: 'baz' }, { runName })).rejects.toThrow(/already used/);
    });

    test('reusing a run name with an equivalent input in the same process deduplicates the run', async () => {
        const actor = newActor();
        await actor.start(actId, { a: 1, b: { c: 2, d: 3 } }, { runName });

        await actor.start(actId, { b: { d: 3, c: 2 }, a: 1 }, { runName });

        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with a different input after a migration throws', async () => {
        await newActor().start(actId, input, { runName });

        await expect(newActor().start(actId, { foo: 'baz' }, { runName })).rejects.toThrow(/already used/);
        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with the same input after a migration deduplicates the run', async () => {
        await newActor().start(actId, { a: 1, b: 2 }, { runName });

        await newActor().start(actId, { b: 2, a: 1 }, { runName });

        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with a different input throws when the tracked run would be resurrected', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, status: 'ABORTED' });

        await expect(actor.start(actId, { foo: 'baz' }, { runName })).rejects.toThrow(/already used/);
        expect(resurrectSpy).not.toBeCalled();
    });

    test('reusing a run name with a different input is allowed when the tracked run is replaced', async () => {
        const actor = newActor();
        await actor.start(actId, input, { runName });
        getSpy.mockResolvedValue({ ...startedRun, status: 'FAILED' });

        await actor.start(actId, { foo: 'baz' }, { runName });

        expect(startSpy).toBeCalledTimes(2);
    });

    test('call() waits for a new run started with a run name', async () => {
        const actor = newActor();

        const run = await actor.call(actId, input, { runName, waitSecs: 10 });

        expect(run).toEqual(finishedRun);
        expect(startSpy).toBeCalledWith(input, expect.objectContaining({ timeoutSecs: 'noTimeout' }));
        expect(waitForFinishSpy).toBeCalledWith({ waitSecs: 10, timeoutSecs: 'noTimeout' });
        expect(getStreamedLogSpy).toBeCalledWith({ toLog: undefined, fromStart: true });
    });

    test('call() with a run name forwards the signal and request timeout like `ActorClient.call`', async () => {
        const { signal } = new AbortController();

        await newActor().call(actId, input, { runName, signal, timeoutSecs: 30 });

        expect(startSpy).toBeCalledWith(input, expect.objectContaining({ signal, timeoutSecs: 30 }));
        expect(getStreamedLogSpy).toBeCalledWith(expect.objectContaining({ signal }));
        expect(waitForFinishSpy).toBeCalledWith({ timeoutSecs: 30, signal });
    });

    test('call() waits for the tracked run instead of starting a new one', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();

        const actor = newActor();
        const run = await actor.call(actId, input, { runName });

        expect(run).toEqual(finishedRun);
        expect(startSpy).not.toBeCalled();
        expect(getStreamedLogSpy).toBeCalledWith({ toLog: undefined, fromStart: false });
        expect((await getChildRunLedger(actor))![runName].status).toBe('SUCCEEDED');
    });

    test('call() waits for a resurrected run without replaying its log', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();
        getSpy.mockResolvedValue({ ...startedRun, status: 'ABORTED' });

        const run = await newActor().call(actId, input, { runName });

        expect(run).toEqual(finishedRun);
        expect(startSpy).not.toBeCalled();
        expect(resurrectSpy).toBeCalledWith(expect.objectContaining({ timeoutSecs: 'noTimeout' }));
        expect(getStreamedLogSpy).toBeCalledWith(expect.objectContaining({ fromStart: false }));
    });

    test('call() stops the log stream when waiting for the run fails', async () => {
        const streamedLog = { start: vitest.fn(), stop: vitest.fn().mockResolvedValue(undefined) };
        getStreamedLogSpy.mockResolvedValue(streamedLog as any);
        waitForFinishSpy.mockRejectedValue(new Error('boom'));

        await expect(newActor().call(actId, input, { runName })).rejects.toThrow('boom');

        expect(streamedLog.start).toBeCalledTimes(1);
        expect(streamedLog.stop).toBeCalledTimes(1);
    });

    test('call() without a run name uses `ActorClient.call`', async () => {
        const callSpy = vitest.spyOn(ActorClient.prototype, 'call').mockResolvedValue(finishedRun);

        await newActor().call(actId, input);

        expect(callSpy).toBeCalledTimes(1);
        expect(startSpy).not.toBeCalled();
    });

    test('startTask() returns the tracked run instead of starting a new one', async () => {
        await newActor().startTask(taskId, input, { runName });
        taskStartSpy.mockClear();

        const actor = newActor();
        const run = await actor.startTask(taskId, input, { runName });

        expect(run).toEqual(startedRun);
        expect(taskStartSpy).not.toBeCalled();
        expect(await getChildRunLedger(actor)).toEqual({ [runName]: { ...stored, history: [] } });
    });

    test('callTask() deduplicates the tracked run instead of starting a new one', async () => {
        await newActor().callTask(taskId, input, { runName });
        expect(taskStartSpy).toBeCalledTimes(1);
        taskStartSpy.mockClear();

        const actor = newActor();
        const run = await actor.callTask(taskId, input, { runName, waitSecs: 5 });

        expect(run).toEqual(finishedRun);
        expect(taskStartSpy).not.toBeCalled();
        expect(waitForFinishSpy).toHaveBeenLastCalledWith({ waitSecs: 5, timeoutSecs: 'noTimeout' });
        expect((await getChildRunLedger(actor))![runName].status).toBe('SUCCEEDED');
    });

    test('callTask() with a run name forwards the signal and request timeout like `TaskClient.call`', async () => {
        const { signal } = new AbortController();

        await newActor().callTask(taskId, input, { runName, signal, timeoutSecs: 30 });

        expect(taskStartSpy).toBeCalledWith(input, expect.objectContaining({ signal, timeoutSecs: 30 }));
        expect(waitForFinishSpy).toBeCalledWith({ timeoutSecs: 30, signal });
    });
});
