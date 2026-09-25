export interface OpenStorageOptions {
    /**
     * If set to `true` then the cloud storage is used even if the `CRAWLEE_STORAGE_DIR`
     * environment variable is set. This way it is possible to combine local and cloud storage.
     * @default false
     */
    forceCloud?: boolean;
}

/**
 * Identifies a run-scoped storage by its alias.
 *
 * An alias declared in the Actor's schema storages (the `ACTOR_STORAGES_JSON` environment variable)
 * resolves to the storage the platform created for it; any other alias gets an unnamed storage of
 * its own, for this run only.
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
 * - `{ alias: string }` to open a run-scoped storage — see {@link StorageAlias}
 * - `{ id: string }` to open by explicit platform ID
 * - `{ name: string }` to open by explicit name
 */
export type StorageIdentifier = string | StorageAlias | StorageId | StorageName;
