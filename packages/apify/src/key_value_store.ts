import type { StorageManagerOptions } from '@crawlee/core';
import { KeyValueStore as CoreKeyValueStore } from '@crawlee/core';

/**
 * @inheritDoc
 */
export class KeyValueStore extends CoreKeyValueStore {
    /**
     * Returns a URL for the given key that may be used to publicly
     * access the value in the remote key-value store.
     */
    getPublicUrl(key: string): string {
        return `https://api.apify.com/v2/key-value-stores/${this.id}/records/${key}`;
    }

    /**
     * @inheritDoc
     */
    static override async open(storeIdOrName?: string | null, options: StorageManagerOptions = {}): Promise<KeyValueStore> {
        return super.open(storeIdOrName, options) as unknown as KeyValueStore;
    }
}

// @ts-expect-error extension of the core class to make this only a type-issue
CoreKeyValueStore.prototype.getPublicUrl = KeyValueStore.prototype.getPublicUrl;
