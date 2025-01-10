import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, workerData } from 'node:worker_threads';

import { ActorSourceType } from '@apify/consts';
import { cryptoRandomObjectId } from '@apify/utilities';
import { ApifyClient } from 'apify-client';

const basePath = join(dirname(fileURLToPath(import.meta.url)), 'sdk');
const actorBasePath = join(basePath, 'actorBase');

async function run() {
    console.log(`Running E2E SDK tests`);

    const paths = await readdir(basePath, { withFileTypes: true });
    const dirs = paths.filter((dirent) => dirent.isDirectory() && dirent.name !== actorBasePath.name);

    for (const dir of dirs) {
        await runWorker(dir.name);
    }
}

async function runWorker(dirName) {
    const worker = new Worker(fileURLToPath(import.meta.url), {
        workerData: dirName,
        stdout: true,
        stderr: true,
    });

    await once(worker, 'exit');
}

async function runTest(dirName) {
    const testDir = join(basePath, dirName);

    const sourceFiles = {};
    const textSuffixes = ['.mjs', '.json', 'Dockerfile'];

    for (const dirent of await readdir(actorBasePath, { recursive: true, withFileTypes: true })) {
        if (!dirent.isFile()) {
            continue;
        }

        const name = relative(actorBasePath, join(dirent.parentPath, dirent.name));
        const format = textSuffixes.some((suffix) => name.endsWith(suffix)) ? 'text' : 'base64';

        sourceFiles[name] = {
            name,
            format,
            content: await readFile(
                join(dirent.parentPath, dirent.name), 
                { encoding: format === 'base64' ? 'base64' : 'utf8' }
            ),
        };
    }

    // TODO obtain and include the built package

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    const actorName = `apify-sdk-js-test-harness-${dirName}-${cryptoRandomObjectId()}`;

    const actor = await client.actors().create({
        name: actorName,
        defaultRunBuild: 'latest',
        defaultRunMemoryMbytes: 256,
        defaultRunTimeoutSecs: 600,
        versions: [
            {
                versionNumber: '0.0',
                buildTag: 'latest',
                sourceType: ActorSourceType.SOURCE_FILES,
                sourceFiles,
            },
        ],
    });

    const actorClient = client.actor(actor.id);
    await actorClient.build({ versionNumber: '0.0' });

    execFile(process.argv[0], [join(testDir, 'test.mjs'), actorName]);

    await actorClient.delete();
}

if (isMainThread) {
    if (process.argv.length === 3) {
        await runWorker(process.argv[2]);
    } else {
        await run();
    }
} else {
    await runTest(workerData);
}
