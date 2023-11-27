/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import log from '@apify/log';
import type {
    KeyValueStore,
    RecordOptions,
    Request,
    RequestOptions,
    RequestQueue,
    RequestQueueOperationOptions,
} from '@crawlee/core';
import type { Dictionary } from '@crawlee/utils';
import type { ApifyEnv } from 'apify';
import { Actor } from 'apify';
import type { MediaType } from 'content-type';
import contentTypeParser from 'content-type';

import type { SnapshotOptions } from './browser_tools';
import { saveSnapshot } from './browser_tools';
import { META_KEY } from './consts';
import type { RequestMetadata } from './tools';

export interface CrawlerSetupOptions {
    rawInput: string;
    env: ApifyEnv;
    globalStore: Map<string, unknown> | MapLike<string, unknown>;
    requestQueue: RequestQueue;
    keyValueStore: KeyValueStore;
    customData: unknown;
}

export interface MapLike<K, V> extends Omit<Map<K, V>, 'values' | 'keys' | 'entries'| 'set'> {
    keys: () => K[];
    values: () => V[];
    entries: () => [K, V][];
    set: (key: K, value: V) => MapLike<K, V>;
}

export interface ContextOptions {
    crawlerSetup: CrawlerSetupOptions;
    pageFunctionArguments: Dictionary;
}

interface InternalState {
    skipLinks: boolean;
}

const setup = Symbol('crawler-setup');
const internalState = Symbol('request-internal-state');

/**
 * Context represents everything that is available to the user
 * via Page Function. A class is used instead of a simple object
 * to avoid having to create new instances of functions with each
 * request.
 *
 * Some properties need to be accessible to the Context,
 * but should not be exposed to the user thus they are hidden
 * using a Symbol to prevent the user from easily accessing
 * and manipulating them.
 */
class Context<Options extends ContextOptions = ContextOptions, ExtraFields = Options['pageFunctionArguments']> {
    private readonly [setup]: CrawlerSetupOptions;
    private readonly [internalState]: InternalState;

    readonly Actor = Actor;
    readonly Apify = Actor; // for back compatibility
    readonly log = log;
    readonly input: any;
    readonly env: ApifyEnv;
    readonly customData: unknown;
    readonly globalStore: Map<string, unknown> | MapLike<string, unknown>;

    constructor(options: Options) {
        const {
            crawlerSetup,
            pageFunctionArguments,
        } = options;

        // Private
        this[setup] = crawlerSetup;
        this[internalState] = {
            skipLinks: false,
        };

        this.input = JSON.parse(crawlerSetup.rawInput);
        this.env = { ...crawlerSetup.env };
        this.customData = crawlerSetup.customData;
        this.globalStore = crawlerSetup.globalStore;

        // Page function arguments are directly passed from CrawlerSetup
        // and differ between Puppeteer and Cheerio Scrapers.
        // We must use properties and descriptors not to trigger getters / setters.
        Object.defineProperties(this, Object.getOwnPropertyDescriptors(pageFunctionArguments));

        // Bind this to allow destructuring off context in pageFunction.
        this.saveSnapshot = this.saveSnapshot.bind(this);
        this.skipLinks = this.skipLinks.bind(this);
        this.enqueueRequest = this.enqueueRequest.bind(this);
    }

    async getValue<T>(...args: Parameters<KeyValueStore['getValue']>) {
        return this[setup].keyValueStore.getValue<T>(...args as [string, T]);
    }

    async setValue<T>(...args: Parameters<KeyValueStore['setValue']>) {
        return this[setup].keyValueStore.setValue<T>(...args as [key: string, value: T | null, options?: RecordOptions]);
    }

    async saveSnapshot() {
        return saveSnapshot({
            page: this.page as SnapshotOptions['page'],
            body: this.body as SnapshotOptions['body'],
            contentType: this.contentType
                ? contentTypeParser.format(this.contentType as MediaType)
                : null,
            json: this.json,
        });
    }

    skipLinks() {
        this[internalState].skipLinks = true;
    }

    async enqueueRequest(
        requestOpts: RequestOptions = {} as RequestOptions,
        options: RequestQueueOperationOptions = {},
    ) : ReturnType<RequestQueue['addRequest']> {
        const defaultRequestOpts = {
            useExtendedUniqueKey: true,
            keepUrlFragment: this.input.keepUrlFragments,
        };

        const newRequest = { ...defaultRequestOpts, ...requestOpts } as RequestOptions;
        const castedRequest = this.request as Request;

        const defaultUserData = {
            [META_KEY]: {
                parentRequestId: castedRequest.id || castedRequest.uniqueKey,
                depth: (castedRequest.userData?.[META_KEY] as RequestMetadata).depth ?? 0 + 1,
            },
        };

        newRequest.userData = { ...defaultUserData, ...requestOpts.userData };

        return this[setup].requestQueue.addRequest(newRequest, options);
    }
}

// @ts-expect-error -- Extensions actually work but TS complains
interface Context<
    Options extends ContextOptions = ContextOptions,
    ExtraFields extends ContextOptions['pageFunctionArguments'] = Options['pageFunctionArguments'],
> extends ExtraFields {}

/**
 * Creates a Context by passing all arguments to its constructor
 * and returns it, along with a reference to its state object.
 */
export function createContext<
    Options extends ContextOptions = ContextOptions,
    ExtraFields extends ContextOptions['pageFunctionArguments'] = Options['pageFunctionArguments'],
>(contextOptions: Options) {
    const context = new Context<Options, ExtraFields>(contextOptions);
    return {
        context,
        state: context[internalState],
    };
}
