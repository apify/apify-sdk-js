import { setTimeout } from 'node:timers/promises';

import { MemoryStorageBackend } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { Actor, PlatformEventManager } from 'apify';
import type { Run as ActorRun } from 'apify-client';
import { ActorClient, NotFoundError, RunClient, TaskClient } from 'apify-client';
import type { MockInstance } from 'vitest';
import { onTestFinished } from 'vitest';

import { ACTOR_ENV_VARS, ACTOR_EVENT_NAMES, APIFY_ENV_VARS } from '@apify/consts';
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
    const stored = { ...trackedInfo, checksum: expect.any(String), abortWithParent: false };

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

    describe('abortWithParent', () => {
        let abortSpy: MockInstance;

        const newInitializedActor = async () => {
            const { actor, events } = createIsolatedActor({ storageClient: storage });
            await actor.init({ gracefulShutdown: false });
            return { actor, events };
        };
        const abortParent = async (events: PlatformEventManager) => {
            events.emit(ACTOR_EVENT_NAMES.ABORTING);
            await events.waitForAllListenersToComplete();
        };
        const abortedRunIds = () => (abortSpy.mock.contexts as RunClient[]).map((runClient) => runClient.id);

        beforeEach(() => {
            abortSpy = vitest
                .spyOn(RunClient.prototype, 'abort')
                .mockResolvedValue({ ...startedRun, status: 'ABORTING' } as ActorRun);
        });

        test.each(['start', 'call', 'startTask', 'callTask'] as const)(
            '%s() with `abortWithParent` throws without a run name',
            async (method) => {
                await expect(newActor()[method](actId, input, { abortWithParent: true })).rejects.toThrow(
                    /requires `runName`/,
                );
                expect(startSpy).not.toBeCalled();
                expect(taskStartSpy).not.toBeCalled();
            },
        );

        test('aborting the parent gracefully aborts only the child runs started with `abortWithParent`', async () => {
            const { actor, events } = await newInitializedActor();
            startSpy.mockResolvedValueOnce({ ...startedRun, id: 'with' }).mockResolvedValueOnce({
                ...startedRun,
                id: 'without',
            });
            await actor.start(actId, input, { runName: 'with', abortWithParent: true });
            await actor.start(actId, input, { runName: 'without' });

            await abortParent(events);

            expect(abortSpy).toBeCalledTimes(1);
            expect(abortSpy).toBeCalledWith({ gracefully: true });
            expect(abortedRunIds()).toEqual(['with']);
            const ledger = await getChildRunLedger(actor);
            expect([ledger!.with.abortWithParent, ledger!.without.abortWithParent]).toEqual([true, false]);
        });

        test('the latest call under a run name sets `abortWithParent`', async () => {
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName });
            await actor.start(actId, input, { runName, abortWithParent: true });

            await abortParent(events);

            expect(startSpy).toBeCalledTimes(1);
            expect(abortedRunIds()).toEqual([startedRun.id]);
        });

        test('aborting the parent aborts a child run tracked before a migration', async () => {
            await newActor().start(actId, input, { runName, abortWithParent: true });

            const { events } = await newInitializedActor();
            await abortParent(events);

            expect(abortedRunIds()).toEqual([startedRun.id]);
        });

        test('removing all `aborting` listeners keeps aborting the child runs started with `abortWithParent`', async () => {
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName, abortWithParent: true });
            const listener = vitest.fn();
            actor.on(ACTOR_EVENT_NAMES.ABORTING, listener);

            actor.off(ACTOR_EVENT_NAMES.ABORTING);
            await abortParent(events);

            expect(listener).not.toBeCalled();
            expect(abortedRunIds()).toEqual([startedRun.id]);
        });

        test('a child run that fails to abort is logged and does not stop the others', async () => {
            const exceptionSpy = vitest.spyOn(log, 'exception');
            const { actor, events } = await newInitializedActor();
            for (const id of ['broken', 'gone', 'healthy']) {
                startSpy.mockResolvedValueOnce({ ...startedRun, id });
                await actor.start(actId, input, { runName: id, abortWithParent: true });
            }
            abortSpy.mockImplementation(async function (this: RunClient) {
                if (this.id === 'broken') throw new Error('boom');
                if (this.id === 'gone') throw new NotFoundError({ status: 404, data: {} } as any, 1);
                return { ...startedRun, id: this.id, status: 'ABORTING' };
            });

            await abortParent(events);

            expect(abortedRunIds().sort()).toEqual(['broken', 'gone', 'healthy']);
            expect(exceptionSpy).toBeCalledTimes(1);
            expect(exceptionSpy).toBeCalledWith(expect.any(Error), 'Failed to abort child run "broken"', {
                runId: 'broken',
            });
        });

        test('once the parent is aborting, a call with `abortWithParent` throws instead of resurrecting', async () => {
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName, abortWithParent: true });
            await abortParent(events);
            getSpy.mockResolvedValue({ ...startedRun, status: 'ABORTED' });

            await expect(actor.call(actId, input, { runName, abortWithParent: true })).rejects.toThrow(/being aborted/);
            await expect(actor.start(actId, input, { runName: 'other', abortWithParent: true })).rejects.toThrow(
                /being aborted/,
            );
            expect(resurrectSpy).not.toBeCalled();
            expect(startSpy).toBeCalledTimes(1);

            await actor.start(actId, input, { runName: 'other' });
            expect(startSpy).toBeCalledTimes(2);
        });

        test('a child run whose start is in flight when the parent is aborted is aborted once started', async () => {
            const { actor, events } = await newInitializedActor();
            let finishStart!: () => void;
            const startCalled = new Promise<void>((resolve) => {
                startSpy.mockImplementation(async () => {
                    resolve();
                    return new Promise((resolveStart) => {
                        finishStart = () => resolveStart(startedRun);
                    });
                });
            });

            const started = actor.start(actId, input, { runName, abortWithParent: true });
            await startCalled;
            events.emit(ACTOR_EVENT_NAMES.ABORTING);
            expect(abortSpy).not.toBeCalled();
            finishStart();
            await started;
            await events.waitForAllListenersToComplete();

            expect(abortedRunIds()).toEqual([startedRun.id]);
        });

        test('exit() waits for the child runs to be aborted', async () => {
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName, abortWithParent: true });
            const order: string[] = [];
            abortSpy.mockImplementation(async () => {
                await setTimeout(50);
                order.push('aborted');
                return { ...startedRun, status: 'ABORTING' };
            });

            events.emit(ACTOR_EVENT_NAMES.ABORTING);
            await actor.exit({ exit: false });
            order.push('exited');

            expect(order).toEqual(['aborted', 'exited']);
        });
    });

    describe('setChildRunLimits', () => {
        /** Status `RunClient.get()` returns for each child run. A child run gets its name as the run ID. */
        let statuses: Record<string, ActorRun['status']>;

        const startChild = async (actor: Actor, name: string) => actor.start(actId, { name }, { runName: name });
        /** Calls a named child run that keeps running until the returned function is called. */
        const callChild = async (actor: Actor, name: string) => {
            let finish: ((run: ActorRun) => void) | undefined;
            waitForFinishSpy.mockImplementationOnce(
                async () =>
                    new Promise((resolve) => {
                        finish = resolve;
                    }),
            );
            const call = actor.call(actId, { name }, { runName: name });
            await vitest.waitFor(() => expect(finish).toBeDefined());
            return async () => {
                finish!({ ...startedRun, id: name, status: 'SUCCEEDED' });
                await call;
            };
        };
        const isPending = async (promise: Promise<unknown>) =>
            Promise.race([
                promise.then(
                    () => false,
                    () => false,
                ),
                setTimeout(50, true),
            ]);

        beforeEach(() => {
            statuses = {};
            startSpy.mockImplementation(async ({ name }: { name: string }) => {
                statuses[name] = 'RUNNING';
                return { ...startedRun, id: name, status: 'READY' };
            });
            getSpy.mockImplementation(async function (this: RunClient) {
                return statuses[this.id] && { ...startedRun, id: this.id, status: statuses[this.id] };
            });
        });

        test('a named start waits while the limit is reached and starts once a child run finishes', async () => {
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            const finishFirst = await callChild(actor, 'first');

            const second = startChild(actor, 'second');

            expect(await isPending(second)).toBe(true);
            await finishFirst();
            expect(await isPending(second)).toBe(false);
            expect((await second).id).toBe('second');
        });

        test('concurrent named starts start no more runs than the limit, until the limit is removed', async () => {
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 2 });

            const starts = Promise.all(['a', 'b', 'c'].map(async (name) => startChild(actor, name)));

            expect(await isPending(starts)).toBe(true);
            expect(startSpy).toBeCalledTimes(2);
            actor.setChildRunLimits({});
            await starts;
            expect(startSpy).toBeCalledTimes(3);
        });

        test('a child run not awaited by call() frees its slot once its status is fetched again after 10 seconds', async () => {
            vitest.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
            onTestFinished(() => {
                vitest.useRealTimers();
            });
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            await startChild(actor, 'first');
            const second = startChild(actor, 'second');

            statuses.first = 'SUCCEEDED';
            await vitest.advanceTimersByTimeAsync(9_000);
            expect(startSpy).toBeCalledTimes(1);
            await vitest.advanceTimersByTimeAsync(1_000);
            expect((await second).id).toBe('second');
        });

        test('a child run tracked before a migration counts toward the limit', async () => {
            await startChild(newActor(), 'first');
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });

            const second = startChild(actor, 'second');

            expect(await isPending(second)).toBe(true);
            actor.setChildRunLimits({});
            await second;
        });

        test('a child run tracked before a migration that cannot be fetched does not block a named start', async () => {
            await startChild(newActor(), 'first');
            getSpy.mockRejectedValue(new Error('forbidden'));
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });

            expect((await startChild(actor, 'second')).id).toBe('second');
        });

        test('returning a tracked run does not wait for a slot', async () => {
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            await startChild(actor, 'first');

            expect((await startChild(actor, 'first')).id).toBe('first');
            expect(startSpy).toBeCalledTimes(1);
        });

        test('resurrecting a tracked run waits for a slot', async () => {
            await startChild(newActor(), 'first');
            statuses.first = 'ABORTED';
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            const finishSecond = await callChild(actor, 'second');

            const first = startChild(actor, 'first');

            expect(await isPending(first)).toBe(true);
            expect(resurrectSpy).not.toBeCalled();
            await finishSecond();
            await first;
            expect(resurrectSpy).toBeCalledTimes(1);
        });

        test('a failed start frees its slot', async () => {
            const actor = newActor();
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            startSpy.mockRejectedValueOnce(new Error('boom'));

            await expect(startChild(actor, 'first')).rejects.toThrow('boom');
            expect((await startChild(actor, 'second')).id).toBe('second');
        });

        test('a start waiting for a slot throws once the parent is aborting', async () => {
            const { actor, events } = createIsolatedActor({ storageClient: storage });
            await actor.init({ gracefulShutdown: false });
            actor.setChildRunLimits({ maxConcurrentRuns: 1 });
            await startChild(actor, 'first');
            const second = startChild(actor, 'second');
            expect(await isPending(second)).toBe(true);

            events.emit(ACTOR_EVENT_NAMES.ABORTING);

            await expect(second).rejects.toThrow(/being aborted/);
            await events.waitForAllListenersToComplete();
            expect(startSpy).toBeCalledTimes(1);
        });

        test('a limit below 1 is rejected', () => {
            expect(() => newActor().setChildRunLimits({ maxConcurrentRuns: 0 })).toThrow(/at least 1/);
        });
    });
});
