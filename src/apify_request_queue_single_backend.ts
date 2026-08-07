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

import { ApifyRequestQueueBackend } from './apify_request_queue_backend.js';

/** Maximum number of full request objects cached locally. */
const MAX_CACHED_REQUESTS = 1_000_000;

/** The maximum head items read count, limited by the API. */
const MAX_HEAD_ITEMS = 1000;

/** How many new head items to aim for per `listHead` round-trip. */
const DESIRED_NEW_HEAD_ITEMS = 200;

/** How many existing requests to prefetch into the local caches on the first add. */
const INIT_CACHES_REQUEST_LIMIT = 10_000;

/**
 * Request queue backend optimized for single-consumer scenarios on the Apify platform.
 *
 * Minimizes API calls by keeping a local estimate of the queue head and a local cache of the
 * requests this client added — a request fetched from the head is usually served straight from the
 * cache, with no per-request round-trip and no server-side locking.
 *
 * ### Usage constraints
 *
 * - **Single consumer** — only one client may fetch and process requests from the queue at a time.
 * - **Multiple producers allowed** — other clients may add requests concurrently, but their
 *   forefront requests may not be prioritized immediately, as this client relies on a local head
 *   estimate instead of frequent head fetching.
 * - **Append-only queue** — other clients must not delete or modify existing requests, as such
 *   changes are not reflected in the local cache. Marking requests as handled elsewhere is
 *   tolerated, but may occasionally lead to a request being processed twice.
 *
 * If these constraints do not hold, use the shared backend (`requestQueueAccess: 'shared'`) instead.
 *
 * @internal
 */
export class ApifyRequestQueueSingleBackend extends ApifyRequestQueueBackend {
    /** Local estimate of the queue head — request ids in the order they should be fetched. */
    private readonly headIds: string[] = [];

    /** Unhandled full request objects added by (or fetched through) this client, keyed by id. */
    private readonly cachedRequests = new LruCache<UpdateRequestSchema>({ maxLength: MAX_CACHED_REQUESTS });

    /** Ids of requests known to be already handled — cheap dedup without caching full objects. */
    private readonly handledIds = new Set<string>();

    /** Ids of requests currently being processed by this client. */
    private readonly inProgressIds = new Set<string>();

    /** Memoized one-time prefetch of existing queue contents into the local caches. */
    private initCachesPromise?: Promise<void>;

    async addBatchOfRequests(
        requests: RequestSchema[],
        options: RequestQueueOperationOptions = {},
    ): Promise<BatchAddRequestsResult> {
        const { forefront = false } = options;
        await (this.initCachesPromise ??= this.initCaches());

        // Split the batch into requests we already know about (dedup them locally — a platform
        // write costs an API call and a paid write operation) and genuinely new ones.
        const alreadyPresent: ProcessedRequest[] = [];
        const newRequests: RequestSchema[] = [];
        for (const request of requests) {
            const id = this.requestIdFromUniqueKey(request.uniqueKey);
            if (this.handledIds.has(id)) {
                alreadyPresent.push({
                    requestId: id,
                    uniqueKey: request.uniqueKey,
                    wasAlreadyPresent: true,
                    wasAlreadyHandled: true,
                });
            } else if (this.cachedRequests.get(id)) {
                alreadyPresent.push({
                    requestId: id,
                    uniqueKey: request.uniqueKey,
                    wasAlreadyPresent: true,
                    wasAlreadyHandled: request.handledAt != null,
                });
            } else {
                newRequests.push(request);
            }
        }

        let result: BatchAddRequestsResult = { processedRequests: [], unprocessedRequests: [] };
        if (newRequests.length > 0) {
            result = await this.sendBatch(newRequests, forefront);

            // Commit the accepted requests to the local caches and the head estimate. The platform
            // response is authoritative — a request it reports as already handled (e.g. handled by
            // a previous run of a resurrected Actor beyond the prefetch limit) must not re-enter
            // the head.
            const processedByKey = new Map(
                result.processedRequests.map((processed) => [processed.uniqueKey, processed]),
            );
            for (const request of newRequests) {
                const processed = processedByKey.get(request.uniqueKey);
                if (!processed) continue; // rejected by the platform, reported in `unprocessedRequests`
                if (processed.wasAlreadyHandled) {
                    this.handledIds.add(processed.requestId);
                    continue;
                }
                this.cacheRequest({ ...request, id: processed.requestId });
                if (forefront) {
                    this.headIds.unshift(processed.requestId);
                } else {
                    this.headIds.push(processed.requestId);
                }
            }
        }

        result.processedRequests.push(...alreadyPresent);
        this.recordAddedRequests(result);
        return result;
    }

    async getRequest(uniqueKey: string): Promise<UpdateRequestSchema | undefined> {
        const id = this.requestIdFromUniqueKey(uniqueKey);
        const cached = this.cachedRequests.get(id);
        if (cached) return cached;

        const request = await this.getRequestById(id);
        if (!request) return undefined;

        // Requests already in progress are ones the client knows about — no caching needed.
        if (!this.inProgressIds.has(id)) {
            if (request.handledAt) {
                this.handledIds.add(id);
            } else {
                this.cacheRequest(request);
            }
        }
        return request;
    }

    async fetchNextRequest(): Promise<UpdateRequestSchema | undefined> {
        await this.ensureHeadIsNonEmpty();

        while (this.headIds.length > 0) {
            const id = this.headIds.shift()!;
            if (this.inProgressIds.has(id) || this.handledIds.has(id)) {
                continue;
            }
            this.inProgressIds.add(id);
            // Requests added by this client are served straight from the cache; only requests
            // discovered via `listHead` (added by another producer) need a round-trip.
            const request = this.cachedRequests.get(id) ?? (await this.getRequestById(id));
            if (!request) {
                this.inProgressIds.delete(id);
                continue;
            }
            if (request.handledAt) {
                // Handled elsewhere in the meantime — skip it and remember the outcome.
                this.inProgressIds.delete(id);
                this.handledIds.add(id);
                this.cachedRequests.remove(id);
                continue;
            }
            return request;
        }
        return undefined;
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
        this.handledIds.add(id);
        this.cachedRequests.remove(id);
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

        // Reclaiming returns the request to the queue for reprocessing.
        const reclaimed: UpdateRequestSchema = { ...request, id, handledAt: undefined };
        const info = await this.updateRequestOnPlatform(reclaimed, forefront);

        this.inProgressIds.delete(id);
        this.handledIds.delete(id);
        this.cacheRequest(reclaimed);
        // Return the id to the local head estimate right away — the platform head read can lag a
        // few seconds behind the update, and `isFinished` must never report `true` while a
        // reclaimed request is still waiting to be reprocessed.
        if (!this.headIds.includes(id)) {
            if (forefront) {
                this.headIds.unshift(id);
            } else {
                this.headIds.push(id);
            }
        }
        if (info.wasAlreadyHandled) {
            this.estimatedHandledRequestCount -= 1;
        }
        return info;
    }

    async isEmpty(): Promise<boolean> {
        await this.ensureHeadIsNonEmpty();
        return this.headIds.length === 0;
    }

    async isFinished(): Promise<boolean> {
        return (await this.isEmpty()) && this.inProgressIds.size === 0;
    }

    private async ensureHeadIsNonEmpty(): Promise<void> {
        if (this.headIds.length <= 1) {
            await this.listHead();
        }
    }

    private async listHead(): Promise<void> {
        // The head read returns in-progress requests too, so fetch enough to find new ones.
        const limit = Math.min(MAX_HEAD_ITEMS, DESIRED_NEW_HEAD_ITEMS + this.inProgressIds.size);
        const head = await this.client.listHead({ limit });
        for (const item of head.items) {
            if (this.inProgressIds.has(item.id) || this.handledIds.has(item.id)) {
                continue;
            }
            // `headIds` is nearly drained whenever this runs (see `ensureHeadIsNonEmpty`), so the
            // linear dedup scan stays cheap.
            if (!this.headIds.includes(item.id)) {
                this.headIds.push(item.id);
            }
        }
    }

    /**
     * One-time prefetch of the existing queue contents into the local caches, so that re-added
     * requests of a resurrected run are deduplicated locally (one read API call for the whole
     * cache) instead of on the platform (one write operation per request).
     */
    private async initCaches(): Promise<void> {
        try {
            const response = await this.client.listRequests({ limit: INIT_CACHES_REQUEST_LIMIT });
            for (const request of response.items) {
                if (request.handledAt) {
                    this.handledIds.add(request.id);
                } else {
                    this.cacheRequest(request as unknown as UpdateRequestSchema);
                }
            }
        } catch (err) {
            // The prefetch is a cost optimization, not a correctness requirement — deduplication
            // falls back to the platform.
            log.warning(
                `Failed to prefetch the request queue contents into the local cache: ${(err as Error).message}`,
            );
        }
    }

    private async isKnownOrExists(id: string): Promise<boolean> {
        if (this.inProgressIds.has(id) || this.handledIds.has(id) || this.cachedRequests.get(id)) {
            return true;
        }
        return (await this.getRequestById(id)) !== undefined;
    }

    private cacheRequest(request: UpdateRequestSchema): void {
        // `LruCache.add` does not overwrite existing entries, so remove first.
        this.cachedRequests.remove(request.id);
        this.cachedRequests.add(request.id, request);
    }
}
