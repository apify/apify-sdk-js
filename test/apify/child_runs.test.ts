import { setTimeout } from 'node:timers/promises';

import { MemoryStorageBackend } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { Actor, InitOptions, PlatformEventManager } from 'apify';
import type { Run as ActorRun } from 'apify-client';
import { ActorClient, NotFoundError, RunClient, TaskClient } from 'apify-client';
import type { MockInstance } from 'vitest';
import { onTestFinished } from 'vitest';

import { ACTOR_ENV_VARS, ACTOR_EVENT_NAMES, APIFY_ENV_VARS } from '@apify/consts';
import log from '@apify/log';

import type { TrackedChildRun } from '../../src/child_run_tracker.js';
import { ABORT_WITH_PARENT_TIMEOUT_MILLIS } from '../../src/child_run_tracker.js';
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
    const newInitializedActor = async (options: InitOptions = {}) => {
        const { actor, events } = createIsolatedActor({ storageClient: storage });
        await actor.init({ gracefulShutdown: false, ...options });
        return { actor, events };
    };

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
                webhooks: [],
            });

            expect(startSpy).not.toBeCalled();
            expect(resurrectSpy).toBeCalledWith({ build: 'beta', memory: 1024, runTimeoutSecs: 60 });
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

    test('call() without a run name does not track the run', async () => {
        const actor = newActor();

        const run = await actor.call(actId, input);

        expect(run).toEqual(finishedRun);
        expect(startSpy).toBeCalledTimes(1);
        expect(getStreamedLogSpy).toBeCalledWith(expect.objectContaining({ fromStart: true }));
        expect(await getChildRunLedger(actor)).toBeNull();
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

        test('aborting the parent uses the token a child run was started with in this process', async () => {
            startSpy.mockResolvedValueOnce({ ...startedRun, id: 'before-migration' });
            await newActor().start(actId, input, { runName: 'before-migration', abortWithParent: true });

            const { actor, events } = await newInitializedActor();
            startSpy.mockResolvedValueOnce({ ...startedRun, id: 'custom-token' });
            await actor.start(actId, input, { runName: 'custom-token', token: 'custom-token', abortWithParent: true });
            await abortParent(events);

            const clients = new Map(
                (abortSpy.mock.contexts as RunClient[]).map((runClient) => [runClient.id, runClient.apifyClient]),
            );
            expect(clients.get('before-migration')).toBe(actor.apifyClient);
            expect(clients.get('custom-token')!.token).toBe('custom-token');
        });

        test.each([
            ['Actor.off()', (actor: Actor) => actor.off(ACTOR_EVENT_NAMES.ABORTING)],
            ['the event manager', (_: Actor, events: PlatformEventManager) => events.off(ACTOR_EVENT_NAMES.ABORTING)],
        ])(
            'removing all `aborting` listeners through %s keeps aborting the child runs started with `abortWithParent`',
            async (_, removeAll) => {
                const { actor, events } = await newInitializedActor();
                await actor.start(actId, input, { runName, abortWithParent: true });
                const listener = vitest.fn();
                actor.on(ACTOR_EVENT_NAMES.ABORTING, listener);

                removeAll(actor, events);
                expect(events.listeners(ACTOR_EVENT_NAMES.ABORTING)).toEqual([]);
                await abortParent(events);

                expect(listener).not.toBeCalled();
                expect(abortedRunIds()).toEqual([startedRun.id]);
            },
        );

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

        test('an `aborting` event that arrives while exit() closes the events still aborts the child runs', async () => {
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName, abortWithParent: true });
            // The final `persistState` is emitted while the events are closing.
            actor.on(ACTOR_EVENT_NAMES.PERSIST_STATE, () => events.emit(ACTOR_EVENT_NAMES.ABORTING));

            await actor.exit({ exit: false });

            expect(abortedRunIds()).toEqual([startedRun.id]);
        });

        test('the child runs are waited for to be aborted for a limited time only', async () => {
            const warningSpy = vitest.spyOn(log, 'warning');
            const { actor, events } = await newInitializedActor();
            await actor.start(actId, input, { runName, abortWithParent: true });
            abortSpy.mockReturnValue(new Promise(() => {}));

            vitest.useFakeTimers();
            try {
                events.emit(ACTOR_EVENT_NAMES.ABORTING);
                const completed = events.waitForAllListenersToComplete();
                await vitest.advanceTimersByTimeAsync(ABORT_WITH_PARENT_TIMEOUT_MILLIS);
                await completed;
            } finally {
                vitest.useRealTimers();
            }

            expect(warningSpy).toBeCalledWith('Aborting the child runs with the parent timed out after 10s');
        });
    });

    describe('maxConcurrentChildRuns', () => {
        let runStatuses: Record<string, ActorRun['status']>;

        const childRun = (id: string) => ({ ...startedRun, id }) as ActorRun;
        const newLimitedActor = async () => newInitializedActor({ maxConcurrentChildRuns: 1 });
        const finishFirstLater = () => {
            const { promise, resolve } = Promise.withResolvers<ActorRun>();
            waitForFinishSpy.mockReturnValueOnce(promise);
            return () => resolve({ ...childRun('a'), status: 'SUCCEEDED' });
        };

        beforeEach(() => {
            vitest.useFakeTimers();
            vitest.mocked(sleep).mockImplementation(
                async (millis) =>
                    new Promise((resolve) => {
                        globalThis.setTimeout(resolve, millis);
                    }),
            );
            runStatuses = { a: 'RUNNING', b: 'RUNNING' };
            getSpy.mockImplementation(async function (this: RunClient) {
                const status = runStatuses[this.id!];
                return status && { ...startedRun, id: this.id, status };
            });
        });

        afterEach(() => {
            vitest.useRealTimers();
        });

        test.each([0, -1, 1.5, NaN])(
            'init() throws with `maxConcurrentChildRuns: %s`',
            async (maxConcurrentChildRuns) => {
                await expect(newActor().init({ maxConcurrentChildRuns })).rejects.toThrow(
                    /in `maxConcurrentChildRuns`/,
                );
            },
        );

        test('start() waits for a free slot, looking up the active runs right away and every 10 seconds', async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            await actor.start(actId, input, { runName: 'a' });

            const waiting = actor.start(actId, input, { runName: 'b' });
            await vitest.advanceTimersByTimeAsync(9_000);
            expect(startSpy).toBeCalledTimes(1);

            runStatuses.a = 'SUCCEEDED';
            await vitest.advanceTimersByTimeAsync(1_000);

            expect(await waiting).toEqual(childRun('b'));
            expect(getSpy).toBeCalledTimes(2);
            expect((await getChildRunLedger(actor))!.a.status).toBe('SUCCEEDED');
        });

        test.each([
            ['a', 'b'],
            [undefined, undefined],
        ])('call() frees the slot of the run it waited for (run names %s, %s)', async (firstName, secondName) => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            const finishFirst = finishFirstLater();

            const first = actor.call(actId, input, { runName: firstName });
            const second = actor.call(actId, input, { runName: secondName });
            await vitest.advanceTimersByTimeAsync(5_000);
            expect(startSpy).toBeCalledTimes(1);

            finishFirst();
            await first;
            await vitest.advanceTimersByTimeAsync(1_000);

            expect(startSpy).toBeCalledTimes(2);
            await second;
        });

        test('looking up the active runs keeps a status that call() recorded meanwhile', async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            const finishFirst = finishFirstLater();
            const lookup = Promise.withResolvers<ActorRun>();
            getSpy.mockReturnValueOnce(lookup.promise);

            const first = actor.call(actId, input, { runName: 'a' });
            await vitest.advanceTimersByTimeAsync(0);
            const second = actor.start(actId, input, { runName: 'b' });
            await vitest.advanceTimersByTimeAsync(0);
            finishFirst();
            await first;
            lookup.resolve(childRun('a'));
            await vitest.advanceTimersByTimeAsync(1_000);

            expect(startSpy).toBeCalledTimes(2);
            expect(await second).toEqual(childRun('b'));
        });

        test('a run tracked before a migration holds a slot until it is found to be gone', async () => {
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            await newActor().start(actId, input, { runName: 'a' });
            const { actor } = await newLimitedActor();

            const waiting = actor.start(actId, input, { runName: 'b' });
            await vitest.advanceTimersByTimeAsync(5_000);
            expect(startSpy).toBeCalledTimes(1);

            delete runStatuses.a;
            await vitest.advanceTimersByTimeAsync(10_000);

            expect(await waiting).toEqual(childRun('b'));
            expect((await getChildRunLedger(actor))!.a.status).toBe('LOST');
        });

        test.each([
            ['a', undefined],
            [undefined, 'b'],
        ])('a run holds a slot until it is seen finished (run names %s, %s)', async (firstName, secondName) => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            await actor.start(actId, input, { runName: firstName });

            const waiting = actor.start(actId, input, { runName: secondName });
            await vitest.advanceTimersByTimeAsync(5_000);
            expect(startSpy).toBeCalledTimes(1);

            runStatuses.a = 'SUCCEEDED';
            await vitest.advanceTimersByTimeAsync(5_000);

            expect(await waiting).toEqual(childRun('b'));
        });

        test('runs started without a run name are forgotten on a migration', async () => {
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            await (await newLimitedActor()).actor.start(actId, input);

            const { actor } = await newLimitedActor();

            expect(await actor.start(actId, input)).toEqual(childRun('b'));
            expect(await getChildRunLedger(actor)).toBeNull();
        });

        test("`timeout: 'inherit'` leaves out the time spent waiting for a free slot", async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            await actor.start(actId, input, { runName: 'a' });
            process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
            process.env[ACTOR_ENV_VARS.TIMEOUT_AT] = new Date(Date.now() + 600_000).toISOString();
            onTestFinished(() => {
                delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
                delete process.env[ACTOR_ENV_VARS.TIMEOUT_AT];
            });

            const waiting = actor.start(actId, input, { runName: 'b', timeout: 'inherit' });
            await vitest.advanceTimersByTimeAsync(300_000);
            runStatuses.a = 'SUCCEEDED';
            await vitest.advanceTimersByTimeAsync(10_000);
            await waiting;

            expect(startSpy.mock.lastCall![1].runTimeoutSecs).toBeLessThanOrEqual(300);
        });

        test('start() returns an active tracked run without waiting for a free slot', async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a'));
            await actor.start(actId, input, { runName: 'a' });

            expect(await actor.start(actId, input, { runName: 'a' })).toEqual(childRun('a'));
            expect(startSpy).toBeCalledTimes(1);
        });

        test('resurrecting a tracked run waits for a free slot', async () => {
            startSpy.mockResolvedValueOnce(childRun('a')).mockResolvedValueOnce(childRun('b'));
            resurrectSpy.mockResolvedValue(childRun('b'));
            const unlimitedActor = newActor();
            await unlimitedActor.start(actId, input, { runName: 'a' });
            await unlimitedActor.start(actId, input, { runName: 'b' });
            runStatuses.b = 'ABORTED';
            const { actor } = await newLimitedActor();

            const resurrected = actor.start(actId, input, { runName: 'b' });
            await vitest.advanceTimersByTimeAsync(5_000);
            expect(resurrectSpy).not.toBeCalled();

            runStatuses.a = 'SUCCEEDED';
            await vitest.advanceTimersByTimeAsync(5_000);

            expect(await resurrected).toEqual(childRun('b'));
            expect(resurrectSpy).toBeCalledTimes(1);
        });

        test('a start that fails frees its slot', async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockRejectedValueOnce(new Error('boom'));

            await expect(actor.start(actId, input, { runName: 'a' })).rejects.toThrow('boom');
            await actor.start(actId, input, { runName: 'b' });

            expect(startSpy).toBeCalledTimes(2);
        });

        test('a start waiting for a free slot throws once its signal is aborted', async () => {
            const { actor } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a'));
            await actor.start(actId, input, { runName: 'a' });
            const controller = new AbortController();

            const waiting = expect(
                actor.start(actId, input, { runName: 'b', signal: controller.signal }),
            ).rejects.toThrow('cancelled');
            controller.abort(new Error('cancelled'));
            await vitest.advanceTimersByTimeAsync(1_000);

            await waiting;
            expect(startSpy).toBeCalledTimes(1);
        });

        test('starts waiting for a free slot do not hold up aborting the child runs with the parent', async () => {
            const abortSpy = vitest
                .spyOn(RunClient.prototype, 'abort')
                .mockResolvedValue({ ...startedRun, status: 'ABORTING' } as ActorRun);
            const { actor, events } = await newLimitedActor();
            startSpy.mockResolvedValueOnce(childRun('a'));
            await actor.start(actId, input, { runName: 'a', abortWithParent: true });
            const withParent = expect(
                actor.start(actId, input, { runName: 'b', abortWithParent: true }),
            ).rejects.toThrow(/being aborted/);
            void actor.start(actId, input, { runName: 'c' });
            await vitest.advanceTimersByTimeAsync(1_000);

            const listenersCompleted = vitest.fn();
            events.emit(ACTOR_EVENT_NAMES.ABORTING);
            void events.waitForAllListenersToComplete().then(listenersCompleted);
            await vitest.advanceTimersByTimeAsync(1_000);

            expect(listenersCompleted).toBeCalled();
            await withParent;
            expect((abortSpy.mock.contexts as RunClient[]).map(({ id }) => id)).toEqual(['a']);
        });
    });
});
