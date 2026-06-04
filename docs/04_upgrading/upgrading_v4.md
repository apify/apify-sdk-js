---
id: upgrading-to-v4
title: Upgrading to v4
---

This page summarizes the breaking changes between Apify SDK v3 and v4. Apify SDK v4 adopts the redesigned Crawlee v4 interfaces (`Configuration`, `EventManager`, `StorageClient`, `ProxyConfiguration`), so most of the changes here track the corresponding Crawlee v4 changes.

## Node.js 22+

The SDK now requires **Node.js 22 or newer**.

## ESM

The SDK is now published as native ESM (the package is `"type": "module"`) and no longer ships a separate CommonJS build. This does **not** change how you load it: the SDK has no top-level `await`, and the supported Node.js versions can `require()` ESM modules, so both `import` and `require('apify')` keep working.

```ts
import { Actor } from 'apify';
// CommonJS projects can still use:
const { Actor } = require('apify');
```

## Configuration

The `Configuration` class no longer exposes `.get(key)` / `.set(key, value)`. Configuration values are resolved eagerly at construction time and exposed as plain typed properties.

Before (v3):

```ts
import { Configuration } from 'apify';

const config = Configuration.getGlobalConfig();
const token = config.get('token');
config.set('token', 'new-token');
```

After (v4):

```ts
import { Configuration } from 'apify';

// Construct with overrides — Configuration is immutable.
const config = new Configuration({ token: 'new-token' });
const token = config.token;
```

Resolution order (highest to lowest priority): constructor options → environment variables → `crawlee.json` → schema defaults.

Empty-string environment variables are treated as unset (they fall through to the schema default) rather than being coerced to `0` / `''` / `false`. For example, `ACTOR_MAX_TOTAL_CHARGE_USD=""` now resolves to `undefined` instead of `0`.

When a setting is exposed under several environment variables, the Apify-specific ones take precedence over Crawlee's generic one — i.e. `ACTOR_*` / `APIFY_*` are checked before `CRAWLEE_*`. For example, if both `APIFY_HEADLESS` and `CRAWLEE_HEADLESS` are set, `APIFY_HEADLESS` wins.

`new Actor({ configuration })` accepts a pre-built `Configuration`, but it must be the Apify SDK's `Configuration` (imported from `apify`), not a bare Crawlee one — otherwise the `APIFY_*` / `ACTOR_*` environment variables are never resolved, so the SDK now throws if given a non-Apify instance.

## ProxyConfiguration: `newUrl()` / `newProxyInfo()` no longer take `sessionId`

The `sessionId` parameter has been removed from both `ProxyConfiguration.newUrl()` and `ProxyConfiguration.newProxyInfo()`. Each call now returns an independent URL; for Apify Proxy the SDK mints a fresh random session id internally for every URL it hands out, so consecutive calls resolve to different IPs.

Before (v3):

```ts
const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

// Sticky pairing: same sessionId → same proxy URL → same IP.
const url1 = await proxyConfiguration.newUrl('mySession');
const url2 = await proxyConfiguration.newUrl('mySession'); // === url1
```

After (v4):

```ts
const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

// Every call returns an independent URL with its own session id.
const url1 = await proxyConfiguration.newUrl();
const url2 = await proxyConfiguration.newUrl(); // !== url1
```

Session continuity (reusing the same IP across multiple requests) is now handled one level up by Crawlee's `SessionPool`: a `Session` stores the proxy URL it was paired with and the crawler reuses that URL for subsequent requests bound to the same session. When using `CheerioCrawler`, `PlaywrightCrawler`, etc. with `useSessionPool: true`, this is automatic — no code changes are required on the consumer side.

`ProxyInfo` no longer carries a `sessionId` field. If you used it for logging or analytics, parse the `session-<id>` segment out of `proxyInfo.username` instead (it is included for Apify Proxy URLs).

The `tieredProxyUrls` and `tieredProxyConfig` options on `ProxyConfigurationOptions` were dropped in Crawlee v4 ([apify/crawlee#3599](https://github.com/apify/crawlee/pull/3599)) and the SDK no longer threads them through. Migrate to named sessions via `SessionPool` if you relied on tiered rotation.

## EventManager

`PlatformEventManager` now extends Crawlee v4's `EventManager` and integrates with the new service locator. Use `Configuration.getGlobalConfig()` (or pass a `Configuration` instance explicitly) when constructing it directly — the constructor no longer accepts a `config` override via the `override` keyword pattern because Crawlee's base class manages the configuration through `serviceLocator` instead of a `config` field.

If you only interact with events through `Actor.on()` / `Actor.off()` / `Actor.events`, no code changes are needed.

## StorageClient

The SDK's storage layer was adapted to the new Crawlee v4 `StorageClient` interface. The Apify platform client is wrapped via the `ApifyStorageClient` adapter — now exported from `apify` — which implements `createDatasetClient`, `createKeyValueStoreClient`, and `createRequestQueueClient`.

`Actor` wires this up for you, so most code needs no changes. But if you previously passed a raw `apify-client` `ApifyClient` straight into a Crawlee storage as its `storageClient` — which worked in v3 — it no longer does: Crawlee v4 calls `createKeyValueStoreClient()` / `createDatasetClient()`, which the raw client doesn't implement. Wrap it in `ApifyStorageClient`:

```ts
// v3
import { ApifyClient, KeyValueStore } from 'apify';

const client = new ApifyClient({ token });
const store = await KeyValueStore.open(storeId, { storageClient: client });

// v4
import { ApifyClient, ApifyStorageClient, KeyValueStore } from 'apify';

const client = new ApifyClient({ token });
const store = await KeyValueStore.open(storeId, { storageClient: new ApifyStorageClient(client) });
```

`KeyValueStore.getPublicUrl()` is now asynchronous (it signs URLs server-side when running on the Apify platform). Update call sites accordingly:

```ts
// v3
const url = store.getPublicUrl('myKey');

// v4
const url = await store.getPublicUrl('myKey');
```

## Argument validation (`ow` → `zod`)

Runtime argument validation (e.g. `Actor.addWebhook()`, `Actor.setStatusMessage()`, `Actor.openDataset()` / `openKeyValueStore()` / `openRequestQueue()`, and the `ProxyConfiguration` constructor) now uses [`zod`](https://zod.dev) instead of `ow`. Validation is just as strict — invalid arguments still throw synchronously, before any work is done — but the **error messages changed**.

For example, `new ProxyConfiguration({ countryCode: 'CZE' })` throws:

```diff
- Expected property string `countryCode` to match `/^[A-Z]{2}$/`, got `CZE` in object   // v3 (ow)
+ ✖ Invalid string: must match pattern /^[A-Z]{2}$/                                       // v4 (zod)
+   → at countryCode
```

If you matched on the exact text of these validation errors, update those checks. The thrown `Error` now carries the structured `ZodError` as its `cause`, so you can inspect `error.cause.issues` programmatically instead of parsing the message:

```ts
try {
    new ProxyConfiguration({ countryCode: 'CZE' });
} catch (error) {
    console.log(error.message); // human-readable sentence (the text shown above)
    console.log(error.cause?.issues); // structured ZodError issues, if you need to branch on them
}
```

## Dependencies

The SDK dropped several runtime dependencies in favor of native Node.js APIs and packages it already pulls in:

- **`got-scraping`** — the internal Apify Proxy status check now uses the native `fetch` (via `undici`'s `ProxyAgent`). If your Actor imported `got-scraping` transitively through `apify`, add it to your own `dependencies`.
- **`fs-extra`** — replaced with `node:fs`.
- **`ow`** — replaced with `zod` (see above).
