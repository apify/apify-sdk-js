import { KeyValueStore, withDirectStorageAccess } from '@crawlee/core';

export class ChildRunTracker {
    private CHILD_RUN_TRACKER_KVS_KEY = 'CHILD_RUN_IDS';
    private childRunIds?: Promise<Record<string, string>>;
    private lastWrite: Promise<void> = Promise.resolve();

    async set(runName: string, runId: string) {
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
