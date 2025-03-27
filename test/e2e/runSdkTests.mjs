import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainThread, Worker, workerData } from 'node:worker_threads';

import { ApifyClient } from 'apify-client';

import { ACTOR_SOURCE_TYPES } from '@apify/consts';
import { log } from '@apify/log';
import { cryptoRandomObjectId } from '@apify/utilities';

const rootPath = dirname(fileURLToPath(import.meta.url));
const basePath = join(rootPath, 'sdk');
const actorBasePath = join(basePath, 'actorBase');

async function run() {
    log.info(`Running E2E SDK tests`);

    const paths = await readdir(basePath, { withFileTypes: true });
    const dirs = paths.filter((dirent) => dirent.isDirectory() && dirent.name !== basename(actorBasePath));

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

    worker.on('exit', (exitCode) => {
        if (exitCode !== 0) {
            log.error(`Test ${dirName} failed`);

            const out = worker.stdout.read();
            if (out) {
                log.info('Captured stdout:');
                process.stdout.write(out);
            }

            const err = worker.stderr.read();
            if (err) {
                log.info('Captured stderr:');
                process.stderr.write(err);
            }
        } else {
            log.info(`${dirName} OK`);
        }
    });

    await once(worker, 'exit');
}

async function packDir(dirName) {
    const sourceFiles = {};
    const textSuffixes = ['.mjs', '.json', 'Dockerfile'];

    for (const dirent of await readdir(dirName, { recursive: true, withFileTypes: true })) {
        if (!dirent.isFile()) {
            continue;
        }

        const name = relative(dirName, join(dirent.parentPath, dirent.name));
        const format = textSuffixes.some((suffix) => name.endsWith(suffix)) ? 'TEXT' : 'BASE64';

        sourceFiles[name] = {
            name,
            format,
            content: await readFile(
                join(dirent.parentPath, dirent.name),
                { encoding: format === 'base64' ? 'base64' : 'utf8' },
            ),
        };
    }

    return sourceFiles;
}

async function runTest(dirName) {
    const testDir = join(basePath, dirName);

    const sourceFiles = {
        ...(await packDir(actorBasePath)),
        ...(await packDir(testDir)),
    };

    sourceFiles['apify.tgz'] = {
        name: 'apify.tgz',
        format: 'BASE64',
        content: await readFile(join(rootPath, 'apify.tgz'), { encoding: 'base64' }),
    };

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    const actorName = `apify-sdk-js-test-harness-${dirName}-${cryptoRandomObjectId()}`;

    const actor = await client.actors().create({
        name: actorName,
        defaultRunOptions: {
            build: 'latest',
            memoryMbytes: 256,
            timeoutSecs: 600,
        },
        versions: [
            {
                versionNumber: '0.0',
                buildTag: 'latest',
                sourceType: ACTOR_SOURCE_TYPES.SOURCE_FILES,
                sourceFiles: Array.from(Object.values(sourceFiles)),
            },
        ],
    });

    const actorClient = client.actor(actor.id);
    const build = await actorClient.build('0.0');
    const buildResult = await client.build(build.id).waitForFinish({ waitSecs: 30 * 60 });

    if (buildResult.status !== 'SUCCEEDED') {
        throw new Error('Build failed');
    }

    const testProcessFinished = Promise.withResolvers();
    const testProcess = spawn(
        process.argv[0],
        [join(testDir, 'test.mjs'), actor.id],
        {
            stdio: 'pipe',
            shell: false,
        },
    );

    testProcess.stdout.on('data', (chunk) => process.stdout.write(chunk));
    testProcess.stderr.on('data', (chunk) => process.stderr.write(chunk));

    testProcess.on('exit', testProcessFinished.resolve);

    await testProcessFinished.promise;

    // Remove any monetization so that the Actor can be deleted
    const { pricingInfos = [] } = await actorClient.get();

    if (pricingInfos.length > 0) {
        await actorClient.update(
            {
                pricingInfos: [
                    ...pricingInfos,
                    {
                        pricingModel: 'FREE',
                    },
                ],
            },
        );
    }

    if (testProcess.exitCode === 0) {
        await actorClient.delete();
    }

    process.exit(testProcess.exitCode);
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
