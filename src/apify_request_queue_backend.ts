import { createHash } from 'node:crypto';

import type {
    BatchAddRequestsResult,
    QueueOperationInfo,
    RequestQueueBackend,
    RequestQueueInfo,
    RequestQueueOperationOptions,
    RequestSchema,
    UpdateRequestSchema,
} from '@crawlee/types';
import type { RequestQueueClient as ApifyRequestQueueApiClient } from 'apify-client';

/**
 * Determines how an Apify platform request queue is consumed.
 *
 * - `'single'` — optimized for a single consumer. The client keeps a local estimate of the queue
 *   head and never locks requests, which means fewer API calls, better performance and lower cost.
 *   Multiple producers may still add requests concurrently, but only one client may *consume*
 *   (fetch and process) them.
 * - `'shared'` — safe for multiple concurrent consumers (e.g. several Actor runs processing one
 *   queue). Requests are locked server-side while they are being processed, at the cost of more
 *   API calls.
 */
export type RequestQueueAccessMode = 'single' | 'shared';

/** Apify request IDs are the first 15 chars of a base64 SHA-256 of the unique key. */
const REQUEST_ID_LENGTH = 15;

/**
 * Derives a request id from its unique key, exactly as the Apify platform does
 * (`sha256(uniqueKey)` → base64 → strip `+`/`/`/`=` → first 15 chars). Lets us
 * address a request by unique key without an extra round-trip.
 */
export function uniqueKeyToRequestId(uniqueKey: string): string {
    const hash = createHash('sha256').update(uniqueKey).digest('base64').replace(/[+/=]/g, '');
    return hash.slice(0, REQUEST_ID_LENGTH);
}

/**
 * Common base of the Apify platform implementations of Crawlee v4's stateful, pull-based
 * {@link RequestQueueBackend} interface, built on top of `apify-client`'s REST request-queue API.
 *
 * The mode-specific consumption logic lives in the subclasses:
 * {@link ApifyRequestQueueSingleBackend} (single consumer, no locking) and
 * {@link ApifyRequestQueueSharedBackend} (multiple consumers, server-side locking).
 * Modeled on the Apify Python SDK's request-queue clients.
 *
 * @internal
 */
export abstract class ApifyRequestQueueBackend implements RequestQueueBackend {
    /**
     * Local estimates of the queue counters, updated as this client adds/handles requests. The API
     * counters can lag behind by a few seconds, so {@link getMetadata} reports whichever is higher.
     */
    protected estimatedTotalRequestCount = 0;
    protected estimatedHandledRequestCount = 0;

    constructor(protected readonly client: ApifyRequestQueueApiClient) {}

    abstract addBatchOfRequests(
        requests: RequestSchema[],
        options?: RequestQueueOperationOptions,
    ): Promise<BatchAddRequestsResult>;

    abstract getRequest(uniqueKey: string): Promise<UpdateRequestSchema | undefined>;

    abstract fetchNextRequest(): Promise<UpdateRequestSchema | undefined>;

    abstract markRequestAsHandled(request: UpdateRequestSchema): Promise<QueueOperationInfo | undefined>;

    abstract reclaimRequest(
        request: UpdateRequestSchema,
        options?: RequestQueueOperationOptions,
    ): Promise<QueueOperationInfo | undefined>;

    abstract isEmpty(): Promise<boolean>;

    abstract isFinished(): Promise<boolean>;

    async setExpectedRequestProcessingTimeSecs(_secs: number): Promise<void> {
        // Only relevant for backends that reserve requests via locking; see the shared backend.
    }

    async getMetadata(): Promise<RequestQueueInfo> {
        const metadata = await this.client.get();
        if (!metadata) {
            throw new Error('Request queue not found or has been deleted.');
        }
        return {
            id: metadata.id,
            name: metadata.name,
            createdAt: metadata.createdAt,
            modifiedAt: metadata.modifiedAt,
            accessedAt: metadata.accessedAt,
            totalRequestCount: Math.max(metadata.totalRequestCount, this.estimatedTotalRequestCount),
            handledRequestCount: Math.max(metadata.handledRequestCount, this.estimatedHandledRequestCount),
            pendingRequestCount: metadata.pendingRequestCount,
        };
    }

    async drop(): Promise<void> {
        await this.client.delete();
    }

    async purge(): Promise<void> {
        throw new Error(
            'Purging a request queue is not supported on the Apify platform. ' +
                'Use `drop()` to delete the queue entirely, or open a new queue instead.',
        );
    }

    protected requestIdFromUniqueKey(uniqueKey: string): string {
        return uniqueKeyToRequestId(uniqueKey);
    }

    /**
     * Fetches the full request record by id.
     *
     * The apify-client return type understates the payload (the API returns the complete request
     * record including `userData`, `payload`, `handledAt`, ...), hence the cast.
     */
    protected async getRequestById(id: string): Promise<UpdateRequestSchema | undefined> {
        const request = await this.client.getRequest(id);
        return (request as unknown as UpdateRequestSchema | undefined) ?? undefined;
    }

    /**
     * Adds new requests to the platform queue. The API assigns ids itself, so any incoming id is
     * stripped to pass its strict input validation. `apify-client` internally chunks the batch and
     * retries transient failures.
     */
    protected async sendBatch(requests: RequestSchema[], forefront?: boolean): Promise<BatchAddRequestsResult> {
        const apiRequests = requests.map((request) => {
            const { id: _id, ...rest } = request;
            return rest;
        });
        const result = await this.client.batchAddRequests(
            apiRequests as Parameters<ApifyRequestQueueApiClient['batchAddRequests']>[0],
            { forefront },
        );
        return result as unknown as BatchAddRequestsResult;
    }

    /** Updates a request record on the platform and maps the result to crawlee's shape. */
    protected async updateRequestOnPlatform(
        request: UpdateRequestSchema,
        forefront?: boolean,
    ): Promise<QueueOperationInfo> {
        const result = await this.client.updateRequest(
            request as Parameters<ApifyRequestQueueApiClient['updateRequest']>[0],
            { forefront },
        );
        return {
            requestId: result.requestId,
            wasAlreadyPresent: result.wasAlreadyPresent,
            wasAlreadyHandled: result.wasAlreadyHandled,
        };
    }

    /** Counts freshly added requests from an add-batch result into the local metadata estimates. */
    protected recordAddedRequests(result: BatchAddRequestsResult): void {
        const newRequestCount = result.processedRequests.filter(
            (request) => !request.wasAlreadyPresent && !request.wasAlreadyHandled,
        ).length;
        this.estimatedTotalRequestCount += newRequestCount;
    }
}

/**
 * A minimal FIFO mutex — serializes the async critical sections passed to {@link runExclusive}.
 * @internal
 */
export class AsyncLock {
    #tail: Promise<unknown> = Promise.resolve();

    async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
        const run = this.#tail.then(fn);
        // Keep the chain alive even when the critical section throws.
        this.#tail = run.catch(() => {});
        return run;
    }
}
