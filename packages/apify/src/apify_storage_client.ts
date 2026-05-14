import type {
    CreateDatasetClientOptions,
    CreateKeyValueStoreClientOptions,
    CreateRequestQueueClientOptions,
    DatasetClient,
    KeyValueStoreClient,
    RequestQueueClient,
    StorageClient,
} from '@crawlee/types';
import type { ApifyClient } from 'apify-client';

type StorageType = 'Dataset' | 'KeyValueStore' | 'RequestQueue';

/**
 * Bridges `apify-client`'s synchronous resource accessors (`dataset(id)`,
 * `keyValueStore(id)`, `requestQueue(id, options?)`) to crawlee v4's
 * `StorageClient` interface (async factory methods accepting either an `id`
 * or a `name`).
 *
 * `storageExists()` is implemented so that `Dataset.open(idOrName)` and friends
 * resolve a string argument to an id first (when one with that id exists on
 * the platform) and fall back to a name otherwise — without this, crawlee's
 * `resolveStorageIdentifier` would treat every string as a name and the SDK
 * would silently create a brand-new storage whose name equals the passed-in id.
 *
 * When only a `name` is provided to a `create*Client` method, it is resolved
 * to a concrete id via `getOrCreate(name)` — same behaviour the SDK relied on
 * in v3.
 */
export class ApifyStorageClient implements StorageClient {
    constructor(private readonly client: ApifyClient) {}

    async storageExists(id: string, type: StorageType): Promise<boolean> {
        // Apify's `GET /v2/{kind}/{idOrName}` endpoint matches by either id or
        // name. Confirm it was an *id* match — otherwise crawlee should fall
        // through to the `{ name }` branch.
        const info = await this.resourceClient(id, type).get();
        return info?.id === id;
    }

    async createDatasetClient(
        options?: CreateDatasetClientOptions,
    ): Promise<DatasetClient> {
        const id = await this.resolveId(options, 'Dataset');
        // apify-client's resource clients overlap with `@crawlee/types`' shapes
        // but don't yet implement the v4-added members (`getMetadata`,
        // `getRecordPublicUrl`). Cast through for now; a follow-up should
        // bring apify-client into structural alignment.
        return this.client.dataset(id) as unknown as DatasetClient;
    }

    async createKeyValueStoreClient(
        options?: CreateKeyValueStoreClientOptions,
    ): Promise<KeyValueStoreClient> {
        const id = await this.resolveId(options, 'KeyValueStore');
        return this.client.keyValueStore(id) as unknown as KeyValueStoreClient;
    }

    async createRequestQueueClient(
        options?: CreateRequestQueueClientOptions,
    ): Promise<RequestQueueClient> {
        const id = await this.resolveId(options, 'RequestQueue');
        return this.client.requestQueue(
            id,
            options?.clientKey ? { clientKey: options.clientKey } : undefined,
        ) as unknown as RequestQueueClient;
    }

    private async resolveId(
        options: { id?: string; name?: string } | undefined,
        type: StorageType,
    ): Promise<string> {
        if (options?.id) return options.id;
        if (options?.name) {
            return (await this.collectionClient(type).getOrCreate(options.name))
                .id;
        }
        return '';
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
