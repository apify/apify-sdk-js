import type { StorageManagerOptions } from '@crawlee/core';
import { KeyValueStore as CoreKeyValueStore } from '@crawlee/core';

import type { Configuration } from './configuration';

// @ts-ignore newer crawlee versions already declare this method in core
const { getPublicUrl } = CoreKeyValueStore.prototype;

/**
 * @inheritDoc
 */
export class KeyValueStore extends CoreKeyValueStore {
    /**
     * Returns a URL for the given key that may be used to publicly
     * access the value in the remote key-value store.
     */
    override getPublicUrl(key: string): string {
        if (!(this.config as Configuration).get('isAtHome') && getPublicUrl) {
            return getPublicUrl.call(this, key);
        }

        return `https://api.apify.com/v2/key-value-stores/${this.id}/records/${key}`;
    }

    /**
     * @inheritDoc
     */
    static override async open(storeIdOrName?: string | null, options: StorageManagerOptions = {}): Promise<KeyValueStore> {
        return super.open(storeIdOrName, options) as unknown as KeyValueStore;
    }
}

// @ts-ignore newer crawlee versions already declare this method in core
CoreKeyValueStore.prototype.getPublicUrl = KeyValueStore.prototype.getPublicUrl;
