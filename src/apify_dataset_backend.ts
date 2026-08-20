import type { DatasetBackend, DatasetBackendListOptions, DatasetInfo, Dictionary, PaginatedList } from '@crawlee/types';
import type { DatasetClient } from 'apify-client';
import { MAX_PAYLOAD_SIZE_BYTES } from '@apify/consts';

/** Slight reduction of the API's 9MB payload limit, to stay safely below it. */
const SAFETY_BUFFER_PERCENT = 0.01 / 100; // 0.01%
const EFFECTIVE_LIMIT_BYTES = MAX_PAYLOAD_SIZE_BYTES - Math.ceil(MAX_PAYLOAD_SIZE_BYTES * SAFETY_BUFFER_PERCENT);

/** Per-item ceiling — 2 bytes under the chunk limit, so even a lone item fits its `[]` wrapper. */
const MAX_ITEM_BYTES = EFFECTIVE_LIMIT_BYTES - 2;

/**
 * Implements crawlee v4's {@link DatasetBackend} interface on top of `apify-client`'s
 * dataset API. Mostly a thin method-mapping wrapper (`getMetadata`/`get`, `drop`/`delete`,
 * `getData`/`listItems`), except `pushData`, which also splits large pushes into chunks
 * fitting the API's payload size limit.
 *
 * @internal
 */
export class ApifyDatasetBackend implements DatasetBackend {
    /** @param onDropped Lets the owning backend know the dataset is gone, so it never resolves to it again. */
    constructor(
        private readonly client: DatasetClient,
        private readonly onDropped?: () => void,
    ) {}

    async getMetadata(): Promise<DatasetInfo> {
        const metadata = await this.client.get();
        if (!metadata) {
            throw new Error('Dataset not found or has been deleted.');
        }
        return metadata;
    }

    async drop(): Promise<void> {
        await this.client.delete();
        this.onDropped?.();
    }

    // No `purge()`: datasets are append-only here — the API can delete a whole dataset but not its items —
    // and dropping the run's default dataset would change the id the run advertises. An absent `purge` makes
    // `Dataset.purge()` say so instead of emulating it.

    async pushData(items: Dictionary[]): Promise<void> {
        // The platform API rejects payloads over 9MB — split the items into chunks
        // that fit, pushed sequentially to preserve item order.
        const payloads = items.map((item, index) => serializeToSizeLimit(item, index));
        for (const chunk of chunkBySize(payloads, EFFECTIVE_LIMIT_BYTES)) {
            await this.client.pushItems(chunk);
        }
    }

    async getData(options?: DatasetBackendListOptions): Promise<PaginatedList<Dictionary>> {
        return await this.client.listItems(options);
    }
}

/** Serializes a dataset item, throwing if it alone exceeds the payload size limit. */
function serializeToSizeLimit(item: Dictionary, index: number): string {
    const payload = JSON.stringify(item);
    const bytes = Buffer.byteLength(payload);
    if (bytes > MAX_ITEM_BYTES) {
        throw new Error(
            `Data item at index ${index} is too large (size: ${bytes} bytes, limit: ${MAX_ITEM_BYTES} bytes)`,
        );
    }
    return payload;
}

/**
 * Takes an array of JSON-serialized items and groups them into JSON array strings
 * of at most `limitBytes` each, preserving item order. Assumes (and does not
 * validate) that no single item exceeds the limit.
 */
function chunkBySize(payloads: string[], limitBytes: number): string[] {
    const chunks: string[][] = [];
    let chunkBytes = Infinity; // Forces the first item to open a new chunk.

    for (const payload of payloads) {
        const bytes = Buffer.byteLength(payload);
        if (chunkBytes + bytes + 1 <= limitBytes) {
            // Fits into the current chunk — add 1 byte for the ',' separator.
            chunks[chunks.length - 1].push(payload);
            chunkBytes += bytes + 1;
        } else {
            // Open a new chunk — add 2 bytes for the '[]' wrapper.
            chunks.push([payload]);
            chunkBytes = bytes + 2;
        }
    }

    return chunks.map((chunk) => `[${chunk.join(',')}]`);
}
