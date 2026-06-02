/* eslint-disable no-use-before-define */

import type { ConfigField, FieldsInput, FieldsOutput } from '@crawlee/core';
import {
    coerceBoolean,
    coerceNumber,
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

// Evaluated lazily (per Configuration construction, not at import) so the
// at-home defaults for `availableMemoryRatio` / `disableBrowserSandbox` below
// react to `APIFY_IS_AT_HOME` even if it changes after import (tests, embedding).
// Reads the env var, not the resolved `isAtHome` field, so an explicit
// `new Configuration({ isAtHome: true })` won't flip these — env is the source.
const isAtHome = () => !!process.env[APIFY_ENV_VARS.IS_AT_HOME];

/**
 * Extend a crawlee config field with Apify-specific env-var aliases. The Apify
 * vars take precedence; crawlee's own `CRAWLEE_*` var is reused as the fallback
 * (so it is never re-typed here). Pass `schema` only when the SDK needs a
 * different default than crawlee's — otherwise crawlee's schema is kept as-is.
 */
function withApifyEnv<T extends z.ZodType>(
    base: ConfigField<T>,
    apifyEnvVars: string | string[],
): ConfigField<T>;
function withApifyEnv<T extends z.ZodType>(
    base: ConfigField,
    apifyEnvVars: string | string[],
    schema: T,
): ConfigField<T>;
function withApifyEnv<T extends z.ZodType>(
    base: ConfigField,
    apifyEnvVars: string | string[],
    schema?: T,
): ConfigField<T> {
    const crawleeVars = base.envVar == null ? [] : [base.envVar].flat();
    return field((schema ?? base.schema) as T, [
        ...[apifyEnvVars].flat(),
        ...crawleeVars,
    ]);
}

// --- Apify config field definitions ---

export const apifyConfigFields = {
    // Inherit all crawlee fields as-is.
    ...crawleeConfigFields,

    // Crawlee fields the SDK extends with ACTOR_/APIFY_ env-var aliases (which
    // take precedence; crawlee's own CRAWLEE_* var is reused as the fallback,
    // never re-typed). A schema is passed only where the SDK needs a different
    // default than crawlee's.
    defaultDatasetId: withApifyEnv(
        crawleeConfigFields.defaultDatasetId,
        [ACTOR_ENV_VARS.DEFAULT_DATASET_ID, APIFY_ENV_VARS.DEFAULT_DATASET_ID],
        z
            .string()
            .default(LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_DATASET_ID]),
    ),
    defaultKeyValueStoreId: withApifyEnv(
        crawleeConfigFields.defaultKeyValueStoreId,
        [
            ACTOR_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID,
            APIFY_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID,
        ],
        z
            .string()
            .default(
                LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_KEY_VALUE_STORE_ID],
            ),
    ),
    defaultRequestQueueId: withApifyEnv(
        crawleeConfigFields.defaultRequestQueueId,
        [
            ACTOR_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID,
            APIFY_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID,
        ],
        z
            .string()
            .default(
                LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.DEFAULT_REQUEST_QUEUE_ID],
            ),
    ),
    inputKey: withApifyEnv(crawleeConfigFields.inputKey, [
        ACTOR_ENV_VARS.INPUT_KEY,
        APIFY_ENV_VARS.INPUT_KEY,
    ]),
    memoryMbytes: withApifyEnv(crawleeConfigFields.memoryMbytes, [
        ACTOR_ENV_VARS.MEMORY_MBYTES,
        APIFY_ENV_VARS.MEMORY_MBYTES,
    ]),
    availableMemoryRatio: withApifyEnv(
        crawleeConfigFields.availableMemoryRatio,
        'APIFY_AVAILABLE_MEMORY_RATIO',
        coerceNumber.default(() => (isAtHome() ? 1 : 0.25)),
    ),
    disableBrowserSandbox: withApifyEnv(
        crawleeConfigFields.disableBrowserSandbox,
        'APIFY_DISABLE_BROWSER_SANDBOX',
        coerceBoolean.optional().default(() => (isAtHome() ? true : undefined)),
    ),
    persistStateIntervalMillis: withApifyEnv(
        crawleeConfigFields.persistStateIntervalMillis,
        [
            APIFY_ENV_VARS.PERSIST_STATE_INTERVAL_MILLIS,
            'APIFY_TEST_PERSIST_INTERVAL_MILLIS',
        ],
    ),
    headless: withApifyEnv(
        crawleeConfigFields.headless,
        APIFY_ENV_VARS.HEADLESS,
    ),
    xvfb: withApifyEnv(crawleeConfigFields.xvfb, APIFY_ENV_VARS.XVFB),
    chromeExecutablePath: withApifyEnv(
        crawleeConfigFields.chromeExecutablePath,
        APIFY_ENV_VARS.CHROME_EXECUTABLE_PATH,
    ),
    defaultBrowserPath: withApifyEnv(
        crawleeConfigFields.defaultBrowserPath,
        'APIFY_DEFAULT_BROWSER_PATH',
    ),
    purgeOnStart: withApifyEnv(
        crawleeConfigFields.purgeOnStart,
        APIFY_ENV_VARS.PURGE_ON_START,
    ),

    // Apify-specific fields
    metamorphAfterSleepMillis: field(
        coerceNumber.default(300_000),
        APIFY_ENV_VARS.METAMORPH_AFTER_SLEEP_MILLIS,
    ),
    actorEventsWsUrl: field(z.string().optional(), [
        ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL,
        APIFY_ENV_VARS.ACTOR_EVENTS_WS_URL,
    ]),
    token: field(z.string().optional(), APIFY_ENV_VARS.TOKEN),
    actorId: field(z.string().optional(), [
        ACTOR_ENV_VARS.ID,
        APIFY_ENV_VARS.ACTOR_ID,
    ]),
    actorRunId: field(z.string().optional(), [
        ACTOR_ENV_VARS.RUN_ID,
        APIFY_ENV_VARS.ACTOR_RUN_ID,
    ]),
    actorTaskId: field(z.string().optional(), [
        ACTOR_ENV_VARS.TASK_ID,
        APIFY_ENV_VARS.ACTOR_TASK_ID,
    ]),
    apiBaseUrl: field(
        z.string().default('https://api.apify.com'),
        APIFY_ENV_VARS.API_BASE_URL,
    ),
    apiPublicBaseUrl: field(
        z.string().default('https://api.apify.com'),
        APIFY_ENV_VARS.API_PUBLIC_BASE_URL,
    ),
    containerPort: field(
        coerceNumber.default(
            +LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_PORT],
        ),
        [ACTOR_ENV_VARS.WEB_SERVER_PORT, APIFY_ENV_VARS.CONTAINER_PORT],
    ),
    containerUrl: field(
        z.string().default(LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.WEB_SERVER_URL]),
        [ACTOR_ENV_VARS.WEB_SERVER_URL, APIFY_ENV_VARS.CONTAINER_URL],
    ),
    proxyHostname: field(
        z.string().default(LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_HOSTNAME]),
        APIFY_ENV_VARS.PROXY_HOSTNAME,
    ),
    proxyPassword: field(z.string().optional(), APIFY_ENV_VARS.PROXY_PASSWORD),
    proxyPort: field(
        coerceNumber.default(+LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_PORT]),
        APIFY_ENV_VARS.PROXY_PORT,
    ),
    proxyStatusUrl: field(
        z.string().default('http://proxy.apify.com'),
        APIFY_ENV_VARS.PROXY_STATUS_URL,
    ),
    /** @deprecated use `containerPort` instead */
    standbyPort: field(
        coerceNumber.default(
            +LOCAL_ACTOR_ENV_VARS[ACTOR_ENV_VARS.STANDBY_PORT],
        ),
        ACTOR_ENV_VARS.STANDBY_PORT,
    ),
    standbyUrl: field(z.string().optional(), ACTOR_ENV_VARS.STANDBY_URL),
    isAtHome: field(coerceBoolean.default(false), APIFY_ENV_VARS.IS_AT_HOME),
    userId: field(z.string().optional(), APIFY_ENV_VARS.USER_ID),
    inputSecretsPrivateKeyPassphrase: field(
        z.string().optional(),
        APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE,
    ),
    inputSecretsPrivateKeyFile: field(
        z.string().optional(),
        APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_FILE,
    ),
    // `0` is treated as "no limit" (mirrors the Apify platform contract).
    maxTotalChargeUsd: field(
        coerceNumber
            .transform((val: number) => (val === 0 ? Infinity : val))
            .default(Infinity),
        ACTOR_ENV_VARS.MAX_TOTAL_CHARGE_USD,
    ),
    metaOrigin: field(z.string().optional(), APIFY_ENV_VARS.META_ORIGIN),
    testPayPerEvent: field(
        coerceBoolean.default(false),
        'ACTOR_TEST_PAY_PER_EVENT',
    ),
    useChargingLogDataset: field(
        coerceBoolean.default(false),
        'ACTOR_USE_CHARGING_LOG_DATASET',
    ),
    // Grab-bag of ApifyClient constructor options; the `storageDir` key is
    // pulled out separately for local storage emulation, the rest is spread
    // into `new ApifyClient({...})` in `Actor.newClient()`. No env var alias.
    storageClientOptions: field(z.record(z.string(), z.unknown()).optional()),
};

// --- Type utilities ---

export type ApifyConfigurationInput = FieldsInput<typeof apifyConfigFields>;
export type ApifyResolvedConfigValues = FieldsOutput<typeof apifyConfigFields>;

/** @deprecated Use {@link ApifyConfigurationInput} instead. */
export type ConfigurationOptions = ApifyConfigurationInput;

// --- Configuration class ---

// Resolved config values are exposed as instance properties at runtime via
// crawlee's accessor registration (driven by `static fields`); this declaration
// merge mirrors that on the type side so `config.token`, `config.headless`, …
// are typed. The two are linked only by convention — a field present in one but
// not the other fails silently, so keep `apifyConfigFields` and this in sync.
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
    static globalConfig?: Configuration;

    protected static override fields: Record<string, ConfigField> =
        apifyConfigFields;

    constructor(options: ApifyConfigurationInput = {}) {
        // `super` types its options against crawlee's field set; ours is a
        // superset (apifyConfigFields spreads crawleeConfigFields), so the
        // shapes are runtime-compatible but not TS-assignable — hence the cast.
        super(options as any);
    }

    /**
     * @inheritDoc
     *
     * Returns the SDK's global {@apilink Configuration} singleton (an
     * Apify-typed default that parses `APIFY_*` env vars). During an Actor run
     * the active configuration is held by crawlee's `serviceLocator`, which is
     * what crawlee internals resolve against; this singleton is only the
     * fallback for code reaching for a configuration without an explicit one.
     */
    static override getGlobalConfig(): Configuration {
        Configuration.globalConfig ??= new Configuration();
        return Configuration.globalConfig;
    }
}
