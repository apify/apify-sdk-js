/* eslint-disable max-classes-per-file */
import { Actor, Dataset as OriginalDataset } from 'apify';
import { log } from 'crawlee';

import { APIFY_EXTRA_KV_RECORD_PREFIX, APIFY_EXTRA_LOG_PREFIX } from './const';

export type DatasetItem = Exclude<Parameters<OriginalDataset['pushData']>[0], any[]>;

export interface ParallelPersistedPushDataOptions {
    /**
     * Number of items to be pushed in one push call.
     * Should not be higher than 1000 to ensure each push call finishes when migration happens.
     *
     * @default 1000
     */
    uploadBatchSize?: number;
    /**
     * Number of push calls to be done in parallel. Apify API should handle up to 30 parallel requests but better be careful.
     *
     * @default 10
     */
    parallelPushes?: number;
    /**
     * You must provide idempotency key if you want to call this function multiple times in the same run.
     * The key should only contain letters and numbers.
     */
    idempotencyKey?: string;
}

export async function waitForCompletion<T>(promises: (() => Promise<T>)[], maxConcurrency: number): Promise<void> {
    async function worker() {
        let job;
        /* eslint-disable-next-line no-cond-assign */
        while (job = promises.shift()) await job();
    }

    await Promise.all([...new Array(maxConcurrency)].map(() => worker()));
}

export class ChunkTracker {
    private readonly chunks: Record<string, boolean> = {};

    public add(chunkId: string): void {
        this.chunks[chunkId] = true;
    }

    public has(chunkId: string): boolean {
        return this.chunks[chunkId] === true;
    }

    public get(): string[] {
        return Object.keys(this.chunks);
    }

    constructor(data?: Record<string, boolean> | null) {
        if (data) {
            Object.assign(this.chunks, data);
        }
    }
}

export class Dataset extends OriginalDataset {
    /**
     * Returns batches of items to be pushed to dataset.
     * @param data Items to be pushed to dataset.
     * @param batchSize Number of items to be pushed in one push call.
     * @param batchCount Number of batches to be returned.
     * @returns Array of batches of items to be pushed to dataset.
     */
    private getBatches(data: DatasetItem | DatasetItem[], batchSize: number, batchCount: number) {
        if (!Array.isArray(data)) {
            return [[data]];
        }
        return [...Array(batchCount).keys()]
            .map((x: number) => data.slice(x * batchSize, (x + 1) * batchSize))
            .filter((x) => x.length !== 0);
    }

    /**
     * Push data to dataset in parallel while also resuming correctly after Actor migration.
     * This should be used when you want to push a lot of items to dataset at once.
     * If you call this function multiple times in the same run,
     * you must provide different idempotencyKey option for each call.
     */
    public async pushDataParallel(data: DatasetItem | DatasetItem[], options: ParallelPersistedPushDataOptions = {}) {
        if (!Array.isArray(data)) {
            return this.pushData(data);
        }

        const {
            uploadBatchSize = 1000,
            parallelPushes = 10,
            idempotencyKey = '',
        } = options;

        let isMigrating = false;
        Actor.on('migrating', () => { isMigrating = true; });
        Actor.on('aborting', () => { isMigrating = true; });

        const sanitizedIdempotencyKey = idempotencyKey.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);

        const kvRecordName = `${APIFY_EXTRA_KV_RECORD_PREFIX}STATE-PUSHED-COUNT${this.name}${sanitizedIdempotencyKey}`;
        let pushedItemsCount = await Actor.getValue<number>(kvRecordName) ?? 0;

        Actor.on('persistState', async () => {
            await Actor.setValue(kvRecordName, pushedItemsCount);
        });

        const stepSize = uploadBatchSize * parallelPushes;

        for (let i = pushedItemsCount; i < data.length; i += stepSize) {
            if (isMigrating) {
                log.info(`${APIFY_EXTRA_LOG_PREFIX}[pushDataParallel]: Stopping push because of migration`);
                // hang indefinitely until migration is done
                await new Promise(() => {});
            }

            const itemsToPush = data.slice(i, i + stepSize);
            const batches = this.getBatches(itemsToPush, uploadBatchSize, parallelPushes);
            const pushPromises = batches.map(this.pushData);

            // We must update it before awaiting the promises because the push can take time
            // and migration can cut us off but the items will already be on the way to dataset
            pushedItemsCount += itemsToPush.length;
            await Promise.all(pushPromises);
        }
    };

    public async forEachParallel(
        func: Parameters<OriginalDataset['forEach']>[0],
        options: Parameters<OriginalDataset['forEach']>[1] & { parallelLoads?: number; batchSize?: number; persistState: boolean },
    ) {
        const { parallelLoads = 20, batchSize = 50000 } = options;
        const { offset: globalOffset = 0, limit: globalLimit = 0 } = options;

        const chunkTrackerName = `${APIFY_EXTRA_KV_RECORD_PREFIX}CHUNKS${this.name}`;
        const chunkTracker = new ChunkTracker(await Actor.getValue<Record<string, boolean>>(chunkTrackerName));

        let isMigrating = false;
        const migrationCallback = async () => {
            isMigrating = true;
            await Actor.setValue(chunkTrackerName, chunkTracker.get());
        };

        Actor.on('migrating', migrationCallback);
        Actor.on('aborting', migrationCallback);

        Actor.on('persistState', async () => {
            await Actor.setValue(chunkTrackerName, chunkTracker.get());
        });

        const { itemCount } = await this.getInfo() ?? { itemCount: 0 };

        return waitForCompletion(
            [...new Array(Math.ceil((itemCount < globalLimit ? itemCount : globalLimit) / batchSize))]
                .filter((_, i) => !chunkTracker.has(`${globalOffset + i * batchSize}`))
                .map((_, i) => async () => {
                    if (isMigrating) await new Promise(() => {}); // blocks indefinitely - after a while, stops the entire execution
                    await this.forEach(func, { ...options, limit: batchSize, offset: globalOffset + batchSize * i });
                    chunkTracker.add(`${globalOffset + batchSize * i}`);
                }),
            parallelLoads);
    };
}
