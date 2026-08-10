import type { ApifyClient, DatasetClient, KeyValueStoreClient } from 'apify-client';
import { DatasetClient as ApifyDatasetClient } from 'apify-client';
import { describe, expect, test, vi } from 'vitest';

import { MAX_PAYLOAD_SIZE_BYTES } from '@apify/consts';

import { ApifyDatasetBackend } from '../../src/apify_dataset_backend.js';
import { ApifyKeyValueStoreBackend } from '../../src/apify_key_value_store_backend.js';
import { ApifyRequestQueueSharedBackend } from '../../src/apify_request_queue_shared_backend.js';
import { ApifyRequestQueueSingleBackend } from '../../src/apify_request_queue_single_backend.js';
import { ApifyStorageBackend, USES_PUSH_DATA_INTERCEPTION } from '../../src/apify_storage_backend.js';
import { DEFAULT_DATASET_ITEM_EVENT } from '../../src/charging.js';
import { Configuration } from '../../src/configuration.js';

function createMockApifyClient() {
    let unnamedCounter = 0;
    const getOrCreate = vi.fn(async (name?: string) => ({
        id: name ? `id-of-${name}` : `unnamed-${++unnamedCounter}`,
    }));
    return {
        baseUrl: 'https://api.apify.com/v2',
        publicBaseUrl: 'https://api.apify.com',
        token: 'test-token',
        httpClient: {},
        dataset: vi.fn(() => ({ get: vi.fn(async () => undefined) })),
        keyValueStore: vi.fn(() => ({ get: vi.fn(async () => undefined) })),
        requestQueue: vi.fn(() => ({ get: vi.fn(async () => undefined) })),
        datasets: vi.fn(() => ({ getOrCreate })),
        keyValueStores: vi.fn(() => ({ getOrCreate })),
        requestQueues: vi.fn(() => ({ getOrCreate })),
        getOrCreate,
    };
}

type MockApifyClient = ReturnType<typeof createMockApifyClient>;

function asApifyClient(mock: MockApifyClient): ApifyClient {
    return mock as unknown as ApifyClient;
}

describe('ApifyStorageBackend', () => {
    test('picks the request queue backend implementation by access mode', async () => {
        const client = createMockApifyClient();
        const configuration = new Configuration({ defaultRequestQueueId: 'default-rq' });
        const single = new ApifyStorageBackend(asApifyClient(client), { configuration });
        const shared = new ApifyStorageBackend(asApifyClient(client), { configuration, requestQueueAccess: 'shared' });

        await expect(single.createRequestQueueBackend()).resolves.toBeInstanceOf(ApifyRequestQueueSingleBackend);
        await expect(shared.createRequestQueueBackend()).resolves.toBeInstanceOf(ApifyRequestQueueSharedBackend);
    });

    test('passes a run-scoped clientKey to the request queue client', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ defaultRequestQueueId: 'default-rq', actorRunId: 'test-run-id' }),
        });

        await backend.createRequestQueueBackend();

        expect(client.requestQueue).toHaveBeenCalledWith('default-rq', { clientKey: 'test-run-id' });
    });

    test('resolves the reserved __default__ alias to the default storage id', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ defaultDatasetId: 'default-dataset' }),
        });

        await backend.createDatasetBackend({ alias: '__default__' });

        expect(client.dataset).toHaveBeenCalledWith('default-dataset');
    });

    test('resolves aliases declared in the Actor schema storages', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({
                isAtHome: true,
                actorStoragesJson: JSON.stringify({ datasets: { results: 'declared-dataset-id' } }),
            }),
        });

        await backend.createDatasetBackend({ alias: 'results' });

        expect(client.dataset).toHaveBeenCalledWith('declared-dataset-id');
    });

    test('rejects undeclared aliases on the platform', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ isAtHome: true }),
        });

        await expect(backend.createDatasetBackend({ alias: 'unknown' })).rejects.toThrow(
            /alias "unknown" cannot be resolved/,
        );
    });

    test('creates one unnamed storage per alias outside the platform', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ isAtHome: false }),
        });

        await backend.createDatasetBackend({ alias: 'scratch' });
        await backend.createDatasetBackend({ alias: 'scratch' });

        expect(client.getOrCreate).toHaveBeenCalledTimes(1);
        expect(client.dataset).toHaveBeenNthCalledWith(1, 'unnamed-1');
        expect(client.dataset).toHaveBeenNthCalledWith(2, 'unnamed-1');
    });

    test('opens named storages via getOrCreate', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client));

        await backend.createKeyValueStoreBackend({ name: 'my-store' });

        expect(client.getOrCreate).toHaveBeenCalledWith('my-store');
        expect(client.keyValueStore).toHaveBeenCalledWith('id-of-my-store');
    });

    test('partitions the storage cache by API credentials, not by access mode', () => {
        const client = createMockApifyClient();
        const single = new ApifyStorageBackend(asApifyClient(client));
        const shared = new ApifyStorageBackend(asApifyClient(client), { requestQueueAccess: 'shared' });
        const otherToken = new ApifyStorageBackend(asApifyClient({ ...client, token: 'other-token' }));

        expect(single.getStorageBackendCacheKey()).toBe(shared.getStorageBackendCacheKey());
        expect(single.getStorageBackendCacheKey()).not.toBe(otherToken.getStorageBackendCacheKey());
    });

    test('marks the default dataset backend for push-data interception on pay-per-event runs', async () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ defaultDatasetId: 'default-dataset' }),
            getChargingManager: () =>
                ({
                    getPricingInfo: () => ({ perEventPrices: { [DEFAULT_DATASET_ITEM_EVENT]: {} } }),
                }) as never,
        });

        const defaultDataset = await backend.createDatasetBackend({ id: 'default-dataset' });
        const otherDataset = await backend.createDatasetBackend({ id: 'other-dataset' });

        expect((defaultDataset as never)[USES_PUSH_DATA_INTERCEPTION]).toBe(true);
        expect((otherDataset as never)[USES_PUSH_DATA_INTERCEPTION]).toBeUndefined();
    });

    test('charges per parsed item when the backend splits a push into chunks', async () => {
        const client = createMockApifyClient();
        const charge = vi.fn(async ({ count }: { eventName: string; count: number }) => ({
            eventChargeLimitReached: false,
            chargedCount: count,
            chargeableWithinLimit: {},
        }));
        const calculatePushDataLimits = vi.fn(({ items }: { items: Record<string, unknown>[] }) => ({
            limitedItems: items,
            eventsToCharge: { [DEFAULT_DATASET_ITEM_EVENT]: items.length },
        }));
        const backend = new ApifyStorageBackend(asApifyClient(client), {
            configuration: new Configuration({ defaultDatasetId: 'default-dataset' }),
            getChargingManager: () =>
                ({
                    getPricingInfo: () => ({ perEventPrices: { [DEFAULT_DATASET_ITEM_EVENT]: {} } }),
                    calculatePushDataLimits,
                    charge,
                }) as never,
        });
        const dataset = await backend.createDatasetBackend({ id: 'default-dataset' });

        // Stub out the plain-client push underneath the charging wrapper.
        const pushSpy = vi.spyOn(ApifyDatasetClient.prototype, 'pushItems').mockResolvedValue(undefined);
        try {
            // Four ~3MB items arrive as multiple pre-serialized JSON chunks — the charging
            // wrapper must still count every logical item exactly once.
            const items = Array.from({ length: 4 }, (_, i) => ({ i, payload: 'a'.repeat(3 * 1024 * 1024) }));
            await dataset.pushData(items);

            expect(pushSpy.mock.calls.length).toBeGreaterThan(1);
            const countedItems = calculatePushDataLimits.mock.calls.map(([{ items: counted }]) => counted);
            expect(countedItems.flat()).toEqual(items);
            const chargedCounts = charge.mock.calls.map(([{ count }]) => count);
            expect(chargedCounts.reduce((sum, count) => sum + count, 0)).toBe(4);
        } finally {
            pushSpy.mockRestore();
        }
    });
});

describe('ApifyDatasetBackend', () => {
    function createMockDatasetClient() {
        return {
            get: vi.fn(async () => ({ id: 'dataset-id', itemCount: 0 })),
            delete: vi.fn(async () => {}),
            pushItems: vi.fn(async (_items: unknown) => {}),
            listItems: vi.fn(async () => ({ items: [{ foo: 'bar' }], total: 1, count: 1, offset: 0, limit: 10 })),
        };
    }

    // Mirrors the backend's per-item ceiling: 9MB API limit - 0.01% safety buffer - 2 bytes for '[]'.
    const maxItemBytes = MAX_PAYLOAD_SIZE_BYTES - Math.ceil(MAX_PAYLOAD_SIZE_BYTES * 0.0001) - 2;

    test('maps the backend interface onto the apify-client dataset client', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        await expect(backend.getMetadata()).resolves.toEqual({ id: 'dataset-id', itemCount: 0 });

        await backend.pushData([{ foo: 'bar' }]);
        expect(client.pushItems).toHaveBeenCalledWith('[{"foo":"bar"}]');

        await expect(backend.getData({ limit: 10 })).resolves.toEqual(
            expect.objectContaining({ items: [{ foo: 'bar' }], total: 1 }),
        );
        expect(client.listItems).toHaveBeenCalledWith({ limit: 10 });

        await backend.drop();
        expect(client.delete).toHaveBeenCalled();
    });

    test('getMetadata throws when the dataset no longer exists, and purge is unsupported', async () => {
        const client = createMockDatasetClient();
        client.get.mockResolvedValue(undefined as never);
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        await expect(backend.getMetadata()).rejects.toThrow(/not found/);
        await expect(backend.purge()).rejects.toThrow(/not supported on the Apify platform/);
    });

    test('splits pushes exceeding the 9MB payload limit into multiple API calls', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        // Four ~3MB items (~12MB total) cannot fit into a single 9MB request.
        const items = Array.from({ length: 4 }, (_, i) => ({ i, payload: 'a'.repeat(3 * 1024 * 1024) }));
        await backend.pushData(items);

        const chunks = client.pushItems.mock.calls.map(([chunk]) => chunk as string);
        expect(chunks.length).toBeGreaterThan(1);
        for (const chunk of chunks) {
            expect(Buffer.byteLength(chunk)).toBeLessThanOrEqual(MAX_PAYLOAD_SIZE_BYTES);
        }
        // All items arrive, in the original order.
        expect(chunks.flatMap((chunk) => JSON.parse(chunk))).toEqual(items);
    });

    test('pushing an empty array makes no API call', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        await backend.pushData([]);
        expect(client.pushItems).not.toHaveBeenCalled();
    });

    test('rejects an item that alone exceeds the payload limit', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        await expect(backend.pushData([{ ok: true }, { payload: 'a'.repeat(10 * 1024 * 1024) }])).rejects.toThrow(
            /Data item at index 1 is too large/,
        );
        expect(client.pushItems).not.toHaveBeenCalled();
    });

    test('accepts an item at exactly the per-item limit and rejects one byte over', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        // `{"payload":"a…a"}` serializes to n + 14 bytes.
        const maxPayload = 'a'.repeat(maxItemBytes - 14);

        await backend.pushData([{ payload: maxPayload }]);
        expect(client.pushItems).toHaveBeenCalledTimes(1);
        const chunk = client.pushItems.mock.calls[0][0] as string;
        expect(Buffer.byteLength(chunk)).toBeLessThanOrEqual(MAX_PAYLOAD_SIZE_BYTES);

        await expect(backend.pushData([{ payload: `${maxPayload}a` }])).rejects.toThrow(
            /Data item at index 0 is too large/,
        );
    });

    test('measures item size in bytes, not string characters', async () => {
        const client = createMockDatasetClient();
        const backend = new ApifyDatasetBackend(client as unknown as DatasetClient);

        // 'é' is one character but two UTF-8 bytes — the item is far below the
        // limit in characters, yet just over it in bytes, so it must be rejected.
        const item = { payload: 'é'.repeat(Math.ceil(maxItemBytes / 2)) };
        expect(JSON.stringify(item).length).toBeLessThan(maxItemBytes);

        await expect(backend.pushData([item])).rejects.toThrow(/Data item at index 0 is too large/);
        expect(client.pushItems).not.toHaveBeenCalled();
    });
});

describe('ApifyKeyValueStoreBackend', () => {
    function createMockKvsClient() {
        return {
            get: vi.fn(async () => ({ id: 'store-id' })),
            delete: vi.fn(async () => {}),
            getRecord: vi.fn(async () => ({ key: 'INPUT', value: Buffer.from('{}'), contentType: 'application/json' })),
            setRecord: vi.fn(async () => {}),
            deleteRecord: vi.fn(async () => {}),
            listKeys: vi.fn(async () => ({
                items: [{ key: 'INPUT', size: 2, recordPublicUrl: 'https://example.com' }],
                count: 1,
                limit: 1000,
                exclusiveStartKey: undefined,
                isTruncated: false,
                nextExclusiveStartKey: undefined,
            })),
            getRecordPublicUrl: vi.fn(async () => 'https://example.com/INPUT'),
            recordExists: vi.fn(async () => true),
        };
    }

    test('reads records as raw bytes so the frontend can do the parsing', async () => {
        const client = createMockKvsClient();
        const backend = new ApifyKeyValueStoreBackend(client as unknown as KeyValueStoreClient);

        const record = await backend.getValue('INPUT');

        expect(client.getRecord).toHaveBeenCalledWith('INPUT', { buffer: true });
        expect(record?.value).toBeInstanceOf(Buffer);
    });

    test('maps the backend interface onto the apify-client store client', async () => {
        const client = createMockKvsClient();
        const backend = new ApifyKeyValueStoreBackend(client as unknown as KeyValueStoreClient);

        await backend.setValue({ key: 'OUTPUT', value: '{}', contentType: 'application/json' });
        expect(client.setRecord).toHaveBeenCalledWith({ key: 'OUTPUT', value: '{}', contentType: 'application/json' });

        await backend.deleteValue('OUTPUT');
        expect(client.deleteRecord).toHaveBeenCalledWith('OUTPUT');

        await expect(backend.listKeys({ limit: 1000 })).resolves.toEqual(
            expect.objectContaining({ items: [{ key: 'INPUT', size: 2 }], isTruncated: false }),
        );
        await expect(backend.recordExists('INPUT')).resolves.toBe(true);
        await expect(backend.getPublicUrl('INPUT')).resolves.toBe('https://example.com/INPUT');
    });

    test('getMetadata throws when the store no longer exists, and purge is unsupported', async () => {
        const client = createMockKvsClient();
        client.get.mockResolvedValue(undefined as never);
        const backend = new ApifyKeyValueStoreBackend(client as unknown as KeyValueStoreClient);

        await expect(backend.getMetadata()).rejects.toThrow(/not found/);
        await expect(backend.purge()).rejects.toThrow(/not supported on the Apify platform/);
    });
});
