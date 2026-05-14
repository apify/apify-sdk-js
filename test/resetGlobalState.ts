import { AsyncLocalStorage } from 'node:async_hooks';

import { serviceLocator } from '@crawlee/core';
import { Actor, Configuration } from 'apify';

/**
 * Test helper: drops every cached singleton that influences how a freshly
 * constructed `Actor` / `Configuration` observes `process.env`.
 *
 * `Configuration` resolves env vars eagerly at construction, so once a global
 * config has been cached, subsequent env-var mutations are invisible until the
 * cached instance is dropped. Four caches need clearing for that to work
 * end-to-end:
 *
 * - `Actor._instance` — lazy default `Actor` created by `Actor.getDefaultInstance()`.
 * - `Configuration.globalConfig` — the SDK's own static singleton (held alongside
 *   crawlee's `serviceLocator` cache because the SDK overrides `getGlobalConfig`).
 * - `Configuration.storage` — the `AsyncLocalStorage` that `Actor.init()` writes
 *   to. Replaced wholesale because `enterWith(undefined)` from a child async
 *   context doesn't propagate back up on Node 22.
 * - `serviceLocator` — crawlee's cache for `Configuration` / `EventManager` /
 *   `StorageClient` / `Logger`. Dropped via `serviceLocator.reset()`.
 *
 * Production code never needs this — Configuration is intentionally immutable
 * per-instance. Kept in the test tree so it doesn't pollute the public SDK
 * surface.
 */
/* eslint-disable no-underscore-dangle */
export function resetGlobalState(): void {
    delete (Actor as { _instance?: Actor })._instance;
    delete (Configuration as unknown as { globalConfig?: Configuration })
        .globalConfig;
    (
        Configuration as unknown as {
            storage: AsyncLocalStorage<Configuration>;
        }
    ).storage = new AsyncLocalStorage<Configuration>();
    serviceLocator.reset();
}
