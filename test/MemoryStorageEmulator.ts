import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { serviceLocator } from '@crawlee/core';
import { MemoryStorage } from '@crawlee/memory-storage';
import { ensureDir } from 'fs-extra';

import log from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';

import { resetGlobalState } from './resetGlobalState.js';

const LOCAL_EMULATION_DIR = resolve(
    __dirname,
    '..',
    'tmp',
    'memory-emulation-dir',
);

export class MemoryStorageEmulator {
    protected localStorageDirectories: string[] = [];

    async init(dirName = cryptoRandomObjectId(10)) {
        // crawlee v4 dropped `StorageManager.clearCache()` and
        // `Configuration.useStorageClient()`; reset the global state and
        // re-register the in-memory client instead.
        resetGlobalState();
        const localStorageDir = resolve(LOCAL_EMULATION_DIR, dirName);
        this.localStorageDirectories.push(localStorageDir);
        await ensureDir(localStorageDir);

        const storage = new MemoryStorage({
            localDataDirectory: localStorageDir,
        });
        serviceLocator.setStorageClient(storage);
        log.debug(
            `Initialized emulated memory storage in folder ${localStorageDir}`,
        );
    }

    async destroy() {
        const promises = this.localStorageDirectories.map(async (dir) => {
            return rm(dir, { force: true, recursive: true });
        });

        await Promise.all(promises);
        resetGlobalState();
    }

    static toString() {
        return '@crawlee/memory-storage';
    }
}
