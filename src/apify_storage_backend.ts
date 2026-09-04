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
import type { ApifyClient, KeyValueStoreClient } from 'apify-client';
import { DatasetClient as ApifyDatasetClient } from 'apify-client';
import log from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';

import { ApifyDatasetBackend } from './apify_dataset_backend.js';
import { ApifyKeyValueStoreBackend } from './apify_key_value_store_backend.js';
import { AsyncLock, type RequestQueueAccessMode } from './apify_request_queue_backend.js';
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

/** The key of the default key-value store record holding this run's alias -> storage id mapping. */
const ALIAS_MAPPING_RECORD_KEY = '__STORAGE_ALIASES_MAPPING';

/** Alias -> storage id, keyed as `<type>,<alias>,<credentials hash>` — see `resolveAliasId`. */
type AliasMapping = Record<string, string>;

async function readAliasMapping(store: KeyValueStoreClient): Promise<AliasMapping> {
    const record = await store.getRecord(ALIAS_MAPPING_RECORD_KEY);
    return (record?.value as AliasMapping | undefined) ?? {};
}

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
    private readonly config?: Configuration;
    private readonly requestQueueAccess: RequestQueueAccessMode;
    private readonly getChargingManager?: () => ChargingManager;

    /** Unnamed storages resolved for aliases in this process, keyed like {@link AliasMapping}. */
    private readonly aliasIdCache = new Map<string, string>();

    /** The alias mapping read from the run's default key-value store; `undefined` until first read. */
    private persistedAliasIds?: AliasMapping;

    /** Serializes alias resolution — see `resolveAliasId`. */
    private readonly aliasLock = new AsyncLock();

    /** Fallback request queue client key when the run id is unavailable — one per backend. */
    private fallbackClientKey?: string;

    constructor(
        private readonly client: ApifyClient,
        options: ApifyStorageBackendOptions = {},
    ) {
        this.config = options.configuration;
        this.requestQueueAccess = options.requestQueueAccess ?? 'single';
        this.getChargingManager = options.getChargingManager;
    }

    /**
     * Partitions crawlee's storage-instance cache by API base URL and token, so the same storage
     * opened through two differently-authenticated backends is cached separately. The request
     * queue access mode is deliberately not part of the key — opening the same queue in `single`
     * and `shared` mode at once is not supported, and whichever backend opens it first wins.
     */
    getStorageBackendCacheKey(): string {
        return `ApifyStorageBackend:${this.credentialsHash()}`;
    }

    /** Short digest of the API base URL and token — identifies the credentials a storage was opened with. */
    private credentialsHash(): string {
        return createHash('sha256')
            .update(`${this.client.publicBaseUrl}${this.client.token ?? ''}`)
            .digest('hex')
            .slice(0, 8);
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
        const backend = new ApifyDatasetBackend(chargingClient ?? this.client.dataset(id));
        if (chargingClient) {
            // `Actor.pushData()` looks for this marker on the dataset's backend to know the
            // pay-per-event charging happens inside the intercepted `pushItems()` calls.
            Object.assign(backend, { [USES_PUSH_DATA_INTERCEPTION]: true });
        }
        return backend;
    }

    async createKeyValueStoreBackend(options?: StorageIdentifier): Promise<KeyValueStoreBackend> {
        const id = await this.resolveId(options, 'KeyValueStore');
        return new ApifyKeyValueStoreBackend(this.client.keyValueStore(id));
    }

    async createRequestQueueBackend(options?: StorageIdentifier): Promise<RequestQueueBackend> {
        const id = await this.resolveId(options, 'RequestQueue');
        const client = this.client.requestQueue(id, { clientKey: this.requestQueueClientKey() });
        return this.requestQueueAccess === 'shared'
            ? new ApifyRequestQueueSharedBackend(client)
            : new ApifyRequestQueueSingleBackend(client);
    }

    /**
     * A stable per-run client key makes the API's `hadMultipleClients` flag meaningful and lets a
     * migrated or resurrected run re-acquire the request locks of its previous incarnation.
     */
    private requestQueueClientKey(): string {
        const key = this.config?.actorRunId ?? (this.fallbackClientKey ??= cryptoRandomObjectId(MAX_CLIENT_KEY_LENGTH));
        return key.slice(0, MAX_CLIENT_KEY_LENGTH);
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

        return new PpeAwareDatasetClient(
            {
                id,
                baseUrl: this.client.baseUrl,
                publicBaseUrl: this.client.publicBaseUrl,
                apifyClient: this.client,
                httpClient: this.client.httpClient,
            },
            getChargingManager,
        );
    }

    /**
     * Resolves a crawlee {@link StorageIdentifier} to a platform storage id.
     *
     * Aliases resolve to unnamed storages: the reserved `__default__` alias maps to the run's
     * default storage, and an alias declared in the Actor's schema to the storage the platform
     * created for it (via the `ACTOR_STORAGES_JSON` environment variable). Any other alias gets an
     * unnamed storage of its own — crawlee mints aliases at runtime, one per extra crawler instance
     * and one per throttled domain, so an undeclared alias is not an error.
     */
    private async resolveId(options: StorageIdentifier | undefined, type: StorageType): Promise<string> {
        if (options?.id) return options.id;
        if (options?.name) {
            return (await this.collectionClient(type).getOrCreate(options.name)).id;
        }

        const alias = (options && 'alias' in options && options.alias) || DEFAULT_STORAGE_ALIAS;

        if (alias === DEFAULT_STORAGE_ALIAS) {
            const defaultId = this.config?.[DEFAULT_ID_CONFIG_KEY[type]];
            if (defaultId) return defaultId;
        } else {
            const declaredId = this.aliasFromActorStorages(alias, type);
            if (declaredId) return declaredId;
        }

        return this.resolveAliasId(alias, type);
    }

    /**
     * Returns the unnamed storage backing `alias`, creating it on first use.
     *
     * On the platform the mapping is persisted, so a migrated run reopens the same storages rather
     * than empty ones — aliased request queues hold live requests. Serialized, so one alias means
     * one storage and the mapping's read-modify-write cannot drop entries.
     */
    private async resolveAliasId(alias: string, type: StorageType): Promise<string> {
        // The credentials are part of the key, so the same alias opened through two
        // differently-authenticated backends maps to two storages.
        const key = [type, alias, this.credentialsHash()].join(',');

        return this.aliasLock.runExclusive(async () => {
            const knownId = this.aliasIdCache.get(key);
            if (knownId) return knownId;

            const store = this.aliasMappingStore();
            this.persistedAliasIds ??= store ? await readAliasMapping(store) : {};

            // A persisted id can point at a storage the user has since deleted.
            const persistedId = this.persistedAliasIds[key];
            if (persistedId && (await this.resourceClient(persistedId, type).get())) {
                this.aliasIdCache.set(key, persistedId);
                return persistedId;
            }

            const { id } = await this.collectionClient(type).getOrCreate();
            this.aliasIdCache.set(key, id);
            if (store) await this.persistAliasId(store, key, id);
            return id;
        });
    }

    /**
     * Re-reads the record first, so a second backend in this process does not drop its entries.
     * Logged rather than thrown: a lost entry only costs a re-created storage after a migration.
     */
    private async persistAliasId(store: KeyValueStoreClient, key: string, id: string): Promise<void> {
        try {
            const mapping = await readAliasMapping(store);
            mapping[key] = id;
            await store.setRecord({ key: ALIAS_MAPPING_RECORD_KEY, value: mapping });
            this.persistedAliasIds = mapping;
        } catch (error) {
            log.warning(`Failed to persist the storage alias mapping: ${(error as Error).message}`);
        }
    }

    /** The run's default key-value store, where the mapping lives — `undefined` off the platform. */
    private aliasMappingStore(): KeyValueStoreClient | undefined {
        return this.config?.isAtHome ? this.client.keyValueStore(this.config.defaultKeyValueStoreId) : undefined;
    }

    /** Looks an alias up in the Actor's schema storages (the `ACTOR_STORAGES_JSON` env var). */
    private aliasFromActorStorages(alias: string, type: StorageType): string | undefined {
        const storagesJson = this.config?.actorStoragesJson;
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
