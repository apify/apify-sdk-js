import type { DatasetBackend, StorageBackend } from '@crawlee/types';
import type { DatasetClient } from 'apify-client';
import type { Mock } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import { ApifyDatasetBackend } from '../../src/apify_dataset_backend.js';
import type { ChargingManager } from '../../src/charging.js';
import { DEFAULT_DATASET_ITEM_EVENT } from '../../src/charging.js';
import { ChargingStorageBackend } from '../../src/charging_storage_backend.js';
import { Configuration } from '../../src/configuration.js';

interface ChargingManagerMock {
    isInitialized: boolean;
    isPayPerEvent: boolean;
    charge: Mock;
    calculatePushDataLimit: Mock;
    withChargeLock: Mock;
}

function createChargingManagerMock(options: { limit?: number; isPayPerEvent?: boolean } = {}): ChargingManagerMock {
    return {
        isInitialized: true,
        isPayPerEvent: options.isPayPerEvent ?? true,
        charge: vi.fn(async () => ({
            eventChargeLimitReached: false,
            chargedCount: 0,
            chargeableWithinLimit: {},
        })),
        calculatePushDataLimit: vi.fn((itemsCount: number) => options.limit ?? itemsCount),
        withChargeLock: vi.fn(async (fn: () => Promise<unknown>) => fn()),
    };
}

function createBackend(inner: Partial<StorageBackend>, chargingManager: ChargingManagerMock): ChargingStorageBackend {
    return new ChargingStorageBackend(inner as StorageBackend, {
        configuration: new Configuration({ defaultDatasetId: 'default-dataset' }),
        getChargingManager: () => chargingManager as unknown as ChargingManager,
    });
}

describe('ChargingStorageBackend', () => {
    test('charges the synthetic event once for a push the inner backend splits into chunks', async () => {
        // Four ~3MB items exceed the API's payload limit, so `ApifyDatasetBackend` sends several
        // requests. Charging sits above that, so the run is billed for 4 items, not 4 per chunk.
        const pushItems = vi.fn(async () => {});
        const inner = new ApifyDatasetBackend({ pushItems } as unknown as DatasetClient);
        const chargingManager = createChargingManagerMock();
        const backend = createBackend({ createDatasetBackend: async () => inner }, chargingManager);

        const dataset = await backend.createDatasetBackend({ alias: '__default__' });
        await dataset.pushData(Array.from({ length: 4 }, (_, i) => ({ i, payload: 'a'.repeat(3 * 1024 * 1024) })));

        expect(pushItems.mock.calls.length).toBeGreaterThan(1);
        expect(chargingManager.charge).toHaveBeenCalledExactlyOnceWith({
            eventName: DEFAULT_DATASET_ITEM_EVENT,
            count: 4,
        });
    });

    test.each([
        ['a non-default id', { id: 'other-dataset' }],
        ['an explicit alias', { alias: 'scratch' }],
    ])('leaves %s uncharged', async (_, identifier) => {
        const pushData = vi.fn(async () => {});
        const chargingManager = createChargingManagerMock();
        const backend = createBackend(
            { createDatasetBackend: async () => ({ pushData }) as unknown as DatasetBackend },
            chargingManager,
        );

        const dataset = await backend.createDatasetBackend(identifier);
        await dataset.pushData([{ a: 1 }]);

        expect(pushData).toHaveBeenCalledWith([{ a: 1 }]);
        expect(chargingManager.charge).not.toHaveBeenCalled();
    });

    test('charges the default dataset addressed by its id', async () => {
        const pushData = vi.fn(async () => {});
        const chargingManager = createChargingManagerMock();
        const backend = createBackend(
            { createDatasetBackend: async () => ({ pushData }) as unknown as DatasetBackend },
            chargingManager,
        );

        const dataset = await backend.createDatasetBackend({ id: 'default-dataset' });
        await dataset.pushData([{ a: 1 }]);

        expect(chargingManager.charge).toHaveBeenCalledWith({
            eventName: DEFAULT_DATASET_ITEM_EVENT,
            count: 1,
        });
    });

    test('does not consult the charging manager outside pay-per-event runs', async () => {
        const pushData = vi.fn(async () => {});
        const chargingManager = createChargingManagerMock({ isPayPerEvent: false });
        const backend = createBackend(
            { createDatasetBackend: async () => ({ pushData }) as unknown as DatasetBackend },
            chargingManager,
        );

        const dataset = await backend.createDatasetBackend();
        await dataset.pushData([{ a: 1 }]);

        expect(pushData).toHaveBeenCalledWith([{ a: 1 }]);
        expect(chargingManager.withChargeLock).not.toHaveBeenCalled();
        expect(chargingManager.charge).not.toHaveBeenCalled();
    });

    test('keeps optional backend members absent when the wrapped backend lacks them', async () => {
        const chargingManager = createChargingManagerMock();
        const withoutOptionals = createBackend(
            { createDatasetBackend: async () => ({}) as DatasetBackend },
            chargingManager,
        );
        const withOptionals = createBackend(
            {
                createDatasetBackend: async () => ({}) as DatasetBackend,
                storageExists: async () => true,
                purge: async () => {},
                teardown: async () => {},
            },
            chargingManager,
        );

        // Crawlee treats a missing `storageExists` as "cannot resolve a string to an id", and a
        // missing `purge` / `teardown` as "nothing to do", so presence has to survive wrapping.
        expect(withoutOptionals.storageExists).toBeUndefined();
        expect(withoutOptionals.purge).toBeUndefined();
        expect(withoutOptionals.teardown).toBeUndefined();
        await expect(withOptionals.storageExists!('some-id', 'Dataset')).resolves.toBe(true);
        expect(withOptionals.purge).toBeDefined();
        expect(withOptionals.teardown).toBeDefined();
    });

    test('reuses the wrapped backend cache key so wrapping does not split the storage cache', () => {
        const chargingManager = createChargingManagerMock();
        const keyed = createBackend(
            { createDatasetBackend: async () => ({}) as DatasetBackend, getStorageBackendCacheKey: () => 'inner-key' },
            chargingManager,
        );
        const unkeyed = createBackend({ createDatasetBackend: async () => ({}) as DatasetBackend }, chargingManager);

        expect(keyed.getStorageBackendCacheKey()).toBe('inner-key');
        // Crawlee's own fallback for a backend without the method.
        expect(unkeyed.getStorageBackendCacheKey()).toBe('Object');
    });
});
