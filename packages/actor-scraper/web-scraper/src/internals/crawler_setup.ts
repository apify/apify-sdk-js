import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';

import type {
    AutoscaledPool,
    Awaitable,
    Dictionary,
    ProxyConfiguration,
    PuppeteerCrawlerOptions,
    PuppeteerCrawlingContext,
    Request,
} from '@crawlee/puppeteer';
import {
    Dataset,
    KeyValueStore,
    log,
    PuppeteerCrawler,
    puppeteerUtils,
    RequestList,
    RequestQueueV2,
} from '@crawlee/puppeteer';
import type { ApifyEnv } from 'apify';
import { Actor } from 'apify';
import contentType from 'content-type';
// @ts-expect-error no typings
import DevToolsServer from 'devtools-server';
import { getInjectableScript } from 'idcac-playwright';
import type { HTTPResponse, Page } from 'puppeteer';

import type { CrawlerSetupOptions, createContext } from '@apify/scraper-tools';
import {
    browserTools,
    constants as scraperToolsConstants,
    tools,
} from '@apify/scraper-tools';

import { createBundle } from './bundle.browser.js';
import type { Input } from './consts.js';
import {
    BreakpointLocation,
    CHROME_DEBUGGER_PORT,
    ProxyRotation,
    RunMode,
} from './consts.js';
import { GlobalStore } from './global_store.js';

const SESSION_STORE_NAME = 'APIFY-WEB-SCRAPER-SESSION-STORE';
const REQUEST_QUEUE_INIT_FLAG_KEY = 'REQUEST_QUEUE_INITIALIZED';

const MAX_CONCURRENCY_IN_DEVELOPMENT = 1;
const {
    SESSION_MAX_USAGE_COUNTS,
    DEFAULT_VIEWPORT,
    DEVTOOLS_TIMEOUT_SECS,
    META_KEY,
} = scraperToolsConstants;
const SCHEMA = JSON.parse(
    await readFile(new URL('../../INPUT_SCHEMA.json', import.meta.url), 'utf8'),
);

interface PageContext {
    apifyNamespace: string;
    skipLinks: boolean;
    timers: {
        start: [number, number];
        navStart?: [number, number];
    };

    browserHandles?: Awaited<ReturnType<CrawlerSetup['_injectBrowserHandles']>>;
}

interface Output {
    pageFunctionResult?: Dictionary;
    pageFunctionError?: tools.ErrorLike;
    requestFromBrowser: Request;
}

/**
 * Holds all the information necessary for constructing a crawler
 * instance and creating a context for a pageFunction invocation.
 */
export class CrawlerSetup implements CrawlerSetupOptions {
    name = 'Web Scraper';
    rawInput: string;
    env: ApifyEnv;
    /**
     * Used to store data that persist navigations
     */
    globalStore = new GlobalStore<unknown>();
    requestQueue: RequestQueueV2;
    keyValueStore: KeyValueStore;
    customData: unknown;
    input: Input;
    maxSessionUsageCount: number;
    evaledPreNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];
    evaledPostNavigationHooks: ((...args: unknown[]) => Awaitable<void>)[];

    /**
     * Used to store page specific data.
     */
    pageContexts = new WeakMap<Page, PageContext>();

    blockedUrlPatterns: string[] = [];
    isDevRun: boolean;
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;

    crawler!: PuppeteerCrawler;
    dataset!: Dataset;
    pagesOutputted!: number;
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
        this.input.pseudoUrls.forEach((purl) => {
            if (!tools.isPlainObject(purl)) {
                throw new Error(
                    'The pseudoUrls Array must only contain Objects.',
                );
            }
            if (purl.userData && !tools.isPlainObject(purl.userData)) {
                throw new Error(
                    'The userData property of a pseudoUrl must be an Object.',
                );
            }
        });

        this.input.initialCookies.forEach((cookie) => {
            if (!tools.isPlainObject(cookie)) {
                throw new Error(
                    'The initialCookies Array must only contain Objects.',
                );
            }
        });

        this.input.waitUntil.forEach((event) => {
            if (
                !/^(domcontentloaded|load|networkidle2|networkidle0)$/.test(
                    event,
                )
            ) {
                throw new Error(
                    'Navigation wait until events must be valid. See tooltip.',
                );
            }
        });

        // solving proxy rotation settings
        this.maxSessionUsageCount =
            SESSION_MAX_USAGE_COUNTS[this.input.proxyRotation];

        tools.evalFunctionOrThrow(this.input.pageFunction);

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

        // Excluded resources
        if (!this.input.downloadMedia) {
            this.blockedUrlPatterns = [
                '.jpg',
                '.jpeg',
                '.png',
                '.svg',
                '.gif',
                '.webp',
                '.webm',
                '.ico',
                '.woff',
                '.eot',
            ];
        }

        if (!this.input.downloadCss) {
            this.blockedUrlPatterns.push('.css');
        }

        this.isDevRun = this.input.runMode === RunMode.Development;

        // Named storages
        this.datasetName = this.input.datasetName;
        this.keyValueStoreName = this.input.keyValueStoreName;
        this.requestQueueName = this.input.requestQueueName;

        // Initialize async operations.
        this.crawler = null!;
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
    }

    /**
     * Resolves to a `PuppeteerCrawler` instance.
     * constructor.
     */
    async createCrawler() {
        await this.initPromise;

        const args = ['--disable-dev-shm-usage'];
        if (this.input.ignoreCorsAndCsp) args.push('--disable-web-security');
        if (this.isDevRun)
            args.push(`--remote-debugging-port=${CHROME_DEBUGGER_PORT}`);

        const options: PuppeteerCrawlerOptions = {
            requestHandler: this._requestHandler.bind(this),
            requestQueue: this.requestQueue,
            requestHandlerTimeoutSecs: this.isDevRun
                ? DEVTOOLS_TIMEOUT_SECS
                : this.input.pageFunctionTimeoutSecs,
            preNavigationHooks: [],
            postNavigationHooks: [],
            failedRequestHandler: this._failedRequestHandler.bind(this),
            respectRobotsTxtFile: this.input.respectRobotsTxtFile,
            maxConcurrency: this.isDevRun
                ? MAX_CONCURRENCY_IN_DEVELOPMENT
                : this.input.maxConcurrency,
            maxRequestRetries: this.input.maxRequestRetries,
            maxRequestsPerCrawl: this.input.maxPagesPerCrawl,
            proxyConfiguration: (await Actor.createProxyConfiguration(
                this.input.proxyConfiguration,
            )) as any as ProxyConfiguration,
            browserPoolOptions: {
                preLaunchHooks: [
                    async () => {
                        if (!this.isDevRun) {
                            return;
                        }

                        const devToolsServer = new DevToolsServer({
                            containerHost: new URL(
                                process.env.ACTOR_WEB_SERVER_URL!,
                            ).host,
                            devToolsServerPort:
                                process.env.ACTOR_WEB_SERVER_PORT,
                            chromeRemoteDebuggingPort: CHROME_DEBUGGER_PORT,
                        });
                        await devToolsServer.start();
                    },
                ],
            },
            launchContext: {
                useChrome: this.input.useChrome,
                launchOptions: {
                    acceptInsecureCerts: this.input.ignoreSslErrors,
                    defaultViewport: DEFAULT_VIEWPORT,
                    args,
                    headless: this.input.headless,
                },
            },
            useSessionPool: !this.isDevRun,
            persistCookiesPerSession: !this.isDevRun,
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
        if (this.isDevRun) {
            options.browserPoolOptions!.retireBrowserAfterPageCount = Infinity;
        }

        this.crawler = new PuppeteerCrawler(options);

        if (this.isDevRun) logDevRunWarning();
        return this.crawler;
    }

    private _createNavigationHooks(options: PuppeteerCrawlerOptions) {
        options.preNavigationHooks!.push(
            async ({ request, page, session }, gotoOptions) => {
                const start = process.hrtime();

                // Create a new page context with a new random key for Apify namespace.
                const pageContext: PageContext = {
                    apifyNamespace: await tools.createRandomHash(),
                    skipLinks: false,
                    timers: { start },
                };
                this.pageContexts.set(page, pageContext);

                // Attach a console listener to get all logs as soon as possible.
                if (this.input.browserLog) browserTools.dumpConsole(page);

                // Prevent download of stylesheets and media, unless selected otherwise
                if (this.blockedUrlPatterns.length) {
                    await puppeteerUtils.blockRequests(page, {
                        urlPatterns: this.blockedUrlPatterns,
                    });
                }

                // Add initial cookies, if any.
                if (
                    this.input.initialCookies &&
                    this.input.initialCookies.length
                ) {
                    const cookiesToSet = session
                        ? tools.getMissingCookiesFromSession(
                              session,
                              this.input.initialCookies,
                              request.url,
                          )
                        : this.input.initialCookies;
                    if (cookiesToSet && cookiesToSet.length) {
                        // setting initial cookies that are not already in the session and page
                        // TODO: We can remove the condition when there is an option to define blocked status codes in sessionPool
                        session?.setCookies(cookiesToSet, request.url);
                        await page.setCookie(...cookiesToSet);
                    }
                }

                // Disable content security policy.
                if (this.input.ignoreCorsAndCsp) await page.setBypassCSP(true);

                tools.logPerformance(request, 'gotoFunction INIT', start);
                const handleStart = process.hrtime();
                pageContext.browserHandles = await this._injectBrowserHandles(
                    page,
                    pageContext,
                );
                tools.logPerformance(
                    request,
                    'gotoFunction INJECTION HANDLES',
                    handleStart,
                );

                const evalStart = process.hrtime();
                await Promise.all([
                    page.evaluateOnNewDocument(
                        createBundle,
                        pageContext.apifyNamespace,
                    ),
                    page.evaluateOnNewDocument(
                        browserTools.wrapPageFunction(
                            this.input.pageFunction,
                            pageContext.apifyNamespace,
                        ),
                    ),
                ]);
                tools.logPerformance(
                    request,
                    'gotoFunction INJECTION EVAL',
                    evalStart,
                );

                if (this.isDevRun) {
                    const cdpClient = await page.target().createCDPSession();
                    await cdpClient.send('Debugger.enable');
                    if (
                        this.input.breakpointLocation ===
                        BreakpointLocation.BeforeGoto
                    ) {
                        await cdpClient.send('Debugger.pause');
                    }
                }

                pageContext.timers.navStart = process.hrtime();
                if (gotoOptions) {
                    gotoOptions.timeout = this.input.pageLoadTimeoutSecs * 1000;
                    gotoOptions.waitUntil = this.input.waitUntil;
                }
            },
        );

        options.preNavigationHooks!.push(
            ...this._runHookWithEnhancedContext(this.evaledPreNavigationHooks),
        );
        options.postNavigationHooks!.push(
            ...this._runHookWithEnhancedContext(this.evaledPostNavigationHooks),
        );

        options.postNavigationHooks!.push(
            async ({ request, page, response }) => {
                await this._waitForLoadEventWhenXml(page, response);
                const pageContext = this.pageContexts.get(page)!;
                tools.logPerformance(
                    request,
                    'gotoFunction NAVIGATION',
                    pageContext.timers.navStart!,
                );

                const delayStart = process.hrtime();
                await this._assertNamespace(page, pageContext.apifyNamespace);

                // Inject selected libraries
                if (this.input.injectJQuery)
                    await puppeteerUtils.injectJQuery(page);

                tools.logPerformance(
                    request,
                    'gotoFunction INJECTION DELAY',
                    delayStart,
                );
                tools.logPerformance(
                    request,
                    'gotoFunction EXECUTION',
                    pageContext.timers.start,
                );
            },
        );
    }

    private _runHookWithEnhancedContext(
        hooks: ((...args: unknown[]) => Awaitable<void>)[],
    ) {
        return hooks.map((hook) => (ctx: Dictionary, ...args: unknown[]) => {
            const { customData } = this.input;
            return hook({ ...ctx, customData }, ...args);
        });
    }

    private async _failedRequestHandler({ request }: PuppeteerCrawlingContext) {
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
    private async _requestHandler(crawlingContext: PuppeteerCrawlingContext) {
        const { request, response, page, crawler, proxyInfo } = crawlingContext;
        const start = process.hrtime();
        const pageContext = this.pageContexts.get(page)!;

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

        // Setup Context and pass the configuration down to Browser.
        const contextOptions = {
            crawlerSetup: {
                rawInput: this.rawInput,
                env: this.env,
                customData: this.input.customData,
                injectJQuery: this.input.injectJQuery,
                META_KEY,
            },
            browserHandles: pageContext.browserHandles,
            pageFunctionArguments: {
                request,
                proxyInfo,
                response: {
                    status: response && response.status(),
                    headers: response && response.headers(),
                },
            },
        };

        /**
         * USER FUNCTION EXECUTION
         */
        tools.logPerformance(request, 'requestHandler PREPROCESSING', start);

        if (
            this.isDevRun &&
            this.input.breakpointLocation ===
                BreakpointLocation.BeforePageFunction
        ) {
            await page.evaluate(async () => {
                // eslint-disable-next-line no-debugger -- Debugger is enabled in dev run
                debugger;
            });
        }

        if (this.input.closeCookieModals) {
            await setTimeout(500);
            await page.evaluate(getInjectableScript());
            await setTimeout(2000);
        }

        if (this.input.maxScrollHeightPixels > 0) {
            await crawlingContext.infiniteScroll({
                maxScrollHeight: this.input.maxScrollHeightPixels,
            });
        }

        const startUserFn = process.hrtime();

        const namespace = pageContext.apifyNamespace;
        const output = await page.evaluate(
            async (ctxOpts: typeof contextOptions, namespc: string) => {
                const context: ReturnType<typeof createContext>['context'] =
                    window[namespc].createContext(ctxOpts);
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const output = {} as Output;
                try {
                    output.pageFunctionResult =
                        await window[namespc].pageFunction(context);
                } catch (err) {
                    const casted = err as Error;
                    output.pageFunctionError = Object.getOwnPropertyNames(
                        casted,
                    ).reduce((memo, name) => {
                        memo[name] = casted[name as keyof Error];
                        return memo;
                    }, {} as Dictionary);
                }

                // This needs to be added after pageFunction has run.
                output.requestFromBrowser = context.request as Request;

                /**
                 * Since Dates cannot travel back to Node and Puppeteer does not use .toJSON
                 * to stringify, they come back as empty objects. We could use JSON.stringify
                 * ourselves, but that exposes us to overridden .toJSON in the target websites.
                 * This hack is not ideal, but it avoids both problems.
                 */
                function replaceAllDatesInObjectWithISOStrings(obj: Output) {
                    for (const [key, value] of Object.entries(obj)) {
                        if (
                            value instanceof Date &&
                            typeof value.toISOString === 'function'
                        ) {
                            Reflect.set(obj, key, value.toISOString());
                        } else if (value && typeof value === 'object') {
                            replaceAllDatesInObjectWithISOStrings(
                                value as Output,
                            );
                        }
                    }
                    return obj;
                }

                return replaceAllDatesInObjectWithISOStrings(output);
            },
            contextOptions,
            namespace,
        );

        tools.logPerformance(
            request,
            'requestHandler USER FUNCTION',
            startUserFn,
        );
        const finishUserFn = process.hrtime();

        /**
         * POST-PROCESSING
         */
        const { pageFunctionResult, requestFromBrowser, pageFunctionError } =
            output;
        // Merge requestFromBrowser into request to preserve modifications that
        // may have been made in browser context.
        Object.assign(request, requestFromBrowser);

        // Throw error from pageFunction, if any.
        if (pageFunctionError) throw tools.createError(pageFunctionError);

        // Enqueue more links if a link selector is available,
        // unless the user invoked the `skipLinks()` context function
        // or maxCrawlingDepth would be exceeded.
        if (!pageContext.skipLinks) {
            await this._handleLinks(crawlingContext);
        }

        // Save the `pageFunction`s result (or just metadata) to the default dataset.
        await this._handleResult(request, response, pageFunctionResult);

        tools.logPerformance(
            request,
            'requestHandler POSTPROCESSING',
            finishUserFn,
        );
        tools.logPerformance(request, 'requestHandler EXECUTION', start);

        if (
            this.isDevRun &&
            this.input.breakpointLocation ===
                BreakpointLocation.AfterPageFunction
        ) {
            await page.evaluate(async () => {
                // eslint-disable-next-line no-debugger -- Debugger is enabled in dev run
                debugger;
            });
        }
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

    private async _handleLinks({
        request,
        enqueueLinks,
    }: PuppeteerCrawlingContext) {
        if (!(this.input.linkSelector && this.requestQueue)) return;
        const start = process.hrtime();

        const currentDepth = (
            request.userData![META_KEY] as tools.RequestMetadata
        ).depth;
        const hasReachedMaxDepth =
            this.input.maxCrawlingDepth &&
            currentDepth >= this.input.maxCrawlingDepth;
        if (hasReachedMaxDepth) {
            log.debug(
                `Request ${request.url} reached the maximum crawling depth of ${currentDepth}.`,
            );
            return;
        }

        await enqueueLinks({
            selector: this.input.linkSelector,
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
        });

        tools.logPerformance(request, 'handleLinks EXECUTION', start);
    }

    private async _handleResult(
        request: Request,
        response?: HTTPResponse,
        pageFunctionResult?: Dictionary,
        isError?: boolean,
    ) {
        const start = process.hrtime();
        const payload = tools.createDatasetPayload(
            request,
            response,
            pageFunctionResult,
            isError,
        );
        await this.dataset.pushData(payload);
        this.pagesOutputted++;
        tools.logPerformance(request, 'handleResult EXECUTION', start);
    }

    private async _assertNamespace(page: Page, namespace: string) {
        try {
            await page.waitForFunction(
                (nmspc: string) => !!window[nmspc],
                { timeout: this.input.pageLoadTimeoutSecs * 1000 },
                namespace,
            );
        } catch (err) {
            const casted = err as Error;
            if (casted.stack!.startsWith('TimeoutError')) {
                throw new Error(
                    'Injection of environment into the browser context timed out. ' +
                        'If this persists even after retries, try increasing the Page load timeout input setting.',
                );
            } else {
                throw err;
            }
        }
    }

    private async _waitForLoadEventWhenXml(
        page: Page,
        response?: HTTPResponse,
    ) {
        // Response can sometimes be null.
        if (!response) return;

        const cTypeHeader = response.headers()['content-type'];
        try {
            const { type } = contentType.parse(cTypeHeader);
            if (!/^(text|application)\/xml$|\+xml$/.test(type)) return;
        } catch (err) {
            // Invalid type is not XML.
            return;
        }

        try {
            const timeout = this.input.pageLoadTimeoutSecs * 1000;
            await page.waitForFunction(
                () => document.readyState === 'complete',
                { timeout },
            );
        } catch (err) {
            const casted = err as Error;
            if (casted.stack!.startsWith('TimeoutError')) {
                throw new Error(
                    "Parsing of XML in the page timed out. If you're expecting a large XML file, " +
                        ' such as a site map, try increasing the Page load timeout input setting.',
                );
            } else {
                throw err;
            }
        }
    }

    private async _injectBrowserHandles(page: Page, pageContext: PageContext) {
        const saveSnapshotP = browserTools.createBrowserHandle(page, async () =>
            browserTools.saveSnapshot({ page }),
        );
        const skipLinksP = browserTools.createBrowserHandle(page, () => {
            pageContext.skipLinks = true;
        });
        const globalStoreP = browserTools.createBrowserHandlesForObject(
            page,
            this.globalStore,
            [
                'size',
                'clear',
                'delete',
                'entries',
                'get',
                'has',
                'keys',
                'set',
                'values',
            ],
            ['size'],
        );
        const logP = browserTools.createBrowserHandlesForObject(page, log, [
            'LEVELS',
            'setLevel',
            'getLevel',
            'debug',
            'info',
            'warning',
            'error',
            'exception',
        ]);
        const requestQueueP = this.requestQueue
            ? browserTools.createBrowserHandlesForObject(
                  page,
                  this.requestQueue,
                  ['addRequest'],
              )
            : null;
        const keyValueStoreP = this.keyValueStore
            ? browserTools.createBrowserHandlesForObject(
                  page,
                  this.keyValueStore,
                  ['getValue', 'setValue'],
              )
            : null;

        const [
            saveSnapshot,
            skipLinks,
            globalStore,
            logHandle,
            requestQueue,
            keyValueStore,
        ] = await Promise.all([
            saveSnapshotP,
            skipLinksP,
            globalStoreP,
            logP,
            requestQueueP,
            keyValueStoreP,
        ]);

        return {
            saveSnapshot,
            skipLinks,
            globalStore,
            log: logHandle,
            keyValueStore,
            requestQueue,
        };
    }
}

function logDevRunWarning() {
    log.warning(`
*****************************************************************
*          Web Scraper is running in DEVELOPMENT MODE!          *
*       Concurrency is limited, sessionPool is not available,   *
*       timeouts are increased and debugger is enabled.         *
*       If you want full control and performance switch         *
*                    Run type to PRODUCTION!                    *
*****************************************************************
`);
}
