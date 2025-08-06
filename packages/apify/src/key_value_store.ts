import type { StorageManagerOptions } from '@crawlee/core';
import { KeyValueStore as CoreKeyValueStore } from '@crawlee/core';

import {
    createHmacSignature,
    createStorageContentSignature,
} from '@apify/utilities';

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
     * Generates a URL that can be used to access key-value store keys.
     *
     * If the client has permission to access the key-value store's URL signing key,
     * the URL will include a signature to verify its authenticity.
     *
     * You can optionally control how long the signed URL should be valid using the `expiresInMillis` option.
     * This value sets the expiration duration in milliseconds from the time the URL is generated.
     * If not provided, the URL will not expire.
     *
     * Any other options (like `limit` or `prefix`) will be included as query parameters in the URL.
     */
    createKeysPublicUrl(expiresInMillis?: number): string | undefined {
        const config = this.config as Configuration;
        if (!config.get('isAtHome')) {
            return undefined;
        }

        const createKeysPublicUrl = new URL(
            `${config.get('apiPublicBaseUrl')}/v2/key-value-stores/${this.id}/keys`,
        );

        if (this.storageObject?.urlSigningSecretKey) {
            const signature = createStorageContentSignature({
                resourceId: this.id,
                urlSigningSecretKey: this.storageObject
                    .urlSigningSecretKey as string,
                expiresInMillis,
            });
            createKeysPublicUrl.searchParams.set('signature', signature);
        }

        return createKeysPublicUrl.toString();
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
