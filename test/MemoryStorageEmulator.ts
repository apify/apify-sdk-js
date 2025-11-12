import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { StorageManager } from '@crawlee/core';
import { MemoryStorage } from '@crawlee/memory-storage';
import { Configuration } from 'apify';
import { ensureDir } from 'fs-extra';

import log from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';

const LOCAL_EMULATION_DIR = resolve(
    __dirname,
    '..',
    'tmp',
    'memory-emulation-dir',
);

export class MemoryStorageEmulator {
    protected localStorageDirectories: string[] = [];
    protected storage?: MemoryStorage;

    async init(dirName = cryptoRandomObjectId(10)) {
        StorageManager.clearCache();
        const localStorageDir = resolve(LOCAL_EMULATION_DIR, dirName);
        this.localStorageDirectories.push(localStorageDir);
        await ensureDir(localStorageDir);

        this.storage = new MemoryStorage({
            localDataDirectory: localStorageDir,
        });
        Configuration.getGlobalConfig().useStorageClient(this.storage);
        log.debug(
            `Initialized emulated memory storage in folder ${localStorageDir}`,
        );
    }

    reapplyStorageClient() {
        if (!this.storage) {
            throw new Error('Storage not initialized. Call init() first.');
        }
        Configuration.getGlobalConfig().useStorageClient(this.storage);
    }

    async destroy() {
        const promises = this.localStorageDirectories.map(async (dir) => {
            return rm(dir, { force: true, recursive: true });
        });

        await Promise.all(promises);
        StorageManager.clearCache();
    }

    static toString() {
        return '@crawlee/memory-storage';
    }
}
