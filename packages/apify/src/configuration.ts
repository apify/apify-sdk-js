/* eslint-disable no-use-before-define */
import { AsyncLocalStorage } from 'node:async_hooks';

import type { ConfigField, FieldsInput, FieldsOutput } from '@crawlee/core';
import {
    coerceBoolean,
    Configuration as CoreConfiguration,
    crawleeConfigFields,
    field,
} from '@crawlee/core';
import { z } from 'zod';

import {
    ACTOR_ENV_VARS,
    APIFY_ENV_VARS,
    LOCAL_ACTOR_ENV_VARS,
    LOCAL_APIFY_ENV_VARS,
} from '@apify/consts';

const coerceNumber = z.preprocess((val) => {
    if (typeof val === 'string') return Number(val);
    return val;
}, z.number());

// --- isAtHome check (simple env var presence) ---
const isAtHome = !!process.env[APIFY_ENV_VARS.IS_AT_HOME];

// --- Apify config field definitions ---

export const apifyConfigFields = {
    // Inherit all crawlee fields, overriding env vars where the SDK supports ACTOR_/APIFY_ aliases
    ...crawleeConfigFields,

    // Override crawlee fields with ACTOR_/APIFY_ env var aliases
    defaultDatasetId: field(
        z
            .string()
            .default(LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_DATASET_ID]),
        [
            ACTOR_ENV_VARS.DEFAULT_DATASET_ID,
            'APIFY_DEFAULT_DATASET_ID',
            'CRAWLEE_DEFAULT_DATASET_ID',
        ],
    ),
    defaultKeyValueStoreId: field(
        z
            .string()
            .default(
                LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID],
            ),
        [
            ACTOR_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID,
            'APIFY_DEFAULT_KEY_VALUE_STORE_ID',
            'CRAWLEE_DEFAULT_KEY_VALUE_STORE_ID',
        ],
    ),
    defaultRequestQueueId: field(
        z
            .string()
            .default(
                LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID],
            ),
        [
            ACTOR_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID,
            'APIFY_DEFAULT_REQUEST_QUEUE_ID',
            'CRAWLEE_DEFAULT_REQUEST_QUEUE_ID',
        ],
    ),
    inputKey: field(z.string().default('INPUT'), [
        ACTOR_ENV_VARS.INPUT_KEY,
        'APIFY_INPUT_KEY',
        'CRAWLEE_INPUT_KEY',
    ]),
    memoryMbytes: field(coerceNumber.optional(), [
        ACTOR_ENV_VARS.MEMORY_MBYTES,
        'APIFY_MEMORY_MBYTES',
        'CRAWLEE_MEMORY_MBYTES',
    ]),
    availableMemoryRatio: field(coerceNumber.default(isAtHome ? 1 : 0.25), [
        'CRAWLEE_AVAILABLE_MEMORY_RATIO',
        'APIFY_AVAILABLE_MEMORY_RATIO',
    ]),
    disableBrowserSandbox: field(
        isAtHome ? coerceBoolean.default(true) : coerceBoolean.optional(),
        ['CRAWLEE_DISABLE_BROWSER_SANDBOX', 'APIFY_DISABLE_BROWSER_SANDBOX'],
    ),
    persistStateIntervalMillis: field(coerceNumber.default(60_000), [
        'CRAWLEE_PERSIST_STATE_INTERVAL_MILLIS',
        'APIFY_PERSIST_STATE_INTERVAL_MILLIS',
        'APIFY_TEST_PERSIST_INTERVAL_MILLIS',
    ]),
    headless: field(coerceBoolean.default(true), [
        'CRAWLEE_HEADLESS',
        'APIFY_HEADLESS',
    ]),
    xvfb: field(coerceBoolean.default(false), ['CRAWLEE_XVFB', 'APIFY_XVFB']),
    chromeExecutablePath: field(z.string().optional(), [
        'CRAWLEE_CHROME_EXECUTABLE_PATH',
        'APIFY_CHROME_EXECUTABLE_PATH',
    ]),
    defaultBrowserPath: field(z.string().optional(), [
        'CRAWLEE_DEFAULT_BROWSER_PATH',
        'APIFY_DEFAULT_BROWSER_PATH',
    ]),
    purgeOnStart: field(coerceBoolean.default(true), [
        'CRAWLEE_PURGE_ON_START',
        'APIFY_PURGE_ON_START',
    ]),

    // Apify-specific fields
    metamorphAfterSleepMillis: field(
        coerceNumber.default(300_000),
        'APIFY_METAMORPH_AFTER_SLEEP_MILLIS',
    ),
    actorEventsWsUrl: field(z.string().optional(), [
        ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL,
        'APIFY_ACTOR_EVENTS_WS_URL',
    ]),
    token: field(z.string().optional(), 'APIFY_TOKEN'),
    actorId: field(z.string().optional(), [
        ACTOR_ENV_VARS.ID,
        'APIFY_ACTOR_ID',
    ]),
    actorRunId: field(z.string().optional(), [
        ACTOR_ENV_VARS.RUN_ID,
        'APIFY_ACTOR_RUN_ID',
    ]),
    actorTaskId: field(z.string().optional(), [
        ACTOR_ENV_VARS.TASK_ID,
        'APIFY_ACTOR_TASK_ID',
    ]),
    apiBaseUrl: field(
        z.string().default('https://api.apify.com'),
        'APIFY_API_BASE_URL',
    ),
    apiPublicBaseUrl: field(
        z.string().default('https://api.apify.com'),
        'APIFY_API_PUBLIC_BASE_URL',
    ),
    containerPort: field(
        coerceNumber.default(
            +LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_PORT],
        ),
        [ACTOR_ENV_VARS.WEB_SERVER_PORT, 'APIFY_CONTAINER_PORT'],
    ),
    containerUrl: field(
        z.string().default(LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_URL]),
        [ACTOR_ENV_VARS.WEB_SERVER_URL, 'APIFY_CONTAINER_URL'],
    ),
    proxyHostname: field(
        z.string().default(LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_HOSTNAME]),
        'APIFY_PROXY_HOSTNAME',
    ),
    proxyPassword: field(z.string().optional(), 'APIFY_PROXY_PASSWORD'),
    proxyPort: field(
        coerceNumber.default(+LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_PORT]),
        'APIFY_PROXY_PORT',
    ),
    proxyStatusUrl: field(
        z.string().default('http://proxy.apify.com'),
        'APIFY_PROXY_STATUS_URL',
    ),
    /** @deprecated use `containerPort` instead */
    standbyPort: field(
        coerceNumber.default(
            +LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.STANDBY_PORT],
        ),
        ACTOR_ENV_VARS.STANDBY_PORT,
    ),
    standbyUrl: field(z.string().optional(), ACTOR_ENV_VARS.STANDBY_URL),
    isAtHome: field(coerceBoolean.optional(), 'APIFY_IS_AT_HOME'),
    userId: field(z.string().optional(), 'APIFY_USER_ID'),
    inputSecretsPrivateKeyPassphrase: field(
        z.string().optional(),
        'APIFY_INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE',
    ),
    inputSecretsPrivateKeyFile: field(
        z.string().optional(),
        'APIFY_INPUT_SECRETS_PRIVATE_KEY_FILE',
    ),
    maxTotalChargeUsd: field(
        coerceNumber.optional(),
        ACTOR_ENV_VARS.MAX_TOTAL_CHARGE_USD,
    ),
    metaOrigin: field(z.string().optional(), 'APIFY_META_ORIGIN'),
    testPayPerEvent: field(
        coerceBoolean.default(false),
        'ACTOR_TEST_PAY_PER_EVENT',
    ),
    useChargingLogDataset: field(
        coerceBoolean.default(false),
        'ACTOR_USE_CHARGING_LOG_DATASET',
    ),
};

// --- Type utilities ---

export type ApifyConfigurationInput = FieldsInput<typeof apifyConfigFields>;
export type ApifyResolvedConfigValues = FieldsOutput<typeof apifyConfigFields>;

/** @deprecated Use {@link ApifyConfigurationInput} instead. */
export type ConfigurationOptions = ApifyConfigurationInput;

// --- Configuration class ---

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface Configuration extends ApifyResolvedConfigValues {}

/**
 * `Configuration` is a value object holding the SDK configuration. We can use it in two ways:
 *
 * 1. When using `Actor` class, we can get the instance configuration via `sdk.config`
 *
 *    ```javascript
 *    import { Actor } from 'apify';
 *
 *    const sdk = new Actor({ token: '123' });
 *    console.log(sdk.config.token); // '123'
 *    ```
 *
 * 2. To get the global configuration (singleton instance). It will respect the environment variables.
 *
 *    ```javascript
 *    import { Configuration } from 'apify';
 *
 *    const config = Configuration.getGlobalConfig();
 *    console.log(config.headless);
 *    console.log(config.persistStateIntervalMillis);
 *    ```
 *
 * Configuration is immutable — values are set via the constructor and cannot be changed afterwards.
 * The priority order for resolving values is (highest to lowest):
 *
 * ```text
 * constructor options > environment variables > crawlee.json > schema defaults
 * ```
 *
 * ## Supported Configuration Options
 *
 * Key | Environment Variable | Default Value
 * ---|---|---
 * `memoryMbytes` | `ACTOR_MEMORY_MBYTES` | -
 * `headless` | `APIFY_HEADLESS` | `true`
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Configuration extends CoreConfiguration {
    /** @internal */
    static storage = new AsyncLocalStorage<Configuration>();

    /** @internal */
    static globalConfig?: Configuration;

    protected static override fields: Record<string, ConfigField> =
        apifyConfigFields;

    constructor(options: ApifyConfigurationInput = {}) {
        super(options as any);
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
    static resetGlobalState(): void {
        delete this.globalConfig;
    }
}
