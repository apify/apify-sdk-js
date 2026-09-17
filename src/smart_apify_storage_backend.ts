import type {
    DatasetBackend,
    KeyValueStoreBackend,
    RequestQueueBackend,
    StorageBackend,
    StorageIdentifier,
} from '@crawlee/types';

import type { StorageType } from './apify_storage_backend.js';
import type { Configuration } from './configuration.js';
import type { OpenStorageOptions } from './storage.js';

export interface SmartApifyStorageBackendOptions {
    /** Used on the Apify platform, and locally for `forceCloud` storages. */
    cloudStorageBackend: StorageBackend;

    /** Used outside of the Apify platform, except for `forceCloud` storages. */
    localStorageBackend: StorageBackend;

    /** Supplies `isAtHome` and the token that cloud storage needs. */
    configuration: Configuration;
}

/**
 * Routes storages to Apify cloud storage or to a local one, depending on where the Actor runs.
 *
 * On the Apify platform (detected through the `APIFY_IS_AT_HOME` environment variable) storages are
 * opened in the cloud; locally they are opened through `localStorageBackend`, unless `forceCloud`
 * asks for the cloud one. `Actor` installs it; callers who want storages of their own pass a
 * backend to `Actor.init({ storage })` instead.
 *
 * @internal
 */
export class SmartApifyStorageBackend implements StorageBackend {
    readonly #cloudStorageBackend: StorageBackend;
    readonly #localStorageBackend: StorageBackend;
    readonly #configuration: Configuration;

    constructor(options: SmartApifyStorageBackendOptions) {
        this.#cloudStorageBackend = options.cloudStorageBackend;
        this.#localStorageBackend = options.localStorageBackend;
        this.#configuration = options.configuration;
    }

    /**
     * The backend a storage is opened through: the cloud one on the platform or with `forceCloud`,
     * the local one otherwise.
     *
     * Exposed so that `forceCloud` storages can be opened through the very same cloud backend
     * instance this one delegates to — two instances would resolve run-scoped aliases to two
     * separate storages.
     */
    getSuitableStorageBackend(options: OpenStorageOptions = {}): StorageBackend {
        if (this.#configuration.isAtHome) {
            return this.#cloudStorageBackend;
        }

        if (!options.forceCloud) {
            return this.#localStorageBackend;
        }

        if (!this.#configuration.token) {
            throw new Error(
                'In order to use the Apify cloud storage from your computer, you need to provide an Apify token ' +
                    'using the APIFY_TOKEN environment variable.',
            );
        }

        return this.#cloudStorageBackend;
    }

    get stats() {
        return this.getSuitableStorageBackend().stats;
    }

    /** Repeats crawlee's own fallback, so that routing a backend does not change how storages are cached. */
    getStorageBackendCacheKey(): string {
        const backend = this.getSuitableStorageBackend();
        return backend.getStorageBackendCacheKey?.() ?? backend.constructor.name;
    }

    async createDatasetBackend(options?: StorageIdentifier): Promise<DatasetBackend> {
        return await this.getSuitableStorageBackend().createDatasetBackend(options);
    }

    async createKeyValueStoreBackend(options?: StorageIdentifier): Promise<KeyValueStoreBackend> {
        return await this.getSuitableStorageBackend().createKeyValueStoreBackend(options);
    }

    async createRequestQueueBackend(options?: StorageIdentifier): Promise<RequestQueueBackend> {
        return await this.getSuitableStorageBackend().createRequestQueueBackend(options);
    }

    /**
     * Declared unconditionally, unlike on the backends this one delegates to: crawlee branches on
     * the presence of the three methods below, and delegating to a backend that lacks one is
     * indistinguishable from not having it — a `false` from `storageExists` means the same as its
     * absence (crawlee falls through to a name lookup), and the other two have no return value.
     */
    async storageExists(id: string, type: StorageType): Promise<boolean> {
        return (await this.getSuitableStorageBackend().storageExists?.(id, type)) ?? false;
    }

    async purge(): Promise<void> {
        await this.getSuitableStorageBackend().purge?.();
    }

    async teardown(): Promise<void> {
        await this.getSuitableStorageBackend().teardown?.();
    }
}
