import { createHash } from 'node:crypto';

import { KeyValueStore, withDirectStorageAccess } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { Run as ActorRun, RunClient, RunResurrectOptions } from 'apify-client';
import { NotFoundError } from 'apify-client';
import { z } from 'zod';

import log from '@apify/log';
import { addTimeoutToPromise } from '@apify/timeout';

import { ReentrantAsyncLock } from './utils.js';
import type { ApifyClient } from './index.js';

/**
 * Status of a tracked child run. This copies the `ActorRun['status']` type,
 * but adds `LOST` to mark a locally tracked run that the platform no longer returns.
 *
 * `LOST` runs can happen as a result of a manual removal or expiration.
 */
export type ChildRunStatus = ActorRun['status'] | 'LOST';

export interface ChildRunInfo {
    runId: string;
    status: ChildRunStatus;
    /** ISO 8601 timestamp. */
    startedAt: string;
}

export interface TrackedChildRun extends ChildRunInfo {
    /** Identifies the Actor / task and input the run was started with. */
    checksum: string;
    /** Earlier runs that were replaced under the same name, oldest first. */
    history: ChildRunInfo[];
    /** Whether the run is aborted when this run is gracefully aborted. */
    abortWithParent: boolean;
}

/**
 * Options to start or resurrect a child run with. `runTimeoutSecs` is a function, so that `timeout: 'inherit'` is
 * computed when the run starts, after a possible wait for a free slot.
 */
type ChildRunStartOptions = Omit<RunResurrectOptions, 'runTimeoutSecs'> & { runTimeoutSecs: () => number | undefined };

export interface ChildRunRequest {
    type: 'actor' | 'task';
    id: string;
    input?: unknown;
}

const sortKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value === null || typeof value !== 'object') return value;

    return Object.fromEntries(
        Object.entries(value)
            .sort(([a], [b]) => Number(a > b) - Number(a < b))
            .map(([key, nested]) => [key, sortKeys(nested)]),
    );
};

// Hashes the JSON form that `apify-client` sends (`Date` -> ISO string, `URL` -> href, functions -> source),
// not the objects' own keys.
const toSentJson = (value: unknown) =>
    JSON.parse(JSON.stringify(value, (_key, nested) => (typeof nested === 'function' ? nested.toString() : nested)));

const checksumRequest = ({ type, id, input }: ChildRunRequest) =>
    createHash('sha256')
        .update(JSON.stringify(sortKeys(toSentJson({ type, id, input }))))
        .digest('hex');

const toInfo = (run: ActorRun): ChildRunInfo => ({
    runId: run.id,
    status: run.status,
    startedAt: run.startedAt.toISOString(),
});

const CHILD_RUNS_KVS_KEY = '__ACTOR_CHILD_RUNS';

const childRunInfoSchema = z.object({ runId: z.string(), status: z.string(), startedAt: z.string() });
const trackedRunsSchema = z.record(
    z.string(),
    childRunInfoSchema.extend({
        checksum: z.string(),
        history: z.array(childRunInfoSchema).default([]),
        abortWithParent: z.boolean().default(false),
    }),
);

/** How many times a tracked run that the API reports as missing is looked up again before it counts as gone. */
const NOT_FOUND_RETRIES = 12;
const NOT_FOUND_RETRY_INTERVAL_MILLIS = 250;

/**
 * Fetches a tracked run, retrying a 404 for a few seconds. A run started moments ago (e.g. by a concurrent call or
 * right before a migration) may not be on every API replica yet, and treating it as gone would start a duplicate.
 */
const getTrackedRun = async (runClient: RunClient) => {
    let run = await runClient.get();
    for (let retry = 0; !run && retry < NOT_FOUND_RETRIES; retry++) {
        await sleep(NOT_FOUND_RETRY_INTERVAL_MILLIS);
        run = await runClient.get();
    }
    return run;
};

/** Statuses that shortly end as `ABORTED` / `TIMED-OUT`. */
const SETTLING_STATUSES = ['ABORTING', 'TIMING-OUT'];
const RESURRECTABLE_STATUSES = ['ABORTED', 'TIMED-OUT'];
const REUSABLE_STATUSES = ['READY', 'RUNNING', 'SUCCEEDED', ...RESURRECTABLE_STATUSES];
const ABORTED_STATUSES = ['ABORTING', 'ABORTED'];
const ACTIVE_STATUSES = ['READY', 'RUNNING', ...SETTLING_STATUSES];

/**
 * How often the active runs are looked up while a start waits for a free slot, as a run that nobody waited for
 * in this process (e.g. one started with `Actor.start()`) is not known to have finished otherwise.
 */
const ACTIVE_RUNS_REFRESH_INTERVAL_MILLIS = 10_000;

/**
 * How long `abortRunsWithParent()` waits for the child runs to be aborted. The platform force-stops a gracefully aborted
 * run 30 seconds after the `aborting` event, which has to leave `Actor.exit()` time for the rest of its work.
 */
export const ABORT_WITH_PARENT_TIMEOUT_MILLIS = 10_000;

export class ChildRunTracker {
    private trackedRuns: Record<string, TrackedChildRun> = {};
    private loading?: Promise<void>;
    /** Client each name was last started or resumed with in this process, so a custom `token` is kept. */
    private clients = new Map<string, ApifyClient>();
    private lastWrite: Promise<void> = Promise.resolve();
    private locks = new Map<string, ReentrantAsyncLock>();
    /**
     * Set once this run is being gracefully aborted, after which no run with `abortWithParent` is started and no start
     * waits for a free slot.
     */
    private isParentAborting = false;
    maxConcurrentRuns = Infinity;
    /**
     * Clients of the runs started without a `runName` in this process that were not seen finished yet, keyed by
     * run ID. They are not stored, so they count towards `maxConcurrentRuns` only until a migration.
     */
    private unnamedRuns = new Map<string, ApifyClient>();
    /** Runs being started or resurrected, which hold a slot before their active status is tracked. */
    private reservedSlots = 0;
    /** Wake the starts waiting for a free slot, called whenever one may have been freed. */
    private slotWaiters = new Set<() => void>();
    private lastActiveRunsRefreshAt = 0;

    constructor(private readonly defaultClient: ApifyClient) {}

    /**
     * Throws if the run tracked under `runName` was started for a different Actor / task or input,
     * as it would otherwise be silently returned or resurrected in place of the requested one.
     */
    async verifyRequest(runName: string, request: ChildRunRequest) {
        const tracked = await this.get(runName);

        if (tracked && tracked.checksum !== checksumRequest(request)) {
            throw new Error(
                `The run name "${runName}" was already used for a different Actor, task or input. Use a unique \`runName\` for each child run.`,
            );
        }
    }

    /**
     * Returns the child run tracked under `runName` if it is still in progress or has succeeded, and resurrects it
     * with `startOptions` if it was aborted or timed out (waiting for it to finish aborting or timing out first).
     * Otherwise (the run failed or is gone), starts a new one using `start` and tracks it under `runName`,
     * keeping the previous one in the history. `abortWithParent` replaces the value tracked under `runName`.
     *
     * Starting and resurrecting waits for a free slot under `maxConcurrentRuns`.
     *
     * Without a `runName`, starts a new run using `start`, which holds a slot until it is seen finished.
     */
    async startOrResumeChildRun(
        client: ApifyClient,
        runName: string | undefined,
        request: ChildRunRequest,
        startOptions: ChildRunStartOptions,
        abortWithParent: boolean,
        start: () => Promise<ActorRun>,
    ): Promise<{ run: ActorRun; resumed: boolean }> {
        if (!runName) {
            if (this.maxConcurrentRuns === Infinity) return { run: await start(), resumed: false };

            const run = await this.withSlot(undefined, false, startOptions.signal, async () => {
                const startedRun = await start();
                this.unnamedRuns.set(startedRun.id, client);
                return startedRun;
            });
            return { run, resumed: false };
        }

        return this.getLock(runName).runExclusive(async () => {
            this.assertCanStart(runName, abortWithParent);

            const { build, memory, runTimeoutSecs, maxItems, maxTotalChargeUsd, restartOnError, timeoutSecs, signal } =
                startOptions;
            const tracked = await this.get(runName);
            let trackedRun = tracked ? await getTrackedRun(client.run(tracked.runId)) : undefined;

            if (trackedRun && SETTLING_STATUSES.includes(trackedRun.status)) {
                trackedRun = await client.run(trackedRun.id).waitForFinish({ timeoutSecs, signal });
            }
            if (tracked) await this.update(runName, trackedRun ?? { id: tracked.runId, status: 'LOST' });

            if (trackedRun && REUSABLE_STATUSES.includes(trackedRun.status)) {
                await this.verifyRequest(runName, request);
                this.clients.set(runName, client);
                const run = RESURRECTABLE_STATUSES.includes(trackedRun.status)
                    ? await this.withSlot(runName, abortWithParent, signal, async () => {
                          const resurrectedRun = await client.run(trackedRun.id).resurrect({
                              build,
                              memory,
                              runTimeoutSecs: runTimeoutSecs(),
                              maxItems,
                              maxTotalChargeUsd,
                              restartOnError,
                              timeoutSecs,
                              signal,
                          });
                          await this.update(runName, resurrectedRun);
                          return resurrectedRun;
                      })
                    : trackedRun;
                if (tracked!.abortWithParent !== abortWithParent) {
                    tracked!.abortWithParent = abortWithParent;
                    await this.persist();
                }
                return { run, resumed: true };
            }

            const run = await this.withSlot(runName, abortWithParent, signal, async () => {
                const startedRun = await start();
                this.clients.set(runName, client);
                await this.track(runName, startedRun, request, trackedRun?.status ?? 'LOST', abortWithParent);
                return startedRun;
            });
            return { run, resumed: false };
        });
    }

    /**
     * Waits until fewer than `maxConcurrentRuns` runs are active, then runs `fn`, which starts or resurrects a run
     * and tracks its status, while holding a slot for it.
     */
    private async withSlot(
        runName: string | undefined,
        abortWithParent: boolean,
        signal: AbortSignal | undefined,
        fn: () => Promise<ActorRun>,
    ) {
        while (!this.hasFreeSlot()) {
            signal?.throwIfAborted();
            if (this.isParentAborting) {
                throw new Error(
                    'A child run waiting for a free slot under `maxConcurrentChildRuns` was not started, because this ' +
                        'run is being aborted.',
                );
            }
            const refreshInMillis = this.lastActiveRunsRefreshAt + ACTIVE_RUNS_REFRESH_INTERVAL_MILLIS - Date.now();
            if (refreshInMillis <= 0) {
                await this.refreshActiveRuns();
            } else {
                await this.waitForFreedSlot(refreshInMillis, signal);
            }
        }
        this.assertCanStart(runName, abortWithParent);

        this.reservedSlots++;
        try {
            return await fn();
        } finally {
            this.reservedSlots--;
            this.notifySlotWaiters();
        }
    }

    /** Resolves once a slot may have been freed, after `timeoutMillis`, or once `signal` is aborted. */
    private async waitForFreedSlot(timeoutMillis: number, signal: AbortSignal | undefined) {
        const { promise, resolve } = Promise.withResolvers<void>();
        const wake = () => resolve();
        const timeout = setTimeout(wake, timeoutMillis);
        this.slotWaiters.add(wake);
        signal?.addEventListener('abort', wake);
        try {
            await promise;
        } finally {
            clearTimeout(timeout);
            this.slotWaiters.delete(wake);
            signal?.removeEventListener('abort', wake);
        }
    }

    private notifySlotWaiters() {
        for (const wake of this.slotWaiters) wake();
    }

    private hasFreeSlot() {
        const activeRuns = Object.values(this.trackedRuns).filter(({ status }) => ACTIVE_STATUSES.includes(status));
        return activeRuns.length + this.unnamedRuns.size + this.reservedSlots < this.maxConcurrentRuns;
    }

    private async refreshActiveRuns() {
        this.lastActiveRunsRefreshAt = Date.now();
        const runClients = this.getRunClients();
        const lookUp = async (runId: string, runClient: RunClient) => {
            try {
                return (await getTrackedRun(runClient)) ?? { id: runId, status: 'LOST' as const };
            } catch (error) {
                log.warning(
                    `Failed to look up a child run, keeping its last known status: ${(error as Error).message}`,
                    {
                        runId,
                    },
                );
                return undefined;
            }
        };
        await Promise.all([
            ...Object.entries(this.trackedRuns)
                .filter(([, { status }]) => ACTIVE_STATUSES.includes(status))
                .map(async ([runName, { runId, status }]) => {
                    const run = await lookUp(runId, runClients[runName]);
                    // Keeps a newer status recorded meanwhile, e.g. by `Actor.call()` once the run finished.
                    if (!run || this.trackedRuns[runName]?.status !== status) return;
                    await this.update(runName, run);
                }),
            ...[...this.unnamedRuns].map(async ([runId, client]) => {
                const run = await lookUp(runId, client.run(runId));
                if (run) await this.update(undefined, run);
            }),
        ]);
    }

    private assertCanStart(runName: string | undefined, abortWithParent: boolean) {
        if (abortWithParent && this.isParentAborting) {
            throw new Error(
                `Child run "${runName}" with \`abortWithParent\` was not started, because this run is being aborted.`,
            );
        }
    }

    /**
     * Tracks `run` as the current run under `runName`. A run tracked earlier under the same name is moved to the
     * history, with `replacedStatus` as its last known status.
     */
    async track(
        runName: string,
        run: ActorRun,
        request: ChildRunRequest,
        replacedStatus: ChildRunStatus,
        abortWithParent: boolean,
    ) {
        const trackedRuns = await this.load();
        const previous = trackedRuns[runName];

        trackedRuns[runName] = {
            ...toInfo(run),
            checksum: checksumRequest(request),
            history: previous
                ? [
                      ...previous.history,
                      { runId: previous.runId, startedAt: previous.startedAt, status: replacedStatus },
                  ]
                : [],
            abortWithParent,
        };

        await this.persist();
    }

    /**
     * Records the latest observed state of the run tracked under `runName`, or of a run started without a `runName`,
     * which frees its slot once it is finished.
     */
    async update(runName: string | undefined, run: { id: string; status: ChildRunStatus }) {
        if (!runName) {
            if (!ACTIVE_STATUSES.includes(run.status)) {
                this.unnamedRuns.delete(run.id);
                this.notifySlotWaiters();
            }
            return;
        }

        const trackedRuns = await this.load();
        const tracked = trackedRuns[runName];

        if (tracked?.runId !== run.id || tracked.status === run.status) return;

        tracked.status = run.status;
        this.notifySlotWaiters();
        await this.persist();
    }

    /**
     * Returns the tracked run and its history for `runName`, if there is one.
     */
    async get(runName: string) {
        const trackedRuns = await this.load();
        return trackedRuns[runName];
    }

    /**
     * Returns a `RunClient` for the current run under each name loaded so far. The client is the one the name was
     * last started or resumed with in this process, or the default client (e.g. for a run tracked before a migration).
     */
    getRunClients(): Record<string, RunClient> {
        return Object.fromEntries(
            Object.entries(this.trackedRuns).map(([runName, { runId }]) => [
                runName,
                (this.clients.get(runName) ?? this.defaultClient).run(runId),
            ]),
        );
    }

    /**
     * Gracefully aborts the current run under each name tracked with `abortWithParent`, and makes any later start with
     * `abortWithParent` throw. A start in flight is waited for, so the run it starts is aborted too. Resolves after
     * {@link ABORT_WITH_PARENT_TIMEOUT_MILLIS} at the latest, leaving the aborts still in progress to go on.
     */
    async abortRunsWithParent() {
        this.isParentAborting = true;
        this.notifySlotWaiters();
        const trackedRuns = await this.load();
        const runNames = new Set([...Object.keys(trackedRuns), ...this.locks.keys()]);

        const aborts = Promise.all(
            [...runNames].map(async (runName) =>
                this.getLock(runName).runExclusive(async () => {
                    const tracked = await this.get(runName);
                    if (!tracked?.abortWithParent) return;

                    try {
                        const run = await (this.clients.get(runName) ?? this.defaultClient)
                            .run(tracked.runId)
                            .abort({ gracefully: true });
                        if (ABORTED_STATUSES.includes(run.status)) {
                            log.info(`Aborted child run "${runName}" with the parent`, { runId: run.id });
                        }
                    } catch (error) {
                        if (error instanceof NotFoundError) return;
                        log.exception(error as Error, `Failed to abort child run "${runName}"`, {
                            runId: tracked.runId,
                        });
                    }
                }),
            ),
        );

        // `Actor.exit()` waits for this listener without a timeout of its own.
        await addTimeoutToPromise(
            async () => aborts,
            ABORT_WITH_PARENT_TIMEOUT_MILLIS,
            `Aborting the child runs with the parent timed out after ${ABORT_WITH_PARENT_TIMEOUT_MILLIS / 1000}s`,
        ).catch((error) => log.warning(error.message));
    }

    private getLock(runName: string) {
        if (!this.locks.has(runName)) {
            this.locks.set(runName, new ReentrantAsyncLock());
        }
        return this.locks.get(runName)!;
    }

    private async persist() {
        const write = this.lastWrite.then(async () =>
            withDirectStorageAccess(async () => {
                const defaultStore = await KeyValueStore.open();
                await defaultStore.setValue(CHILD_RUNS_KVS_KEY, this.trackedRuns);
            }),
        );
        this.lastWrite = write.catch(() => {});
        await write;
    }

    /**
     * Loads the tracked runs from the default key-value store, once.
     */
    async load() {
        this.loading ??= KeyValueStore.open()
            .then(async (defaultStore) => defaultStore.getValue(CHILD_RUNS_KVS_KEY))
            .then((storedRuns) => {
                const parsed = trackedRunsSchema.safeParse(storedRuns ?? {});
                if (!parsed.success) {
                    throw new Error(
                        `The child runs stored under the "${CHILD_RUNS_KVS_KEY}" key in the default key-value store are malformed.`,
                        { cause: parsed.error },
                    );
                }
                this.trackedRuns = parsed.data as Record<string, TrackedChildRun>;
            })
            .catch((error) => {
                this.loading = undefined;
                throw error;
            });

        await this.loading;
        return this.trackedRuns;
    }
}
