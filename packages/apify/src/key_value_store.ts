import type { StorageManagerOptions } from '@crawlee/core';
import { KeyValueStore as CoreKeyValueStore } from '@crawlee/core';

import { createHmacSignature } from '@apify/utilities';

import type { Configuration } from './configuration.js';

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
        const config = this.config as Configuration;
        if (!config.get('isAtHome') && getPublicUrl) {
            return getPublicUrl.call(this, key);
        }

        const publicUrl = new URL(
            `${config.get('apiPublicBaseUrl')}/v2/key-value-stores/${this.id}/records/${key}`,
        );

        if (this.storageObject?.urlSigningSecretKey) {
            publicUrl.searchParams.append(
                'signature',
                createHmacSignature(
                    this.storageObject.urlSigningSecretKey as string,
                    key,
                ),
            );
        }

        return publicUrl.toString();
    }

    /**
     * @inheritDoc
     */
    static override async open(
        storeIdOrName?: string | null,
        options: StorageManagerOptions = {},
    ): Promise<KeyValueStore> {
        return super.open(storeIdOrName, options) as unknown as KeyValueStore;
    }
}

// @ts-ignore newer crawlee versions already declare this method in core
CoreKeyValueStore.prototype.getPublicUrl = KeyValueStore.prototype.getPublicUrl;
