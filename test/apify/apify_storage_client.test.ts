import { Configuration } from 'apify';
import { ApifyStorageClient } from 'apify/apify_storage_client.js';
import { describe, expect, it } from 'vitest';

// Minimal apify-client stub: each resource accessor echoes back the id it got.
function stubClient() {
    return {
        dataset: (id: string) => ({ id }),
        keyValueStore: (id: string) => ({ id }),
        requestQueue: (id: string) => ({ id }),
    };
}

describe('ApifyStorageClient default-storage id resolution', () => {
    it("maps crawlee's `__default__` alias (no id/name) to the configured default ids", async () => {
        const config = new Configuration();
        const sc = new ApifyStorageClient(stubClient() as any, config);

        const ds = (await sc.createDatasetClient({
            alias: '__default__',
        } as any)) as any;
        const kvs = (await sc.createKeyValueStoreClient({
            alias: '__default__',
        } as any)) as any;
        const rq = (await sc.createRequestQueueClient({
            alias: '__default__',
        } as any)) as any;

        expect(ds.id).toBe(config.defaultDatasetId);
        expect(kvs.id).toBe(config.defaultKeyValueStoreId);
        expect(rq.id).toBe(config.defaultRequestQueueId);
        // apify-client rejects empty ids — the whole point of the fix.
        expect(ds.id).not.toBe('');
    });

    it('still honours an explicit id', async () => {
        const sc = new ApifyStorageClient(
            stubClient() as any,
            new Configuration(),
        );
        const ds = (await sc.createDatasetClient({
            id: 'explicit',
        } as any)) as any;
        expect(ds.id).toBe('explicit');
    });
});
