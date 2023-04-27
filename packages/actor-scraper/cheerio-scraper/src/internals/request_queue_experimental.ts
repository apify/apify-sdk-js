import { Actor, log } from 'apify';
import { Request, Dictionary, RequestOptions } from '@crawlee/cheerio';

import got from 'got';
import Queue from './queue.js';

// In memory request queue with deduplication and persistance
// Limit is around 2.5M requests to be save
// It supports only the critical functions for queue to work
export class ExperimentalRequestQueue {
    set = new Set();
    requests = new Queue();
    // Fastest tested settings chunk size
    // However it can vary with size of userData
    maxBatchRequests = 150_000;
    log = log.child({ prefix: 'ExperimentalRequestQueue' });
    // Fastest tested chunk for persisting set
    maxBatchSet = 500_000;
    setKey = 'INTERNAL-set-state';
    queueKey = 'INTERNAL-queue-state';
    defaultKeyValueStoreId = Actor.getEnv().defaultKeyValueStoreId;
    handled = 0;
    constructor() {
        Actor.on('migrating', async () => {
            await this.persistQueueState();
            this.log.info('State persisted!');
        });

        Actor.on('aborting', async () => {
            await this.persistQueueState();
            this.log.info('State persisted!');
        });
    }

    async initialize() {
        const firstRequests = await Actor.getValue(`${this.queueKey}-0`);

        if (firstRequests) {
            return this.loadState();
        }
    }

    addRequest(requestLike: any) {
        const uid = requestLike.uniqueKey ? requestLike.uniqueKey : requestLike.url;
        // Faster then negative condition
        if (this.set.has(uid)) {
            return;
        }
        this.set.add(uid);
        this.requests.enqueue(this._stripRequest(requestLike));
    }

    addRequests(requests: []) {
        for (const request of requests) {
            this.addRequest(request);
        }
    }

    markRequestHandled() {
        this.handled += 1;
    }

    handledCount() {
        return this.handled;
    }

    isEmpty() {
        return this.requests.size() === 0;
    }

    isFinished() {
        return this.isEmpty();
    }

    fetchNextRequest(): any {
        const baseRequest = this.requests.dequeue();
        return new Request(baseRequest as any as Request);
    }

    reclaimRequest(request: Request<Dictionary>) {
        this.requests.enqueue(this._stripRequest(request));
    }

    async persistQueueState() {
        const promises = [
            this.persistRequests(),
            this.persistSet(),
        ];

        await Promise.all(promises);
    }

    async persistSet() {
        await this._saveInChunks(Array.from(this.set), this.setKey, this.maxBatchSet);
    }

    async persistRequests() {
        await this._saveInChunks(this.requests.toArray(), this.queueKey, this.maxBatchRequests);
    }

    async loadState() {
        await this._loadRequests();
        await this._loadSet();
        this.log.info('State Loaded!', { requestCount: this.requests.size() });
    }

    _stripRequest(requestLike: Request | RequestOptions) {
        return {
            url: requestLike.url,
            // @ts-expect-error It is
            retryCount: requestLike.retryCount || 0,
            uniqueKey: requestLike.uniqueKey,
            userData: requestLike.userData,
            label: requestLike.label,
        };
    }

    async _loadRequests() {
        const items = await this._loadItemsFromState(this.queueKey);

        this.requests.fromArray(items);
    }

    async _loadSet() {
        const setData = await this._loadItemsFromState(this.setKey);

        this.set = new Set(setData);
    }

    async _loadItemsFromState(keyRoot: string): Promise<any[]> {
        const storeClient = await Actor.apifyClient.keyValueStore(this.defaultKeyValueStoreId!);

        const allKeys = await storeClient.listKeys();
        const orderedKeys = allKeys.items
            .filter(({ key }) => key.includes(keyRoot))
            .sort(({ key: key1 }, { key: key2 }) => this._sortByChunkOrder(key1, key2));

        let finalItems: any[] = [];
        for (const { key } of orderedKeys) {
            const items = await Actor.getValue(key);
            finalItems = finalItems.concat(items);
        }

        await Promise.all(orderedKeys.map(({ key }) => {
            return storeClient.deleteRecord(key);
        }));

        return finalItems;
    }

    async _saveInChunks<T>(arr: T[], key: string, chunkSize: number): Promise<any[]> {
        const promises = [];

        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            // Faster with got
            promises.push(got({
                url: `https://api.apify.com/v2/key-value-stores/${this.defaultKeyValueStoreId}/records/${key}-${promises.length}?token=${Actor.getEnv().token}`,
                method: 'PUT',
                json: chunk,
                http2: false,
            }).catch((e: any) => this.log.exception(e.message, e.status)));
        }

        return Promise.all(promises);
    }

    _sortByChunkOrder(a: string, b: string) {
        const regEx = /[^0-9]/g;
        // Extract the numbers from the string
        const aNumber = parseInt(a.replace(regEx, ''), 10);
        const bNumber = parseInt(b.replace(regEx, ''), 10);
        if (aNumber < bNumber) {
            return -1;
        } if (aNumber > bNumber) {
            return 1;
        }
        return 0;
    }
}

export async function createRequestQueue() {
    const queue = new ExperimentalRequestQueue();
    await queue.initialize();
    return queue;
}
