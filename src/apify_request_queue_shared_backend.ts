import type {
    BatchAddRequestsResult,
    ProcessedRequest,
    QueueOperationInfo,
    RequestQueueOperationOptions,
    RequestSchema,
    UpdateRequestSchema,
} from '@crawlee/types';
import { LruCache } from '@apify/datastructures';
import log from '@apify/log';

import { ApifyRequestQueueBackend, AsyncLock } from './apify_request_queue_backend.js';

/** Maximum number of request dedup records cached locally. */
const MAX_CACHED_REQUESTS = 1_000_000;

/** Default lock duration for requests fetched via `fetchNextRequest`. */
const DEFAULT_REQUEST_LOCK_SECS = 3 * 60;

/** How many head requests to lock per `listAndLockHead` round-trip. */
const HEAD_LOCK_LIMIT = 25;

/** Locally cached dedup information about a request that reached the platform. */
interface CachedRequestInfo {
    wasAlreadyHandled: boolean;
}

/**
 * Request queue backend safe for multi-consumer scenarios on the Apify platform.
 *
 * Requests fetched via {@link fetchNextRequest} are locked server-side (`listAndLockHead`), so any
 * number of clients — including other Actor runs — can process the same queue concurrently without
 * handing out a request twice. The lock is held until the request is marked as handled or
 * reclaimed, and its duration follows the consumer's expected processing time
 * (see {@link setExpectedRequestProcessingTimeSecs}). This consistency costs roughly one extra API
 * call per processed request compared to the single-consumer backend.
 *
 * @internal
 */
export class ApifyRequestQueueSharedBackend extends ApifyRequestQueueBackend {
    /** Ids of requests locked by this client and waiting to be handed out by `fetchNextRequest`. */
    private readonly headIds: string[] = [];

    /** Dedup records for requests known to exist on the platform, keyed by id. */
    private readonly cachedRequestInfo = new LruCache<CachedRequestInfo>({ maxLength: MAX_CACHED_REQUESTS });

    /** Ids of requests currently being processed by this client. */
    private readonly inProgressIds = new Set<string>();

    /** Whether the last head read reported any locked requests left in the queue (any client's). */
    private queueHasLockedRequests?: boolean;

    /** Set after a forefront insert — the next head read starts fresh so the insert is honored. */
    private shouldCheckForefrontRequests = false;

    /** Lock duration applied to fetched requests; raised via `setExpectedRequestProcessingTimeSecs`. */
    private lockSecs = DEFAULT_REQUEST_LOCK_SECS;

    /** Serializes head reads and reclaims — both reorder the shared head state. */
    private readonly headLock = new AsyncLock();

    override async setExpectedRequestProcessingTimeSecs(secs: number): Promise<void> {
        // Only ever raise the lock duration — several consumers may share this client, and a
        // short-lived one must not cut the reservation of a long-running one short.
        this.lockSecs = Math.max(this.lockSecs, secs);
    }

    async addBatchOfRequests(
        requests: RequestSchema[],
        options: RequestQueueOperationOptions = {},
    ): Promise<BatchAddRequestsResult> {
        const { forefront = false } = options;

        // Skip requests this client already knows reached the platform — a platform write costs an
        // API call and a paid write operation. Whether such a request has been handled in the
        // meantime by another client is unknowable locally, so report its last known state.
        const alreadyPresent: ProcessedRequest[] = [];
        const newRequests: RequestSchema[] = [];
        for (const request of requests) {
            const id = this.requestIdFromUniqueKey(request.uniqueKey);
            const cached = this.cachedRequestInfo.get(id);
            if (cached) {
                alreadyPresent.push({
                    requestId: id,
                    uniqueKey: request.uniqueKey,
                    wasAlreadyPresent: true,
                    wasAlreadyHandled: cached.wasAlreadyHandled || request.handledAt != null,
                });
            } else {
                newRequests.push(request);
            }
        }

        let result: BatchAddRequestsResult = { processedRequests: [], unprocessedRequests: [] };
        if (newRequests.length > 0) {
            result = await this.sendBatch(newRequests, forefront);
            for (const processed of result.processedRequests) {
                this.cacheRequestInfo(processed.requestId, { wasAlreadyHandled: processed.wasAlreadyHandled });
            }
            // A forefront insert changes the head order — have the next head read re-fetch the
            // front of the queue instead of draining the local buffer first.
            if (forefront) {
                this.shouldCheckForefrontRequests = true;
            }
        }

        result.processedRequests.push(...alreadyPresent);
        this.recordAddedRequests(result);
        return result;
    }

    async getRequest(uniqueKey: string): Promise<UpdateRequestSchema | undefined> {
        // The queue is shared — another client may modify a request at any time, so always read
        // through to the platform.
        return this.getRequestById(this.requestIdFromUniqueKey(uniqueKey));
    }

    async fetchNextRequest(): Promise<UpdateRequestSchema | undefined> {
        const id = await this.headLock.runExclusive(async () => {
            await this.ensureHeadIsNonEmpty();
            return this.headIds.shift();
        });
        if (!id) return undefined;

        // Head items carry only partial request data (no userData, payload or headers), so the
        // full record has to be hydrated with a round-trip.
        const request = await this.getRequestById(id);
        if (!request) {
            // The head read can briefly report a request the main table does not serve yet — leave
            // it out of the local head; it will reappear in a later head read.
            log.debug(`Request fetched from the queue head was not found (id: ${id}), will be retried later`);
            return undefined;
        }
        if (request.handledAt) {
            // Handled by another client in the meantime.
            this.cacheRequestInfo(id, { wasAlreadyHandled: true });
            return undefined;
        }
        this.inProgressIds.add(id);
        return request;
    }

    async markRequestAsHandled(request: UpdateRequestSchema): Promise<QueueOperationInfo | undefined> {
        const id = this.requestIdFromUniqueKey(request.uniqueKey);
        // Contract: marking a request that does not exist in the queue is a no-op — it must not be
        // added as a side effect (the platform update endpoint would upsert it).
        if (!(await this.isKnownOrExists(id))) {
            this.inProgressIds.delete(id);
            return undefined;
        }

        const handledAt = request.handledAt ?? new Date().toISOString();
        const info = await this.updateRequestOnPlatform({ ...request, id, handledAt });

        this.inProgressIds.delete(id);
        this.cacheRequestInfo(id, { wasAlreadyHandled: true });
        if (!info.wasAlreadyHandled) {
            this.estimatedHandledRequestCount += 1;
        }
        return info;
    }

    async reclaimRequest(
        request: UpdateRequestSchema,
        options: RequestQueueOperationOptions = {},
    ): Promise<QueueOperationInfo | undefined> {
        const { forefront = false } = options;
        const id = this.requestIdFromUniqueKey(request.uniqueKey);
        // Same contract as `markRequestAsHandled` — never insert as a side effect.
        if (!(await this.isKnownOrExists(id))) {
            this.inProgressIds.delete(id);
            return undefined;
        }

        return this.headLock.runExclusive(async () => {
            const info = await this.updateRequestOnPlatform({ ...request, id, handledAt: undefined }, forefront);

            // Release the server-side lock so the request becomes fetchable again immediately —
            // by any consumer — rather than only after the lock expires.
            try {
                await this.client.deleteRequestLock(id, { forefront });
            } catch (err) {
                log.debug(`Failed to delete the lock of a reclaimed request (id: ${id}): ${(err as Error).message}`);
            }

            this.inProgressIds.delete(id);
            this.cacheRequestInfo(id, { wasAlreadyHandled: false });
            if (forefront) {
                this.shouldCheckForefrontRequests = true;
            }
            if (info.wasAlreadyHandled) {
                this.estimatedHandledRequestCount -= 1;
            }
            return info;
        });
    }

    async isEmpty(): Promise<boolean> {
        return this.headLock.runExclusive(async () => {
            if (this.headIds.length > 0) return false;
            await this.listAndLockHead(1);
            return this.headIds.length === 0;
        });
    }

    async isFinished(): Promise<boolean> {
        return this.headLock.runExclusive(async () => {
            if (this.headIds.length > 0) return false;
            // The head read also refreshes `queueHasLockedRequests`, so the order matters here.
            await this.listAndLockHead(1);
            return this.headIds.length === 0 && !this.queueHasLockedRequests;
        });
    }

    /** Must be called with the head lock held. */
    private async ensureHeadIsNonEmpty(): Promise<void> {
        if (this.headIds.length > 1 && !this.shouldCheckForefrontRequests) {
            return;
        }
        await this.listAndLockHead(HEAD_LOCK_LIMIT);
    }

    /** Must be called with the head lock held. */
    private async listAndLockHead(limit: number): Promise<void> {
        // After a forefront insert the local buffer no longer starts at the true front of the
        // queue — re-fetch the front and keep the already-locked leftovers for afterwards.
        let leftoverIds: string[] = [];
        if (this.shouldCheckForefrontRequests) {
            leftoverIds = this.headIds.splice(0);
            this.shouldCheckForefrontRequests = false;
        }

        const head = await this.client.listAndLockHead({ limit, lockSecs: this.lockSecs });
        this.queueHasLockedRequests = head.queueHasLockedRequests;

        for (const item of head.items) {
            if (this.inProgressIds.has(item.id)) continue;
            if (this.headIds.includes(item.id) || leftoverIds.includes(item.id)) continue;
            this.cacheRequestInfo(item.id, { wasAlreadyHandled: false });
            this.headIds.push(item.id);
        }
        this.headIds.push(...leftoverIds);
    }

    private async isKnownOrExists(id: string): Promise<boolean> {
        if (this.inProgressIds.has(id) || this.cachedRequestInfo.get(id)) {
            return true;
        }
        return (await this.getRequestById(id)) !== undefined;
    }

    private cacheRequestInfo(id: string, info: CachedRequestInfo): void {
        // `LruCache.add` does not overwrite existing entries, so remove first.
        this.cachedRequestInfo.remove(id);
        this.cachedRequestInfo.add(id, info);
    }
}
