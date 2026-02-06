import {
    coerceBoolean,
    Configuration as CrawleeConfiguration,
    crawleeConfigFields,
    extendField,
    field,
    type FieldDefinitions,
    type InferInputOptions,
    type InferOutputOptions,
} from '@crawlee/core';
import { z } from 'zod';

import type { META_ORIGINS } from '@apify/consts';

// ============================================================================
// Apify Configuration Field Definitions
// ============================================================================

/**
 * Field definitions for Apify SDK Configuration.
 * Extends Crawlee's configuration with Apify-specific fields.
 *
 * Uses `extendField` to add ACTOR_* and APIFY_* env var aliases
 * while preserving the base CRAWLEE_* env vars from crawleeConfigFields.
 */
export const apifyConfigFields = {
    ...crawleeConfigFields,

    // Override storage IDs to also check ACTOR_* and APIFY_* env vars
    defaultDatasetId: extendField(crawleeConfigFields.defaultDatasetId, {
        env: ['ACTOR_DEFAULT_DATASET_ID', 'APIFY_DEFAULT_DATASET_ID'],
    }),
    defaultKeyValueStoreId: extendField(
        crawleeConfigFields.defaultKeyValueStoreId,
        {
            env: [
                'ACTOR_DEFAULT_KEY_VALUE_STORE_ID',
                'APIFY_DEFAULT_KEY_VALUE_STORE_ID',
            ],
        },
    ),
    defaultRequestQueueId: extendField(
        crawleeConfigFields.defaultRequestQueueId,
        {
            env: [
                'ACTOR_DEFAULT_REQUEST_QUEUE_ID',
                'APIFY_DEFAULT_REQUEST_QUEUE_ID',
            ],
        },
    ),

    // Override inputKey to also check ACTOR_INPUT_KEY and APIFY_INPUT_KEY
    inputKey: extendField(crawleeConfigFields.inputKey, {
        env: ['ACTOR_INPUT_KEY', 'APIFY_INPUT_KEY'],
    }),

    // Override memoryMbytes to also check ACTOR_MEMORY_MBYTES and APIFY_MEMORY_MBYTES
    memoryMbytes: extendField(crawleeConfigFields.memoryMbytes, {
        env: ['ACTOR_MEMORY_MBYTES', 'APIFY_MEMORY_MBYTES'],
    }),

    // Override persistStateIntervalMillis with APIFY_* aliases
    persistStateIntervalMillis: extendField(
        crawleeConfigFields.persistStateIntervalMillis,
        {
            env: [
                'APIFY_PERSIST_STATE_INTERVAL_MILLIS',
                'APIFY_TEST_PERSIST_INTERVAL_MILLIS',
            ],
        },
    ),

    // Override browser-related fields to also check APIFY_* env vars
    headless: extendField(crawleeConfigFields.headless, {
        env: 'APIFY_HEADLESS',
    }),
    xvfb: extendField(crawleeConfigFields.xvfb, {
        env: 'APIFY_XVFB',
    }),
    chromeExecutablePath: extendField(
        crawleeConfigFields.chromeExecutablePath,
        {
            env: 'APIFY_CHROME_EXECUTABLE_PATH',
        },
    ),
    defaultBrowserPath: extendField(crawleeConfigFields.defaultBrowserPath, {
        env: 'APIFY_DEFAULT_BROWSER_PATH',
    }),
    disableBrowserSandbox: extendField(
        crawleeConfigFields.disableBrowserSandbox,
        {
            env: 'APIFY_DISABLE_BROWSER_SANDBOX',
        },
    ),

    // Override other crawlee fields with APIFY_* aliases
    availableMemoryRatio: extendField(
        crawleeConfigFields.availableMemoryRatio,
        {
            env: 'APIFY_AVAILABLE_MEMORY_RATIO',
        },
    ),
    purgeOnStart: extendField(crawleeConfigFields.purgeOnStart, {
        env: 'APIFY_PURGE_ON_START',
    }),

    // =========================================================================
    // Apify-specific fields
    // =========================================================================

    // Authentication
    token: field(z.string().optional(), {
        env: 'APIFY_TOKEN',
    }),

    // Actor identification
    actorId: field(z.string().optional(), {
        env: ['ACTOR_ID', 'APIFY_ACTOR_ID'],
    }),
    actorRunId: field(z.string().optional(), {
        env: ['ACTOR_RUN_ID', 'APIFY_ACTOR_RUN_ID'],
    }),
    actorTaskId: field(z.string().optional(), {
        env: ['ACTOR_TASK_ID', 'APIFY_ACTOR_TASK_ID'],
    }),

    // API URLs
    apiBaseUrl: field(z.string().default('https://api.apify.com'), {
        env: 'APIFY_API_BASE_URL',
    }),
    apiPublicBaseUrl: field(z.string().default('https://api.apify.com'), {
        env: 'APIFY_API_PUBLIC_BASE_URL',
    }),

    // Actor events
    actorEventsWsUrl: field(z.string().optional(), {
        env: ['ACTOR_EVENTS_WEBSOCKET_URL', 'APIFY_ACTOR_EVENTS_WS_URL'],
    }),

    // Container/web server
    containerPort: field(z.coerce.number().default(4321), {
        env: ['ACTOR_WEB_SERVER_PORT', 'APIFY_CONTAINER_PORT'],
    }),
    containerUrl: field(z.string().default('http://localhost:4321'), {
        env: ['ACTOR_WEB_SERVER_URL', 'APIFY_CONTAINER_URL'],
    }),

    // Standby (deprecated in favor of containerPort/containerUrl)
    /** @deprecated use `containerPort` instead */
    standbyPort: field(z.coerce.number().default(4321), {
        env: 'ACTOR_STANDBY_PORT',
    }),
    standbyUrl: field(z.string().optional(), {
        env: 'ACTOR_STANDBY_URL',
    }),

    // Proxy
    proxyHostname: field(z.string().default('proxy.apify.com'), {
        env: 'APIFY_PROXY_HOSTNAME',
    }),
    proxyPassword: field(z.string().optional(), {
        env: 'APIFY_PROXY_PASSWORD',
    }),
    proxyPort: field(z.coerce.number().default(8000), {
        env: 'APIFY_PROXY_PORT',
    }),
    proxyStatusUrl: field(z.string().default('http://proxy.apify.com'), {
        env: 'APIFY_PROXY_STATUS_URL',
    }),

    // Platform detection
    isAtHome: field(coerceBoolean.default(false), {
        env: 'APIFY_IS_AT_HOME',
    }),

    // User
    userId: field(z.string().optional(), {
        env: 'APIFY_USER_ID',
    }),

    // Input secrets
    inputSecretsPrivateKeyFile: field(z.string().optional(), {
        env: 'APIFY_INPUT_SECRETS_PRIVATE_KEY_FILE',
    }),
    inputSecretsPrivateKeyPassphrase: field(z.string().optional(), {
        env: 'APIFY_INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE',
    }),

    // Metamorph
    metamorphAfterSleepMillis: field(z.coerce.number().default(300_000), {
        env: 'APIFY_METAMORPH_AFTER_SLEEP_MILLIS',
    }),

    // Pay per event
    maxTotalChargeUsd: field(z.coerce.number().optional(), {
        env: 'ACTOR_MAX_TOTAL_CHARGE_USD',
    }),
    testPayPerEvent: field(coerceBoolean.default(false), {
        env: 'ACTOR_TEST_PAY_PER_EVENT',
    }),
    useChargingLogDataset: field(coerceBoolean.default(false), {
        env: 'ACTOR_USE_CHARGING_LOG_DATASET',
    }),

    // Meta origin
    metaOrigin: field(
        z.custom<(typeof META_ORIGINS)[keyof typeof META_ORIGINS]>().optional(),
        {
            env: 'APIFY_META_ORIGIN',
        },
    ),
} as const;

export type ApifyConfigFields = typeof apifyConfigFields;

// ============================================================================
// Configuration Options Types
// ============================================================================

/** Input options for Configuration constructor (all fields optional) */
export type ConfigurationOptions = InferInputOptions<ApifyConfigFields>;

/** Output options from Configuration.get() (respects defaults) */
export type ConfigurationValues = InferOutputOptions<ApifyConfigFields>;

// ============================================================================
// Configuration Class
// ============================================================================

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
 * `metaOrigin` | `APIFY_META_ORIGIN` | -
 * `proxyHostname` | `APIFY_PROXY_HOSTNAME` | `'proxy.apify.com'`
 * `proxyPassword` | `APIFY_PROXY_PASSWORD` | -
 * `proxyPort` | `APIFY_PROXY_PORT` | `8000`
 * `proxyStatusUrl` | `APIFY_PROXY_STATUS_URL` | `'http://proxy.apify.com'`
 * `userId` | `APIFY_USER_ID` | -
 * `xvfb` | `APIFY_XVFB` | -
 * `standbyPort` | `ACTOR_STANDBY_PORT` | `4321`
 * `standbyUrl` | `ACTOR_STANDBY_URL` | -
 * `chromeExecutablePath` | `APIFY_CHROME_EXECUTABLE_PATH` | -
 * `defaultBrowserPath` | `APIFY_DEFAULT_BROWSER_PATH` | -
 */
export class Configuration extends CrawleeConfiguration<
    ApifyConfigFields,
    ConfigurationOptions,
    ConfigurationValues
> {
    static override fields: FieldDefinitions = apifyConfigFields;

    /** @internal */
    // eslint-disable-next-line no-use-before-define
    static override globalConfig?: Configuration;

    /**
     * Returns the global configuration instance. It will respect the environment variables.
     */
    static override getGlobalConfig(): Configuration {
        if (CrawleeConfiguration.storage.getStore()) {
            return CrawleeConfiguration.storage.getStore() as Configuration;
        }

        Configuration.globalConfig ??= new Configuration();
        return Configuration.globalConfig;
    }

    /**
     * Resets global configuration instance. The default instance holds configuration based on env vars,
     * if we want to change them, we need to first reset the global state. Used mainly for testing purposes.
     */
    static override resetGlobalState(): void {
        delete Configuration.globalConfig;
    }
}
