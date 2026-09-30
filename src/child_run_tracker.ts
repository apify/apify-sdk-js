import { createHash } from 'node:crypto';

import { KeyValueStore, withDirectStorageAccess } from '@crawlee/core';

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

export class ChildRunTracker {
    private CHILD_RUN_TRACKER_KVS_KEY = 'CHILD_RUN_IDS';
    private childRunIds?: Promise<Record<string, string>>;
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

    async set(runName: string, runId: string, request: ChildRunRequest) {
        this.requestChecksums.set(runName, checksumRequest(request));

        const childRunIds = await this.load();
        childRunIds[runName] = runId;

        const write = this.lastWrite.then(async () =>
            withDirectStorageAccess(async () => {
                const defaultStore = await KeyValueStore.open();
                await defaultStore.setValue(this.CHILD_RUN_TRACKER_KVS_KEY, childRunIds);
            }),
        );
        this.lastWrite = write.catch(() => {});
        await write;
    }

    async get(runName: string) {
        const childRunIds = await this.load();
        return childRunIds[runName];
    }

    private async load() {
        this.childRunIds ??= KeyValueStore.open()
            .then(async (defaultStore) => defaultStore.getValue<Record<string, string>>(this.CHILD_RUN_TRACKER_KVS_KEY))
            .then((storedChildIds) => storedChildIds ?? {});

        return this.childRunIds;
    }
}
