/* eslint-disable max-classes-per-file */
import type {
    DatasetBackend,
    DatasetBackendListOptions,
    DatasetInfo,
    Dictionary,
    KeyValueStoreBackend,
    PaginatedList,
    RequestQueueBackend,
    StorageBackend,
    StorageIdentifier,
} from '@crawlee/types';

import type { ChargingManager } from './charging.js';
import { DEFAULT_DATASET_ITEM_EVENT } from './charging.js';
import type { Configuration } from './configuration.js';
import { DEFAULT_STORAGE_ALIAS } from './apify_storage_backend.js';

export interface ChargingStorageBackendOptions {
    /** Supplies the run's default dataset id, which is the only dataset charged for. */
    configuration: Configuration;

    /** Resolved per push, as the charging manager only knows the pricing once `Actor.init()` has run. */
    getChargingManager: () => ChargingManager;
}

/**
 * Charges the synthetic `apify-default-dataset-item` event for the items it stores, trimming a push
 * that the remaining budget cannot cover.
 *
 * It wraps the whole dataset backend rather than its API calls, so that a push split into several
 * payload-sized requests is still counted and charged exactly once.
 *
 * @internal
 */
export class ChargingDatasetBackend implements DatasetBackend {
    constructor(
        private readonly inner: DatasetBackend,
        private readonly getChargingManager: () => ChargingManager,
    ) {}

    async getMetadata(): Promise<DatasetInfo> {
        return await this.inner.getMetadata();
    }

    async drop(): Promise<void> {
        await this.inner.drop();
    }

    async purge(): Promise<void> {
        await this.inner.purge();
    }

    async getData(options?: DatasetBackendListOptions): Promise<PaginatedList<Dictionary>> {
        return await this.inner.getData(options);
    }

    async pushData(items: Dictionary[]): Promise<void> {
        const chargingManager = this.getChargingManager();

        // `Dataset.pushData()` also works without `Actor.init()`, where there is no charging state yet.
        if (items.length === 0 || !chargingManager.isInitialized || !chargingManager.isPayPerEvent) {
            await this.inner.pushData(items);
            return;
        }

        await chargingManager.withChargeLock(async () => {
            const limit = chargingManager.calculatePushDataLimit(items.length, { isDefaultDataset: true });

            if (limit === 0) {
                return;
            }

            await this.inner.pushData(limit < items.length ? items.slice(0, limit) : items);
            await chargingManager.charge({ eventName: DEFAULT_DATASET_ITEM_EVENT, count: limit });
        });
    }
}

/**
 * Wraps another storage backend so that items pushed to the run's default dataset are charged for
 * under the pay-per-event pricing model.
 *
 * Charging belongs here rather than in `Actor.pushData()` because `Dataset.pushData()` is also
 * called directly - by user code and by crawlee itself (`context.pushData()`) - and every item that
 * reaches the default dataset is billed by the platform regardless of who pushed it.
 *
 * @internal
 */
export class ChargingStorageBackend implements StorageBackend {
    storageExists?: StorageBackend['storageExists'];
    purge?: StorageBackend['purge'];
    teardown?: StorageBackend['teardown'];

    constructor(
        private readonly inner: StorageBackend,
        private readonly options: ChargingStorageBackendOptions,
    ) {
        // Crawlee branches on the presence of these, so they have to stay absent when `inner` lacks them.
        const { storageExists, purge, teardown } = inner;
        if (storageExists) this.storageExists = async (id, type) => storageExists.call(inner, id, type);
        if (purge) this.purge = async () => purge.call(inner);
        if (teardown) this.teardown = async () => teardown.call(inner);
    }

    get stats() {
        return this.inner.stats;
    }

    /** Repeats crawlee's own fallback, so that wrapping a backend does not change how storages are cached. */
    getStorageBackendCacheKey(): string {
        return this.inner.getStorageBackendCacheKey?.() ?? this.inner.constructor.name;
    }

    async createDatasetBackend(options?: StorageIdentifier): Promise<DatasetBackend> {
        const backend = await this.inner.createDatasetBackend(options);

        if (!this.isDefaultDataset(options)) {
            return backend;
        }

        return new ChargingDatasetBackend(backend, this.options.getChargingManager);
    }

    async createKeyValueStoreBackend(options?: StorageIdentifier): Promise<KeyValueStoreBackend> {
        return await this.inner.createKeyValueStoreBackend(options);
    }

    async createRequestQueueBackend(options?: StorageIdentifier): Promise<RequestQueueBackend> {
        return await this.inner.createRequestQueueBackend(options);
    }

    private isDefaultDataset(options?: StorageIdentifier): boolean {
        if (!options) return true;
        if (options.alias !== undefined) return options.alias === DEFAULT_STORAGE_ALIAS;
        if (options.id !== undefined) return options.id === this.options.configuration.defaultDatasetId;
        return false;
    }
}
