import { bindMethodsToServiceLocator, ServiceLocator } from '@crawlee/core';
import { MemoryStorage } from '@crawlee/memory-storage';
import type { StorageClient } from '@crawlee/types';
import { Actor, Configuration, type PlatformEventManager } from 'apify';
import { onTestFinished } from 'vitest';

export interface IsolatedActor {
    actor: Actor;
    config: Configuration;
    events: PlatformEventManager;
    serviceLocator: ServiceLocator;
}

/**
 * Build an {@link Actor} wired to its **own** `ServiceLocator`, so the Actor's
 * methods resolve crawlee's `Configuration` / `EventManager` / `StorageClient`
 * from that instance instead of the process-global locator.
 *
 * This is the per-consumer locator pattern crawlee itself uses for crawlers
 * (see apify/crawlee#3710): `bindMethodsToServiceLocator` runs every Actor method
 * inside an `AsyncLocalStorage` scope bound to this locator, so a test gets a
 * fully isolated set of services without having to reset shared global state
 * (`serviceLocator.reset()`) between tests.
 *
 * Teardown is automatic: the Actor's event manager (its WebSocket connection and
 * persist-state interval) is closed when the current test finishes, via vitest's
 * `onTestFinished`. Callers don't track or close anything by hand.
 *
 * For tests that drive an `Actor` **instance** directly, use the returned
 * `actor`. For tests that go through the static `Actor.*` API, see
 * {@link initIsolatedDefaultActor}.
 */
export function createIsolatedActor(
    options: { config?: Configuration; storageClient?: StorageClient } = {},
): IsolatedActor {
    const config = options.config ?? new Configuration();
    const actor = new Actor({ configuration: config });
    // Seed the locator with the Actor's *own* event manager, so that on the
    // platform — where `init()` calls `setEventManager(this.eventManager)` — the
    // set is a no-op rather than a conflict with a second instance.
    const events = (actor as unknown as { eventManager: PlatformEventManager }).eventManager;
    const serviceLocator = new ServiceLocator(config, events, options.storageClient);
    bindMethodsToServiceLocator(serviceLocator, actor);

    onTestFinished(async () => {
        await events.close().catch(() => {});
    });

    return { actor, config, events, serviceLocator };
}

/**
 * Like {@link createIsolatedActor}, but also installs the isolated Actor as the
 * static default instance and calls `init()`. The static `Actor.*` helpers all
 * delegate to `Actor.getDefaultInstance()`, so they then route through this
 * isolated, per-test locator — letting static-API tests stay isolated without
 * resetting the global locator between runs.
 *
 * Teardown is automatic (see {@link createIsolatedActor}): when the test
 * finishes, the Actor is exited and the static default instance is dropped.
 */
export async function initIsolatedDefaultActor(options: { config?: Configuration } = {}): Promise<IsolatedActor> {
    const isolated = createIsolatedActor(options);
    // eslint-disable-next-line no-underscore-dangle
    Actor._instance = isolated.actor;

    onTestFinished(async () => {
        await isolated.actor.exit({ exit: false }).catch(() => {});
        // eslint-disable-next-line no-underscore-dangle
        delete (Actor as { _instance?: Actor })._instance;
    });

    await isolated.actor.init();
    return isolated;
}

/**
 * Replace a locator's storage client with a fresh in-memory one.
 *
 * On the platform, `Actor.init()` registers an `ApifyStorageClient`; tests that
 * assert on `pushData()` / `openDataset()` want local in-memory storage instead.
 * crawlee services are set-once, so swapping one means resetting the locator and
 * re-setting it — harmless here because the locator is the test's own isolated
 * instance, not the shared global one.
 */
export function useInMemoryStorage(serviceLocator: ServiceLocator): MemoryStorage {
    const storage = new MemoryStorage({ persistStorage: false });
    serviceLocator.reset();
    serviceLocator.setStorageClient(storage);
    return storage;
}
