import type { RequestSchema } from '@crawlee/types';
import type { RequestQueueClient } from 'apify-client';
import { describe, expect, test, vi } from 'vitest';

import { uniqueKeyToRequestId } from '../../src/apify_request_queue_backend.js';
import { ApifyRequestQueueSharedBackend } from '../../src/apify_request_queue_shared_backend.js';
import { ApifyRequestQueueSingleBackend } from '../../src/apify_request_queue_single_backend.js';

function request(uniqueKey: string, extra: Partial<RequestSchema> = {}): RequestSchema {
    return { url: `https://example.com/${uniqueKey}`, uniqueKey, ...extra };
}

function id(uniqueKey: string): string {
    return uniqueKeyToRequestId(uniqueKey);
}

/**
 * A mocked `apify-client` request queue client. Every method is a `vi.fn()`; the defaults emulate
 * an empty queue and a platform that accepts everything.
 */
function createMockApiClient() {
    return {
        get: vi.fn(async () => ({
            id: 'queue-id',
            name: undefined,
            createdAt: new Date('2025-01-01'),
            modifiedAt: new Date('2025-01-01'),
            accessedAt: new Date('2025-01-01'),
            totalRequestCount: 0,
            handledRequestCount: 0,
            pendingRequestCount: 0,
        })),
        delete: vi.fn(async () => {}),
        listHead: vi.fn(async () => ({
            items: [],
            limit: 100,
            queueModifiedAt: new Date(),
            hadMultipleClients: false,
        })),
        listAndLockHead: vi.fn(async () => ({
            items: [],
            limit: 25,
            lockSecs: 180,
            queueModifiedAt: new Date(),
            hadMultipleClients: false,
            queueHasLockedRequests: false,
            clientKey: 'client-key',
        })),
        listRequests: vi.fn(async () => ({ items: [], limit: 10_000 })),
        batchAddRequests: vi.fn(async (requests: { uniqueKey: string }[]) => ({
            processedRequests: requests.map((req) => ({
                requestId: id(req.uniqueKey),
                uniqueKey: req.uniqueKey,
                wasAlreadyPresent: false,
                wasAlreadyHandled: false,
            })),
            unprocessedRequests: [],
        })),
        updateRequest: vi.fn(async (req: { id: string }) => ({
            requestId: req.id,
            wasAlreadyPresent: true,
            wasAlreadyHandled: false,
        })),
        getRequest: vi.fn(async (_requestId: string) => undefined),
        deleteRequestLock: vi.fn(async () => {}),
    };
}

type MockApiClient = ReturnType<typeof createMockApiClient>;

function asApiClient(mock: MockApiClient): RequestQueueClient {
    return mock as unknown as RequestQueueClient;
}

describe('ApifyRequestQueueSingleBackend', () => {
    test('adds requests, strips ids, and never locks', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        const result = await backend.addBatchOfRequests([request('a', { id: 'bogus' } as RequestSchema), request('b')]);

        expect(result.processedRequests).toHaveLength(2);
        expect(api.batchAddRequests).toHaveBeenCalledTimes(1);
        expect(api.batchAddRequests.mock.calls[0][0]).toEqual([
            { url: 'https://example.com/a', uniqueKey: 'a' },
            { url: 'https://example.com/b', uniqueKey: 'b' },
        ]);
        expect(api.listAndLockHead).not.toHaveBeenCalled();
    });

    test('deduplicates re-added requests locally without an API call', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a')]);
        const second = await backend.addBatchOfRequests([request('a')]);

        expect(api.batchAddRequests).toHaveBeenCalledTimes(1);
        expect(second.processedRequests).toEqual([
            expect.objectContaining({ requestId: id('a'), wasAlreadyPresent: true, wasAlreadyHandled: false }),
        ]);
    });

    test('prefetches existing queue contents once and dedups against them', async () => {
        const api = createMockApiClient();
        api.listRequests.mockResolvedValue({
            items: [
                { ...request('handled'), id: id('handled'), handledAt: '2025-01-01T00:00:00.000Z' },
                { ...request('pending'), id: id('pending') },
            ],
        } as never);
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        const result = await backend.addBatchOfRequests([request('handled'), request('pending'), request('new')]);

        expect(api.listRequests).toHaveBeenCalledTimes(1);
        // Only the genuinely new request reaches the platform.
        expect(api.batchAddRequests.mock.calls[0][0]).toEqual([request('new')]);
        expect(result.processedRequests).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ requestId: id('handled'), wasAlreadyPresent: true, wasAlreadyHandled: true }),
                expect.objectContaining({
                    requestId: id('pending'),
                    wasAlreadyPresent: true,
                    wasAlreadyHandled: false,
                }),
                expect.objectContaining({ requestId: id('new'), wasAlreadyPresent: false }),
            ]),
        );
    });

    test('serves fetched requests from the local cache without a read API call', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a', { userData: { foo: 'bar' } })]);
        const fetched = await backend.fetchNextRequest();

        expect(fetched).toEqual(expect.objectContaining({ uniqueKey: 'a', userData: { foo: 'bar' } }));
        expect(api.getRequest).not.toHaveBeenCalled();
    });

    test('hydrates requests discovered via listHead (added by another producer)', async () => {
        const api = createMockApiClient();
        api.listHead.mockResolvedValue({
            items: [{ id: id('foreign'), uniqueKey: 'foreign', url: 'https://example.com/foreign' }],
        } as never);
        api.getRequest.mockResolvedValue({ ...request('foreign'), id: id('foreign') } as never);
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        const fetched = await backend.fetchNextRequest();

        expect(fetched).toEqual(expect.objectContaining({ uniqueKey: 'foreign' }));
        expect(api.getRequest).toHaveBeenCalledWith(id('foreign'));
    });

    test('tracks in-progress requests for isFinished', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a')]);
        const fetched = (await backend.fetchNextRequest())!;

        await expect(backend.isEmpty()).resolves.toBe(true);
        await expect(backend.isFinished()).resolves.toBe(false);

        await backend.markRequestAsHandled(fetched);
        await expect(backend.isFinished()).resolves.toBe(true);
        expect(api.updateRequest).toHaveBeenCalledWith(
            expect.objectContaining({ id: id('a'), handledAt: expect.any(String) }),
            { forefront: undefined },
        );
    });

    test('forefront adds are fetched first', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a')]);
        await backend.addBatchOfRequests([request('b')], { forefront: true });

        expect((await backend.fetchNextRequest())?.uniqueKey).toBe('b');
        expect((await backend.fetchNextRequest())?.uniqueKey).toBe('a');
    });

    test('reclaimed requests return to the local head and are re-fetched', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a')]);
        const fetched = (await backend.fetchNextRequest())!;

        await backend.reclaimRequest(fetched, { forefront: true });
        expect(api.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ id: id('a') }), { forefront: true });
        expect(api.deleteRequestLock).not.toHaveBeenCalled();

        await expect(backend.isFinished()).resolves.toBe(false);
        expect((await backend.fetchNextRequest())?.uniqueKey).toBe('a');
    });

    test('marking an unknown, nonexistent request is a no-op and never upserts', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(api));

        const result = await backend.markRequestAsHandled({ ...request('ghost'), id: id('ghost') });

        expect(result).toBeUndefined();
        expect(api.updateRequest).not.toHaveBeenCalled();

        const reclaimed = await backend.reclaimRequest({ ...request('ghost'), id: id('ghost') });
        expect(reclaimed).toBeUndefined();
        expect(api.updateRequest).not.toHaveBeenCalled();
    });

    test('purge is not supported on the platform', async () => {
        const backend = new ApifyRequestQueueSingleBackend(asApiClient(createMockApiClient()));
        await expect(backend.purge()).rejects.toThrow(/not supported on the Apify platform/);
    });
});

describe('ApifyRequestQueueSharedBackend', () => {
    test('fetches requests via listAndLockHead and hydrates them by id', async () => {
        const api = createMockApiClient();
        api.listAndLockHead.mockResolvedValue({
            items: [{ id: id('a'), uniqueKey: 'a', url: 'https://example.com/a' }],
            queueHasLockedRequests: true,
            clientKey: 'client-key',
        } as never);
        api.getRequest.mockResolvedValue({ ...request('a', { userData: { foo: 'bar' } }), id: id('a') } as never);
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        const fetched = await backend.fetchNextRequest();

        expect(api.listAndLockHead).toHaveBeenCalledWith({ limit: 25, lockSecs: 180 });
        expect(fetched).toEqual(expect.objectContaining({ uniqueKey: 'a', userData: { foo: 'bar' } }));
    });

    test('the lock duration follows the expected processing time and only ever rises', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        await backend.setExpectedRequestProcessingTimeSecs(600);
        await backend.setExpectedRequestProcessingTimeSecs(60);
        await backend.fetchNextRequest();

        expect(api.listAndLockHead).toHaveBeenCalledWith({ limit: 25, lockSecs: 600 });
    });

    test('isFinished stays false while any client holds locked requests', async () => {
        const api = createMockApiClient();
        api.listAndLockHead.mockResolvedValue({ items: [], queueHasLockedRequests: true } as never);
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        await expect(backend.isEmpty()).resolves.toBe(true);
        await expect(backend.isFinished()).resolves.toBe(false);

        api.listAndLockHead.mockResolvedValue({ items: [], queueHasLockedRequests: false } as never);
        await expect(backend.isFinished()).resolves.toBe(true);
    });

    test('reclaiming updates the request, releases its lock, and honors forefront', async () => {
        const api = createMockApiClient();
        api.listAndLockHead.mockResolvedValueOnce({
            items: [
                { id: id('a'), uniqueKey: 'a', url: 'https://example.com/a' },
                { id: id('b'), uniqueKey: 'b', url: 'https://example.com/b' },
                { id: id('c'), uniqueKey: 'c', url: 'https://example.com/c' },
            ],
            queueHasLockedRequests: true,
        } as never);
        api.getRequest.mockImplementation(
            async (requestId: string) =>
                ({ url: 'https://example.com/x', uniqueKey: `hydrated-${requestId}`, id: requestId }) as never,
        );
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        const fetched = (await backend.fetchNextRequest())!;
        await backend.reclaimRequest({ ...fetched, uniqueKey: 'a' }, { forefront: true });

        expect(api.updateRequest).toHaveBeenCalledWith(expect.objectContaining({ id: id('a') }), { forefront: true });
        expect(api.deleteRequestLock).toHaveBeenCalledWith(id('a'), { forefront: true });

        // The forefront reclaim invalidates the local head order — the next fetch re-reads the
        // head even though buffered ids remain.
        expect(api.listAndLockHead).toHaveBeenCalledTimes(1);
        await backend.fetchNextRequest();
        expect(api.listAndLockHead).toHaveBeenCalledTimes(2);
    });

    test('skips requests handled by another client in the meantime', async () => {
        const api = createMockApiClient();
        api.listAndLockHead.mockResolvedValueOnce({
            items: [{ id: id('a'), uniqueKey: 'a', url: 'https://example.com/a' }],
            queueHasLockedRequests: false,
        } as never);
        api.getRequest.mockResolvedValue({
            ...request('a', { handledAt: '2025-01-01T00:00:00.000Z' }),
            id: id('a'),
        } as never);
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        await expect(backend.fetchNextRequest()).resolves.toBeUndefined();
    });

    test('deduplicates re-added requests locally without an API call', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        await backend.addBatchOfRequests([request('a')]);
        const second = await backend.addBatchOfRequests([request('a')]);

        expect(api.batchAddRequests).toHaveBeenCalledTimes(1);
        expect(second.processedRequests).toEqual([
            expect.objectContaining({ requestId: id('a'), wasAlreadyPresent: true }),
        ]);
    });

    test('marking an unknown, nonexistent request is a no-op and never upserts', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        const result = await backend.markRequestAsHandled({ ...request('ghost'), id: id('ghost') });

        expect(result).toBeUndefined();
        expect(api.updateRequest).not.toHaveBeenCalled();
    });

    test('getMetadata merges local estimates with the API counters', async () => {
        const api = createMockApiClient();
        const backend = new ApifyRequestQueueSharedBackend(asApiClient(api));

        // The API counters lag behind (still report zero) right after adding.
        await backend.addBatchOfRequests([request('a'), request('b')]);
        const metadata = await backend.getMetadata();

        expect(metadata.totalRequestCount).toBe(2);
        expect(metadata.handledRequestCount).toBe(0);
    });
});
