import { readFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import type {
    AutoscaledPool,
    Awaitable,
    Dictionary,
    HttpCrawlerOptions,
    HttpCrawlingContext,
    InternalHttpCrawlingContext,
    ProxyConfiguration,
    Request,
} from '@crawlee/http';
import {
    Dataset,
    HttpCrawler,
    KeyValueStore,
    log,
    RequestList,
    RequestQueueV2,
} from '@crawlee/http';
import type { ApifyEnv } from 'apify';
import { Actor } from 'apify';

import type { CrawlerSetupOptions } from '@apify/scraper-tools';
import {
    constants as scraperToolsConstants,
    createContext,
    tools,
} from '@apify/scraper-tools';

import type { Input } from './consts.js';
import { ProxyRotation } from './consts.js';

const { SESSION_MAX_USAGE_COUNTS } = scraperToolsConstants;
const SCHEMA = JSON.parse(
    await readFile(new URL('../../INPUT_SCHEMA.json', import.meta.url), 'utf8'),
);

const MAX_EVENT_LOOP_OVERLOADED_RATIO = 0.9;
const SESSION_STORE_NAME = 'APIFY-HTTP-SCRAPER-SESSION-STORE';
const REQUEST_QUEUE_INIT_FLAG_KEY = 'REQUEST_QUEUE_INITIALIZED';

/**
 * Holds all the information necessary for constructing a crawler
 * instance and creating a context for a pageFunction invocation.
 */
export class CrawlerSetup implements CrawlerSetupOptions {
    name = 'http Scraper';
    rawInput: string;
    env: ApifyEnv;
    /**
     * Used to store data that persist navigations
     */
    globalStore = new Map();
    requestQueue: RequestQueueV2;
    keyValueStore: KeyValueStore;
    customData: unknown;
    input: Input;
    maxSessionUsageCount: number;
    evaledPageFunction: (...args: unknown[]) => unknown;
    evaledPreNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];
    evaledPostNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;

    crawler!: HttpCrawler<InternalHttpCrawlingContext>;
    dataset!: Dataset;
    pagesOutputted!: number;
    proxyConfiguration?: ProxyConfiguration;
    private initPromise: Promise<void>;

    constructor(input: Input) {
        // Set log level early to prevent missed messages.
        if (input.debugLog) log.setLevel(log.LEVELS.DEBUG);

        // Keep this as string to be immutable.
        this.rawInput = JSON.stringify(input);

        // Attempt to load page function from disk if not present on input.
        tools.maybeLoadPageFunctionFromDisk(
            input,
            dirname(fileURLToPath(import.meta.url)),
        );

        // Validate INPUT if not running on Apify Cloud Platform.
        if (!Actor.isAtHome()) tools.checkInputOrThrow(input, SCHEMA);

        this.input = input;
        this.env = Actor.getEnv();

        // Validations
        this.input.initialCookies.forEach((cookie) => {
            if (!tools.isPlainObject(cookie)) {
                throw new Error(
                    'The initialCookies Array must only contain Objects.',
                );
            }
        });

        // solving proxy rotation settings
        this.maxSessionUsageCount =
            SESSION_MAX_USAGE_COUNTS[this.input.proxyRotation];

        // Functions need to be evaluated.
        this.evaledPageFunction = tools.evalFunctionOrThrow(
            this.input.pageFunction,
        );

        if (this.input.preNavigationHooks) {
            this.evaledPreNavigationHooks = tools.evalFunctionArrayOrThrow(
                this.input.preNavigationHooks,
                'preNavigationHooks',
            );
        } else {
            this.evaledPreNavigationHooks = [];
        }

        if (this.input.postNavigationHooks) {
            this.evaledPostNavigationHooks = tools.evalFunctionArrayOrThrow(
                this.input.postNavigationHooks,
                'postNavigationHooks',
            );
        } else {
            this.evaledPostNavigationHooks = [];
        }

        // Named storages
        this.datasetName = this.input.datasetName;
        this.keyValueStoreName = this.input.keyValueStoreName;
        this.requestQueueName = this.input.requestQueueName;

        // Initialize async operations.
        this.crawler = null!;
        this.requestQueue = null!;
        this.dataset = null!;
        this.keyValueStore = null!;
        this.proxyConfiguration = null!;
        this.initPromise = this._initializeAsync();
    }

    private async _initializeAsync() {
        // RequestList
        const startUrls = this.input.startUrls.map((req) => {
            req.useExtendedUniqueKey = true;
            req.keepUrlFragment = this.input.keepUrlFragments;
            return req;
        });

        // KeyValueStore
        this.keyValueStore = await KeyValueStore.open(this.keyValueStoreName);

        // RequestQueue
        this.requestQueue = await RequestQueueV2.open(this.requestQueueName);

        if (
            !(await this.keyValueStore.recordExists(
                REQUEST_QUEUE_INIT_FLAG_KEY,
            ))
        ) {
            const requests: Request[] = [];
            for await (const request of await RequestList.open(
                null,
                startUrls,
            )) {
                if (
                    this.input.maxResultsPerCrawl > 0 &&
                    requests.length >= 1.5 * this.input.maxResultsPerCrawl
                ) {
                    break;
                }
                requests.push(request);
            }

            const { waitForAllRequestsToBeAdded } =
                await this.requestQueue.addRequestsBatched(requests);

            void waitForAllRequestsToBeAdded.then(async () => {
                await this.keyValueStore.setValue(
                    REQUEST_QUEUE_INIT_FLAG_KEY,
                    '1',
                );
            });
        }

        // Dataset
        this.dataset = await Dataset.open(this.datasetName);
        const info = await this.dataset.getInfo();
        this.pagesOutputted = info?.itemCount ?? 0;

        // Proxy configuration
        this.proxyConfiguration = (await Actor.createProxyConfiguration(
            this.input.proxyConfiguration,
        )) as any as ProxyConfiguration;
    }

    /**
     * Resolves to a `httpCrawler` instance.
     */
    async createCrawler() {
        await this.initPromise;

        const options: HttpCrawlerOptions = {
            proxyConfiguration: this.proxyConfiguration,
            requestHandler: this._requestHandler.bind(this),
            preNavigationHooks: [],
            postNavigationHooks: [],
            requestQueue: this.requestQueue,
            navigationTimeoutSecs: this.input.pageLoadTimeoutSecs,
            requestHandlerTimeoutSecs: this.input.pageFunctionTimeoutSecs,
            ignoreSslErrors: this.input.ignoreSslErrors,
            failedRequestHandler: this._failedRequestHandler.bind(this),
            respectRobotsTxtFile: this.input.respectRobotsTxtFile,
            maxRequestRetries: this.input.maxRequestRetries,
            maxRequestsPerCrawl:
                this.input.maxPagesPerCrawl === 0
                    ? undefined
                    : this.input.maxPagesPerCrawl,
            additionalMimeTypes: this.input.additionalMimeTypes,
            autoscaledPoolOptions: {
                maxConcurrency: this.input.maxConcurrency,
                systemStatusOptions: {
                    // http does a lot of sync operations, so we need to
                    // give it some time to do its job.
                    maxEventLoopOverloadedRatio:
                        MAX_EVENT_LOOP_OVERLOADED_RATIO,
                },
            },
            useSessionPool: true,
            persistCookiesPerSession: true,
            sessionPoolOptions: {
                persistStateKeyValueStoreId: this.input.sessionPoolName
                    ? SESSION_STORE_NAME
                    : undefined,
                persistStateKey: this.input.sessionPoolName,
                sessionOptions: {
                    maxUsageCount: this.maxSessionUsageCount,
                },
            },
            experiments: {
                requestLocking: true,
            },
        };

        this._createNavigationHooks(options);

        if (this.input.proxyRotation === ProxyRotation.UntilFailure) {
            options.sessionPoolOptions!.maxPoolSize = 1;
        }

        if (this.input.suggestResponseEncoding) {
            if (this.input.forceResponseEncoding) {
                options.forceResponseEncoding =
                    this.input.suggestResponseEncoding;
            } else {
                options.suggestResponseEncoding =
                    this.input.suggestResponseEncoding;
            }
        }

        this.crawler = new HttpCrawler(options);

        return this.crawler;
    }

    private _createNavigationHooks(options: HttpCrawlerOptions) {
        options.preNavigationHooks!.push(async ({ request, session }) => {
            // Normalize headers
            request.headers = Object.entries(request.headers ?? {}).reduce(
                (newHeaders, [key, value]) => {
                    newHeaders[key.toLowerCase()] = value;
                    return newHeaders;
                },
                {} as Dictionary<string>,
            );

            // Add initial cookies, if any.
            if (this.input.initialCookies && this.input.initialCookies.length) {
                const cookiesToSet = session
                    ? tools.getMissingCookiesFromSession(
                          session,
                          this.input.initialCookies,
                          request.url,
                      )
                    : this.input.initialCookies;
                if (cookiesToSet?.length) {
                    // setting initial cookies that are not already in the session and page
                    session?.setCookies(cookiesToSet, request.url);
                }
            }
        });

        options.preNavigationHooks!.push(
            ...this._runHookWithEnhancedContext(this.evaledPreNavigationHooks),
        );
        options.postNavigationHooks!.push(
            ...this._runHookWithEnhancedContext(this.evaledPostNavigationHooks),
        );
    }

    private _runHookWithEnhancedContext(
        hooks: ((...args: unknown[]) => Awaitable<void>)[],
    ) {
        return hooks.map((hook) => (ctx: Dictionary, ...args: unknown[]) => {
            const { customData } = this.input;
            return hook({ ...ctx, Apify: Actor, Actor, customData }, ...args);
        });
    }

    private async _failedRequestHandler({ request }: HttpCrawlingContext) {
        const lastError =
            request.errorMessages[request.errorMessages.length - 1];
        const errorMessage = lastError ? lastError.split('\n')[0] : 'no error';
        log.error(
            `Request ${request.url} failed and will not be retried anymore. Marking as failed.\nLast Error Message: ${errorMessage}`,
        );
        return this._handleResult(request, undefined, undefined, true);
    }

    /**
     * First of all, it initializes the state that is exposed to the user via
     * `pageFunction` context.
     *
     * Then it invokes the user provided `pageFunction` with the prescribed context
     * and saves its return value.
     *
     * Finally, it makes decisions based on the current state and post-processes
     * the data returned from the `pageFunction`.
     */
    private async _requestHandler(crawlingContext: HttpCrawlingContext) {
        const { request, response, crawler } = crawlingContext;
        const pageFunctionArguments: Dictionary = {};

        // We must use properties and descriptors not to trigger getters / setters.
        const props = Object.getOwnPropertyDescriptors(crawlingContext);
        ['json', 'body'].forEach((key) => {
            props[key].configurable = true;
        });
        Object.defineProperties(pageFunctionArguments, props);

        pageFunctionArguments.response = {
            status: response!.statusCode,
            headers: response!.headers,
        };

        Object.defineProperties(
            this,
            Object.getOwnPropertyDescriptors(pageFunctionArguments),
        );

        /**
         * PRE-PROCESSING
         */
        // Make sure that an object containing internal metadata
        // is present on every request.
        tools.ensureMetaData(request);

        // Abort the crawler if the maximum number of results was reached.
        const aborted = await this._handleMaxResultsPerCrawl(
            crawler.autoscaledPool,
        );
        if (aborted) return;

        // Setup and create Context.
        const contextOptions = {
            crawlerSetup: {
                rawInput: this.rawInput,
                env: this.env,
                globalStore: this.globalStore,
                requestQueue: this.requestQueue,
                keyValueStore: this.keyValueStore,
                customData: this.input.customData,
            },
            pageFunctionArguments,
        };
        const { context } = createContext(contextOptions);

        /**
         * USER FUNCTION INVOCATION
         */
        const pageFunctionResult = await this.evaledPageFunction(context);

        // Save the `pageFunction`s result to the default dataset.
        await this._handleResult(
            request,
            response,
            pageFunctionResult as Dictionary,
        );
    }

    private async _handleMaxResultsPerCrawl(autoscaledPool?: AutoscaledPool) {
        if (
            !this.input.maxResultsPerCrawl ||
            this.pagesOutputted < this.input.maxResultsPerCrawl
        )
            return false;
        if (!autoscaledPool) return false;
        log.info(
            `User set limit of ${this.input.maxResultsPerCrawl} results was reached. Finishing the crawl.`,
        );
        await autoscaledPool.abort();
        return true;
    }

    private async _handleResult(
        request: Request,
        response?: IncomingMessage,
        pageFunctionResult?: Dictionary,
        isError?: boolean,
    ) {
        const payload = tools.createDatasetPayload(
            request,
            response,
            pageFunctionResult,
            isError,
        );
        await this.dataset.pushData(payload);
        this.pagesOutputted++;
    }
}
