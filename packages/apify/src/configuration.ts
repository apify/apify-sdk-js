import {
    ACTOR_ENV_VARS,
    APIFY_ENV_VARS,
    LOCAL_ACTOR_ENV_VARS,
    LOCAL_APIFY_ENV_VARS,
} from '@apify/consts';
import { Configuration as CoreConfiguration } from '@crawlee/core';
import type { ConfigurationOptions as CoreConfigurationOptions } from '@crawlee/core';

export interface ConfigurationOptions extends CoreConfigurationOptions {
    metamorphAfterSleepMillis?: number;
    actorEventsWsUrl?: string;
    token?: string;
    actorId?: string;
    actorRunId?: string;
    actorTaskId?: string;
    apiBaseUrl?: string;
    containerPort?: number;
    containerUrl?: string;
    proxyHostname?: string;
    proxyPassword?: string;
    proxyPort?: number;
    proxyStatusUrl?: string;
    isAtHome?: boolean;
    userId?: string;
    inputSecretsPrivateKeyPassphrase?: string;
    inputSecretsPrivateKeyFile?: string;
}

/**
 * `Configuration` is a value object holding the SDK configuration. We can use it in two ways:
 *
 * 1. When using `Actor` class, we can get the instance configuration via `sdk.config`
 *
 *    ```javascript
 *    import { Actor } from 'apify';
 *    import { BasicCrawler } from 'crawlee';
 *
 *    const sdk = new Actor({ token: '123' });
 *    console.log(sdk.config.get('token')); // '123'
 *
 *    const crawler = new BasicCrawler({
 *        // ... crawler options
 *    }, sdk.config);
 *    ```
 *
 * 2. To get the global configuration (singleton instance). It will respect the environment variables.
 *
 *    ```javascript
 *    import { BasicCrawler, Configuration } from 'crawlee';
 *
 *    // Get the global configuration
 *    const config = Configuration.getGlobalConfig();
 *    // Set the 'persistStateIntervalMillis' option
 *    // of global configuration to 30 seconds
 *    config.set('persistStateIntervalMillis', 30_000);
 *
 *    // No need to pass the configuration to the crawler,
 *    // as it's using the global configuration by default
 *    const crawler = new BasicCrawler();
 *    ```
 *
 * ## Supported Configuration Options
 *
 * Key | Environment Variable | Default Value
 * ---|---|---
 * `memoryMbytes` | `ACTOR_MEMORY_MBYTES` | -
 * `headless` | `APIFY_HEADLESS` | -
 * `persistStateIntervalMillis` | `APIFY_PERSIST_STATE_INTERVAL_MILLIS` | `60e3`
 * `token` | `APIFY_TOKEN` | -
 * `isAtHome` | `APIFY_IS_AT_HOME` | -
 * `defaultDatasetId` | `ACTOR_DEFAULT_DATASET_ID` | `'default'`
 * `defaultKeyValueStoreId` | `ACTOR_DEFAULT_KEY_VALUE_STORE_ID` | `'default'`
 * `defaultRequestQueueId` | `ACTOR_DEFAULT_REQUEST_QUEUE_ID` | `'default'`
 *
 * ## Advanced Configuration Options
 *
 * Key | Environment Variable | Default Value
 * ---|---|---
 * `actorEventsWsUrl` | `ACTOR_EVENTS_WEBSOCKET_URL` | -
 * `actorId` | `ACTOR_ID` | -
 * `actorRunId` | `ACTOR_RUN_ID` | -
 * `actorTaskId` | `ACTOR_TASK_ID` | -
 * `apiBaseUrl` | `APIFY_API_BASE_URL` | `'https://api.apify.com'`
 * `containerPort` | `ACTOR_WEB_SERVER_PORT` | `4321`
 * `containerUrl` | `ACTOR_WEB_SERVER_URL` | `'http://localhost:4321'`
 * `inputKey` | `ACTOR_INPUT_KEY` | `'INPUT'`
 * `metamorphAfterSleepMillis` | `APIFY_METAMORPH_AFTER_SLEEP_MILLIS` | `300e3`
 * `proxyHostname` | `APIFY_PROXY_HOSTNAME` | `'proxy.apify.com'`
 * `proxyPassword` | `APIFY_PROXY_PASSWORD` | -
 * `proxyPort` | `APIFY_PROXY_PORT` | `8000`
 * `proxyStatusUrl` | `APIFY_PROXY_STATUS_URL` | `'http://proxy.apify.com'`
 * `userId` | `APIFY_USER_ID` | -
 * `xvfb` | `APIFY_XVFB` | -
 * `chromeExecutablePath` | `APIFY_CHROME_EXECUTABLE_PATH` | -
 * `defaultBrowserPath` | `APIFY_DEFAULT_BROWSER_PATH` | -
 */
export class Configuration extends CoreConfiguration {
    /** @inheritDoc */
    static override globalConfig?: Configuration;

    // maps environment variables to config keys (e.g. `APIFY_MEMORY_MBYTES` to `memoryMbytes`)
    protected static override ENV_MAP = {
        // regular crawlee env vars are also supported
        ...super.ENV_MAP,

        // support crawlee env vars prefixed with `APIFY_` too
        APIFY_AVAILABLE_MEMORY_RATIO: 'availableMemoryRatio',
        APIFY_PURGE_ON_START: 'purgeOnStart',
        APIFY_MEMORY_MBYTES: 'memoryMbytes',
        APIFY_DEFAULT_DATASET_ID: 'defaultDatasetId',
        APIFY_DEFAULT_KEY_VALUE_STORE_ID: 'defaultKeyValueStoreId',
        APIFY_DEFAULT_REQUEST_QUEUE_ID: 'defaultRequestQueueId',
        APIFY_INPUT_KEY: 'inputKey',
        APIFY_PERSIST_STATE_INTERVAL_MILLIS: 'persistStateIntervalMillis',
        APIFY_HEADLESS: 'headless',
        APIFY_XVFB: 'xvfb',
        APIFY_CHROME_EXECUTABLE_PATH: 'chromeExecutablePath',
        APIFY_DEFAULT_BROWSER_PATH: 'defaultBrowserPath',
        APIFY_DISABLE_BROWSER_SANDBOX: 'disableBrowserSandbox',

        // as well as apify specific ones
        APIFY_TOKEN: 'token',
        APIFY_METAMORPH_AFTER_SLEEP_MILLIS: 'metamorphAfterSleepMillis',
        APIFY_TEST_PERSIST_INTERVAL_MILLIS: 'persistStateIntervalMillis', // for BC, seems to be unused
        APIFY_ACTOR_EVENTS_WS_URL: 'actorEventsWsUrl',
        APIFY_ACTOR_ID: 'actorId',
        APIFY_API_BASE_URL: 'apiBaseUrl',
        APIFY_IS_AT_HOME: 'isAtHome',
        APIFY_ACTOR_RUN_ID: 'actorRunId',
        APIFY_ACTOR_TASK_ID: 'actorTaskId',
        APIFY_CONTAINER_PORT: 'containerPort',
        APIFY_CONTAINER_URL: 'containerUrl',
        APIFY_USER_ID: 'userId',
        APIFY_PROXY_HOSTNAME: 'proxyHostname',
        APIFY_PROXY_PASSWORD: 'proxyPassword',
        APIFY_PROXY_STATUS_URL: 'proxyStatusUrl',
        APIFY_PROXY_PORT: 'proxyPort',
        APIFY_INPUT_SECRETS_PRIVATE_KEY_FILE: 'inputSecretsPrivateKeyFile',
        APIFY_INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE: 'inputSecretsPrivateKeyPassphrase',

        // Actor env vars
        ACTOR_DEFAULT_DATASET_ID: 'defaultDatasetId',
        ACTOR_DEFAULT_KEY_VALUE_STORE_ID: 'defaultKeyValueStoreId',
        ACTOR_DEFAULT_REQUEST_QUEUE_ID: 'defaultRequestQueueId',
        ACTOR_EVENTS_WEBSOCKET_URL: 'actorEventsWsUrl',
        ACTOR_ID: 'actorId',
        ACTOR_INPUT_KEY: 'inputKey',
        ACTOR_MEMORY_MBYTES: 'memoryMbytes',
        ACTOR_RUN_ID: 'actorRunId',
        ACTOR_TASK_ID: 'actorTaskId',
        ACTOR_WEB_SERVER_PORT: 'containerPort',
        ACTOR_WEB_SERVER_URL: 'containerUrl',
    };

    protected static override INTEGER_VARS = [...super.INTEGER_VARS, 'proxyPort', 'containerPort', 'metamorphAfterSleepMillis'];

    protected static override BOOLEAN_VARS = [...super.BOOLEAN_VARS, 'isAtHome'];

    protected static override DEFAULTS = {
        ...super.DEFAULTS,
        defaultKeyValueStoreId: LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID],
        defaultDatasetId: LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_DATASET_ID],
        defaultRequestQueueId: LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID],
        inputKey: 'INPUT',
        apiBaseUrl: 'https://api.apify.com',
        proxyStatusUrl: 'http://proxy.apify.com',
        proxyHostname: LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_HOSTNAME],
        proxyPort: +LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_PORT],
        containerPort: +LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_PORT],
        containerUrl: LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_URL],
        metamorphAfterSleepMillis: 300e3,
        persistStateIntervalMillis: 60e3, // This value is mentioned in jsdoc in `events.js`, if you update it here, update it there too.
    };

    /**
     * @inheritDoc
     */
    override get<T extends keyof ConfigurationOptions, U extends ConfigurationOptions[T]>(key: T, defaultValue?: U): U {
        return super.get(key as keyof CoreConfigurationOptions, defaultValue);
    }

    /**
     * @inheritDoc
     */
    override set(key: keyof ConfigurationOptions, value?: any) {
        super.set(key as keyof CoreConfigurationOptions, value);
    }

    /**
     * @inheritDoc
     */
    static override getGlobalConfig(): Configuration {
        if (Configuration.storage.getStore()) {
            return Configuration.storage.getStore() as Configuration;
        }

        Configuration.globalConfig ??= new Configuration();
        return Configuration.globalConfig as Configuration;
    }

    /**
     * Resets global configuration instance. The default instance holds configuration based on env vars,
     * if we want to change them, we need to first reset the global state. Used mainly for testing purposes.
     */
    static override resetGlobalState(): void {
        delete this.globalConfig;
    }
}

// monkey patch the core class so it respects the new options too
CoreConfiguration.getGlobalConfig = Configuration.getGlobalConfig;
// @ts-expect-error protected property
CoreConfiguration.ENV_MAP = Configuration.ENV_MAP;
// @ts-expect-error protected property
CoreConfiguration.INTEGER_VARS = Configuration.INTEGER_VARS;
// @ts-expect-error protected property
CoreConfiguration.BOOLEAN_VARS = Configuration.BOOLEAN_VARS;
// @ts-expect-error protected property
CoreConfiguration.DEFAULTS = Configuration.DEFAULTS;
