import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import log from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';
import { StorageManager } from '@crawlee/core';
import { MemoryStorage } from '@crawlee/memory-storage';
import { Configuration } from 'apify';
import { ensureDir } from 'fs-extra';

const LOCAL_EMULATION_DIR = resolve(__dirname, '..', 'tmp', 'memory-emulation-dir');

export class MemoryStorageEmulator {
    protected localStorageDirectories: string[] = [];

    async init(dirName = cryptoRandomObjectId(10)) {
        StorageManager.clearCache();
        const localStorageDir = resolve(LOCAL_EMULATION_DIR, dirName);
        this.localStorageDirectories.push(localStorageDir);
        await ensureDir(localStorageDir);

        const storage = new MemoryStorage({ localDataDirectory: localStorageDir });
        Configuration.getGlobalConfig().useStorageClient(storage);
        log.debug(`Initialized emulated memory storage in folder ${localStorageDir}`);
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
