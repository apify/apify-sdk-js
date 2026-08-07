/* eslint-disable max-classes-per-file */
import { AsyncLocalStorage } from 'node:async_hooks';

import type {
    DatasetBackend,
    KeyValueStoreBackend,
    RequestQueueBackend,
    StorageBackend,
    StorageIdentifier,
} from '@crawlee/types';
import type { ApifyClient } from 'apify-client';
import { DatasetClient as ApifyDatasetClient } from 'apify-client';

import {
    type ChargeResult,
    type ChargingManager,
    DEFAULT_DATASET_ITEM_EVENT,
    mergeChargeResults,
    pushDataAndCharge,
} from './charging.js';
import type { Configuration } from './configuration.js';

type StorageType = 'Dataset' | 'KeyValueStore' | 'RequestQueue';

const DEFAULT_ID_CONFIG_KEY = {
    Dataset: 'defaultDatasetId',
    KeyValueStore: 'defaultKeyValueStoreId',
    RequestQueue: 'defaultRequestQueueId',
} as const;

/** Marks a dataset client whose `pushItems` charges for pay-per-event. @internal */
export const USES_PUSH_DATA_INTERCEPTION = Symbol('apify:uses-push-data-interception');

/**
 * Context of a single `Actor.pushData()` call, shared with the intercepted
 * `pushItems()` calls so they can (1) know which event to charge and
 * (2) aggregate the {@link ChargeResult} across the multiple `pushItems()`
 * calls a single `pushData()` may trigger (Crawlee batches large pushes).
 */
export interface PpeAwarePushDataContext {
    eventName: string | undefined;
    chargeResult?: ChargeResult;
}

export const pushDataChargingContext = new AsyncLocalStorage<PpeAwarePushDataContext>();

/**
 * Default `DatasetClient` that charges for pushed items (pay-per-event). Used
 * only for the run's default dataset when a `apify-default-dataset-item` price
 * is configured; for everything else the plain `apify-client` dataset client is
 * used.
 */
class PpeAwareDatasetClient<
    Data extends Record<string | number, any> = Record<string | number, unknown>,
> extends ApifyDatasetClient<Data> {
    constructor(
        options: ConstructorParameters<typeof ApifyDatasetClient<Data>>[0],
        private readonly getChargingManager: () => ChargingManager,
    ) {
        super(options);
    }

    private normalizeItems(items: string | Data | string[] | Data[]): Data[] {
        if (typeof items === 'string') {
            const parsed = JSON.parse(items);
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        if (Array.isArray(items)) {
            return items.flatMap((item) =>
                typeof item === 'string' ? (JSON.parse(item) as Data | Data[]) : item,
            ) as Data[];
        }
        return [items];
    }

    override async pushItems(items: string | Data | string[] | Data[]): Promise<void> {
        const context = pushDataChargingContext.getStore();

        // A single JSON string may encode multiple items (e.g. '[{...},{...}]'),
        // which the charging logic would miscount — parse strings into arrays so
        // each logical item is counted individually.
        const normalizedItems = this.normalizeItems(items);

        const result = await pushDataAndCharge({
            chargingManager: this.getChargingManager(),
            items: normalizedItems,
            eventName: context?.eventName,
            isDefaultDataset: true,
            // stringify for faster validation in the Apify client
            pushFn: async (limitedItems) => super.pushItems(JSON.stringify(limitedItems)),
        });

        if (!context) return;

        // One `Actor.pushData()` may map to several `pushItems()` calls — aggregate.
        context.chargeResult =
            context.chargeResult === undefined ? result : mergeChargeResults(context.chargeResult, result);
    }
}

// crawlee v4's storage backend interfaces use different method names
// than `apify-client`'s resource clients (`getValue`/`getRecord`,
// `pushData`/`pushItems`, `getData`/`listItems`, `getMetadata`/`get`,
// `drop`/`delete`). `adapt` wraps a client in a name-remapping proxy: `renames`
// aliases the differing methods and `overrides` replaces the few whose return
// shape differs; everything else — identically-named methods and the
// pay-per-event marker symbol — passes straight through.
//
// `purge()` has no apify-client equivalent and isn't needed on the platform
// (a run's storages are already fresh), so it's a no-op.
const noPurge = { purge: async () => {} };

function adapt<T extends object>(
    client: T,
    renames: Record<string, string>,
    overrides: Record<string, (...args: any[]) => unknown> = {},
): T {
    return new Proxy(client, {
        get(target, prop) {
            if (typeof prop === 'string' && prop in overrides) return overrides[prop];
            const value = Reflect.get(target, (typeof prop === 'string' && renames[prop]) || prop, target);
            return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
        },
    });
}

export interface ApifyStorageBackendOptions {
    /**
     * SDK configuration providing the run's default storage ids and related environment values.
     * Without it, opening storages requires an explicit id or name.
     */
    configuration?: Configuration;

    /**
     * Supplies the charging manager for pay-per-event runs, enabling the charging-aware default
     * dataset client.
     * @internal
     */
    getChargingManager?: () => ChargingManager;
}

/**
 * Bridges `apify-client`'s synchronous resource accessors (`dataset(id)`,
 * `keyValueStore(id)`, `requestQueue(id, options?)`) to crawlee v4's
 * `StorageBackend` interface (async factory methods accepting either an `id`
 * or a `name`).
 *
 * For the run's default dataset it transparently swaps in a charging-aware
 * dataset client (pay-per-event on `Actor.pushData()`), provided a charging
 * manager is supplied and a default-dataset-item price is configured.
 *
 * `Actor` wires this up automatically; construct it directly only to use Apify
 * platform storage with crawlee's storage classes outside of `Actor` — e.g. to
 * read another run's output with an explicit token:
 *
 * ```ts
 * import { ApifyClient, ApifyStorageBackend, Dataset } from 'apify';
 *
 * const client = new ApifyClient({ token });
 * const dataset = await Dataset.open(datasetId, { storageBackend: new ApifyStorageBackend(client) });
 * const { items } = await dataset.getData();
 * ```
 */
export class ApifyStorageBackend implements StorageBackend {
    private readonly config?: Configuration;
    private readonly getChargingManager?: () => ChargingManager;

    constructor(
        private readonly client: ApifyClient,
        options: ApifyStorageBackendOptions = {},
    ) {
        this.config = options.configuration;
        this.getChargingManager = options.getChargingManager;
    }

    async storageExists(id: string, type: StorageType): Promise<boolean> {
        // Lets `Dataset.open(idOrName)` and friends resolve a string to an id first (when one
        // exists on the platform) and fall back to a name otherwise; without this, crawlee would
        // treat every string as a name and silently create a new storage named like the passed id.
        // Apify's `GET /v2/{kind}/{idOrName}` matches by either id or name;
        // confirm it was an *id* match so crawlee can fall through to `{ name }`.
        const info = await this.resourceClient(id, type).get();
        return info?.id === id;
    }

    async createDatasetBackend(options?: StorageIdentifier): Promise<DatasetBackend> {
        const id = await this.resolveId(options, 'Dataset');
        const client = this.chargingDatasetClient(id) ?? this.client.dataset(id);
        return adapt(
            client,
            {
                getMetadata: 'get',
                drop: 'delete',
                pushData: 'pushItems',
                getData: 'listItems',
            },
            noPurge,
        ) as unknown as DatasetBackend;
    }

    async createKeyValueStoreBackend(options?: StorageIdentifier): Promise<KeyValueStoreBackend> {
        const id = await this.resolveId(options, 'KeyValueStore');
        const client = this.client.keyValueStore(id);
        return adapt(
            client,
            {
                getMetadata: 'get',
                getValue: 'getRecord',
                setValue: 'setRecord',
                deleteValue: 'deleteRecord',
                drop: 'delete',
                getPublicUrl: 'getRecordPublicUrl',
            },
            {
                ...noPurge,
                // crawlee expects an array; apify-client returns `{ items }`.
                listKeys: async (opts?: Parameters<typeof client.listKeys>[0]) => (await client.listKeys(opts)).items,
            },
        ) as unknown as KeyValueStoreBackend;
    }

    async createRequestQueueBackend(options?: StorageIdentifier): Promise<RequestQueueBackend> {
        const id = await this.resolveId(options, 'RequestQueue');
        const client = this.client.requestQueue(id);
        return adapt(client, { getMetadata: 'get', drop: 'delete' }, noPurge) as unknown as RequestQueueBackend;
    }

    /**
     * Returns a charging-aware dataset client when `id` is the run's default
     * dataset and a default-dataset-item price is configured; otherwise
     * `undefined` (caller uses the plain client).
     */
    private chargingDatasetClient(id: string): ApifyDatasetClient | undefined {
        const { getChargingManager } = this;
        if (!getChargingManager) return undefined;
        if (id !== this.config?.defaultDatasetId) return undefined;

        const hasDefaultDatasetItemEvent =
            DEFAULT_DATASET_ITEM_EVENT in getChargingManager().getPricingInfo().perEventPrices;
        if (!hasDefaultDatasetItemEvent) return undefined;

        const datasetClient = new PpeAwareDatasetClient(
            {
                id,
                baseUrl: this.client.baseUrl,
                publicBaseUrl: this.client.publicBaseUrl,
                apifyClient: this.client,
                httpClient: this.client.httpClient,
            },
            getChargingManager,
        );
        Object.assign(datasetClient as object, {
            [USES_PUSH_DATA_INTERCEPTION]: true,
        });
        return datasetClient;
    }

    private async resolveId(options: { id?: string; name?: string } | undefined, type: StorageType): Promise<string> {
        if (options?.id) return options.id;
        if (options?.name) {
            return (await this.collectionClient(type).getOrCreate(options.name)).id;
        }
        // No id/name (crawlee's `__default__` alias): use the default storage
        // id from the run's environment. apify-client rejects an empty id.
        return this.config?.[DEFAULT_ID_CONFIG_KEY[type]] ?? '';
    }

    private resourceClient(id: string, type: StorageType) {
        if (type === 'Dataset') return this.client.dataset(id);
        if (type === 'KeyValueStore') return this.client.keyValueStore(id);
        return this.client.requestQueue(id);
    }

    private collectionClient(type: StorageType) {
        if (type === 'Dataset') return this.client.datasets();
        if (type === 'KeyValueStore') return this.client.keyValueStores();
        return this.client.requestQueues();
    }
}
