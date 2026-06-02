import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { serviceLocator } from '@crawlee/core';
import { MemoryStorage } from '@crawlee/memory-storage';
import { ensureDir } from 'fs-extra';

import log from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';

import { resetGlobalState } from './resetGlobalState.js';

const LOCAL_EMULATION_DIR = resolve(__dirname, '..', 'tmp', 'memory-emulation-dir');

export class MemoryStorageEmulator {
    protected localStorageDirectories: string[] = [];
    protected storage?: MemoryStorage;

    async init(dirName = cryptoRandomObjectId(10)) {
        const localStorageDir = resolve(LOCAL_EMULATION_DIR, dirName);
        this.localStorageDirectories.push(localStorageDir);
        await ensureDir(localStorageDir);

        this.storage = new MemoryStorage({
            localDataDirectory: localStorageDir,
        });
        // Start each test from a clean slate: drop the cached default `Actor`
        // instance and the SDK's `Configuration.globalConfig` singleton (which
        // snapshots env vars), plus reset crawlee's serviceLocator. Don't
        // register the storage client yet — `Actor.init()` registers its own
        // (an `ApifyStorageClient` on the platform), and crawlee v4's
        // serviceLocator throws when a client is replaced. Tests call
        // `reapplyStorageClient()` after `Actor.init()` when they need the
        // in-memory storage back.
        resetGlobalState();
        log.debug(`Initialized emulated memory storage in folder ${localStorageDir}`);
    }

    reapplyStorageClient() {
        if (!this.storage) {
            throw new Error('Storage not initialized. Call init() first.');
        }
        this.forceStorageClient(this.storage);
    }

    /**
     * crawlee v4's serviceLocator throws when a storage client is replaced (e.g.
     * after `Actor.init()` swapped in an `ApifyStorageClient`). The only way to
     * clear the registered client is a full `reset()`, so we reset and re-apply
     * the in-memory emulator. The active `Actor` keeps its own config reference,
     * so charging assertions are unaffected.
     */
    private forceStorageClient(storage: MemoryStorage) {
        serviceLocator.reset();
        serviceLocator.setStorageClient(storage);
    }

    async destroy() {
        const promises = this.localStorageDirectories.map(async (dir) => {
            return rm(dir, { force: true, recursive: true });
        });

        await Promise.all(promises);
        serviceLocator.getStorageInstanceManager().clearCache();
    }

    static toString() {
        return '@crawlee/memory-storage';
    }
}
