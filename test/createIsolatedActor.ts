import { bindMethodsToServiceLocator, ServiceLocator } from '@crawlee/core';
import type { StorageClient } from '@crawlee/types';
import { Actor, Configuration, PlatformEventManager } from 'apify';

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
 * Use this for tests that exercise an `Actor` **instance**. Tests that exercise
 * the static `Actor.*` / global-config API still go through the global locator
 * by design and keep using `resetGlobalState()`.
 */
export function createIsolatedActor(
    options: { config?: Configuration; storageClient?: StorageClient } = {},
): IsolatedActor {
    const config = options.config ?? new Configuration();
    const events = new PlatformEventManager(config);
    const actor = new Actor({ configuration: config });
    const serviceLocator = new ServiceLocator(config, events, options.storageClient);
    bindMethodsToServiceLocator(serviceLocator, actor);
    return { actor, config, events, serviceLocator };
}
