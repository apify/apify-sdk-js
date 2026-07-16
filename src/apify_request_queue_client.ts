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
import type { RequestQueueClient as ApifyRequestQueueResourceClient } from 'apify-client';

/** Apify request IDs are the first 15 chars of a base64url-ish SHA-256 of the unique key. */
const REQUEST_ID_LENGTH = 15;

/** Default lock duration for requests fetched via {@link ApifyRequestQueueClient.fetchNextRequest}. */
const DEFAULT_REQUEST_LOCK_SECS = 3 * 60;

/** How many head requests to lock per `listAndLockHead` round-trip. */
const HEAD_LOCK_BATCH_SIZE = 25;

/**
 * Derives a request id from its unique key, exactly as the Apify platform does
 * (`sha256(uniqueKey)` → base64 → strip `+`/`/`/`=` → first 15 chars). Lets us
 * address a request by unique key without an extra round-trip.
 */
function uniqueKeyToRequestId(uniqueKey: string): string {
    const hash = createHash('sha256').update(uniqueKey).digest('base64').replace(/[+/=]/g, '');
    return hash.slice(0, REQUEST_ID_LENGTH);
}

/**
 * Implements Crawlee v4's stateful, pull-based {@link RequestQueueBackend} interface
 * on top of `apify-client`'s REST request-queue API.
 *
 * `fetchNextRequest` locks requests server-side (`listAndLockHead`) so the queue can
 * be safely shared across multiple consumers; `markRequestAsHandled` / `reclaimRequest`
 * update the request and release its lock. Modeled on the Apify Python SDK's
 * request-queue client.
 *
 * @internal
 */
export class ApifyRequestQueueClient implements RequestQueueBackend {
    /** Locked request ids waiting to be handed out by {@link fetchNextRequest}, in queue order. */
    private readonly queueHead: string[] = [];

    /** Lock duration applied to fetched requests; adjustable via {@link setExpectedRequestProcessingTimeSecs}. */
    private lockSecs = DEFAULT_REQUEST_LOCK_SECS;

    constructor(private readonly client: ApifyRequestQueueResourceClient) {}

    async getMetadata(): Promise<RequestQueueInfo> {
        const metadata = await this.client.get();
        if (!metadata) {
            throw new Error('Request queue not found or has been deleted.');
        }
        return metadata as unknown as RequestQueueInfo;
    }

    async drop(): Promise<void> {
        await this.client.delete();
    }

    async purge(): Promise<void> {
        // The Apify platform has no "empty but keep" endpoint, and a run's queue is
        // already fresh, so purge is a no-op here (use drop() to remove it entirely).
    }

    async setExpectedRequestProcessingTimeSecs(secs: number): Promise<void> {
        this.lockSecs = secs;
    }

    async addBatchOfRequests(
        requests: RequestSchema[],
        options: RequestQueueOperationOptions = {},
    ): Promise<BatchAddRequestsResult> {
        const { forefront } = options;
        // The API assigns ids itself; strip any incoming id so its strict input validation passes.
        const apiRequests = requests.map((request) => {
            const { id: _id, ...rest } = request;
            return rest;
        });

        const result = await this.client.batchAddRequests(
            apiRequests as Parameters<ApifyRequestQueueResourceClient['batchAddRequests']>[0],
            { forefront },
        );

        // A forefront insert changes the head order; drop our cached head so the next
        // fetch re-reads (and locks) the new front of the queue.
        if (forefront) {
            this.queueHead.length = 0;
        }
        return result as unknown as BatchAddRequestsResult;
    }

    async getRequest(uniqueKey: string): Promise<UpdateRequestSchema | undefined> {
        const request = await this.client.getRequest(uniqueKeyToRequestId(uniqueKey));
        return (request as UpdateRequestSchema | undefined) ?? undefined;
    }

    async fetchNextRequest(): Promise<UpdateRequestSchema | undefined> {
        await this.ensureHeadIsNonEmpty();

        while (this.queueHead.length > 0) {
            const requestId = this.queueHead.shift()!;
            // Head items lack userData/payload, so hydrate the full request.
            const request = await this.client.getRequest(requestId);
            // Skip requests that vanished or were already handled (e.g. by another consumer).
            if (!request || (request as { handledAt?: string }).handledAt) {
                continue;
            }
            return request as UpdateRequestSchema;
        }
        return undefined;
    }

    async markRequestAsHandled(request: UpdateRequestSchema): Promise<QueueOperationInfo | undefined> {
        const result = await this.client.updateRequest({
            ...this.toApiRequest(request),
            handledAt: request.handledAt ?? new Date().toISOString(),
        });
        // Marking handled takes the request out of the head; its lock becomes moot.
        return this.toQueueOperationInfo(result);
    }

    async reclaimRequest(
        request: UpdateRequestSchema,
        options: RequestQueueOperationOptions = {},
    ): Promise<QueueOperationInfo | undefined> {
        const { forefront } = options;
        const result = await this.client.updateRequest(this.toApiRequest(request), { forefront });

        // Release the server-side lock so the request is fetchable again immediately,
        // rather than only once the lock expires.
        await this.client.deleteRequestLock(request.id, { forefront }).catch(() => {});
        if (forefront) {
            this.queueHead.length = 0;
        }
        return this.toQueueOperationInfo(result);
    }

    async isEmpty(): Promise<boolean> {
        if (this.queueHead.length > 0) {
            return false;
        }
        const head = await this.client.listHead({ limit: 1 });
        return head.items.length === 0;
    }

    async isFinished(): Promise<boolean> {
        if (this.queueHead.length > 0) {
            return false;
        }
        // `pendingRequestCount` counts every not-yet-handled request, including ones
        // currently locked/in-progress — so 0 means there is genuinely nothing left.
        const metadata = await this.client.get();
        return (metadata?.pendingRequestCount ?? 0) === 0;
    }

    private async ensureHeadIsNonEmpty(): Promise<void> {
        if (this.queueHead.length > 0) {
            return;
        }
        const head = await this.client.listAndLockHead({ limit: HEAD_LOCK_BATCH_SIZE, lockSecs: this.lockSecs });
        for (const item of head.items) {
            this.queueHead.push(item.id);
        }
    }

    /** Crawlee's `UpdateRequestSchema` is structurally the apify-client request shape. */
    private toApiRequest(
        request: UpdateRequestSchema,
    ): Parameters<ApifyRequestQueueResourceClient['updateRequest']>[0] {
        return request as unknown as Parameters<ApifyRequestQueueResourceClient['updateRequest']>[0];
    }

    private toQueueOperationInfo(result: {
        requestId: string;
        wasAlreadyPresent: boolean;
        wasAlreadyHandled: boolean;
    }): QueueOperationInfo {
        return {
            requestId: result.requestId,
            wasAlreadyPresent: result.wasAlreadyPresent,
            wasAlreadyHandled: result.wasAlreadyHandled,
        };
    }
}
