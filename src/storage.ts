import type { IStorage } from '@crawlee/core';
import { StorageManager } from '@crawlee/core';
import type { Constructor, StorageClient } from '@crawlee/types';
import { ApifyClient } from 'apify-client';

import type { Configuration } from './configuration.js';

export interface OpenStorageOptions {
    /**
     * If set to `true` then the cloud storage is used even if the `CRAWLEE_STORAGE_DIR`
     * environment variable is set. This way it is possible to combine local and cloud storage.
     * @default false
     */
    forceCloud?: boolean;
}

/**
 * Identifies a storage by its alias from the Actor's schema storages
 * (resolved via the `ACTOR_STORAGES_JSON` environment variable).
 */
export interface StorageAlias {
    alias: string;
}

/**
 * Identifies a storage by its platform ID.
 */
export interface StorageId {
    id: string;
}

/**
 * Identifies a storage by its name.
 */
export interface StorageName {
    name: string;
}

/**
 * Identifies a storage to open. Can be:
 * - A plain `string` for backward compatibility (treated as ID or name)
 * - `{ alias: string }` to resolve from the Actor's schema storages (`ACTOR_STORAGES_JSON`)
 * - `{ id: string }` to open by explicit platform ID
 * - `{ name: string }` to open by explicit name
 */
export type StorageIdentifier = string | StorageAlias | StorageId | StorageName;

/**
 * Identifies a storage to open, without alias support.
 * Used for key-value stores and request queues, which do not support aliases.
 * Can be:
 * - A plain `string` for backward compatibility (treated as ID or name)
 * - `{ id: string }` to open by explicit platform ID
 * - `{ name: string }` to open by explicit name
 */
export type StorageIdentifierWithoutAlias = string | StorageId | StorageName;

/**
 * The parsed shape of the `ACTOR_STORAGES_JSON` environment variable.
 */
interface ActorStorages {
    datasets: Record<string, string>;
    keyValueStores: Record<string, string>;
    requestQueues: Record<string, string>;
}

const STORAGE_TYPE_KEYS: Record<string, keyof ActorStorages> = {
    Dataset: 'datasets',
    KeyValueStore: 'keyValueStores',
    RequestQueue: 'requestQueues',
};

const parsedStoragesJson = new Map<string, ActorStorages>();

/**
 * Resolves a {@link StorageIdentifier} to a plain string ID or name
 * that can be passed to Crawlee's `StorageManager.openStorage()`.
 */
function resolveStorageIdentifier(
    storageType: 'Dataset' | 'KeyValueStore' | 'RequestQueue',
    identifier: StorageIdentifier | null | undefined,
    config: Configuration,
): string | undefined {
    if (identifier === null || identifier === undefined) {
        return undefined;
    }

    if (typeof identifier === 'string') {
        return identifier;
    }

    if ('id' in identifier) {
        return identifier.id;
    }

    if ('name' in identifier) {
        return identifier.name;
    }

    // { alias: string }
    const storagesJson = config.get('actorStoragesJson');
    if (config.get('isAtHome') && storagesJson) {
        let storages: ActorStorages;
        try {
            if (!parsedStoragesJson.has(storagesJson)) {
                parsedStoragesJson.set(storagesJson, JSON.parse(storagesJson));
            }
            storages = parsedStoragesJson.get(storagesJson)!;
        } catch {
            throw new Error(
                `Failed to parse ACTOR_STORAGES_JSON environment variable: ${storagesJson}`,
            );
        }

        const typeKey = STORAGE_TYPE_KEYS[storageType];
        const resolvedId = storages[typeKey]?.[identifier.alias];

        if (resolvedId) {
            return resolvedId;
        }

        throw new Error(
            `Storage alias "${identifier.alias}" not found in ACTOR_STORAGES_JSON for storage type "${storageType}". ` +
                `Available aliases: ${Object.keys(storages[typeKey] ?? {}).join(', ') || '(none)'}`,
        );
    }

    // When using local storage, just use the alias as a name.
    // When using platform storage, we can't just make up a name — the alias must be
    // in ACTOR_STORAGES_JSON.
    if (config.get('isAtHome')) {
        throw new Error(
            `Storage alias "${identifier.alias}" cannot be resolved because ACTOR_STORAGES_JSON is not set. ` +
                `Aliases are only available for storages declared in the Actor's schema.`,
        );
    }

    return identifier.alias;
}

export interface OpenStorageContext {
    config: Configuration;
    client?: StorageClient;
    purgedStorageAliases: Set<string>;
}

/**
 * Opens a storage by its identifier, handling alias resolution and local purging.
 */
export async function openStorage<T extends IStorage>(
    storageClass: Constructor<T>,
    identifier: StorageIdentifier | null | undefined,
    context: OpenStorageContext,
): Promise<T> {
    const isAlias =
        identifier !== null &&
        identifier !== undefined &&
        typeof identifier === 'object' &&
        'alias' in identifier;

    if (
        isAlias &&
        !context.config.get('isAtHome') &&
        context.client instanceof ApifyClient
    ) {
        throw new Error(
            'The `alias` option is not allowed for Apify-based storages running outside of Apify',
        );
    }

    const resolvedIdOrName = resolveStorageIdentifier(
        storageClass.name as 'Dataset' | 'KeyValueStore' | 'RequestQueue',
        identifier,
        context.config,
    );

    // When running locally, purge aliased storages on first open
    // (similar to how Crawlee purges default storages on start)
    if (
        isAlias &&
        !context.config.get('isAtHome') &&
        context.config.get('purgeOnStart') &&
        !context.purgedStorageAliases.has(identifier.alias)
    ) {
        context.purgedStorageAliases.add(identifier.alias);
        const existingStorage = await StorageManager.openStorage<T>(
            storageClass,
            resolvedIdOrName,
            context.client,
            context.config,
        );
        await (existingStorage as T & { drop(): Promise<void> }).drop();
    }

    return StorageManager.openStorage<T>(
        storageClass,
        resolvedIdOrName,
        context.client,
        context.config,
    );
}
