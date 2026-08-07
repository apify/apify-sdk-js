import type { ApifyClient } from 'apify-client';
import { describe, expect, test, vi } from 'vitest';

import { ApifyStorageBackend } from '../../src/apify_storage_backend.js';
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

    test('partitions the storage cache by API credentials', () => {
        const client = createMockApifyClient();
        const backend = new ApifyStorageBackend(asApifyClient(client));
        const sameCredentials = new ApifyStorageBackend(asApifyClient(client));
        const otherToken = new ApifyStorageBackend(asApifyClient({ ...client, token: 'other-token' }));

        expect(backend.getStorageBackendCacheKey()).toBe(sameCredentials.getStorageBackendCacheKey());
        expect(backend.getStorageBackendCacheKey()).not.toBe(otherToken.getStorageBackendCacheKey());
    });
});
