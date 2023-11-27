import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { browserTools, constants as scraperToolsConstants, CrawlerSetupOptions, createContext, RequestMetadata, tools } from '@apify/scraper-tools';
import {
    AutoscaledPool,
    Dataset,
    KeyValueStore,
    Request,
    RequestList,
    RequestQueue,
    PlaywrightCrawlingContext,
    PlaywrightCrawler,
    PlaywrightCrawlerOptions,
    PlaywrightLaunchContext,
    EnqueueLinksOptions,
    log,
    ProxyConfiguration,
} from '@crawlee/playwright';
import { Awaitable, Dictionary, sleep } from '@crawlee/utils';
import { Actor, ApifyEnv } from 'apify';
import { getInjectableScript } from 'idcac-playwright';
import playwright, { Response } from 'playwright';

import { Input, ProxyRotation } from './consts.js';

const SESSION_STORE_NAME = 'APIFY-PLAYWRIGHT-SCRAPER-SESSION-STORE';

const { META_KEY, DEFAULT_VIEWPORT, DEVTOOLS_TIMEOUT_SECS, SESSION_MAX_USAGE_COUNTS } = scraperToolsConstants;
const SCHEMA = JSON.parse(await readFile(new URL('../../INPUT_SCHEMA.json', import.meta.url), 'utf8'));

/**
 * Holds all the information necessary for constructing a crawler
 * instance and creating a context for a pageFunction invocation.
 */
export class CrawlerSetup implements CrawlerSetupOptions {
    name = 'Playwright Scraper';
    rawInput: string;
    env: ApifyEnv;
    /**
     * Used to store data that persist navigations
     */
    globalStore = new Map();
    requestQueue: RequestQueue;
    keyValueStore: KeyValueStore;
    customData: unknown;
    input: Input;
    maxSessionUsageCount: number;
    evaledPageFunction: (...args: unknown[]) => unknown;
    evaledPreNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];
    evaledPostNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];
    blockedUrlPatterns: string[] = [];
    devtools: boolean;
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;

    crawler!: PlaywrightCrawler;
    requestList!: RequestList;
    dataset!: Dataset;
    pagesOutputted!: number;
    private initPromise: Promise<void>;

    constructor(input: Input) {
        // Set log level early to prevent missed messages.
        if (input.debugLog) log.setLevel(log.LEVELS.DEBUG);

        // Keep this as string to be immutable.
        this.rawInput = JSON.stringify(input);

        // Attempt to load page function from disk if not present on input.
        tools.maybeLoadPageFunctionFromDisk(input, dirname(fileURLToPath(import.meta.url)));

        // Validate INPUT if not running on Apify Cloud Platform.
        if (!Actor.isAtHome()) tools.checkInputOrThrow(input, SCHEMA);

        this.input = input;
        this.env = Actor.getEnv();

        // Validations
        this.input.pseudoUrls.forEach((purl) => {
            if (!tools.isPlainObject(purl)) throw new Error('The pseudoUrls Array must only contain Objects.');
            if (purl.userData && !tools.isPlainObject(purl.userData)) throw new Error('The userData property of a pseudoUrl must be an Object.');
        });

        if (this.input.useChrome && this.input.launcher !== 'chromium') {
            throw new Error('useChrome option could only be used with Chromium browser selected.');
        }

        this.input.initialCookies.forEach((cookie) => {
            if (!tools.isPlainObject(cookie)) throw new Error('The initialCookies Array must only contain Objects.');
        });

        if (!/^(domcontentloaded|load|networkidle)$/.test(this.input.waitUntil)) {
            throw new Error('Navigation wait until event must be valid. See tooltip.');
        }

        // solving proxy rotation settings
        this.maxSessionUsageCount = SESSION_MAX_USAGE_COUNTS[this.input.proxyRotation];

        // Functions need to be evaluated.
        this.evaledPageFunction = tools.evalFunctionOrThrow(this.input.pageFunction);

        if (this.input.preNavigationHooks) {
            this.evaledPreNavigationHooks = tools.evalFunctionArrayOrThrow(this.input.preNavigationHooks, 'preNavigationHooks');
        } else {
            this.evaledPreNavigationHooks = [];
        }

        if (this.input.postNavigationHooks) {
            this.evaledPostNavigationHooks = tools.evalFunctionArrayOrThrow(this.input.postNavigationHooks, 'postNavigationHooks');
        } else {
            this.evaledPostNavigationHooks = [];
        }

        // Excluded resources
        this.blockedUrlPatterns = [];
        if (!this.input.downloadMedia) {
            this.blockedUrlPatterns = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.webm', '.ico', '.woff', '.eot'];
        }

        if (!this.input.downloadCss) {
            this.blockedUrlPatterns.push('.css');
        }

        // Start Chromium with Debugger any time the page function includes the keyword.
        this.devtools = this.input.pageFunction.includes('debugger;');

        // Named storages
        this.datasetName = this.input.datasetName;
        this.keyValueStoreName = this.input.keyValueStoreName;
        this.requestQueueName = this.input.requestQueueName;

        // Initialize async operations.
        this.crawler = null!;
        this.requestList = null!;
        this.requestQueue = null!;
        this.dataset = null!;
        this.keyValueStore = null!;
        this.initPromise = this._initializeAsync();
    }

    private async _initializeAsync() {
        // RequestList
        const startUrls = this.input.startUrls.map((req) => {
            req.useExtendedUniqueKey = true;
            req.keepUrlFragment = this.input.keepUrlFragments;
            return req;
        });

        this.requestList = await RequestList.open('PLAYWRIGHT_SCRAPER', startUrls);

        // RequestQueue
        this.requestQueue = await RequestQueue.open(this.requestQueueName);

        // Dataset
        this.dataset = await Dataset.open(this.datasetName);
        const info = await this.dataset.getInfo();
        this.pagesOutputted = info?.itemCount ?? 0;

        // KeyValueStore
        this.keyValueStore = await KeyValueStore.open(this.keyValueStoreName);
    }

    /**
     * Resolves to a `PlaywrightCrawler` instance.
     */
    async createCrawler() {
        await this.initPromise;

        const args = [];
        if (this.input.ignoreCorsAndCsp) args.push('--disable-web-security');

        const options: PlaywrightCrawlerOptions = {
            requestHandler: this._requestHandler.bind(this),
            requestList: this.requestList,
            requestQueue: this.requestQueue,
            requestHandlerTimeoutSecs: this.devtools ? DEVTOOLS_TIMEOUT_SECS : this.input.pageFunctionTimeoutSecs,
            preNavigationHooks: [],
            postNavigationHooks: [],
            failedRequestHandler: this._failedRequestHandler.bind(this),
            maxConcurrency: this.input.maxConcurrency,
            maxRequestRetries: this.input.maxRequestRetries,
            maxRequestsPerCrawl: this.input.maxPagesPerCrawl,
            proxyConfiguration: await Actor.createProxyConfiguration(this.input.proxyConfiguration) as any as ProxyConfiguration,
            launchContext: {
                useChrome: this.input.useChrome,
                launcher: playwright[this.input.launcher],
                launchOptions: {
                    ignoreHTTPSErrors: this.input.ignoreSslErrors,
                    bypassCSP: this.input.ignoreCorsAndCsp,
                    defaultViewport: DEFAULT_VIEWPORT,
                    devtools: this.devtools,
                    args,
                    headless: this.input.headless,
                },
            } as PlaywrightLaunchContext,
            useSessionPool: true,
            persistCookiesPerSession: true,
            sessionPoolOptions: {
                persistStateKeyValueStoreId: this.input.sessionPoolName ? SESSION_STORE_NAME : undefined,
                persistStateKey: this.input.sessionPoolName,
                sessionOptions: {
                    maxUsageCount: this.maxSessionUsageCount,
                },
            },
        };

        this._createNavigationHooks(options);

        if (this.input.proxyRotation === ProxyRotation.UntilFailure) {
            options.sessionPoolOptions!.maxPoolSize = 1;
        }

        this.crawler = new PlaywrightCrawler(options);

        return this.crawler;
    }

    private _createNavigationHooks(options: PlaywrightCrawlerOptions) {
        options.preNavigationHooks!.push(async ({ request, page, session, blockRequests }, gotoOptions) => {
            // Attach a console listener to get all logs from Browser context.
            if (this.input.browserLog) browserTools.dumpConsole(page);

            // Prevent download of stylesheets and media, unless selected otherwise
            if (this.blockedUrlPatterns.length) {
                await blockRequests({ urlPatterns: this.blockedUrlPatterns });
            }

            // Add initial cookies, if any.
            if (this.input.initialCookies && this.input.initialCookies.length) {
                const cookiesToSet = session
                    ? tools.getMissingCookiesFromSession(session, this.input.initialCookies, request.url)
                    : this.input.initialCookies;

                if (cookiesToSet?.length) {
                    // setting initial cookies that are not already in the session and page
                    session?.setCookies(cookiesToSet, request.url);
                    await page.context().addCookies(cookiesToSet);
                }
            }

            if (gotoOptions) {
                gotoOptions.timeout = (this.devtools ? DEVTOOLS_TIMEOUT_SECS : this.input.pageLoadTimeoutSecs) * 1000;
                gotoOptions.waitUntil = this.input.waitUntil;
            }
        });

        options.preNavigationHooks!.push(...this._runHookWithEnhancedContext(this.evaledPreNavigationHooks));
        options.postNavigationHooks!.push(...this._runHookWithEnhancedContext(this.evaledPostNavigationHooks));
    }

    private _runHookWithEnhancedContext(hooks: ((...args: unknown[]) => Awaitable<void>)[]) {
        return hooks.map((hook) => (ctx: Dictionary, ...args: unknown[]) => {
            const { customData } = this.input;
            return hook({ ...ctx, Apify: Actor, Actor, customData }, ...args);
        });
    }

    private async _failedRequestHandler({ request }: PlaywrightCrawlingContext) {
        const lastError = request.errorMessages[request.errorMessages.length - 1];
        const errorMessage = lastError ? lastError.split('\n')[0] : 'no error';
        log.error(`Request ${request.url} failed and will not be retried anymore. Marking as failed.\nLast Error Message: ${errorMessage}`);
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
    private async _requestHandler(crawlingContext: PlaywrightCrawlingContext) {
        const { request, response, crawler } = crawlingContext;

        /**
         * PRE-PROCESSING
         */
        // Make sure that an object containing internal metadata
        // is present on every request.
        tools.ensureMetaData(request);

        // Abort the crawler if the maximum number of results was reached.
        const aborted = await this._handleMaxResultsPerCrawl(crawler.autoscaledPool);
        if (aborted) return;

        const pageFunctionArguments: Dictionary = {};

        // We must use properties and descriptors not to trigger getters / setters.
        Object.defineProperties(pageFunctionArguments, Object.getOwnPropertyDescriptors(crawlingContext));

        pageFunctionArguments.response = {
            status: response && response.status(),
            headers: response && response.headers(),
        };

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
        const { context, state } = createContext(contextOptions);

        if (this.input.closeCookieModals) {
            await sleep(500);
            await crawlingContext.page.evaluate(getInjectableScript());
            await sleep(2000);
        }

        if (this.input.maxScrollHeightPixels > 0) {
            await crawlingContext.infiniteScroll({ maxScrollHeight: this.input.maxScrollHeightPixels });
        }

        /**
         * USER FUNCTION INVOCATION
         */
        const pageFunctionResult = await this.evaledPageFunction(context);

        /**
         * POST-PROCESSING
         */
        // Enqueue more links if Pseudo URLs and a link selector are available,
        // unless the user invoked the `skipLinks()` context function
        // or maxCrawlingDepth would be exceeded.
        if (!state.skipLinks) await this._handleLinks(crawlingContext);

        // Save the `pageFunction`s result to the default dataset.
        await this._handleResult(request, response, pageFunctionResult as Dictionary);
    }

    private async _handleMaxResultsPerCrawl(autoscaledPool?: AutoscaledPool) {
        if (!this.input.maxResultsPerCrawl || this.pagesOutputted < this.input.maxResultsPerCrawl) return false;
        if (!autoscaledPool) return false;
        log.info(`User set limit of ${this.input.maxResultsPerCrawl} results was reached. Finishing the crawl.`);
        await autoscaledPool.abort();
        return true;
    }

    private async _handleLinks({ request, enqueueLinks }: PlaywrightCrawlingContext) {
        if (!this.requestQueue) return;
        const currentDepth = (request.userData![META_KEY] as RequestMetadata).depth;
        const hasReachedMaxDepth = this.input.maxCrawlingDepth && currentDepth >= this.input.maxCrawlingDepth;
        if (hasReachedMaxDepth) {
            log.debug(`Request ${request.url} reached the maximum crawling depth of ${currentDepth}.`);
            return;
        }

        const enqueueOptions: EnqueueLinksOptions = {
            globs: this.input.globs,
            pseudoUrls: this.input.pseudoUrls,
            exclude: this.input.excludes,
            transformRequestFunction: (requestOptions) => {
                requestOptions.userData ??= {};
                requestOptions.userData[META_KEY] = {
                    parentRequestId: request.id || request.uniqueKey,
                    depth: currentDepth + 1,
                };

                requestOptions.useExtendedUniqueKey = true;
                requestOptions.keepUrlFragment = this.input.keepUrlFragments;
                return requestOptions;
            },
        };

        if (this.input.linkSelector) {
            await enqueueLinks({ ...enqueueOptions, selector: this.input.linkSelector });
        }
    }

    private async _handleResult(request: Request, response?: Response, pageFunctionResult?: Dictionary, isError?: boolean) {
        const payload = tools.createDatasetPayload(request, response, pageFunctionResult, isError);
        await this.dataset.pushData(payload);
        this.pagesOutputted++;
    }
}
