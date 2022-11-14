/* eslint-disable max-classes-per-file */
import { Actor, Dataset as OriginalDataset } from 'apify';
import { log } from 'crawlee';

import { APIFY_EXTRA_KV_RECORD_PREFIX, APIFY_EXTRA_LOG_PREFIX } from './const';

export type DatasetItem = Exclude<Parameters<OriginalDataset['pushData']>[0], any[]>;

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
     * Stores an object or an array of objects to the dataset.
     * The function returns a promise that resolves when the operation finishes.
     * It has no result, but throws on invalid args or other errors.
     *
     * **IMPORTANT**: Make sure to use the `await` keyword when calling `pushDataParallel()`,
     * otherwise the crawler process might finish before the data is stored!
     *
     * The size of the data is limited by the receiving API and therefore `pushDataParallel()` will only
     * allow objects whose JSON representation is smaller than 9MB. When an array is passed,
     * none of the included objects
     * may be larger than 9MB, but the array itself may be of any size.
     *
     * This method parallellizes the pushData calls to the Apify API, which can handle up to 30 parallel requests.
     * It also ensures keeps track of the progress and can resume the push if the actor is migrated.
     * Unline the `pushData` method, this method does not guarantee the order of items.
     *
     * @param data Object or array of objects containing data to be stored in the dataset.
     *   The objects must be serializable to JSON and the JSON representation of each object must be smaller than 9MB.
     * @param [options] All `pushDataParallel()` parameters.
     * @param [options.batchSize] Number of items to be pushed in one push call.
     *  Should not be higher than 1000 to ensure each push call finishes when migration happens.
     * @param [options.parallelPushes] Number of push calls to be done in parallel. Apify API should handle up to 30 parallel requests.
     * @param [options.idempotencyKey] By providing different idempotency keys (any string), you can call this function multiple times in the same run.
     */
    public async pushDataParallel(data: DatasetItem | DatasetItem[], options: {
        batchSize?: number;
        parallelPushes?: number;
        idempotencyKey?: string;
    } = {}) {
        if (!Array.isArray(data)) {
            return this.pushData(data);
        }

        const {
            batchSize = 1000,
            parallelPushes = 10,
            idempotencyKey = '',
        } = options;

        if (parallelPushes > 30) {
            log.warning(`${APIFY_EXTRA_LOG_PREFIX} Setting the parallelPushes option larger than 30 can lead to problems with the Apify Platform API.`);
        }

        const sanitizedIdempotencyKey = idempotencyKey.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
        const chunkTrackerName = `${APIFY_EXTRA_KV_RECORD_PREFIX}-PUSH-${this.id}-${sanitizedIdempotencyKey}`;
        const chunkTracker = new ChunkTracker(await Actor.getValue<Record<string, boolean>>(chunkTrackerName));

        let isMigrating = false;
        const migrationCallback = async (migrating: boolean) => {
            isMigrating = migrating ?? true;
            await Actor.setValue(chunkTrackerName, chunkTracker.get());
        };

        Actor.on('migrating', migrationCallback);
        Actor.on('aborting', migrationCallback);
        Actor.on('persistState', () => migrationCallback(false));

        return waitForCompletion(
            [...new Array(Math.ceil(data.length / batchSize))]
                .filter((_, i) => !chunkTracker.has(`${batchSize * i}`))
                .map((_, i) => async () => {
                    if (isMigrating) {
                        log.info(`${APIFY_EXTRA_LOG_PREFIX}[pushParallel]: Stopping pushParallel because of migration`);
                        await new Promise(() => {});
                    }

                    chunkTracker.add(`${batchSize * i}`);
                    const currentSlice = data.slice(batchSize * i, batchSize * (i + 1));
                    if (currentSlice.length > 0) {
                        await this.pushData(currentSlice);
                    }
                }),
            parallelPushes);
    };

    /**
     * Iterates over dataset items, passing every item to the provided `func` function.
     * Each invocation of `func` is called with two arguments: `(item, index)`. Index specifies the zero-based index of the item in the dataset.
     *
     * If the `func` function returns a Promise, it is awaited.
     * If it throws an error, the iteration is aborted and the `forEachParallel` function throws the error.
     *
     * **Example usage**
     * ```typescript
     * const dataset = await Dataset.open('my-results');
     * await dataset.forEachParallel(async (item, index) => {
     *   console.log(`Item at ${index}: ${JSON.stringify(item)}`);
     * });
     * ```
     *
     * *Important note*: Unlike the `forEach` method, this method processes items in parallel and does not guarantee the order of items.
     * It also doesn't wait before calling the provided function for the next item.
     *
     * @param func A function that is called for every item in the dataset.
     * @param [options] All `forEach()` parameters.
     * @param [options.parallelLoads] Maximum number of item batches to be processed in parallel.
     * @param [options.batchSize] Maximum number of items to be processed in one batch.
     * @param [options.persistState] If `true`, the processing state will be persisted between actor migrations and runs.
     * @returns {Promise<void>}
     */
    public async forEachParallel(
        func: Parameters<OriginalDataset['forEach']>[0],
        options: Parameters<OriginalDataset['forEach']>[1] & { parallelLoads?: number; batchSize?: number; persistState: boolean; idempotencyKey?: string },
    ) {
        const { parallelLoads = 20, batchSize = 50000, persistState, idempotencyKey = '' } = options;
        const { offset: globalOffset = 0, limit: globalLimit = Infinity } = options;

        const sanitizedIdempotencyKey = idempotencyKey.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
        const chunkTrackerName = `${APIFY_EXTRA_KV_RECORD_PREFIX}FOREACH-${this.id}-${sanitizedIdempotencyKey}`;
        const chunkTracker = new ChunkTracker(persistState ? await Actor.getValue<Record<string, boolean>>(chunkTrackerName) : undefined);

        let isMigrating = false;

        const migrationCallback = async (migrating: boolean) => {
            isMigrating = migrating ?? true;
            await Actor.setValue(chunkTrackerName, persistState ? chunkTracker.get() : null);
        };

        Actor.on('migrating', migrationCallback);
        Actor.on('aborting', migrationCallback);
        Actor.on('persistState', () => migrationCallback(false));

        const { itemCount } = await this.getInfo() ?? { itemCount: 0 };

        return waitForCompletion(
            [...new Array(Math.ceil((itemCount < globalLimit ? itemCount : globalLimit) / batchSize))] // every item represents one chunk
                .filter((_, i) => !chunkTracker.has(`${globalOffset + i * batchSize}`))
                .map((_, i) => async () => {
                    if (isMigrating) {
                        log.info(`${APIFY_EXTRA_LOG_PREFIX}[forEachParallel]: Stopping forEachParallel because of migration`);
                        // hang indefinitely until migration is done
                        await new Promise(() => {});
                    }

                    const { items } = await this.getData({ limit: batchSize, offset: globalOffset + batchSize * i });

                    chunkTracker.add(`${globalOffset + batchSize * i}`);
                    await Promise.all(items.map((item, b) => func(item, globalOffset + batchSize * i + b)));
                }),
            parallelLoads);
    };
}
