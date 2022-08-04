import { Configuration, Actor } from '../../packages/apify/dist/index.mjs';
import { URL_NO_COMMAS_REGEX, purgeDefaultStorages } from 'crawlee';
import { join } from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { homedir } from 'os';
import fs from 'fs-extra';

export const colors = {
    red: (text) => `\x1B[31m${text}\x1B[39m`,
    green: (text) => `\x1B[32m${text}\x1B[39m`,
    grey: (text) => `\x1B[90m${text}\x1B[39m`,
    yellow: (text) => `\x1B[33m${text}\x1B[39m`,
};

export function getStorage(url) {
    return join(dirname(fileURLToPath(url)), './apify_storage');
}

export async function getStats(url) {
    const dir = getStorage(url);
    const path = join(dir, 'key_value_stores/default/SDK_CRAWLER_STATISTICS_0.json');

    if (!existsSync(path)) {
        return false;
    }

    return fs.readJSON(path);
}

export async function getApifyToken() {
    const authPath = join(homedir(), '.apify', 'auth.json');

    if (!existsSync(authPath)) {
        throw new Error('You need to be logged in with your Apify account to run E2E tests. Call "apify login" to fix that.')
    }

    const { token } = await fs.readJSON(authPath);
    return token;
}

export async function getDatasetItems(url) {
    const dir = getStorage(url);
    const datasetPath = join(dir, 'datasets/default/');

    const dirents = await readdir(datasetPath, { withFileTypes: true });
    const fileNames = dirents.filter(dirent => dirent.isFile());
    const datasetItems = [];

    for (const fileName of fileNames) {
        const filePath = join(datasetPath, fileName.name);
        const datasetItem = await fs.readJSON(filePath);

        if (!isItemHidden(datasetItem)) {
            datasetItems.push(datasetItem);
        }
    }

    return datasetItems;
}

export async function run(url, scraper, input) {
    process.env.APIFY_LOCAL_STORAGE_DIR = getStorage(url);

    await purgeDefaultStorages();
    const inputKey = Configuration.getGlobalConfig().get('inputKey');
    await Actor.setValue(inputKey, input);

    const exit = process.exit;
    process.exit = () => {};

    await import(`../../packages/actor-scraper/${scraper}/dist/main.js`);
    await waitForFinish(url);
    process.exit = exit;
}

async function isFinished(dir) {
    const stats = await getStats(dir);
    return !!stats.crawlerFinishedAt;
}

export async function waitForFinish(dir) {
    while (!await isFinished(dir)) {
        await setTimeout(1000);
    }
}

export function expect(bool, message) {
    if (bool) {
        console.log(`[assertion] passed: ${message}`);
    } else {
        console.log(`[assertion] failed: ${message}`);
        process.exit(1);
    }
}

export function validateDataset(items, schema = []) {
    for (const item of items) {
        if (!item.hasOwnProperty('url') || !item.url.match(URL_NO_COMMAS_REGEX)) {
            return false;
        }

        const modifiedDateIndex = schema.indexOf('modifiedDate');
        if (modifiedDateIndex !== -1) {
            if (!item.hasOwnProperty('modifiedDate') || Number.isNaN(Date.parse(item.modifiedDate))) {
                return false;
            }
            schema.splice(modifiedDateIndex, 1);
        }

        const runCountIndex = schema.indexOf('runCount');
        if (runCountIndex !== -1) {
            if (!item.hasOwnProperty('runCount') || !Number.isInteger(item.runCount)) {
                return false;
            }
            schema.splice(runCountIndex, 1);
        }

        for (const propName of schema) {
            if (!item.hasOwnProperty(propName) || typeof item[propName] !== 'string') {
                return false;
            }
        }
    }
    return true;
}

function isItemHidden(item) {
    for (const key of Object.keys(item)) {
        if (!key.startsWith('#')) {
            return false;
        }
    }
    return true;
}
