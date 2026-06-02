---
id: upgrading-to-v4
title: Upgrading to v4
---

This page summarizes the breaking changes between Apify SDK v3 and v4. Apify SDK v4 adopts the redesigned Crawlee v4 interfaces (`Configuration`, `EventManager`, `StorageClient`, `ProxyConfiguration`), so most of the changes here track the corresponding Crawlee v4 changes.

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

The SDK's storage layer was adapted to the new Crawlee v4 `StorageClient` interface. The Apify platform client is wrapped via an internal `ApifyStorageClient` adapter that implements `createDatasetClient`, `createKeyValueStoreClient`, and `createRequestQueueClient`.

`KeyValueStore.getPublicUrl()` is now asynchronous (it signs URLs server-side when running on the Apify platform). Update call sites accordingly:

```ts
// v3
const url = store.getPublicUrl('myKey');

// v4
const url = await store.getPublicUrl('myKey');
```
