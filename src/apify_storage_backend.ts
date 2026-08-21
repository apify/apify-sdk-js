/* eslint-disable max-classes-per-file */
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';

import type {
    DatasetBackend,
    KeyValueStoreBackend,
    RequestQueueBackend,
    StorageBackend,
    StorageIdentifier,
} from '@crawlee/types';
import type { ApifyClient } from 'apify-client';
import { DatasetClient as ApifyDatasetClient } from 'apify-client';
import { cryptoRandomObjectId } from '@apify/utilities';

import { ApifyDatasetBackend } from './apify_dataset_backend.js';
import { ApifyKeyValueStoreBackend } from './apify_key_value_store_backend.js';
import type { RequestQueueAccessMode } from './apify_request_queue_backend.js';
import { ApifyRequestQueueSharedBackend } from './apify_request_queue_shared_backend.js';
import { ApifyRequestQueueSingleBackend } from './apify_request_queue_single_backend.js';
import {
    type ChargeResult,
    type ChargingManager,
    DEFAULT_DATASET_ITEM_EVENT,
    mergeChargeResults,
    pushDataAndCharge,
} from './charging.js';
import type { Configuration } from './configuration.js';

type StorageType = 'Dataset' | 'KeyValueStore' | 'RequestQueue';

/** The reserved alias crawlee uses for the default (unnamed) storage. */
const DEFAULT_STORAGE_ALIAS = '__default__';

/** The maximum clientKey length accepted by the request queue API. */
const MAX_CLIENT_KEY_LENGTH = 32;

const DEFAULT_ID_CONFIG_KEY = {
    Dataset: 'defaultDatasetId',
    KeyValueStore: 'defaultKeyValueStoreId',
    RequestQueue: 'defaultRequestQueueId',
} as const;

const ACTOR_STORAGES_TYPE_KEY = {
    Dataset: 'datasets',
    KeyValueStore: 'keyValueStores',
    RequestQueue: 'requestQueues',
} as const;

/** The parsed shape of the `ACTOR_STORAGES_JSON` environment variable. */
interface ActorStorages {
    datasets?: Record<string, string>;
    keyValueStores?: Record<string, string>;
    requestQueues?: Record<string, string>;
}

/** Marks a dataset backend whose underlying client charges for pushed items (pay-per-event). @internal */
export const USES_PUSH_DATA_INTERCEPTION = Symbol('apify:uses-push-data-interception');

/**
 * Context of a single `Actor.pushData()` call, shared with the intercepted
 * `pushItems()` calls so they can (1) know which event to charge and
 * (2) aggregate the {@link ChargeResult} across the multiple `pushItems()`
 * calls a single `pushData()` may trigger (the backend splits pushes exceeding
 * the API's payload size limit).
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
    readonly #getChargingManager: () => ChargingManager;

    constructor(
        options: ConstructorParameters<typeof ApifyDatasetClient<Data>>[0],
        getChargingManager: () => ChargingManager,
    ) {
        super(options);
        this.#getChargingManager = getChargingManager;
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
            chargingManager: this.#getChargingManager(),
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

export interface ApifyStorageBackendOptions {
    /**
     * SDK configuration providing the run's default storage ids and related environment values.
     * Without it, opening storages requires an explicit id or name.
     */
    configuration?: Configuration;

    /**
     * Determines how request queues opened through this backend are consumed —
     * `'single'` (default) assumes this is the queue's only consumer and skips request locking for
     * fewer (paid) API calls; `'shared'` locks requests server-side so any number of concurrent
     * consumers can process the same queue safely.
     */
    requestQueueAccess?: RequestQueueAccessMode;

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
 * `StorageBackend` interface (async factory methods accepting an `id`,
 * a `name`, or an `alias`).
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
    readonly #client: ApifyClient;
    readonly #config?: Configuration;
    readonly #requestQueueAccess: RequestQueueAccessMode;
    readonly #getChargingManager?: () => ChargingManager;

    /** Unnamed storages created for aliases in this process, so an alias maps to one storage. */
    readonly #aliasIdCache = new Map<string, string>();

    /** Fallback request queue client key when the run id is unavailable — one per backend. */
    #fallbackClientKey?: string;

    constructor(client: ApifyClient, options: ApifyStorageBackendOptions = {}) {
        this.#client = client;
        this.#config = options.configuration;
        this.#requestQueueAccess = options.requestQueueAccess ?? 'single';
        this.#getChargingManager = options.getChargingManager;
    }

    /**
     * Partitions crawlee's storage-instance cache by API base URL and token, so the same storage
     * opened through two differently-authenticated backends is cached separately. The request
     * queue access mode is deliberately not part of the key — opening the same queue in `single`
     * and `shared` mode at once is not supported, and whichever backend opens it first wins.
     */
    getStorageBackendCacheKey(): string {
        const hash = createHash('sha256')
            .update(`${this.#client.publicBaseUrl}${this.#client.token ?? ''}`)
            .digest('hex')
            .slice(0, 8);
        return `ApifyStorageBackend:${hash}`;
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
        const chargingClient = this.chargingDatasetClient(id);
        const backend = new ApifyDatasetBackend(chargingClient ?? this.#client.dataset(id));
        if (chargingClient) {
            // `Actor.pushData()` looks for this marker on the dataset's backend to know the
            // pay-per-event charging happens inside the intercepted `pushItems()` calls.
            Object.assign(backend, { [USES_PUSH_DATA_INTERCEPTION]: true });
        }
        return backend;
    }

    async createKeyValueStoreBackend(options?: StorageIdentifier): Promise<KeyValueStoreBackend> {
        const id = await this.resolveId(options, 'KeyValueStore');
        return new ApifyKeyValueStoreBackend(this.#client.keyValueStore(id));
    }

    async createRequestQueueBackend(options?: StorageIdentifier): Promise<RequestQueueBackend> {
        const id = await this.resolveId(options, 'RequestQueue');
        const client = this.#client.requestQueue(id, { clientKey: this.requestQueueClientKey() });
        return this.#requestQueueAccess === 'shared'
            ? new ApifyRequestQueueSharedBackend(client)
            : new ApifyRequestQueueSingleBackend(client);
    }

    /**
     * A stable per-run client key makes the API's `hadMultipleClients` flag meaningful and lets a
     * migrated or resurrected run re-acquire the request locks of its previous incarnation.
     */
    private requestQueueClientKey(): string {
        const key =
            this.#config?.actorRunId ?? (this.#fallbackClientKey ??= cryptoRandomObjectId(MAX_CLIENT_KEY_LENGTH));
        return key.slice(0, MAX_CLIENT_KEY_LENGTH);
    }

    /**
     * Returns a charging-aware dataset client when `id` is the run's default
     * dataset and a default-dataset-item price is configured; otherwise
     * `undefined` (caller uses the plain client).
     */
    private chargingDatasetClient(id: string): ApifyDatasetClient | undefined {
        const getChargingManager = this.#getChargingManager;
        if (!getChargingManager) return undefined;
        if (id !== this.#config?.defaultDatasetId) return undefined;

        const hasDefaultDatasetItemEvent =
            DEFAULT_DATASET_ITEM_EVENT in getChargingManager().getPricingInfo().perEventPrices;
        if (!hasDefaultDatasetItemEvent) return undefined;

        return new PpeAwareDatasetClient(
            {
                id,
                baseUrl: this.#client.baseUrl,
                publicBaseUrl: this.#client.publicBaseUrl,
                apifyClient: this.#client,
                httpClient: this.#client.httpClient,
            },
            getChargingManager,
        );
    }

    /**
     * Resolves a crawlee {@link StorageIdentifier} to a platform storage id.
     *
     * Aliases resolve to unnamed storages: the reserved `__default__` alias maps to the run's
     * default storage, and other aliases to the storages declared in the Actor's schema (via the
     * `ACTOR_STORAGES_JSON` environment variable, maintained by the platform). Outside the
     * platform, an unnamed storage is created per alias instead (remembered for this process only).
     */
    private async resolveId(options: StorageIdentifier | undefined, type: StorageType): Promise<string> {
        if (options?.id) return options.id;
        if (options?.name) {
            return (await this.collectionClient(type).getOrCreate(options.name)).id;
        }

        const alias = (options && 'alias' in options && options.alias) || DEFAULT_STORAGE_ALIAS;

        if (alias === DEFAULT_STORAGE_ALIAS) {
            const defaultId = this.#config?.[DEFAULT_ID_CONFIG_KEY[type]];
            if (defaultId) return defaultId;
        } else {
            const declaredId = this.aliasFromActorStorages(alias, type);
            if (declaredId) return declaredId;
            if (this.#config?.isAtHome) {
                throw new Error(
                    `Storage alias "${alias}" cannot be resolved because it is not declared in the Actor's schema storages. ` +
                        `Declare it in the Actor schema, or open the storage by name instead.`,
                );
            }
        }

        // No platform-provided id for this alias (e.g. cloud storage used locally via an API
        // token) — create an unnamed storage for it, one per alias per process.
        const cacheKey = `${type}:${alias}`;
        const cachedId = this.#aliasIdCache.get(cacheKey);
        if (cachedId) return cachedId;
        const created = await this.collectionClient(type).getOrCreate();
        this.#aliasIdCache.set(cacheKey, created.id);
        return created.id;
    }

    /** Looks an alias up in the Actor's schema storages (the `ACTOR_STORAGES_JSON` env var). */
    private aliasFromActorStorages(alias: string, type: StorageType): string | undefined {
        const storagesJson = this.#config?.actorStoragesJson;
        if (!storagesJson) return undefined;
        let storages: ActorStorages;
        try {
            storages = JSON.parse(storagesJson);
        } catch {
            throw new Error(`Failed to parse ACTOR_STORAGES_JSON environment variable: ${storagesJson}`);
        }
        return storages[ACTOR_STORAGES_TYPE_KEY[type]]?.[alias];
    }

    private resourceClient(id: string, type: StorageType) {
        if (type === 'Dataset') return this.#client.dataset(id);
        if (type === 'KeyValueStore') return this.#client.keyValueStore(id);
        return this.#client.requestQueue(id);
    }

    private collectionClient(type: StorageType) {
        if (type === 'Dataset') return this.#client.datasets();
        if (type === 'KeyValueStore') return this.#client.keyValueStores();
        return this.#client.requestQueues();
    }
}
