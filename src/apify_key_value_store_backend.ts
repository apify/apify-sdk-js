import type {
    KeyValueStoreBackend,
    KeyValueStoreInfo,
    KeyValueStoreInputRecord,
    KeyValueStoreItemData,
    KeyValueStoreListKeysOptions,
    KeyValueStoreListKeysResult,
    KeyValueStoreRecord,
} from '@crawlee/types';
import type { KeyValueStoreClient } from 'apify-client';

/**
 * Implements crawlee v4's {@link KeyValueStoreBackend} interface on top of `apify-client`'s
 * key-value store API. Mostly a method-mapping wrapper (`getValue`/`getRecord`,
 * `setValue`/`setRecord`, `drop`/`delete`, ...); the one semantic difference is that storage
 * backends are byte transports, so records are read unparsed (see {@link getValue}).
 *
 * @internal
 */
export class ApifyKeyValueStoreBackend implements KeyValueStoreBackend {
    constructor(private readonly client: KeyValueStoreClient) {}

    async getMetadata(): Promise<KeyValueStoreInfo> {
        const metadata = await this.client.get();
        if (!metadata) {
            throw new Error('Key-value store not found or has been deleted.');
        }
        return metadata;
    }

    async drop(): Promise<void> {
        await this.client.delete();
    }

    async purge(): Promise<void> {
        throw new Error(
            'Purging a key-value store is not supported on the Apify platform. ' +
                'Use `drop()` to delete the store entirely, or open a new store instead.',
        );
    }

    async getValue(key: string): Promise<KeyValueStoreRecord | undefined> {
        // Storage backends are byte transports — the KeyValueStore frontend parses values
        // according to their content type, so the record must be returned unparsed.
        return this.client.getRecord(key, { buffer: true });
    }

    async setValue(record: KeyValueStoreInputRecord): Promise<void> {
        await this.client.setRecord(record as Parameters<KeyValueStoreClient['setRecord']>[0]);
    }

    async deleteValue(key: string): Promise<void> {
        await this.client.deleteRecord(key);
    }

    async listKeys(options?: KeyValueStoreListKeysOptions): Promise<KeyValueStoreListKeysResult> {
        const result = await this.client.listKeys(options);
        // The API does not report a content type for listed keys; crawlee's item shape
        // requires the field, so it is left undefined via the cast.
        return {
            ...result,
            items: result.items.map(({ key, size }) => ({ key, size }) as KeyValueStoreItemData),
        };
    }

    async getPublicUrl(key: string): Promise<string | undefined> {
        return this.client.getRecordPublicUrl(key);
    }

    async recordExists(key: string): Promise<boolean> {
        return this.client.recordExists(key);
    }
}
