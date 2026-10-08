import { MemoryStorageBackend } from '@crawlee/core';
import type { Actor } from 'apify';
import type { ActorRun } from 'apify-client';
import { ActorClient, RunClient, TaskClient } from 'apify-client';
import type { MockInstance } from 'vitest';
import { createIsolatedActor } from '../createIsolatedActor';

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

    const getChildRunLedger = async (actor: Actor) => (await actor.openKeyValueStore()).getValue('__ACTOR_CHILD_RUNS');
    const newActor = () => createIsolatedActor({ storageClient: storage }).actor;

    beforeEach(() => {
        storage = new MemoryStorageBackend();
        startSpy = vitest.spyOn(ActorClient.prototype, 'start').mockResolvedValue(startedRun);
        taskStartSpy = vitest.spyOn(TaskClient.prototype, 'start').mockResolvedValue(startedRun);
        getSpy = vitest.spyOn(RunClient.prototype, 'get').mockResolvedValue(startedRun);
        waitForFinishSpy = vitest.spyOn(RunClient.prototype, 'waitForFinish').mockResolvedValue(finishedRun);
        getStreamedLogSpy = vitest.spyOn(RunClient.prototype, 'getStreamedLog').mockResolvedValue(undefined);
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
        'start() resumes a tracked run in the %s status after a restart',
        async (status) => {
            await newActor().start(actId, input, { runName });
            startSpy.mockClear();
            getSpy.mockResolvedValue({ ...startedRun, status });

            const actor = newActor();
            const run = await actor.start(actId, input, { runName });

            expect(startSpy).not.toBeCalled();
            expect(run).toEqual({ ...startedRun, status });
            expect(getSpy).toBeCalledTimes(1);
            expect((await actor.childRuns())[runName]).toEqual({ ...stored, status, history: [] });
        },
    );

    test.each(['FAILED', 'ABORTING', 'ABORTED', 'TIMING-OUT', 'TIMED-OUT'] as const)(
        'start() starts a new run when the tracked run is in the %s status and keeps the old one in the history',
        async (status) => {
            await newActor().start(actId, input, { runName });
            startSpy.mockClear();
            getSpy.mockResolvedValue({ ...startedRun, status });
            const replacement = { id: 'replacement-run', status: 'RUNNING', startedAt } as ActorRun;
            startSpy.mockResolvedValue(replacement);

            const actor = newActor();
            const run = await actor.start(actId, input, { runName });

            expect(startSpy).toBeCalledTimes(1);
            expect(run).toEqual(replacement);
            expect(await getChildRunLedger(actor)).toEqual({
                [runName]: {
                    ...stored,
                    runId: replacement.id,
                    history: [{ ...trackedInfo, status }],
                },
            });
        },
    );

    test('start() starts a new run when the tracked run no longer exists and records the old one as lost', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();
        getSpy.mockResolvedValue(undefined);
        startSpy.mockResolvedValue({ ...startedRun, id: 'replacement-run' });

        const actor = newActor();
        await actor.start(actId, input, { runName });

        expect(startSpy).toBeCalledTimes(1);
        expect((await actor.childRuns())[runName].history).toEqual([{ ...trackedInfo, status: 'LOST' }]);
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

        const tracked = (await actor.childRuns())[runName];
        expect(tracked.runId).toBe('third');
        expect(tracked.history.map(({ runId, status }) => [runId, status])).toEqual([
            [startedRun.id, 'FAILED'],
            ['second', 'FAILED'],
        ]);
    });

    test('childRuns() is empty without tracked runs and returns a copy', async () => {
        const actor = newActor();
        expect(await actor.childRuns()).toEqual({});

        await actor.start(actId, input, { runName });
        (await actor.childRuns())[runName].status = 'FAILED';

        expect((await actor.childRuns())[runName].status).toBe('RUNNING');
    });

    test('start() tracks different run names independently', async () => {
        const actor = newActor();
        startSpy.mockResolvedValueOnce({ ...startedRun, id: 'first' }).mockResolvedValueOnce({
            ...startedRun,
            id: 'second',
        });

        await Promise.all([actor.start(actId, input, { runName: 'a' }), actor.start(actId, input, { runName: 'b' })]);

        expect(
            Object.fromEntries(Object.entries(await actor.childRuns()).map(([name, { runId }]) => [name, runId])),
        ).toEqual({ a: 'first', b: 'second' });
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

    test('reusing a run name with an equivalent input in the same process resumes the run', async () => {
        const actor = newActor();
        await actor.start(actId, { a: 1, b: { c: 2, d: 3 } }, { runName });

        await actor.start(actId, { b: { d: 3, c: 2 }, a: 1 }, { runName });

        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with a different input after a restart throws', async () => {
        await newActor().start(actId, input, { runName });

        await expect(newActor().start(actId, { foo: 'baz' }, { runName })).rejects.toThrow(/already used/);
        expect(startSpy).toBeCalledTimes(1);
    });

    test('reusing a run name with the same input after a restart resumes the run', async () => {
        await newActor().start(actId, { a: 1, b: 2 }, { runName });

        await newActor().start(actId, { b: 2, a: 1 }, { runName });

        expect(startSpy).toBeCalledTimes(1);
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
        expect(startSpy).toBeCalledTimes(1);
        expect(waitForFinishSpy).toBeCalledWith({ waitSecs: 10 });
        expect(getStreamedLogSpy).toBeCalledWith({ toLog: undefined, fromStart: true });
    });

    test('call() waits for the tracked run instead of starting a new one', async () => {
        await newActor().start(actId, input, { runName });
        startSpy.mockClear();

        const actor = newActor();
        const run = await actor.call(actId, input, { runName });

        expect(run).toEqual(finishedRun);
        expect(startSpy).not.toBeCalled();
        expect(getStreamedLogSpy).toBeCalledWith({ toLog: undefined, fromStart: false });
        expect((await actor.childRuns())[runName].status).toBe('SUCCEEDED');
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

    test('callTask() resumes the tracked run instead of starting a new one', async () => {
        await newActor().callTask(taskId, input, { runName });
        expect(taskStartSpy).toBeCalledTimes(1);
        taskStartSpy.mockClear();

        const actor = newActor();
        const run = await actor.callTask(taskId, input, { runName, waitSecs: 5 });

        expect(run).toEqual(finishedRun);
        expect(taskStartSpy).not.toBeCalled();
        expect(waitForFinishSpy).toHaveBeenLastCalledWith({ waitSecs: 5 });
        expect((await actor.childRuns())[runName].status).toBe('SUCCEEDED');
    });
});
