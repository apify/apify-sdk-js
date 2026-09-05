import { serviceLocator } from '@crawlee/core';
import { Actor, Configuration } from 'apify';

/**
 * Test helper: drops every cached singleton that influences how a freshly
 * constructed `Actor` / `Configuration` observes `process.env`.
 *
 * `Configuration` resolves env vars eagerly at construction, so once a global
 * config has been cached, subsequent env-var mutations are invisible until the
 * cached instance is dropped. Three caches need clearing for that to work
 * end-to-end:
 *
 * - The cached default `Actor` created by `Actor.getDefaultInstance()`, dropped via
 *   `Actor.setDefaultInstance()`.
 * - `Configuration.globalConfig` — the SDK's own static singleton (its
 *   Apify-typed default fallback for `getGlobalConfiguration()`).
 * - `serviceLocator` — crawlee's cache for `Configuration` / `EventManager` /
 *   `StorageClient` / `Logger`. Dropped via `serviceLocator.reset()`.
 *
 * Production code never needs this — Configuration is intentionally immutable
 * per-instance. Kept in the test tree so it doesn't pollute the public SDK
 * surface.
 */
export function resetGlobalState(): void {
    Actor.setDefaultInstance();
    delete (Configuration as unknown as { globalConfig?: Configuration }).globalConfig;
    serviceLocator.reset();
}
