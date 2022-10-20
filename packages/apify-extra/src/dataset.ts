import { Actor } from 'apify';
import { Dictionary, log } from 'crawlee';
import type { DatasetInfo } from '@crawlee/types';

import { APIFY_EXTRA_KV_RECORD_PREFIX, APIFY_EXTRA_LOG_PREFIX } from './const';

export type DatasetItem = Dictionary<any>;

async function waitForCompletion(jobs: (() => Promise<any>)[], maxConcurrency: number) : Promise<void> {
    if (maxConcurrency < 1 || maxConcurrency > 100) {
        throw new Error('maxConcurrency must be greater than 0 and less than 100');
    };

    async function worker() {
        let job;
        // eslint-disable-next-line no-cond-assign
        while (job = jobs.shift()) await job();
    }

    await Promise.all(
        Array(maxConcurrency).fill(null).map(() => worker()),
    );
}

export interface ParallelPersistedPushDataOptions {
    /**
     * Number of items to be pushed in one push call.
     * Should not be higher than 1000 to ensure each push call finishes when migration happens.
     *
     * @default 1000
     */
    uploadBatchSize?: number;
    /**
     * Optional dataset ID or name to push into. If not provided, default dataset is used.
     */
    outputDatasetIdOrName?: string;
    /**
     * Number of push calls to be done in parallel. Apify API should handle up to 30 parallel requests but better be careful.
     *
     * @default 10
     */
    parallelPushes?: number;
    /**
     * You must provide idempotency key if you want to call this function multiple times in the saem run.
     * The key should only contain letters and numbers.
     */
    idempotencyKey?: string;
}
/**
 * Pushes items to dataset in parallel while also resuming correctly after Actor migration.
 * This should be used when you want to push a lot of items to dataset at once.
 * If you call this function multiple times in the same run,
 * you must provide different idempotencyKey option for each call.
 */
export const parallelPersistedPushData = async (items: DatasetItem[], options: ParallelPersistedPushDataOptions = {}) => {
    const {
        uploadBatchSize = 1000,
        outputDatasetIdOrName = '',
        parallelPushes = 10,
        idempotencyKey = '',
    } = options;
    let isMigrating = false;
    Actor.on('migrating', () => { isMigrating = true; });
    Actor.on('aborting', () => { isMigrating = true; });

    const sanitizedIdempotencyKey = idempotencyKey.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);

    const kvRecordName = `${APIFY_EXTRA_KV_RECORD_PREFIX}STATE-PUSHED-COUNT${outputDatasetIdOrName}${sanitizedIdempotencyKey}`;
    let pushedItemsCount: number = await Actor.getValue(kvRecordName) || 0;
    const dataset = await Actor.openDataset(outputDatasetIdOrName);

    Actor.on('persistState', async () => {
        await Actor.setValue(kvRecordName, pushedItemsCount);
    });

    const fullBatchSize = uploadBatchSize * parallelPushes;

    for (let i = pushedItemsCount; i < items.length; i += fullBatchSize) {
        if (isMigrating) {
            log.info(`${APIFY_EXTRA_LOG_PREFIX}[parallelPersistedPushData]: Stopping push because of migration`);
            // Do nothing
            await new Promise(() => {});
        }
        const itemsToPush = items.slice(i, i + fullBatchSize);

        const pushPromises: Promise<void>[] = [];
        const parallelizedBatchSize = Math.ceil(itemsToPush.length / parallelPushes);
        for (let j = 0; j < parallelPushes; j++) {
            const start = j * parallelizedBatchSize;
            const end = (j + 1) * parallelizedBatchSize;
            const parallelPushChunk = itemsToPush.slice(start, end);
            pushPromises.push(dataset.pushData(parallelPushChunk));
        }
        // We must update it before awaiting the promises because the push can take time
        // and migration can cut us off but the items will already be on the way to dataset
        pushedItemsCount += itemsToPush.length;
        await Promise.all(pushPromises);
    }
};

interface CalculateLocalOffsetLimitParams {
    offset: number;
    limit: number;
    localStart: number;
    batchSize: number;
}

type CalculateLocalOffsetLimitResult =
    null |
    { offset: number; limit: number };

// Returns either null if offset/limit does not fit the current chunk
// or { offset, limit } object
const calculateLocalOffsetLimit = ({ offset, limit, localStart, batchSize }: CalculateLocalOffsetLimitParams): CalculateLocalOffsetLimitResult => {
    const localEnd = localStart + batchSize;
    const inputEnd = offset + limit;

    // Offset starts after the current chunk
    if (offset >= localEnd) {
        return null;
    }
    // Offset + limit ends before our chunk
    if (inputEnd <= localStart) {
        return null;
    }

    // Now we know that the some data are in the current batch
    const calculateLimit = () => {
        // limit overflows current batch
        if (inputEnd >= localEnd) {
            // Now either the offset is less than local start and we do whole batch
            if (offset < localStart) {
                return batchSize;
            }
            // Or it is inside the current batch and we slice it from the start (including whole batch)
            return localEnd - offset;
            // eslint-disable-next-line no-else-return
        } else { // Consider (inputEnd < localEnd) Means limit ends inside current batch
            if (offset < localStart) {
                return inputEnd - localStart;
            }
            // This means both offset and limit are inside current batch
            return inputEnd - offset;
        }
    };

    return {
        offset: Math.max(localStart, offset),
        limit: calculateLimit(),
    };
};

const PROCESS_FN_LOADING_STATE_KV_RECORD_KEY = `${APIFY_EXTRA_KV_RECORD_PREFIX}PROCESS-FN-LOADING-STATE`;

export interface LoadDatasetItemsInParallelOptions {
    parallelLoads?: number;
    batchSize?: number;
    offset?: number;
    limit?: number;
    concatItems?: boolean;
    concatDatasets?: boolean;
    debugLog?: boolean;
    persistLoadingStateForProcesFn?: boolean;
    fields?: string[];
    // If run outside of Apify platform, will fetch local datasets instead. On Apify platform, this is ignored.
    loadFromLocalDataset?: boolean;
    processFn?: (items: DatasetItem[], params: { datasetId: string; datasetOffset: number }) => Promise<void>;
}

export type LoadDatasetItemsInParallelResult =
    undefined |
    DatasetItem[] |
    DatasetItem[][];

/**
* Loads items from one or many datasets in parallel by chunking the items from each dataset into batches,
* retaining order of both items and datasets. Useful for large loads.
* By default returns one array of items in order of datasets provided.
* By changing concatItems or concatDatasets options, you can get array of arrays (of arrays) back
* Requires bluebird dependency and copy calculateLocalOffsetLimit function!!!
*
* @param {string[]} datasetIds IDs or names of datasets you want to load
* @param {object} options Options with default values.
* If both concatItems and concatDatasets are false, output of this function is an array of datasets containing arrays
* of batches containig array of items.
* concatItems concats all batches of one dataset into one array of items.
* concatDatasets concat all datasets into one array of batches
* Using both concatItems and concatDatasets gives you back a sinlge array of all items in order.
* Both are true by default.
* Data are not returned by fed to the supplied async function on the fly (reduces memory usage)
* Will not load batches that were already processed before migration, does nothing if processFn is not used.
* It does not persist the state inside processFn, that is a responsibillity of the caller (if needed)
* You must not manipulate input parameters (and underlying datasets) between migrations or this will break
*/
export const loadDatasetItemsInParallel = async (
    datasetIds: string[],
    options: LoadDatasetItemsInParallelOptions = {},
): Promise<LoadDatasetItemsInParallelResult> => {
    const {
        processFn,
        parallelLoads = 20,
        batchSize = 50000,
        offset = 0,
        limit = 999999999,
        concatItems = true,
        concatDatasets = true,
        debugLog = false,
        persistLoadingStateForProcesFn = false,
        fields,
        // Figure out better name since this is useful for datasets by name on platform
        loadFromLocalDataset = false,
    } = options;

    const LOG_PREFIX = `${APIFY_EXTRA_LOG_PREFIX}[loadDatasetItemsInParallel]:`;

    if (!Actor.isAtHome() && loadFromLocalDataset && fields) {
        log.warning(`${LOG_PREFIX} fields option does not work on local datasets`);
    }

    const client = Actor.newClient();

    const loadStart = Date.now();

    // If we use processFnLoadingState, we skip requests that are done
    const createRequestArray = async (processFnLoadingState: any) => {
        // We increment for each dataset so we remember their order
        let datasetIndex = 0;

        // This array will be used to create promises to run in parallel
        const requestInfoArr = [];

        for (const datasetId of datasetIds) {
            if (processFnLoadingState && !processFnLoadingState[datasetId]) {
                processFnLoadingState[datasetId] = {};
            }
            // We get the number of items first and then we precreate request info objects
            let datasetInfo: DatasetInfo | undefined;
            if (loadFromLocalDataset) {
                const dataset = await Actor.openDataset(datasetId);
                datasetInfo = await dataset.getInfo();
            } else {
                datasetInfo = await client.dataset(datasetId).get();
            }
            if (!datasetInfo) {
                throw new Error(`${LOG_PREFIX} Dataset ${datasetId} was not found`);
            }
            const { itemCount } = datasetInfo;
            if (debugLog) {
                log.info(`Dataset ${datasetId} has ${itemCount} items`);
            }
            const numberOfBatches = Math.ceil(itemCount / batchSize);

            for (let i = 0; i < numberOfBatches; i++) {
                const localOffsetLimit = calculateLocalOffsetLimit({ offset, limit, localStart: i * batchSize, batchSize });
                if (!localOffsetLimit) {
                    continue;
                }

                if (processFnLoadingState) {
                    if (!processFnLoadingState[datasetId][localOffsetLimit.offset]) {
                        processFnLoadingState[datasetId][localOffsetLimit.offset] = { done: false };
                    } else if (processFnLoadingState[datasetId][localOffsetLimit.offset].done) {
                        if (debugLog) {
                            log.info(`Batch for dataset ${datasetId}, offset: ${localOffsetLimit.offset} was already processed, skipping...`);
                        }
                        continue;
                    }
                }

                requestInfoArr.push({
                    index: i,
                    offset: localOffsetLimit.offset,
                    limit: localOffsetLimit.limit,
                    datasetId,
                    datasetIndex,
                });
            }

            datasetIndex++;
        }
        return requestInfoArr;
    };

    // This is array of arrays. Top level array is for each dataset and inside one entry for each batch (in order)
    const loadedBatchedArr: DatasetItem[][][] = [];

    let totalLoaded = 0;
    const totalLoadedPerDataset: Record<string, number> = {};

    const processFnLoadingState: any = persistLoadingStateForProcesFn
        ? (await Actor.getValue(PROCESS_FN_LOADING_STATE_KV_RECORD_KEY) || {})
        : null;

    Actor.on('persistState', async () => {
        await Actor.setValue(PROCESS_FN_LOADING_STATE_KV_RECORD_KEY, processFnLoadingState);
    });

    const requestInfoArr = await createRequestArray(processFnLoadingState);
    if (debugLog) {
        log.info(`Number of requests to do: ${requestInfoArr.length}`);
    }

    //  Now we execute all the requests in parallel (with defined concurrency)
    await waitForCompletion(requestInfoArr.map((requestInfoObj) => async () => {
        const { index, datasetId, datasetIndex } = requestInfoObj;

        const getDataOptions = {
            offset: requestInfoObj.offset,
            limit: requestInfoObj.limit,
            fields,
        };
        let datasetResult;
        if (loadFromLocalDataset) {
            // This open should be cached
            const dataset = await Actor.openDataset(datasetId);

            if (!Actor.isAtHome()) {
                delete getDataOptions.fields;
            }
            datasetResult = await dataset.getData(getDataOptions);
        } else {
            datasetResult = await client.dataset(datasetId).listItems(getDataOptions);
        }

        const { items } = datasetResult;

        if (!totalLoadedPerDataset[datasetId]) {
            totalLoadedPerDataset[datasetId] = 0;
        }

        totalLoadedPerDataset[datasetId] += items.length;
        totalLoaded += items.length;

        if (debugLog) {
            log.info(
                `Items loaded from dataset ${datasetId}: ${items.length}, offset: ${requestInfoObj.offset},
       total loaded from dataset ${datasetId}: ${totalLoadedPerDataset[datasetId]},
       total loaded: ${totalLoaded}`,
            );
        }
        // We either collect the data or we process them on the fly
        if (processFn) {
            await processFn(items, { datasetId, datasetOffset: requestInfoObj.offset });
            if (processFnLoadingState) {
                processFnLoadingState[datasetId][requestInfoObj.offset].done = true;
            }
        } else {
            if (!loadedBatchedArr[datasetIndex]) {
                loadedBatchedArr[datasetIndex] = [];
            }
            // Now we correctly assign the items into the main array
            loadedBatchedArr[datasetIndex][index] = items;
        }
    }), parallelLoads);

    if (debugLog) {
        log.info(`Loading took ${Math.round((Date.now() - loadStart) / 1000)} seconds`);
    }

    if (processFnLoadingState) {
        await Actor.setValue(PROCESS_FN_LOADING_STATE_KV_RECORD_KEY, processFnLoadingState);
    }

    if (processFn) {
        return undefined;
    }

    let resultItems: DatasetItem[] | DatasetItem[][] | DatasetItem[][][] = loadedBatchedArr;
    if (concatItems) {
        for (let i = 0; i < loadedBatchedArr.length; i++) {
            resultItems[i] = loadedBatchedArr[i].flatMap((item) => item);
        }
    }

    if (concatDatasets) {
        resultItems = loadedBatchedArr.flatMap((item) => item);
    }
    return loadedBatchedArr;
};
