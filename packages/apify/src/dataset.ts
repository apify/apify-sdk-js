import type { StorageManagerOptions } from '@crawlee/core';
import { Dataset as CoreDataset } from '@crawlee/core';

import { createStorageContentSignature } from '@apify/utilities';

import type { Configuration } from './configuration';

export class Dataset extends CoreDataset {
    /**
     * Generates a URL that can be used to access dataset items.
     *
     * If the client has permission to access the dataset's URL signing key,
     * the URL will include a signature to verify its authenticity.
     *
     * You can optionally control how long the signed URL should be valid using the `expiresInMillis` option.
     * This value sets the expiration duration in milliseconds from the time the URL is generated.
     * If not provided, the URL will not expire.
     *
     * Any other options (like `limit` or `prefix`) will be included as query parameters in the URL.
     */
    createItemsPublicUrl(expiresInMillis?: number): string | undefined {
        const config = this.config as Configuration;
        if (!config.get('isAtHome')) {
            return undefined;
        }

        const createItemsPublicUrl = new URL(
            `${config.get('apiPublicBaseUrl')}/v2/datasets/${this.id}/items`,
        );

        if (this.storageObject?.urlSigningSecretKey) {
            const signature = createStorageContentSignature({
                resourceId: this.id,
                urlSigningSecretKey: this.storageObject
                    .urlSigningSecretKey as string,
                expiresInMillis,
            });
            createItemsPublicUrl.searchParams.set('signature', signature);
        }

        return createItemsPublicUrl.toString();
    }

    /**
     * @inheritDoc
     */
    static override async open(
        storeIdOrName?: string | null,
        options: StorageManagerOptions = {},
    ): Promise<Dataset> {
        return super.open(storeIdOrName, options) as unknown as Dataset;
    }
}

// @ts-ignore newer crawlee versions already declare this method in core
CoreDataset.prototype.createItemsPublicUrl =
    Dataset.prototype.createItemsPublicUrl;
