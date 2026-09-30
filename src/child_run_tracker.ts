import { createHash } from 'node:crypto';

import { KeyValueStore, withDirectStorageAccess } from '@crawlee/core';
import type { ActorRun } from 'apify-client';

/** `LOST` marks a tracked run that the platform no longer returns. */
export type ChildRunStatus = ActorRun['status'] | 'LOST';

export interface ChildRunInfo {
    runId: string;
    status: ChildRunStatus;
    /** ISO 8601 timestamp. */
    startedAt: string;
}

export interface TrackedChildRun extends ChildRunInfo {
    /** Earlier runs that were replaced under the same name, oldest first. */
    history: ChildRunInfo[];
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
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, nested]) => [key, sortKeys(nested)]),
    );
};

const checksumRequest = ({ type, id, input }: ChildRunRequest) =>
    createHash('sha256')
        .update(JSON.stringify(sortKeys({ type, id, input })) ?? '')
        .digest('hex');

const toInfo = (run: ActorRun): ChildRunInfo => ({
    runId: run.id,
    status: run.status,
    startedAt: run.startedAt.toISOString(),
});

export class ChildRunTracker {
    private CHILD_RUN_TRACKER_KVS_KEY = 'CHILD_RUNS';
    private trackedRuns?: Promise<Record<string, TrackedChildRun>>;
    private lastWrite: Promise<void> = Promise.resolve();
    private requestChecksums = new Map<string, string>();

    /**
     * Throws if `runName` was already used by this process for a different Actor / task or input,
     * as the earlier run would otherwise be silently returned in place of the requested one.
     */
    verifyRequest(runName: string, request: ChildRunRequest) {
        const checksum = checksumRequest(request);
        const knownChecksum = this.requestChecksums.get(runName);

        if (knownChecksum && knownChecksum !== checksum) {
            throw new Error(
                `The run name "${runName}" was already used for a different Actor, task or input. Use a unique \`runName\` for each child run.`,
            );
        }

        this.requestChecksums.set(runName, checksum);
    }

    /**
     * Tracks `run` as the current run under `runName`. A run tracked earlier under the same name is moved to the
     * history, with `replacedStatus` as its last known status.
     */
    async track(runName: string, run: ActorRun, request: ChildRunRequest, replacedStatus: ChildRunStatus) {
        this.requestChecksums.set(runName, checksumRequest(request));

        const trackedRuns = await this.load();
        const previous = trackedRuns[runName];

        trackedRuns[runName] = {
            ...toInfo(run),
            history: previous
                ? [
                      ...previous.history,
                      { runId: previous.runId, startedAt: previous.startedAt, status: replacedStatus },
                  ]
                : [],
        };

        await this.persist();
    }

    /**
     * Records the latest observed state of the run tracked under `runName`.
     */
    async update(runName: string, run: ActorRun) {
        const trackedRuns = await this.load();
        const tracked = trackedRuns[runName];

        if (tracked?.runId !== run.id || tracked.status === run.status) return;

        tracked.status = run.status;
        await this.persist();
    }

    async get(runName: string) {
        const trackedRuns = await this.load();
        return trackedRuns[runName];
    }

    async getAll() {
        return structuredClone(await this.load());
    }

    private async persist() {
        const trackedRuns = await this.load();

        const write = this.lastWrite.then(async () =>
            withDirectStorageAccess(async () => {
                const defaultStore = await KeyValueStore.open();
                await defaultStore.setValue(this.CHILD_RUN_TRACKER_KVS_KEY, trackedRuns);
            }),
        );
        this.lastWrite = write.catch(() => {});
        await write;
    }

    private async load() {
        this.trackedRuns ??= KeyValueStore.open()
            .then(async (defaultStore) =>
                defaultStore.getValue<Record<string, TrackedChildRun>>(this.CHILD_RUN_TRACKER_KVS_KEY),
            )
            .then((storedRuns) => storedRuns ?? {});

        return this.trackedRuns;
    }
}
