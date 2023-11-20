/* eslint-disable max-classes-per-file */

import { Log } from '@apify/log';
import type { CrawlerSetupOptions, constants, RequestMetadata } from '@apify/scraper-tools';
import type {
    KeyValueStore,
    RecordOptions,
    Request,
    RequestOptions,
    RequestQueue,
    RequestQueueOperationOptions,
    Dictionary,
} from '@crawlee/puppeteer';
import type { ApifyEnv } from 'apify';

import { Input } from './consts';
import { GlobalStore } from './global_store';

/**
 * Command to be evaluated for Browser side code injection.
 * @param apifyNamespace
 */
export function createBundle(apifyNamespace: string) {
    (function (global, namespace) {
        if (typeof window[namespace] !== 'object') window[namespace] = {};
        /**
         * Takes a configuration object with function references
         * as an input and creates a dummy class that proxies
         * function invocations from Browser context to Node context.
         *
         * The configuration is to be provided by the
         * tools.createBrowserHandlesForObject function.
         */
        class NodeProxy {
            constructor(config: Dictionary<{ value: unknown; type: 'METHOD' | 'VALUE' | 'GETTER' }>) {
                if (!config || typeof config !== 'object') {
                    throw new Error('NodeProxy: Parameter config of type Object must be provided.');
                }

                Object.entries(config)
                    .forEach(([key, { value, type }]) => {
                        if (type === 'METHOD') {
                            // @ts-expect-error
                            this[key] = (...args: unknown[]) => global[value](...args);
                        } else if (type === 'GETTER') {
                            Object.defineProperty(this, key, {
                                // @ts-expect-error
                                get: () => global[value](),
                            });
                        } else if (type === 'VALUE') {
                            // @ts-expect-error
                            this[key] = value;
                        } else {
                            throw new Error(`Unsupported function type: ${type} for function: ${key}.`);
                        }
                    });
            }
        }

        /**
         * Exposed factory.
         * @param config
         */
        global[namespace].createNodeProxy = (config: Dictionary<{ value: unknown; type: 'METHOD' | 'VALUE' | 'GETTER' }>) => new NodeProxy(config);

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
        class Context {
            [setup]: BrowserCrawlerSetup;
            [internalState]: InternalState;
            input: Input;
            env: ApifyEnv;
            customData: unknown;
            response: ProvidedResponse;
            request: Request;
            globalStore: GlobalStore<unknown>;
            log: Log;

            jQuery: any;

            constructor(options: ContextOptions) {
                const {
                    crawlerSetup,
                    browserHandles,
                    pageFunctionArguments,
                } = options;

                const createProxy = global[namespace].createNodeProxy;

                // Private
                this[setup] = crawlerSetup;
                this[internalState] = {
                    browserHandles,
                    requestQueue: browserHandles.requestQueue ? createProxy(browserHandles.requestQueue) : null,
                    keyValueStore: browserHandles.keyValueStore ? createProxy(browserHandles.keyValueStore) : null,
                };

                // Copies of Node objects
                this.input = JSON.parse(crawlerSetup.rawInput);
                this.env = { ...crawlerSetup.env };
                this.customData = crawlerSetup.customData;
                this.response = pageFunctionArguments.response as ProvidedResponse;
                this.request = pageFunctionArguments.request as Request;
                // Functions are not converted so we need to add them this way
                // to not be enumerable and thus not polluting the object.
                Reflect.defineProperty(this.request, 'pushErrorMessage', {
                    value(this: Request, errorOrMessage: Error) {
                        // It's a simplified fake of the original function.
                        const msg = (errorOrMessage && errorOrMessage.message) || `${errorOrMessage}`;
                        this.errorMessages.push(msg);
                    },
                    enumerable: false,
                });

                // Proxied Node objects
                this.globalStore = createProxy(browserHandles.globalStore);
                this.log = createProxy(browserHandles.log);

                // Browser side libraries
                if (this[setup].injectJQuery) this.jQuery = global.jQuery.noConflict(true);

                // Bind this to allow destructuring off context in pageFunction.
                this.getValue = this.getValue.bind(this);
                this.setValue = this.setValue.bind(this);
                this.saveSnapshot = this.saveSnapshot.bind(this);
                this.skipLinks = this.skipLinks.bind(this);
                this.enqueueRequest = this.enqueueRequest.bind(this);
                this.waitFor = this.waitFor.bind(this);
            }

            async getValue<T>(...args: Parameters<KeyValueStore['getValue']>) {
                return this[internalState].keyValueStore!.getValue(...args) as Promise<T>;
            }

            async setValue<T>(...args: Parameters<KeyValueStore['setValue']>) {
                return this[internalState].keyValueStore!.setValue(...args as [key: string, value: T | null, options?: RecordOptions]);
            }

            async saveSnapshot() {
                const handle = this[internalState].browserHandles.saveSnapshot as string;
                return global[handle]();
            }

            async skipLinks() {
                const handle = this[internalState].browserHandles.skipLinks as string;
                return global[handle]();
            }

            async enqueueRequest(requestOpts: RequestOptions = {} as RequestOptions, options: RequestQueueOperationOptions = {}) {
                const defaultRequestOpts = {
                    useExtendedUniqueKey: true,
                    keepUrlFragment: this.input.keepUrlFragments,
                };

                const newRequest = { ...defaultRequestOpts, ...requestOpts };

                const metaKey = this[setup].META_KEY;
                const defaultUserData = {
                    [metaKey]: {
                        parentRequestId: this.request.id || this.request.uniqueKey,
                        depth: (this.request.userData![metaKey] as RequestMetadata).depth + 1,
                    },
                };

                newRequest.userData = { ...defaultUserData, ...requestOpts.userData };

                return this[internalState].requestQueue!.addRequest(newRequest, options);
            }

            async waitFor(selectorOrNumberOrFunction: string | number | ((...args: unknown[]) => boolean), options = {}) {
                if (!options || typeof options !== 'object') throw new Error('Parameter options must be an Object');
                const type = typeof selectorOrNumberOrFunction;
                if (type === 'string') return this._waitForSelector(selectorOrNumberOrFunction as string, options);
                if (type === 'number') return this._waitForMillis(selectorOrNumberOrFunction as number);
                if (type === 'function') return this._waitForFunction(selectorOrNumberOrFunction as (...args: unknown[]) => boolean, options);
                throw new Error('Parameter selectorOrNumberOrFunction must be one of the said types.');
            }

            async _waitForSelector(selector: string, options = {}) {
                try {
                    await this._poll(() => {
                        return !!global.document.querySelector(selector);
                    }, options);
                } catch (err) {
                    const casted = err as Error;
                    if (/timeout of \d+ms exceeded/.test(casted.message)) {
                        throw new Error(`Timeout Error: waiting for selector failed: ${casted.message}`);
                    }
                    throw err;
                }
            }

            async _waitForMillis(millis: number) {
                return new Promise((res) => setTimeout(res, millis));
            }

            async _waitForFunction(predicate: () => boolean, options: PoolOptions = {}) {
                try {
                    await this._poll(predicate, options);
                } catch (err) {
                    const casted = err as Error;
                    if (/timeout of \d+ms exceeded/.test(casted.message)) {
                        throw new Error(`Timeout Error: waiting for function failed: ${casted.message}`);
                    }
                    throw err;
                }
            }

            async _poll(predicate: () => boolean, options: PoolOptions = {}) {
                const {
                    pollingIntervalMillis = 50,
                    timeoutMillis = 20000,
                } = options;
                return new Promise<void>((resolve, reject) => {
                    const handler = (): void => {
                        if (predicate()) {
                            resolve();
                        } else {
                            setTimeout(handler);
                        }
                    };
                    const pollTimeout = setTimeout(handler, pollingIntervalMillis);
                    setTimeout(() => {
                        clearTimeout(pollTimeout);
                        return reject(new Error(`timeout of ${timeoutMillis}ms exceeded.`));
                    }, timeoutMillis);
                });
            }
        }

        /**
         * Exposed factory.
         */
        global[namespace].createContext = (options: ContextOptions) => {
            return new Context(options);
        };
    }(window, apifyNamespace));
}

interface PoolOptions {
    pollingIntervalMillis?: number;
    timeoutMillis?: number;
}

interface InternalState {
    browserHandles: Dictionary<string | Record<string, { value: unknown; type: 'METHOD' | 'VALUE' | 'GETTER' }>>;
    requestQueue: RequestQueue | null;
    keyValueStore: KeyValueStore | null;
}

interface ContextOptions {
    crawlerSetup: BrowserCrawlerSetup;
    browserHandles: InternalState['browserHandles'];
    pageFunctionArguments: Dictionary<unknown>;
}

interface ProvidedResponse {
    status: number;
    headers: Dictionary<string>;
}

interface BrowserCrawlerSetup extends CrawlerSetupOptions {
    injectJQuery?: boolean;
    META_KEY: typeof constants.META_KEY;
}
