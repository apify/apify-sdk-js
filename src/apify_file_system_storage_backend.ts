import type { AdoptionCandidate, FileSystemStorageOptions, KeyValueStoreBackend } from '@crawlee/fs-storage';
import { FileSystemStorageBackend } from '@crawlee/fs-storage';

import { KEY_VALUE_STORE_KEYS } from '@apify/consts';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const BINARY_CONTENT_TYPE = 'application/octet-stream';

export interface ApifyFileSystemStorageOptions extends FileSystemStorageOptions {
    /**
     * The key the Actor input is read from — `Configuration.inputKey` (`ACTOR_INPUT_KEY`).
     *
     * `INPUT` is treated as an input key regardless of this setting, so a project's `INPUT.json` stays
     * intact when the Apify CLI redirects the run to a temporary key.
     *
     * @default 'INPUT'
     */
    inputKey?: string;
}

/**
 * Crawlee's file-system storage backend, aware of the Actor input.
 *
 * Locally the input arrives in the default key-value store as a bare `INPUT` or `INPUT.json` file with
 * no metadata sidecar — written by the Apify CLI, a project template, or by hand. This backend adopts
 * such a file as the record under the input key when the store is opened (both files present fails the
 * open), and keeps the input keys when the default store is purged on start. Everything else is
 * inherited from {@apilink FileSystemStorageBackend}.
 *
 * `Actor` installs it as the local backend; pass an instance to `Actor.init({ storage })` only if you
 * need to construct it yourself.
 */
export class ApifyFileSystemStorageBackend extends FileSystemStorageBackend {
    /** `INPUT` plus the configured input key, deduplicated. */
    readonly inputKeys: readonly string[];

    constructor(options: ApifyFileSystemStorageOptions) {
        const { inputKey = KEY_VALUE_STORE_KEYS.INPUT, ...fileSystemOptions } = options;
        super(fileSystemOptions);
        this.inputKeys = [...new Set([KEY_VALUE_STORE_KEYS.INPUT, inputKey])];
    }

    /** Claims a bare `<key>` or `<key>.json` in the default store for each input key, ahead of the generic sweep. */
    protected override keyValueStoreAdoptionCandidates(isDefaultStore: boolean): AdoptionCandidate[] {
        const inputCandidates: AdoptionCandidate[] = isDefaultStore
            ? this.inputKeys.map((key) => ({
                  key,
                  files: [
                      { filename: key, contentType: BINARY_CONTENT_TYPE },
                      { filename: `${key}.json`, contentType: JSON_CONTENT_TYPE },
                  ],
              }))
            : [];

        return [...inputCandidates, ...super.keyValueStoreAdoptionCandidates(isDefaultStore)];
    }

    /** Spares the input keys in the default store; every other run-scoped store is emptied. */
    protected override async purgeKeyValueStore(store: KeyValueStoreBackend, isDefaultStore: boolean): Promise<void> {
        await (isDefaultStore ? store.purgeExcept([...this.inputKeys]) : store.purge());
    }
}
