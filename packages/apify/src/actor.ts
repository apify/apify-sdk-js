import { createPrivateKey } from 'node:crypto';

import { ACTOR_ENV_VARS, APIFY_ENV_VARS, INTEGER_ENV_VARS } from '@apify/consts';
import { decryptInputSecrets } from '@apify/input_secrets';
import log from '@apify/log';
import { addTimeoutToPromise } from '@apify/timeout';
import type {
    ConfigurationOptions,
    EventManager,
    EventTypeName,
    IStorage,
    RecordOptions,
    UseStateOptions,
} from '@crawlee/core';
import {
    Configuration as CoreConfiguration,
    Dataset,
    EventType,
    RequestQueue,
    StorageManager,
    purgeDefaultStorages,
} from '@crawlee/core';
import type { Awaitable, Constructor, Dictionary, SetStatusMessageOptions, StorageClient } from '@crawlee/types';
import { sleep, snakeCaseToCamelCase } from '@crawlee/utils';
import type {
    ActorCallOptions,
    ApifyClientOptions,
    RunAbortOptions,
    TaskCallOptions,
    Webhook,
    WebhookEventType,
} from 'apify-client';
import {
    ActorRun as ClientActorRun,
    ApifyClient,
} from 'apify-client';
import ow from 'ow';

import { Configuration } from './configuration';
import { KeyValueStore } from './key_value_store';
import { PlatformEventManager } from './platform_event_manager';
import type { ProxyConfigurationOptions } from './proxy_configuration';
import { ProxyConfiguration } from './proxy_configuration';
import { logSystemInfo, printOutdatedSdkWarning } from './utils';

/**
 * `Actor` class serves as an alternative approach to the static helpers exported from the package. It allows to pass configuration
 * that will be used on the instance methods. Environment variables will have precedence over this configuration.
 * See {@apilink Configuration} for details about what can be configured and what are the default values.
 */
export class Actor<Data extends Dictionary = Dictionary> {
    /** @internal */
    static _instance: Actor;

    /**
     * Configuration of this SDK instance (provided to its constructor). See {@apilink Configuration} for details.
     * @internal
     */
    readonly config: Configuration;

    /**
     * Default {@apilink ApifyClient} instance.
     * @internal
     */
    readonly apifyClient: ApifyClient;

    /**
     * Default {@apilink EventManager} instance.
     * @internal
     */
    readonly eventManager: EventManager;

    /**
     * Whether the actor instance was initialized. This is set by calling {@apilink Actor.init}.
     */
    initialized = false;

    /**
     * Set if the actor called a method that requires the instance to be initialized, but did not do so.
     * A call to `init` after this warning is emitted is considered  an invalid state and will throw an error.
     */
    private warnedAboutMissingInitCall = false;

    constructor(options: ConfigurationOptions = {}) {
        // use default configuration object if nothing overridden (it fallbacks to env vars)
        this.config = Object.keys(options).length === 0 ? Configuration.getGlobalConfig() : new Configuration(options);
        this.apifyClient = this.newClient();
        this.eventManager = new PlatformEventManager(this.config);
    }

    /**
     * Runs the main user function that performs the job of the actor
     * and terminates the process when the user function finishes.
     *
     * **The `Actor.main()` function is optional** and is provided merely for your convenience.
     * It is mainly useful when you're running your code as an actor on the [Apify platform](https://apify.com/actors).
     * However, if you want to use Apify SDK tools directly inside your existing projects, e.g.
     * running in an [Express](https://expressjs.com/) server, on
     * [Google Cloud functions](https://cloud.google.com/functions)
     * or [AWS Lambda](https://aws.amazon.com/lambda/), it's better to avoid
     * it since the function terminates the main process when it finishes!
     *
     * The `Actor.main()` function performs the following actions:
     *
     * - When running on the Apify platform (i.e. `APIFY_IS_AT_HOME` environment variable is set),
     *   it sets up a connection to listen for platform events.
     *   For example, to get a notification about an imminent migration to another server.
     *   See {@apilink Actor.events} for details.
     * - It checks that either `APIFY_TOKEN` or `APIFY_LOCAL_STORAGE_DIR` environment variable
     *   is defined. If not, the functions sets `APIFY_LOCAL_STORAGE_DIR` to `./apify_storage`
     *   inside the current working directory. This is to simplify running code examples.
     * - It invokes the user function passed as the `userFunc` parameter.
     * - If the user function returned a promise, waits for it to resolve.
     * - If the user function throws an exception or some other error is encountered,
     *   prints error details to console so that they are stored to the log.
     * - Exits the Node.js process, with zero exit code on success and non-zero on errors.
     *
     * The user function can be synchronous:
     *
     * ```javascript
     * await Actor.main(() => {
     *   // My synchronous function that returns immediately
     *   console.log('Hello world from actor!');
     * });
     * ```
     *
     * If the user function returns a promise, it is considered asynchronous:
     * ```javascript
     * import { gotScraping } from 'got-scraping';
     *
     * await Actor.main(() => {
     *   // My asynchronous function that returns a promise
     *   return gotScraping('http://www.example.com').then((html) => {
     *     console.log(html);
     *   });
     * });
     * ```
     *
     * To simplify your code, you can take advantage of the `async`/`await` keywords:
     *
     * ```javascript
     * import { gotScraping } from 'got-scraping';
     *
     * await Actor.main(async () => {
     *   // My asynchronous function
     *   const html = await request('http://www.example.com');
     *   console.log(html);
     * });
     * ```
     *
     * @param userFunc User function to be executed. If it returns a promise,
     * the promise will be awaited. The user function is called with no arguments.
     * @param options
     * @ignore
     */
    async main<T>(userFunc: UserFunc, options?: MainOptions): Promise<T> {
        if (!userFunc || typeof userFunc !== 'function') {
            throw new Error(`First parameter for Actor.main() must be a function (was '${userFunc === null ? 'null' : typeof userFunc}').`);
        }

        return (async () => {
            await this.init(options);
            let ret: T;

            try {
                ret = await userFunc() as T;
                await this.exit(options);
            } catch (err: any) {
                log.exception(err, err.message);
                await this.exit({ exitCode: EXIT_CODES.ERROR_USER_FUNCTION_THREW });
            }

            return ret!;
        })();
    }

    /**
     * @ignore
     */
    async init(options: InitOptions = {}): Promise<void> {
        if (this.initialized) {
            log.debug(`Actor SDK was already initialized`);
            return;
        }

        // If the warning about forgotten init call was emitted, we will not continue the init procedure.
        if (this.warnedAboutMissingInitCall) {
            throw new Error([
                'Actor.init() was called after a method that would access a storage client was used.',
                'This in an invalid state. Please make sure to call Actor.init() before such methods are called.',
            ].join('\n'));
        }

        this.initialized = true;

        logSystemInfo();
        printOutdatedSdkWarning();

        // reset global config instance to respect APIFY_ prefixed env vars
        CoreConfiguration.globalConfig = Configuration.getGlobalConfig();

        if (this.isAtHome()) {
            this.config.set('availableMemoryRatio', 1);
            this.config.set('disableBrowserSandbox', true); // for browser launcher, adds `--no-sandbox` to args
            this.config.useStorageClient(this.apifyClient);
            this.config.useEventManager(this.eventManager);
        } else if (options.storage) {
            this.config.useStorageClient(options.storage);
        }

        // Init the event manager the config uses
        await this.config.getEventManager().init();
        log.debug(`Events initialized`);

        await purgeDefaultStorages({
            config: this.config,
            onlyPurgeOnce: true,
        });
        log.debug(`Default storages purged`);

        Configuration.storage.enterWith(this.config);
    }

    /**
     * @ignore
     */
    async exit(messageOrOptions?: string | ExitOptions, options: ExitOptions = {}): Promise<void> {
        options = typeof messageOrOptions === 'string' ? { ...options, statusMessage: messageOrOptions } : { ...messageOrOptions, ...options };
        options.exit ??= true;
        options.exitCode ??= EXIT_CODES.SUCCESS;
        options.timeoutSecs ??= 30;
        const client = this.config.getStorageClient();
        const events = this.config.getEventManager();

        // Close the event manager and emit the final PERSIST_STATE event
        await events.close();
        log.debug(`Events closed`);

        // Emit the exit event
        events.emit(EventType.EXIT, options);

        // Wait for all event listeners to be processed
        log.debug(`Waiting for all event listeners to complete their execution (with ${options.timeoutSecs} seconds timeout)`);
        await addTimeoutToPromise(
            async () => {
                await events.waitForAllListenersToComplete();

                if (client.teardown) {
                    let finished = false;
                    setTimeout(() => {
                        if (!finished) {
                            log.info('Waiting for the storage to write its state to file system.');
                        }
                    }, 1000);
                    await client.teardown();
                    finished = true;
                }

                if (options.statusMessage != null) {
                    await this.setStatusMessage(options.statusMessage, { isStatusMessageTerminal: true, level: options.exitCode! > 0 ? 'ERROR' : 'INFO' });
                }
            },
            options.timeoutSecs * 1000,
            `Waiting for all event listeners to complete their execution timed out after ${options.timeoutSecs} seconds`,
        ).catch(() => {
            if (options.exit) {
                process.exit(options.exitCode);
            }
        });

        if (!options.exit) {
            return;
        }

        process.exit(options.exitCode);
    }

    /**
     * @ignore
     */
    async fail(messageOrOptions?: string | ExitOptions, options: ExitOptions = {}): Promise<void> {
        return this.exit(messageOrOptions, { exitCode: 1, ...options });
    }

    /**
     * @ignore
     */
    on(event: EventTypeName, listener: (...args: any[]) => any): void {
        this.config.getEventManager().on(event, listener);
    }

    /**
     * @ignore
     */
    off(event: EventTypeName, listener?: (...args: any[]) => any): void {
        this.config.getEventManager().off(event, listener);
    }

    /**
     * Runs an actor on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * If you want to run an actor task rather than an actor, please use the {@apilink Actor.callTask} function instead.
     *
     * For more information about actors, read the [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.call('apify/hello-world', { myInput: 123 });
     * ```
     *
     * @param actorId
     *  Allowed formats are `username/actor-name`, `userId/actor-name` or actor ID.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise the `options.contentType` parameter must be provided.
     * @param [options]
     * @ignore
     */
    async call(actorId: string, input?: unknown, options: CallOptions = {}): Promise<ClientActorRun> {
        const { token, ...rest } = options;
        const client = token ? this.newClient({ token }) : this.apifyClient;

        return client.actor(actorId).call(input, rest);
    }

    /**
     * Runs an actor on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable),
     * unlike `Actor.call`, this method just starts the run without waiting for finish.
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * For more information about actors, read the
     * [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.start('apify/hello-world', { myInput: 123 });
     * ```
     *
     * @param actorId
     *  Allowed formats are `username/actor-name`, `userId/actor-name` or actor ID.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise the `options.contentType` parameter must be provided.
     * @param [options]
     * @ignore
     */
    async start(actorId: string, input?: unknown, options: CallOptions = {}): Promise<ClientActorRun> {
        const { token, ...rest } = options;
        const client = token ? this.newClient({ token }) : this.apifyClient;

        return client.actor(actorId).start(input, rest);
    }

    /**
     * Aborts given actor run on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * For more information about actors, read the
     * [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.abort(runId);
     * ```
     * @ignore
     */
    async abort(runId: string, options: AbortOptions = {}): Promise<ClientActorRun> {
        const { token, statusMessage, ...rest } = options;
        const client = token ? this.newClient({ token }) : this.apifyClient;

        if (statusMessage) {
            await this.setStatusMessage(statusMessage, { isStatusMessageTerminal: true });
        }

        return client.run(runId).abort(rest);
    }

    /**
     * Runs an actor task on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * Note that an actor task is a saved input configuration and options for an actor.
     * If you want to run an actor directly rather than an actor task, please use the
     * {@apilink Actor.call} function instead.
     *
     * For more information about actor tasks, read the [documentation](https://docs.apify.com/tasks).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.callTask('bob/some-task');
     * ```
     *
     * @param taskId
     *  Allowed formats are `username/task-name`, `userId/task-name` or task ID.
     * @param [input]
     *  Input overrides for the actor task. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Provided input will be merged with actor task input.
     * @param [options]
     * @ignore
     */
    async callTask(taskId: string, input?: Dictionary, options: CallTaskOptions = {}): Promise<ClientActorRun> {
        const { token, ...rest } = options;
        const client = token ? this.newClient({ token }) : this.apifyClient;

        return client.task(taskId).call(input, rest);
    }

    /**
     * Transforms this actor run to an actor run of a given actor. The system stops the current container and starts
     * the new container instead. All the default storages are preserved and the new input is stored under the `INPUT-METAMORPH-1` key
     * in the same default key-value store.
     *
     * @param targetActorId
     *  Either `username/actor-name` or actor ID of an actor to which we want to metamorph.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise, the `options.contentType` parameter must be provided.
     * @param [options]
     * @ignore
     */
    async metamorph(targetActorId: string, input?: unknown, options: MetamorphOptions = {}): Promise<void> {
        if (!this.isAtHome()) {
            log.warning('Actor.metamorph() is only supported when running on the Apify platform.');
            return;
        }

        const {
            customAfterSleepMillis = this.config.get('metamorphAfterSleepMillis'),
            ...metamorphOpts
        } = options;
        const runId = this.config.get('actorRunId')!;
        await this.apifyClient.run(runId).metamorph(targetActorId, input, metamorphOpts);

        // Wait some time for container to be stopped.
        await sleep(customAfterSleepMillis);
    }

    /**
     * Internally reboots this actor. The system stops the current container and starts
     * a new container with the same run ID.
     * This can be used to get the Actor out of irrecoverable error state and continue where it left off.
     *
     * @ignore
     */
    async reboot(options: RebootOptions = {}): Promise<void> {
        if (!this.isAtHome()) {
            log.warning('Actor.reboot() is only supported when running on the Apify platform.');
            return;
        }

        // Waiting for all the listeners to finish, as `.reboot()` kills the container.
        await Promise.all([
            // `persistState` for individual RequestLists, RequestQueue... instances to be persisted
            ...this.config.getEventManager().listeners(EventType.PERSIST_STATE).map(async (x) => x()),
            // `migrating` to pause Apify crawlers
            ...this.config.getEventManager().listeners(EventType.MIGRATING).map(async (x) => x()),
        ]);

        const runId = this.config.get('actorRunId')!;
        await this.apifyClient.run(runId).reboot();

        // Wait some time for container to be stopped.
        const { customAfterSleepMillis = this.config.get('metamorphAfterSleepMillis') } = options;
        await sleep(customAfterSleepMillis);
    }

    /**
     * Creates an ad-hoc webhook for the current actor run, which lets you receive a notification when the actor run finished or failed.
     * For more information about Apify actor webhooks, please see the [documentation](https://docs.apify.com/webhooks).
     *
     * Note that webhooks are only supported for actors running on the Apify platform.
     * In local environment, the function will print a warning and have no effect.
     *
     * @param options
     * @returns The return value is the Webhook object.
     * For more information, see the [Get webhook](https://apify.com/docs/api/v2#/reference/webhooks/webhook-object/get-webhook) API endpoint.
     * @ignore
     */
    async addWebhook(options: WebhookOptions): Promise<Webhook | undefined> {
        ow(options, ow.object.exactShape({
            eventTypes: ow.array.ofType<WebhookEventType>(ow.string),
            requestUrl: ow.string,
            payloadTemplate: ow.optional.string,
            idempotencyKey: ow.optional.string,
        }));

        const { eventTypes, requestUrl, payloadTemplate, idempotencyKey } = options;

        if (!this.isAtHome()) {
            log.warning('Actor.addWebhook() is only supported when running on the Apify platform. The webhook will not be invoked.');
            return undefined;
        }

        const runId = this.config.get('actorRunId')!;
        if (!runId) {
            throw new Error(`Environment variable ${ACTOR_ENV_VARS.RUN_ID} is not set!`);
        }

        return this.apifyClient.webhooks().create({
            isAdHoc: true,
            eventTypes,
            condition: {
                actorRunId: runId,
            },
            requestUrl,
            payloadTemplate,
            idempotencyKey,
        });
    }

    /**
     * Sets the status message for the current actor run.
     *
     * @returns The return value is the Run object.
     * For more information, see the [Actor Runs](https://docs.apify.com/api/v2#/reference/actor-runs/) API endpoints.
     * @ignore
     */
    async setStatusMessage(statusMessage: string, options?: SetStatusMessageOptions): Promise<ClientActorRun> {
        const { isStatusMessageTerminal, level } = options || {};
        ow(statusMessage, ow.string);
        ow(isStatusMessageTerminal, ow.optional.boolean);

        const loggedStatusMessage = `[Status message]: ${statusMessage}`;

        switch (level) {
            case 'DEBUG':
                log.debug(loggedStatusMessage);
                break;
            case 'WARNING':
                log.warning(loggedStatusMessage);
                break;
            case 'ERROR':
                log.error(loggedStatusMessage);
                break;
            default:
                log.info(loggedStatusMessage);
                break;
        }

        const client = this.config.getStorageClient();

        // just to be sure, this should be fast
        await addTimeoutToPromise(
            async () => client.setStatusMessage!(statusMessage, { isStatusMessageTerminal, level }),
            1000,
            'Setting status message timed out after 1s',
        ).catch((e) => log.warning(e.message));

        const runId = this.config.get('actorRunId')!;

        if (runId) {
            // just to be sure, this should be fast
            const run = await addTimeoutToPromise(
                async () => this.apifyClient.run(runId).get(),
                1000,
                'Getting the current run timed out after 1s',
            ).catch((e) => log.warning(e.message));

            if (run) {
                return run;
            }
        }

        return {} as ClientActorRun;
    }

    /**
     * Stores an object or an array of objects to the default {@apilink Dataset} of the current actor run.
     *
     * This is just a convenient shortcut for {@apilink Dataset.pushData}.
     * For example, calling the following code:
     * ```javascript
     * await Actor.pushData({ myValue: 123 });
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const dataset = await Actor.openDataset();
     * await dataset.pushData({ myValue: 123 });
     * ```
     *
     * For more information, see {@apilink Actor.openDataset} and {@apilink Dataset.pushData}
     *
     * **IMPORTANT**: Make sure to use the `await` keyword when calling `pushData()`,
     * otherwise the actor process might finish before the data are stored!
     *
     * @param item Object or array of objects containing data to be stored in the default dataset.
     * The objects must be serializable to JSON and the JSON representation of each object must be smaller than 9MB.
     * @ignore
     */
    async pushData(item: Data | Data[]): Promise<void> {
        this._ensureActorInit('pushData');

        const dataset = await this.openDataset();
        return dataset.pushData(item);
    }

    /**
     * Opens a dataset and returns a promise resolving to an instance of the {@apilink Dataset} class.
     *
     * Datasets are used to store structured data where each object stored has the same attributes,
     * such as online store products or real estate offers.
     * The actual data is stored either on the local filesystem or in the cloud.
     *
     * For more details and code examples, see the {@apilink Dataset} class.
     *
     * @param [datasetIdOrName]
     *   ID or name of the dataset to be opened. If `null` or `undefined`,
     *   the function returns the default dataset associated with the actor run.
     * @param [options]
     * @ignore
     */
    async openDataset(
        datasetIdOrName?: string | null,
        options: OpenStorageOptions = {},
    ): Promise<Dataset<Data>> {
        ow(datasetIdOrName, ow.optional.string);
        ow(options, ow.object.exactShape({
            forceCloud: ow.optional.boolean,
        }));

        this._ensureActorInit('openDataset');

        return this._openStorage<Dataset<Data>>(Dataset, datasetIdOrName, options);
    }

    /**
     * Gets a value from the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for {@apilink KeyValueStore.getValue}.
     * For example, calling the following code:
     * ```javascript
     * const value = await Actor.getValue('my-key');
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * const value = await store.getValue('my-key');
     * ```
     *
     * To store the value to the default key-value store, you can use the {@apilink Actor.setValue} function.
     *
     * For more information, see  {@apilink Actor.openKeyValueStore}
     * and  {@apilink KeyValueStore.getValue}.
     *
     * @param key Unique record key.
     * @returns
     *   Returns a promise that resolves to an object, string
     *   or [`Buffer`](https://nodejs.org/api/buffer.html), depending
     *   on the MIME content type of the record, or `null`
     *   if the record is missing.
     * @ignore
     */
    async getValue<T = unknown>(key: string): Promise<T | null> {
        this._ensureActorInit('getValue');

        const store = await this.openKeyValueStore();
        return store.getValue<T>(key);
    }

    /**
     * Stores or deletes a value in the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for  {@apilink KeyValueStore.setValue}.
     * For example, calling the following code:
     * ```javascript
     * await Actor.setValue('OUTPUT', { foo: "bar" });
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * await store.setValue('OUTPUT', { foo: "bar" });
     * ```
     *
     * To get a value from the default key-value store, you can use the  {@apilink Actor.getValue} function.
     *
     * For more information, see  {@apilink Actor.openKeyValueStore}
     * and  {@apilink KeyValueStore.getValue}.
     *
     * @param key
     *   Unique record key.
     * @param value
     *   Record data, which can be one of the following values:
     *    - If `null`, the record in the key-value store is deleted.
     *    - If no `options.contentType` is specified, `value` can be any JavaScript object, and it will be stringified to JSON.
     *    - If `options.contentType` is set, `value` is taken as is, and it must be a `String` or [`Buffer`](https://nodejs.org/api/buffer.html).
     *   For any other value an error will be thrown.
     * @param [options]
     * @ignore
     */
    async setValue<T>(key: string, value: T | null, options: RecordOptions = {}): Promise<void> {
        this._ensureActorInit('setValue');

        const store = await this.openKeyValueStore();
        return store.setValue(key, value, options);
    }

    /**
     * Gets the actor input value from the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for [`keyValueStore.getValue('INPUT')`](core/class/KeyValueStore#getValue).
     * For example, calling the following code:
     * ```javascript
     * const input = await Actor.getInput();
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * await store.getValue('INPUT');
     * ```
     *
     * Note that the `getInput()` function does not cache the value read from the key-value store.
     * If you need to use the input multiple times in your actor,
     * it is far more efficient to read it once and store it locally.
     *
     * For more information, see  {@apilink Actor.openKeyValueStore}
     * and {@apilink KeyValueStore.getValue}.
     *
     * @returns
     *   Returns a promise that resolves to an object, string
     *   or [`Buffer`](https://nodejs.org/api/buffer.html), depending
     *   on the MIME content type of the record, or `null`
     *   if the record is missing.
     * @ignore
     */
    async getInput<T = Dictionary | string | Buffer>(): Promise<T | null> {
        this._ensureActorInit('getInput');

        const inputSecretsPrivateKeyFile = this.config.get('inputSecretsPrivateKeyFile');
        const inputSecretsPrivateKeyPassphrase = this.config.get('inputSecretsPrivateKeyPassphrase');
        const input = await this.getValue<T>(this.config.get('inputKey'));
        if (ow.isValid(input, ow.object.nonEmpty) && inputSecretsPrivateKeyFile && inputSecretsPrivateKeyPassphrase) {
            const privateKey = createPrivateKey({
                key: Buffer.from(inputSecretsPrivateKeyFile, 'base64'),
                passphrase: inputSecretsPrivateKeyPassphrase,
            });
            return decryptInputSecrets<T>({ input, privateKey });
        }
        return input;
    }

    /**
     * Gets the actor input value just like the {@apilink Actor.getInput} method,
     * but throws if it is not found.
     */
    async getInputOrThrow<T = Dictionary | string | Buffer>(): Promise<T> {
        const input = await this.getInput<T>();

        if (input == null) {
            throw new Error('Input does not exist');
        }

        return input;
    }

    /**
     * Opens a key-value store and returns a promise resolving to an instance of the {@apilink KeyValueStore} class.
     *
     * Key-value stores are used to store records or files, along with their MIME content type.
     * The records are stored and retrieved using a unique key.
     * The actual data is stored either on a local filesystem or in the Apify cloud.
     *
     * For more details and code examples, see the {@apilink KeyValueStore} class.
     *
     * @param [storeIdOrName]
     *   ID or name of the key-value store to be opened. If `null` or `undefined`,
     *   the function returns the default key-value store associated with the actor run.
     * @param [options]
     * @ignore
     */
    async openKeyValueStore(storeIdOrName?: string | null, options: OpenStorageOptions = {}): Promise<KeyValueStore> {
        ow(storeIdOrName, ow.optional.string);
        ow(options, ow.object.exactShape({
            forceCloud: ow.optional.boolean,
        }));

        this._ensureActorInit('openKeyValueStore');

        return this._openStorage(KeyValueStore, storeIdOrName, options);
    }

    /**
     * Opens a request queue and returns a promise resolving to an instance
     * of the {@apilink RequestQueue} class.
     *
     * {@apilink RequestQueue} represents a queue of URLs to crawl, which is stored either on local filesystem or in the cloud.
     * The queue is used for deep crawling of websites, where you start with several URLs and then
     * recursively follow links to other pages. The data structure supports both breadth-first
     * and depth-first crawling orders.
     *
     * For more details and code examples, see the {@apilink RequestQueue} class.
     *
     * @param [queueIdOrName]
     *   ID or name of the request queue to be opened. If `null` or `undefined`,
     *   the function returns the default request queue associated with the actor run.
     * @param [options]
     * @ignore
     */
    async openRequestQueue(queueIdOrName?: string | null, options: OpenStorageOptions = {}): Promise<RequestQueue> {
        ow(queueIdOrName, ow.optional.string);
        ow(options, ow.object.exactShape({
            forceCloud: ow.optional.boolean,
        }));

        this._ensureActorInit('openRequestQueue');

        return this._openStorage(RequestQueue, queueIdOrName, options);
    }

    /**
     * Creates a proxy configuration and returns a promise resolving to an instance
     * of the {@apilink ProxyConfiguration} class that is already initialized.
     *
     * Configures connection to a proxy server with the provided options. Proxy servers are used to prevent target websites from blocking
     * your crawlers based on IP address rate limits or blacklists. Setting proxy configuration in your crawlers automatically configures
     * them to use the selected proxies for all connections.
     *
     * For more details and code examples, see the {@apilink ProxyConfiguration} class.
     *
     * ```javascript
     *
     * // Returns initialized proxy configuration class
     * const proxyConfiguration = await Actor.createProxyConfiguration({
     *     groups: ['GROUP1', 'GROUP2'] // List of Apify proxy groups
     *     countryCode: 'US'
     * });
     *
     * const crawler = new CheerioCrawler({
     *   // ...
     *   proxyConfiguration,
     *   requestHandler({ proxyInfo }) {
     *       const usedProxyUrl = proxyInfo.url; // Getting the proxy URL
     *   }
     * })
     *
     * ```
     *
     * For compatibility with existing Actor Input UI (Input Schema), this function
     * returns `undefined` when the following object is passed as `proxyConfigurationOptions`.
     *
     * ```
     * { useApifyProxy: false }
     * ```
     * @ignore
     */
    async createProxyConfiguration(
        proxyConfigurationOptions: ProxyConfigurationOptions & { useApifyProxy?: boolean } = {},
    ): Promise<ProxyConfiguration | undefined> {
        // Compatibility fix for Input UI where proxy: None returns { useApifyProxy: false }
        // Without this, it would cause proxy to use the zero config / auto mode.
        const { useApifyProxy, ...options } = proxyConfigurationOptions;
        const dontUseApifyProxy = useApifyProxy === false;
        const dontUseCustomProxies = !proxyConfigurationOptions.proxyUrls;

        if (dontUseApifyProxy && dontUseCustomProxies) {
            return undefined;
        }

        const proxyConfiguration = new ProxyConfiguration(options, this.config);
        await proxyConfiguration.initialize();

        return proxyConfiguration;
    }

    /**
     * Modifies Actor env vars so parsing respects the structure of {@apilink ApifyEnv} interface.
     */
    private getModifiedActorEnvVars() {
        const modifiedActorEnvVars: Record<string, string> = {};

        Object.entries(ACTOR_ENV_VARS).forEach(([k, v]) => {
            // Prepend `ACTOR_` to env vars so ApifyEnv structure is preserved
            if (['ID', 'RUN_ID', 'TASK_ID'].includes(k)) {
                modifiedActorEnvVars[`ACTOR_${k}`] = v;
            } else {
                modifiedActorEnvVars[k] = v;
            }
        });

        return modifiedActorEnvVars;
    }

    /**
     * Returns a new {@apilink ApifyEnv} object which contains information parsed from all the Apify environment variables.
     *
     * For the list of the Apify environment variables, see
     * [Actor documentation](https://docs.apify.com/actor/run#environment-variables).
     * If some variables are not defined or are invalid, the corresponding value in the resulting object will be null.
     * @ignore
     */
    getEnv(): ApifyEnv {
        // NOTE: Don't throw if env vars are invalid to simplify local development and debugging of actors
        const env = process.env || {};
        const envVars = {} as ApifyEnv;

        for (const [shortName, fullName] of Object.entries({ ...APIFY_ENV_VARS, ...this.getModifiedActorEnvVars() })) {
            const camelCaseName = snakeCaseToCamelCase(shortName) as keyof ApifyEnv;
            let value: string | number | Date | undefined = env[fullName];

            // Parse dates and integers.
            if (value && fullName.endsWith('_AT')) {
                const unix = Date.parse(value);
                value = unix > 0 ? new Date(unix) : undefined;
            } else if ((INTEGER_ENV_VARS as readonly string[]).includes(fullName)) {
                value = parseInt(value!, 10);
            }

            Reflect.set(envVars, camelCaseName, value || value === 0 ? value : null);
        }

        return envVars;
    }

    /**
     * Returns a new instance of the Apify API client. The `ApifyClient` class is provided
     * by the [apify-client](https://www.npmjs.com/package/apify-client)
     * NPM package, and it is automatically configured using the `APIFY_API_BASE_URL`, and `APIFY_TOKEN`
     * environment variables. You can override the token via the available options. That's useful
     * if you want to use the client as a different Apify user than the SDK internals are using.
     * @ignore
     */
    newClient(options: ApifyClientOptions = {}): ApifyClient {
        const { storageDir, ...storageClientOptions } = this.config.get('storageClientOptions') as Dictionary;
        return new ApifyClient({
            baseUrl: this.config.get('apiBaseUrl'),
            token: this.config.get('token'),
            ...storageClientOptions,
            ...options, // allow overriding the instance configuration
        });
    }

    /**
     * Returns `true` when code is running on Apify platform and `false` otherwise (for example locally).
     * @ignore
     */
    isAtHome(): boolean {
        return !!process.env[APIFY_ENV_VARS.IS_AT_HOME];
    }

    /**
     * Easily create and manage state values. All state values are automatically persisted.
     *
     * Values can be modified by simply using the assignment operator.
     *
     * @param name The name of the store to use.
     * @param defaultValue If the store does not yet have a value in it, the value will be initialized with the `defaultValue` you provide.
     * @param options An optional object parameter where a custom `keyValueStoreName` and `config` can be passed in.
     */
    async useState<State extends Dictionary = Dictionary>(
        name?: string,
        defaultValue = {} as State,
        options?: UseStateOptions,
    ) {
        const kvStore = await KeyValueStore.open(options?.keyValueStoreName, { config: options?.config || Configuration.getGlobalConfig() });
        return kvStore.getAutoSavedValue<State>(name || 'APIFY_GLOBAL_STATE', defaultValue);
    }

    /**
     * Easily create and manage state values. All state values are automatically persisted.
     *
     * Values can be modified by simply using the assignment operator.
     *
     * @param name The name of the store to use.
     * @param defaultValue If the store does not yet have a value in it, the value will be initialized with the `defaultValue` you provide.
     * @param options An optional object parameter where a custom `keyValueStoreName` and `config` can be passed in.
     */
    static async useState<State extends Dictionary = Dictionary>(
        name?: string,
        defaultValue = {} as State,
        options?: UseStateOptions,
    ) {
        return Actor.getDefaultInstance().useState<State>(name, defaultValue, options);
    }

    /**
     * Runs the main user function that performs the job of the actor
     * and terminates the process when the user function finishes.
     *
     * **The `Actor.main()` function is optional** and is provided merely for your convenience.
     * It is mainly useful when you're running your code as an actor on the [Apify platform](https://apify.com/actors).
     * However, if you want to use Apify SDK tools directly inside your existing projects, e.g.
     * running in an [Express](https://expressjs.com/) server, on
     * [Google Cloud functions](https://cloud.google.com/functions)
     * or [AWS Lambda](https://aws.amazon.com/lambda/), it's better to avoid
     * it since the function terminates the main process when it finishes!
     *
     * The `Actor.main()` function performs the following actions:
     *
     * - When running on the Apify platform (i.e. `APIFY_IS_AT_HOME` environment variable is set),
     *   it sets up a connection to listen for platform events.
     *   For example, to get a notification about an imminent migration to another server.
     *   See {@apilink Actor.events} for details.
     * - It checks that either `APIFY_TOKEN` or `APIFY_LOCAL_STORAGE_DIR` environment variable
     *   is defined. If not, the functions sets `APIFY_LOCAL_STORAGE_DIR` to `./apify_storage`
     *   inside the current working directory. This is to simplify running code examples.
     * - It invokes the user function passed as the `userFunc` parameter.
     * - If the user function returned a promise, waits for it to resolve.
     * - If the user function throws an exception or some other error is encountered,
     *   prints error details to console so that they are stored to the log.
     * - Exits the Node.js process, with zero exit code on success and non-zero on errors.
     *
     * The user function can be synchronous:
     *
     * ```javascript
     * await Actor.main(() => {
     *   // My synchronous function that returns immediately
     *   console.log('Hello world from actor!');
     * });
     * ```
     *
     * If the user function returns a promise, it is considered asynchronous:
     * ```javascript
     * import { gotScraping } from 'got-scraping';
     *
     * await Actor.main(() => {
     *   // My asynchronous function that returns a promise
     *   return gotScraping('http://www.example.com').then((html) => {
     *     console.log(html);
     *   });
     * });
     * ```
     *
     * To simplify your code, you can take advantage of the `async`/`await` keywords:
     *
     * ```javascript
     * import { gotScraping } from 'got-scraping';
     *
     * await Actor.main(async () => {
     *   // My asynchronous function
     *   const html = await gotScraping('http://www.example.com');
     *   console.log(html);
     * });
     * ```
     *
     * @param userFunc User function to be executed. If it returns a promise,
     * the promise will be awaited. The user function is called with no arguments.
     * @param options
     */
    static async main<T>(userFunc: UserFunc<T>, options?: MainOptions): Promise<T> {
        return Actor.getDefaultInstance().main<T>(userFunc, options);
    }

    static async init(options: InitOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().init(options);
    }

    /**
     * Gracefully exits the actor run with the provided status message and exit code.
     * @param messageOrOptions First parameter accepts either a string (a terminal status message) or an `ExitOptions` object.
     * @param options Second parameter accepts an `ExitOptions` object.
     */
    static async exit(messageOrOptions?: string | ExitOptions, options: ExitOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().exit(messageOrOptions, options);
    }

    /**
     * Calls `Actor.exit()` with `options.exitCode` set to `1`.
     * @param messageOrOptions First parameter accepts either a string (a terminal status message) or an `ExitOptions` object.
     * @param options Second parameter accepts an `ExitOptions` object.
     */
    static async fail(messageOrOptions?: string | ExitOptions, options: ExitOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().fail(messageOrOptions, options);
    }

    static on(event: EventTypeName, listener: (...args: any[]) => any): void {
        Actor.getDefaultInstance().on(event, listener);
    }

    static off(event: EventTypeName, listener?: (...args: any[]) => any): void {
        Actor.getDefaultInstance().off(event, listener);
    }

    /**
     * Runs an actor on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * If you want to run an actor task rather than an actor, please use the {@apilink Actor.callTask} function instead.
     *
     * For more information about actors, read the [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.call('apify/hello-world', { myInput: 123 });
     * ```
     *
     * @param actorId
     *  Allowed formats are `username/actor-name`, `userId/actor-name` or actor ID.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise the `options.contentType` parameter must be provided.
     * @param [options]
     */
    static async call(actorId: string, input?: unknown, options: CallOptions = {}): Promise<ClientActorRun> {
        return Actor.getDefaultInstance().call(actorId, input, options);
    }

    /**
     * Runs an actor task on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * Note that an actor task is a saved input configuration and options for an actor.
     * If you want to run an actor directly rather than an actor task, please use the
     * {@apilink Actor.call} function instead.
     *
     * For more information about actor tasks, read the [documentation](https://docs.apify.com/tasks).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.callTask('bob/some-task');
     * ```
     *
     * @param taskId
     *  Allowed formats are `username/task-name`, `userId/task-name` or task ID.
     * @param [input]
     *  Input overrides for the actor task. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Provided input will be merged with actor task input.
     * @param [options]
     */
    static async callTask(taskId: string, input?: Dictionary, options: CallTaskOptions = {}): Promise<ClientActorRun> {
        return Actor.getDefaultInstance().callTask(taskId, input, options);
    }

    /**
     * Runs an actor on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable),
     * unlike `Actor.call`, this method just starts the run without waiting for finish.
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * For more information about actors, read the
     * [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.start('apify/hello-world', { myInput: 123 });
     * ```
     *
     * @param actorId
     *  Allowed formats are `username/actor-name`, `userId/actor-name` or actor ID.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise the `options.contentType` parameter must be provided.
     * @param [options]
     */
    static async start(actorId: string, input?: Dictionary, options: CallOptions = {}): Promise<ClientActorRun> {
        return Actor.getDefaultInstance().start(actorId, input, options);
    }

    /**
     * Aborts given actor run on the Apify platform using the current user account (determined by the `APIFY_TOKEN` environment variable).
     *
     * The result of the function is an {@apilink ActorRun} object that contains details about the actor run.
     *
     * For more information about actors, read the
     * [documentation](https://docs.apify.com/actor).
     *
     * **Example usage:**
     *
     * ```javascript
     * const run = await Actor.abort(runId);
     * ```
     */
    static async abort(runId: string, options: AbortOptions = {}): Promise<ClientActorRun> {
        return Actor.getDefaultInstance().abort(runId, options);
    }

    /**
     * Transforms this actor run to an actor run of a given actor. The system stops the current container and starts
     * the new container instead. All the default storages are preserved and the new input is stored under the `INPUT-METAMORPH-1` key
     * in the same default key-value store.
     *
     * @param targetActorId
     *  Either `username/actor-name` or actor ID of an actor to which we want to metamorph.
     * @param [input]
     *  Input for the actor. If it is an object, it will be stringified to
     *  JSON and its content type set to `application/json; charset=utf-8`.
     *  Otherwise, the `options.contentType` parameter must be provided.
     * @param [options]
     */
    static async metamorph(targetActorId: string, input?: unknown, options: MetamorphOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().metamorph(targetActorId, input, options);
    }

    /**
     * Internally reboots this actor run. The system stops the current container and starts
     * a new container with the same run id.
     * This can be used to get the Actor out of irrecoverable error state and continue where it left off.
     */
    static async reboot(options: RebootOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().reboot(options);
    }

    /**
     * Creates an ad-hoc webhook for the current actor run, which lets you receive a notification when the actor run finished or failed.
     * For more information about Apify actor webhooks, please see the [documentation](https://docs.apify.com/webhooks).
     *
     * Note that webhooks are only supported for actors running on the Apify platform.
     * In local environment, the function will print a warning and have no effect.
     *
     * @param options
     * @returns The return value is the Webhook object.
     * For more information, see the [Get webhook](https://apify.com/docs/api/v2#/reference/webhooks/webhook-object/get-webhook) API endpoint.
     */
    static async addWebhook(options: WebhookOptions): Promise<Webhook | undefined> {
        return Actor.getDefaultInstance().addWebhook(options);
    }

    /**
     * Sets the status message for the current actor run.
     *
     * @param statusMessage The status message to set.
     * @param [options]
     * @param [options.isStatusMessageTerminal] If `true`, the status message will be marked as terminal.
     *          This is required for the last status message of the run. Default value is `false`.
     * @returns The return value is the Run object. When run locally, this method returns empty object (`{}`).
     * For more information, see the [Actor Runs](https://docs.apify.com/api/v2#/reference/actor-runs/) API endpoints.
     */
    static async setStatusMessage(statusMessage: string, options?: SetStatusMessageOptions): Promise<ClientActorRun> {
        return Actor.getDefaultInstance().setStatusMessage(statusMessage, options);
    }

    /**
     * Stores an object or an array of objects to the default {@apilink Dataset} of the current actor run.
     *
     * This is just a convenient shortcut for {@apilink Dataset.pushData}.
     * For example, calling the following code:
     * ```javascript
     * await Actor.pushData({ myValue: 123 });
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const dataset = await Actor.openDataset();
     * await dataset.pushData({ myValue: 123 });
     * ```
     *
     * For more information, see {@apilink Actor.openDataset} and {@apilink Dataset.pushData}
     *
     * **IMPORTANT**: Make sure to use the `await` keyword when calling `pushData()`,
     * otherwise the actor process might finish before the data are stored!
     *
     * @param item Object or array of objects containing data to be stored in the default dataset.
     * The objects must be serializable to JSON and the JSON representation of each object must be smaller than 9MB.
     */
    static async pushData<Data extends Dictionary = Dictionary>(item: Data | Data[]): Promise<void> {
        return Actor.getDefaultInstance().pushData(item);
    }

    /**
     * Opens a dataset and returns a promise resolving to an instance of the {@apilink Dataset} class.
     *
     * Datasets are used to store structured data where each object stored has the same attributes,
     * such as online store products or real estate offers.
     * The actual data is stored either on the local filesystem or in the cloud.
     *
     * For more details and code examples, see the {@apilink Dataset} class.
     *
     * @param [datasetIdOrName]
     *   ID or name of the dataset to be opened. If `null` or `undefined`,
     *   the function returns the default dataset associated with the actor run.
     * @param [options]
     */
    static async openDataset<Data extends Dictionary = Dictionary>(
        datasetIdOrName?: string | null, options: OpenStorageOptions = {},
    ): Promise<Dataset<Data>> {
        return Actor.getDefaultInstance().openDataset(datasetIdOrName, options);
    }

    /**
     * Gets a value from the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for {@apilink KeyValueStore.getValue}.
     * For example, calling the following code:
     * ```javascript
     * const value = await Actor.getValue('my-key');
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * const value = await store.getValue('my-key');
     * ```
     *
     * To store the value to the default key-value store, you can use the {@apilink Actor.setValue} function.
     *
     * For more information, see  {@apilink Actor.openKeyValueStore}
     * and  {@apilink KeyValueStore.getValue}.
     *
     * @param key Unique record key.
     * @returns
     *   Returns a promise that resolves to an object, string
     *   or [`Buffer`](https://nodejs.org/api/buffer.html), depending
     *   on the MIME content type of the record, or `null`
     *   if the record is missing.
     */
    static async getValue<T = unknown>(key: string): Promise<T | null> {
        return Actor.getDefaultInstance().getValue(key);
    }

    /**
     * Stores or deletes a value in the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for  {@apilink KeyValueStore.setValue}.
     * For example, calling the following code:
     * ```javascript
     * await Actor.setValue('OUTPUT', { foo: "bar" });
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * await store.setValue('OUTPUT', { foo: "bar" });
     * ```
     *
     * To get a value from the default key-value store, you can use the  {@apilink Actor.getValue} function.
     *
     * For more information, see  {@apilink Actor.openKeyValueStore}
     * and  {@apilink KeyValueStore.getValue}.
     *
     * @param key
     *   Unique record key.
     * @param value
     *   Record data, which can be one of the following values:
     *    - If `null`, the record in the key-value store is deleted.
     *    - If no `options.contentType` is specified, `value` can be any JavaScript object, and it will be stringified to JSON.
     *    - If `options.contentType` is set, `value` is taken as is, and it must be a `String` or [`Buffer`](https://nodejs.org/api/buffer.html).
     *   For any other value an error will be thrown.
     * @param [options]
     */
    static async setValue<T>(key: string, value: T | null, options: RecordOptions = {}): Promise<void> {
        return Actor.getDefaultInstance().setValue(key, value, options);
    }

    /**
     * Gets the actor input value from the default {@apilink KeyValueStore} associated with the current actor run.
     *
     * This is just a convenient shortcut for {@apilink KeyValueStore.getValue | `keyValueStore.getValue('INPUT')`}.
     * For example, calling the following code:
     * ```javascript
     * const input = await Actor.getInput();
     * ```
     *
     * is equivalent to:
     * ```javascript
     * const store = await Actor.openKeyValueStore();
     * await store.getValue('INPUT');
     * ```
     *
     * Note that the `getInput()` function does not cache the value read from the key-value store.
     * If you need to use the input multiple times in your actor,
     * it is far more efficient to read it once and store it locally.
     *
     * For more information, see {@apilink Actor.openKeyValueStore} and {@apilink KeyValueStore.getValue}.
     *
     * @returns
     *   Returns a promise that resolves to an object, string
     *   or [`Buffer`](https://nodejs.org/api/buffer.html), depending
     *   on the MIME content type of the record, or `null`
     *   if the record is missing.
     */
    static async getInput<T = Dictionary | string | Buffer>(): Promise<T | null> {
        return Actor.getDefaultInstance().getInput();
    }

    /**
     * Gets the actor input value just like the {@apilink Actor.getInput} method,
     * but throws if it is not found.
     */
    static async getInputOrThrow<T = Dictionary | string | Buffer>(): Promise<T> {
        return Actor.getDefaultInstance().getInputOrThrow<T>();
    }

    /**
     * Opens a key-value store and returns a promise resolving to an instance of the {@apilink KeyValueStore} class.
     *
     * Key-value stores are used to store records or files, along with their MIME content type.
     * The records are stored and retrieved using a unique key.
     * The actual data is stored either on a local filesystem or in the Apify cloud.
     *
     * For more details and code examples, see the {@apilink KeyValueStore} class.
     *
     * @param [storeIdOrName]
     *   ID or name of the key-value store to be opened. If `null` or `undefined`,
     *   the function returns the default key-value store associated with the actor run.
     * @param [options]
     */
    static async openKeyValueStore(storeIdOrName?: string | null, options: OpenStorageOptions = {}): Promise<KeyValueStore> {
        return Actor.getDefaultInstance().openKeyValueStore(storeIdOrName, options);
    }

    /**
     * Opens a request queue and returns a promise resolving to an instance
     * of the {@apilink RequestQueue} class.
     *
     * {@apilink RequestQueue} represents a queue of URLs to crawl, which is stored either on local filesystem or in the cloud.
     * The queue is used for deep crawling of websites, where you start with several URLs and then
     * recursively follow links to other pages. The data structure supports both breadth-first
     * and depth-first crawling orders.
     *
     * For more details and code examples, see the {@apilink RequestQueue} class.
     *
     * @param [queueIdOrName]
     *   ID or name of the request queue to be opened. If `null` or `undefined`,
     *   the function returns the default request queue associated with the actor run.
     * @param [options]
     */
    static async openRequestQueue(queueIdOrName?: string | null, options: OpenStorageOptions = {}): Promise<RequestQueue> {
        return Actor.getDefaultInstance().openRequestQueue(queueIdOrName, options);
    }

    /**
     * Creates a proxy configuration and returns a promise resolving to an instance
     * of the {@apilink ProxyConfiguration} class that is already initialized.
     *
     * Configures connection to a proxy server with the provided options. Proxy servers are used to prevent target websites from blocking
     * your crawlers based on IP address rate limits or blacklists. Setting proxy configuration in your crawlers automatically configures
     * them to use the selected proxies for all connections.
     *
     * For more details and code examples, see the {@apilink ProxyConfiguration} class.
     *
     * ```javascript
     *
     * // Returns initialized proxy configuration class
     * const proxyConfiguration = await Actor.createProxyConfiguration({
     *     groups: ['GROUP1', 'GROUP2'] // List of Apify proxy groups
     *     countryCode: 'US'
     * });
     *
     * const crawler = new CheerioCrawler({
     *   // ...
     *   proxyConfiguration,
     *   requestHandler({ proxyInfo }) {
     *       const usedProxyUrl = proxyInfo.url; // Getting the proxy URL
     *   }
     * })
     *
     * ```
     *
     * For compatibility with existing Actor Input UI (Input Schema), this function
     * returns `undefined` when the following object is passed as `proxyConfigurationOptions`.
     *
     * ```
     * { useApifyProxy: false }
     * ```
     */
    static async createProxyConfiguration(
        proxyConfigurationOptions: ProxyConfigurationOptions & { useApifyProxy?: boolean } = {},
    ): Promise<ProxyConfiguration | undefined> {
        return Actor.getDefaultInstance().createProxyConfiguration(proxyConfigurationOptions);
    }

    /**
     * Returns a new {@apilink ApifyEnv} object which contains information parsed from all the Apify environment variables.
     *
     * For the list of the Apify environment variables, see
     * [Actor documentation](https://docs.apify.com/actor/run#environment-variables).
     * If some of the variables are not defined or are invalid, the corresponding value in the resulting object will be null.
     */
    static getEnv(): ApifyEnv {
        return Actor.getDefaultInstance().getEnv();
    }

    /**
     * Returns a new instance of the Apify API client. The `ApifyClient` class is provided
     * by the [apify-client](https://www.npmjs.com/package/apify-client)
     * NPM package, and it is automatically configured using the `APIFY_API_BASE_URL`, and `APIFY_TOKEN`
     * environment variables. You can override the token via the available options. That's useful
     * if you want to use the client as a different Apify user than the SDK internals are using.
     */
    static newClient(options: ApifyClientOptions = {}): ApifyClient {
        return Actor.getDefaultInstance().newClient(options);
    }

    /**
     * Returns `true` when code is running on Apify platform and `false` otherwise (for example locally).
     */
    static isAtHome(): boolean {
        return Actor.getDefaultInstance().isAtHome();
    }

    /** Default {@apilink ApifyClient} instance. */
    static get apifyClient(): ApifyClient {
        return Actor.getDefaultInstance().apifyClient;
    }

    /** Default {@apilink Configuration} instance. */
    static get config(): Configuration {
        return Actor.getDefaultInstance().config;
    }

    /** @internal */
    static getDefaultInstance(): Actor {
        this._instance ??= new Actor();
        return this._instance;
    }

    private async _openStorage<T extends IStorage>(storageClass: Constructor<T>, id?: string, options: OpenStorageOptions = {}) {
        const client = options.forceCloud ? this.apifyClient : undefined;
        return StorageManager.openStorage<T>(storageClass, id, client, this.config);
    }

    private _ensureActorInit(methodCalled: string) {
        // If we already warned the user once, don't do it again to prevent spam
        if (this.warnedAboutMissingInitCall) {
            return;
        }

        if (this.initialized) {
            return;
        }

        this.warnedAboutMissingInitCall = true;

        log.warning([
            `Actor.${methodCalled}() was called but the actor instance was not initialized.`,
            'Did you forget to call Actor.init()?',
        ].join('\n'));
    }
}

export interface InitOptions {
    storage?: StorageClient;
}

export interface MainOptions extends ExitOptions, InitOptions {}

/**
 * Parsed representation of the Apify environment variables.
 * This object is returned by the {@apilink Actor.getEnv} function.
 */
export interface ApifyEnv {
    /**
     * ID of the actor (ACTOR_ID)
     */
    actorId: string | null;

    /**
     * ID of the actor run (ACTOR_RUN_ID)
     */
    actorRunId: string | null;

    /**
     * ID of the actor task (ACTOR_TASK_ID)
     */
    actorTaskId: string | null;

    /**
     * ID of the user who started the actor - note that it might be
     * different than the owner ofthe actor (APIFY_USER_ID)
     */
    userId: string | null;

    /**
     * Authentication token representing privileges given to the actor run,
     * it can be passed to various Apify APIs (APIFY_TOKEN)
     */
    token: string | null;

    /**
     * Date when the actor was started (ACTOR_STARTED_AT)
     */
    startedAt: Date | null;

    /**
     * Date when the actor will time out (ACTOR_TIMEOUT_AT)
     */
    timeoutAt: Date | null;

    /**
     * ID of the key-value store where input and output data of this
     * actor is stored (ACTOR_DEFAULT_KEY_VALUE_STORE_ID)
     */
    defaultKeyValueStoreId: string | null;

    /**
     * ID of the dataset where input and output data of this
     * actor is stored (ACTOR_DEFAULT_DATASET_ID)
     */
    defaultDatasetId: string | null;

    /**
     * Amount of memory allocated for the actor,
     * in megabytes (ACTOR_MEMORY_MBYTES)
     */
    memoryMbytes: number | null;
}

export type UserFunc<T = unknown> = () => Awaitable<T>;

export interface CallOptions extends ActorCallOptions {
    /**
     * User API token that is used to run the actor. By default, it is taken from the `APIFY_TOKEN` environment variable.
     */
    token?: string;
}

export interface CallTaskOptions extends TaskCallOptions {
    /**
     * User API token that is used to run the actor. By default, it is taken from the `APIFY_TOKEN` environment variable.
     */
    token?: string;
}

export interface AbortOptions extends RunAbortOptions {
    /**
     * User API token that is used to run the actor. By default, it is taken from the `APIFY_TOKEN` environment variable.
     */
    token?: string;

    /** Exit with given status message */
    statusMessage?: string;
}

export interface WebhookOptions {
    /**
     * Array of event types, which you can set for actor run, see
     * the [actor run events](https://docs.apify.com/webhooks/events#actor-run) in the Apify doc.
     */
    eventTypes: readonly WebhookEventType[];

    /**
     * URL which will be requested using HTTP POST request, when actor run will reach the set event type.
     */
    requestUrl: string;

    /**
     * Payload template is a JSON-like string that describes the structure of the webhook POST request payload.
     * It uses JSON syntax, extended with a double curly braces syntax for injecting variables `{{variable}}`.
     * Those variables are resolved at the time of the webhook's dispatch, and a list of available variables with their descriptions
     * is available in the [Apify webhook documentation](https://docs.apify.com/webhooks).
     * If `payloadTemplate` is omitted, the default payload template is used
     * ([view docs](https://docs.apify.com/webhooks/actions#payload-template)).
     */
    payloadTemplate?: string;

    /**
     * Idempotency key enables you to ensure that a webhook will not be added multiple times in case of
     * an actor restart or other situation that would cause the `addWebhook()` function to be called again.
     * We suggest using the actor run ID as the idempotency key. You can get the run ID by calling
     * {@apilink Actor.getEnv} function.
     */
    idempotencyKey?: string;
}

export interface MetamorphOptions {
    /**
     * Content type for the `input`. If not specified,
     * `input` is expected to be an object that will be stringified to JSON and content type set to
     * `application/json; charset=utf-8`. If `options.contentType` is specified, then `input` must be a
     * `String` or `Buffer`.
     */
    contentType?: string;

    /**
     * Tag or number of the target actor build to metamorph into (e.g. `beta` or `1.2.345`).
     * If not provided, the run uses build tag or number from the default actor run configuration (typically `latest`).
     */
    build?: string;

    /** @internal */
    customAfterSleepMillis?: number;
}

export interface RebootOptions {
    /** @internal */
    customAfterSleepMillis?: number;
}

export interface ExitOptions {
    /** Exit with given status message */
    statusMessage?: string;
    /**
     * Amount of time, in seconds, to wait for all event handlers to finish before exiting the process.
     * @default 30
     */
    timeoutSecs?: number;
    /** Exit code, defaults to 0 */
    exitCode?: number;
    /** Call `process.exit()`? Defaults to true */
    exit?: boolean;
}

export interface OpenStorageOptions {
    /**
     * If set to `true` then the cloud storage is used even if the `APIFY_LOCAL_STORAGE_DIR`
     * environment variable is set. This way it is possible to combine local and cloud storage.
     * @default false
     */
    forceCloud?: boolean;
}

export { ClientActorRun as ActorRun };

/**
 * Exit codes for the actor process.
 * The error codes must be in the range 1-128, to avoid collision with signal exits
 * and to ensure Docker will handle them correctly!
 * @internal should be removed if we decide to remove `Actor.main()`
 */
export const EXIT_CODES = {
    SUCCESS: 0,
    ERROR_USER_FUNCTION_THREW: 91,
    ERROR_UNKNOWN: 92,
};
