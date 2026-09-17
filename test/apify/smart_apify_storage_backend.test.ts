import type { DatasetBackend, StorageBackend } from '@crawlee/types';
import { describe, expect, onTestFinished, test, vi } from 'vitest';

import { Configuration } from '../../src/configuration.js';
import { SmartApifyStorageBackend } from '../../src/smart_apify_storage_backend.js';

function createMockBackend(cacheKey: string) {
    return {
        createDatasetBackend: vi.fn(async () => ({}) as DatasetBackend),
        createKeyValueStoreBackend: vi.fn(),
        createRequestQueueBackend: vi.fn(),
        getStorageBackendCacheKey: vi.fn(() => cacheKey),
        purge: vi.fn(async () => {}),
    } as unknown as StorageBackend & { purge: () => Promise<void> };
}

function createSmartBackend(configuration: Configuration) {
    const cloudStorageBackend = createMockBackend('cloud');
    const localStorageBackend = createMockBackend('local');
    const backend = new SmartApifyStorageBackend({ cloudStorageBackend, localStorageBackend, configuration });
    return { backend, cloudStorageBackend, localStorageBackend };
}

describe('SmartApifyStorageBackend', () => {
    test('opens storages locally when the Actor does not run on the platform', async () => {
        const { backend, cloudStorageBackend, localStorageBackend } = createSmartBackend(new Configuration());

        await backend.createDatasetBackend({ alias: 'results' });
        await backend.purge();

        expect(localStorageBackend.createDatasetBackend).toHaveBeenCalledWith({ alias: 'results' });
        expect(localStorageBackend.purge).toHaveBeenCalled();
        expect(cloudStorageBackend.createDatasetBackend).not.toHaveBeenCalled();
        expect(cloudStorageBackend.purge).not.toHaveBeenCalled();
        expect(backend.getStorageBackendCacheKey()).toBe('local');
    });

    test('opens storages in the cloud when the Actor runs on the platform', async () => {
        const { backend, cloudStorageBackend, localStorageBackend } = createSmartBackend(
            new Configuration({ isAtHome: true }),
        );

        await backend.createDatasetBackend({ alias: 'results' });

        expect(cloudStorageBackend.createDatasetBackend).toHaveBeenCalledWith({ alias: 'results' });
        expect(localStorageBackend.createDatasetBackend).not.toHaveBeenCalled();
        expect(backend.getStorageBackendCacheKey()).toBe('cloud');
    });

    test('forceCloud reaches the cloud backend from a local run', () => {
        const { backend, cloudStorageBackend } = createSmartBackend(new Configuration({ token: 'some-token' }));

        expect(backend.getSuitableStorageBackend({ forceCloud: true })).toBe(cloudStorageBackend);
    });

    test('forceCloud without a token explains what is missing', () => {
        // `Configuration` resolves the token from the environment, which the developer machine
        // running the tests may well have set.
        vi.stubEnv('APIFY_TOKEN', undefined);
        onTestFinished(() => {
            vi.unstubAllEnvs();
        });

        const { backend } = createSmartBackend(new Configuration());

        expect(() => backend.getSuitableStorageBackend({ forceCloud: true })).toThrow(/APIFY_TOKEN/);
    });
});
