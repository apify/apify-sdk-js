import type { StorageOpenOptions } from '@crawlee/core';
import { KeyValueStore as CoreKeyValueStore } from '@crawlee/core';
import type { KeyValueStoreInfo } from '@crawlee/types';
import { KeyValueStoreClient as RemoteKeyValueStoreClient } from 'apify-client';

import { createHmacSignature } from '@apify/utilities';

import type { Configuration } from './configuration.js';

// crawlee v4 dropped the `storageObject` cache from `KeyValueStore`, so the
// per-store `urlSigningSecretKey` (which is part of the platform's metadata
// response but not declared on `@crawlee/types`' `KeyValueStoreInfo`) has to
// be fetched on demand and accessed through a structural-typed augmentation.
type ApifyKeyValueStoreInfo = KeyValueStoreInfo & {
    urlSigningSecretKey?: string;
};

/**
 * @inheritDoc
 */
export class KeyValueStore extends CoreKeyValueStore {
    /**
     * Returns a URL for the given key that may be used to publicly
     * access the value in the remote key-value store.
     *
     * On the Apify platform the URL is signed with the store's
     * `urlSigningSecretKey` so that anyone with the URL can read the record
     * without authentication. Locally we delegate to crawlee's default
     * implementation (which produces a `file://` URL or returns `undefined`).
     */
    override async getPublicUrl(key: string): Promise<string | undefined> {
        const config = this.config as Configuration;

        // Detect a remote (Apify) store by its client type rather than by
        // `isAtHome`, so that a `forceCloud` store opened locally still gets a
        // signed Apify URL (matching the platform behaviour). `client` is
        // `private` on `CoreKeyValueStore`, so bypass the visibility check.
        const { client } = this as unknown as { client: unknown };
        const isLocalStore = !(client instanceof RemoteKeyValueStoreClient);

        if (isLocalStore) {
            return super.getPublicUrl(key);
        }

        const publicUrl = new URL(`${config.apiPublicBaseUrl}/v2/key-value-stores/${this.id}/records/${key}`);

        const metadata = (await (
            client as unknown as { getMetadata(): Promise<KeyValueStoreInfo> }
        ).getMetadata()) as ApifyKeyValueStoreInfo;

        if (metadata?.urlSigningSecretKey) {
            publicUrl.searchParams.append('signature', createHmacSignature(metadata.urlSigningSecretKey, key));
        }

        return publicUrl.toString();
    }

    /**
     * @inheritDoc
     */
    static override async open(
        storeIdOrName?: string | null,
        options: StorageOpenOptions = {},
    ): Promise<KeyValueStore> {
        return super.open(storeIdOrName, options) as unknown as KeyValueStore;
    }
}
