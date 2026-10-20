import { createHash } from 'node:crypto';

import { KeyValueStore, withDirectStorageAccess } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { Run as ActorRun, RunClient, RunResurrectOptions } from 'apify-client';
import { NotFoundError } from 'apify-client';
import { z } from 'zod';

import log from '@apify/log';

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
/** Statuses that count toward the `maxConcurrentRuns` limit. */
const ACTIVE_STATUSES = ['READY', 'RUNNING', ...SETTLING_STATUSES];
/** How long an observed active status counts toward the `maxConcurrentRuns` limit before the run is fetched again. */
const STATUS_MAX_AGE_MILLIS = 10_000;

export class ChildRunTracker {
    private trackedRuns: Record<string, TrackedChildRun> = {};
    private loading?: Promise<void>;
    /** Client each name was last started or resumed with in this process, so a custom `token` is kept. */
    private clients = new Map<string, ApifyClient>();
    private lastWrite: Promise<void> = Promise.resolve();
    private locks = new Map<string, ReentrantAsyncLock>();
    /** Set once this run is being gracefully aborted, after which no run with `abortWithParent` is started. */
    private isParentAborting = false;
    private maxConcurrentRuns?: number;
    /** Names holding a slot for a start or resurrection in flight, not counted from the tracked runs yet. */
    private startingRunNames = new Set<string>();
    /** When the status tracked under each name was last observed in this process. */
    private statusObservedAt = new Map<string, number>();
    /** Serializes counting and taking slots under the `maxConcurrentRuns` limit. */
    private slotLock = new ReentrantAsyncLock();
    /** Resolved and replaced whenever a slot may have been freed. */
    private slotFreed = Promise.withResolvers<void>();

    /**
     * Sets how many tracked runs may be active at once, or removes the limit with `undefined`.
     */
    setMaxConcurrentRuns(maxConcurrentRuns: number | undefined) {
        if (maxConcurrentRuns !== undefined && maxConcurrentRuns < 1) {
            throw new Error(`\`maxConcurrentRuns\` must be at least 1, got ${maxConcurrentRuns}.`);
        }
        this.maxConcurrentRuns = maxConcurrentRuns;
        this.notifySlotWaiters();
    }

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
     * Starting or resurrecting a run waits while the `maxConcurrentRuns` limit is reached. Returning a run never waits.
     */
    async startOrResumeChildRun(
        client: ApifyClient,
        runName: string,
        request: ChildRunRequest,
        startOptions: RunResurrectOptions,
        abortWithParent: boolean,
        start: () => Promise<ActorRun>,
    ): Promise<{ run: ActorRun; resumed: boolean }> {
        return this.getLock(runName).runExclusive(async () => {
            if (abortWithParent && this.isParentAborting) {
                throw new Error(
                    `Child run "${runName}" with \`abortWithParent\` was not started, because this run is being aborted.`,
                );
            }

            const { build, memory, runTimeoutSecs, maxItems, maxTotalChargeUsd, restartOnError, timeoutSecs, signal } =
                startOptions;
            const tracked = await this.get(runName);
            let trackedRun = tracked ? await getTrackedRun(client.run(tracked.runId)) : undefined;

            if (trackedRun && SETTLING_STATUSES.includes(trackedRun.status)) {
                trackedRun = await client.run(trackedRun.id).waitForFinish({ timeoutSecs, signal });
            }

            if (trackedRun && REUSABLE_STATUSES.includes(trackedRun.status)) {
                await this.verifyRequest(runName, request);
                const run = RESURRECTABLE_STATUSES.includes(trackedRun.status)
                    ? await this.withSlot(client, runName, async () => {
                          const resurrectedRun = await client.run(trackedRun!.id).resurrect({
                              build,
                              memory,
                              runTimeoutSecs,
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
                await this.update(runName, run);
                this.clients.set(runName, client);
                return { run, resumed: true };
            }

            const run = await this.withSlot(client, runName, async () => {
                const startedRun = await start();
                await this.track(runName, startedRun, request, trackedRun?.status ?? 'LOST', abortWithParent);
                return startedRun;
            });
            this.clients.set(runName, client);
            return { run, resumed: false };
        });
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
        this.statusObservedAt.set(runName, Date.now());

        await this.persist();
    }

    /**
     * Records the latest observed state of the run tracked under `runName`.
     */
    async update(runName: string, run: ActorRun) {
        const trackedRuns = await this.load();
        const tracked = trackedRuns[runName];

        if (tracked?.runId !== run.id) return;
        this.statusObservedAt.set(runName, Date.now());
        if (tracked.status === run.status) return;

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
     * last started or resumed with in this process, or `defaultClient` (e.g. for a run tracked before a migration).
     */
    getRunClients(defaultClient: ApifyClient): Record<string, RunClient> {
        return Object.fromEntries(
            Object.entries(this.trackedRuns).map(([runName, { runId }]) => [
                runName,
                (this.clients.get(runName) ?? defaultClient).run(runId),
            ]),
        );
    }

    /**
     * Gracefully aborts the current run under each name tracked with `abortWithParent`, and makes any later start with
     * `abortWithParent` throw. A start in flight is waited for, so the run it starts is aborted too. A start waiting
     * for a slot under the `maxConcurrentRuns` limit throws, so it does not hold up the abort.
     */
    async abortRunsWithParent(defaultClient: ApifyClient) {
        this.isParentAborting = true;
        this.notifySlotWaiters();
        const trackedRuns = await this.load();
        const runNames = new Set([...Object.keys(trackedRuns), ...this.locks.keys()]);

        await Promise.all(
            [...runNames].map(async (runName) =>
                this.getLock(runName).runExclusive(async () => {
                    const tracked = await this.get(runName);
                    if (!tracked?.abortWithParent) return;

                    try {
                        const run = await (this.clients.get(runName) ?? defaultClient)
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
    }

    /**
     * Runs `startRun`, which starts or resurrects the run under `runName` and records it, once fewer than
     * `maxConcurrentRuns` tracked runs are active. The slot is held until `startRun` settles.
     */
    private async withSlot<T>(client: ApifyClient, runName: string, startRun: () => Promise<T>): Promise<T> {
        if (this.maxConcurrentRuns === undefined) return startRun();

        await this.slotLock.runExclusive(async () => {
            // Taken before counting, so a slot freed while counting is not missed.
            let slotFreed = this.slotFreed.promise;
            while (
                this.maxConcurrentRuns !== undefined &&
                (await this.countActiveRuns(client, runName)) >= this.maxConcurrentRuns
            ) {
                if (this.isParentAborting) {
                    throw new Error(
                        `Child run "${runName}" was not started, because this run is being aborted and the limit of ${this.maxConcurrentRuns} concurrent child runs is reached.`,
                    );
                }

                log.debug(`Child run "${runName}" is waiting for a free slot`);
                let timeout: ReturnType<typeof setTimeout> | undefined;
                await Promise.race([
                    slotFreed,
                    new Promise((resolve) => {
                        timeout = setTimeout(resolve, STATUS_MAX_AGE_MILLIS);
                    }),
                ]);
                clearTimeout(timeout);
                slotFreed = this.slotFreed.promise;
            }
            this.startingRunNames.add(runName);
        });

        try {
            return await startRun();
        } finally {
            this.startingRunNames.delete(runName);
            this.notifySlotWaiters();
        }
    }

    /**
     * Counts the tracked runs other than `runName` whose status observed in this process is active, plus the slots held
     * by starts in flight. An active status older than `STATUS_MAX_AGE_MILLIS` or not observed in this process yet
     * (e.g. recorded before a migration) is fetched again first.
     */
    private async countActiveRuns(defaultClient: ApifyClient, runName: string) {
        const trackedRuns = await this.load();
        const runNames = Object.keys(trackedRuns).filter(
            (name) => name !== runName && !this.startingRunNames.has(name),
        );
        const isActive = (name: string) => ACTIVE_STATUSES.includes(trackedRuns[name].status);
        const isStale = (name: string) =>
            Date.now() - (this.statusObservedAt.get(name) ?? -Infinity) >= STATUS_MAX_AGE_MILLIS;

        await Promise.all(
            runNames
                .filter((name) => isActive(name) && isStale(name))
                .map(async (name) => {
                    const { runId } = trackedRuns[name];
                    try {
                        const run = await (this.clients.get(name) ?? defaultClient).run(runId).get();
                        if (run) {
                            await this.update(name, run);
                        } else {
                            this.statusObservedAt.delete(name);
                        }
                    } catch (error) {
                        log.warning(
                            `Failed to fetch child run "${name}" to count it toward \`maxConcurrentRuns\`: ${(error as Error).message}`,
                            { runId },
                        );
                    }
                }),
        );

        // A run that could not be fetched counts only if this process saw it active before.
        const activeRunNames = runNames.filter((name) => this.statusObservedAt.has(name) && isActive(name));
        return activeRunNames.length + this.startingRunNames.size;
    }

    private notifySlotWaiters() {
        this.slotFreed.resolve();
        this.slotFreed = Promise.withResolvers<void>();
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
