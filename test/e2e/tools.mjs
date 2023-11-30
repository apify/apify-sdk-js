import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { purgeDefaultStorages } from '@crawlee/core';
import { Configuration, KeyValueStore } from 'apify';
import { URL_NO_COMMAS_REGEX, sleep } from 'crawlee';
import fs from 'fs-extra';

export const SKIPPED_TEST_CLOSE_CODE = 404;

/** @type {Record<string, (text: string) => string>} */
export const colors = {
    red: (text) => `\x1B[31m${text}\x1B[39m`,
    green: (text) => `\x1B[32m${text}\x1B[39m`,
    grey: (text) => `\x1B[90m${text}\x1B[39m`,
    yellow: (text) => `\x1B[33m${text}\x1B[39m`,
};

/**
 * @param {string} dirName
 */
export function getStorage(dirName) {
    return join(dirName, 'storage');
}

/**
 * @param {string} dirName
 */
export async function getStats(dirName, retries = 3) {
    const dir = getStorage(dirName);
    const path = join(dir, 'key_value_stores/default/SDK_CRAWLER_STATISTICS_0.json');

    if (!existsSync(path)) {
        if (!retries) {
            return false;
        }

        await sleep(500);
        return getStats(dirName, retries - 1);
    }

    return fs.readJSON(path);
}

/**
 * @param {string | URL} url
 */
export function getTestDir(url) {
    const filename = fileURLToPath(url);
    return dirname(filename);
}

export async function run(url, scraper, input) {
    await initialize(url);

    await purgeDefaultStorages({
        onlyPurgeOnce: true,
    });
    const inputKey = Configuration.getGlobalConfig().get('inputKey');
    await KeyValueStore.setValue(inputKey, input);

    await import(`../../packages/actor-scraper/${scraper}/dist/main.js`);
    // Some runs don't save the final stats, and stats.crawlerFinishedAt
    // is always null, therefore waitForFinish never resolves.
    // However, logs do say that actor finished with exit code 0,
    // i.e. dataset items are there, etc. Honestly, no idea why -
    // hanging test is always random. So adding Promise.race()
    // to make sure all tests will run and finish.
    await Promise.race([
        waitForFinish(url),
        setTimeout(120e3),
    ]);
}

export async function waitForFinish(dir) {
    while (!await isFinished(dir)) {
        await setTimeout(1e3);
    }
}

async function isFinished(dir) {
    const stats = await getStats(dir);
    return !!stats.crawlerFinishedAt;
}

/**
 * @param {string} dirName
 */
export async function clearStorage(dirName) {
    const destPackagesDir = join(dirName, 'storage');
    await fs.remove(destPackagesDir);
}

export async function getApifyToken() {
    const authPath = join(homedir(), '.apify', 'auth.json');

    if (!existsSync(authPath)) {
        throw new Error('You need to be logged in with your Apify account to run E2E tests. Call "apify login" to fix that.');
    }

    const { token } = await fs.readJSON(authPath);
    return token;
}

/**
 * @param {string} dirName
 */
export async function getDatasetItems(dirName) {
    const dir = getStorage(dirName);
    const datasetPath = join(dir, 'datasets/default/');

    if (!existsSync(datasetPath)) {
        return [];
    }

    const dirents = await readdir(datasetPath, { withFileTypes: true });
    const fileNames = dirents.filter((dirent) => dirent.isFile());
    const datasetItems = [];

    for (const fileName of fileNames) {
        if (fileName.name.includes('__metadata__')) continue;

        const filePath = join(datasetPath, fileName.name);
        const datasetItem = await fs.readJSON(filePath);

        if (!isItemHidden(datasetItem)) {
            datasetItems.push(datasetItem);
        }
    }

    return datasetItems;
}

/**
 * @param {string} dirName
 */
export async function initialize(dirName) {
    process.env.CRAWLEE_STORAGE_DIR = getStorage(dirName);
    process.env.APIFY_TOKEN ??= await getApifyToken();
    process.env.ACTOR_WEB_SERVER_URL ??= 'http://127.0.0.1';
    process.env.ACTOR_WEB_SERVER_PORT ??= '8000';
}

/**
 * @param {boolean} bool
 * @param {string} message
 */
export async function expect(bool, message) {
    if (bool) {
        console.log(`[assertion] passed: ${message}`);
        await setTimeout(10);
    } else {
        console.log(`[assertion] failed: ${message}`);
        await setTimeout(10);
        process.exit(1);
    }
}

/**
 * @param {string} reason
 */
export async function skipTest(reason) {
    console.error(`[test skipped] ${reason}`);
    process.exit(SKIPPED_TEST_CLOSE_CODE);
}

/**
 * @param {Record<string, any>} item
 * @param {string} propName
 * @returns {boolean}
 */
function checkDatasetItem(item, propName) {
    if (!item.hasOwnProperty(propName)) {
        return false;
    }

    switch (propName) {
        case 'url':
            return item.url.match(URL_NO_COMMAS_REGEX);
        case 'modifiedDate':
            return !Number.isNaN(Date.parse(item.modifiedDate));
        case 'runCount':
            return Number.isInteger(item.runCount);
        default:
            return ['string', 'number', 'boolean'].includes(typeof item[propName]);
    }
}

/**
 * @param {any[]} items
 * @param {string[]} schema
 */
export function validateDataset(items, schema = []) {
    for (const item of items) {
        for (const propName of schema) {
            if (!checkDatasetItem(item, propName)) {
                return false;
            }
        }
    }

    return true;
}

/**
 * @param {Record<PropertyKey, unknown>} item
 */
function isItemHidden(item) {
    for (const key of Object.keys(item)) {
        if (!key.startsWith('#')) {
            return false;
        }
    }
    return true;
}
