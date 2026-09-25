import { KeyValueStoreClient } from 'apify-client';
import { describe, expect, test, vi } from 'vitest';

import { KeyValueStore } from '../../src/key_value_store.ts';

describe('KeyValueStore', () => {
    test('delegates remote record URLs to the API client', async () => {
        const client = Object.create(KeyValueStoreClient.prototype) as KeyValueStoreClient;
        const getRecordPublicUrl = vi
            .fn()
            .mockResolvedValue('https://api.apify.com/v2/key-value-stores/store/records/OUTPUT');
        Object.defineProperty(client, 'getRecordPublicUrl', { value: getRecordPublicUrl });

        const store = Object.create(KeyValueStore.prototype) as KeyValueStore;
        Object.defineProperty(store, 'client', { value: client });

        await expect(store.getRecordPublicUrl('OUTPUT')).resolves.toBe(
            'https://api.apify.com/v2/key-value-stores/store/records/OUTPUT',
        );
        expect(getRecordPublicUrl).toHaveBeenCalledWith('OUTPUT');
    });
});
