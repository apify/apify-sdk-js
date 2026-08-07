import type { DatasetBackend, DatasetBackendListOptions, DatasetInfo, Dictionary, PaginatedList } from '@crawlee/types';
import type { DatasetClient } from 'apify-client';

/**
 * Implements crawlee v4's {@link DatasetBackend} interface on top of `apify-client`'s
 * dataset API. A thin method-mapping wrapper — the interfaces differ only in naming
 * (`getMetadata`/`get`, `drop`/`delete`, `pushData`/`pushItems`, `getData`/`listItems`).
 *
 * @internal
 */
export class ApifyDatasetBackend implements DatasetBackend {
    constructor(private readonly client: DatasetClient) {}

    async getMetadata(): Promise<DatasetInfo> {
        const metadata = await this.client.get();
        if (!metadata) {
            throw new Error('Dataset not found or has been deleted.');
        }
        return metadata;
    }

    async drop(): Promise<void> {
        await this.client.delete();
    }

    async purge(): Promise<void> {
        throw new Error(
            'Purging a dataset is not supported on the Apify platform. ' +
                'Use `drop()` to delete the dataset entirely, or open a new dataset instead.',
        );
    }

    async pushData(items: Dictionary[]): Promise<void> {
        await this.client.pushItems(items);
    }

    async getData(options?: DatasetBackendListOptions): Promise<PaginatedList<Dictionary>> {
        return await this.client.listItems(options);
    }
}
