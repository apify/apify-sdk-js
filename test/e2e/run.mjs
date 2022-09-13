import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { isMainThread, Worker, workerData } from 'node:worker_threads';
import { colors, clearStorage, SKIPPED_TEST_CLOSE_CODE } from './tools.mjs';

const basePath = dirname(fileURLToPath(import.meta.url));

// If any of the tests failed - we want to exit with a non-zero code
// so that the CI knows that e2e test suite has failed
let failure = false;

async function run() {
    console.log(`Running E2E scraper tests`);

    const paths = await readdir(basePath, { withFileTypes: true });
    const dirs = paths.filter((dirent) => dirent.isDirectory());

    for (const dir of dirs) {
        if (process.argv.length === 3 && dir.name !== process.argv[2]) {
            continue;
        }

        const now = Date.now();
        const worker = new Worker(fileURLToPath(import.meta.url), {
            workerData: dir.name,
            stdout: true,
            stderr: true,
        });
        /** @type Map<string, string[]> */
        const allLogs = new Map();
        worker.stderr.on('data', (data) => {
            const str = data.toString();
            const taskLogs = allLogs.get(dir.name) ?? [];
            allLogs.set(dir.name, taskLogs);
            taskLogs.push(str);
        });
        worker.stdout.on('data', (data) => {
            const str = data.toString();
            const taskLogs = allLogs.get(dir.name) ?? [];
            allLogs.set(dir.name, taskLogs);
            taskLogs.push(str);

            if (str.startsWith('[test skipped]')) {
                return;
            }

            const match = str.match(/\[assertion] (passed|failed): (.*)/);

            if (match) {
                const c = match[1] === 'passed' ? colors.green : colors.red;
                console.log(`${colors.yellow(`[${dir.name}] `)}${match[2]}: ${c(match[1])}`);
            }
        });
        worker.on('exit', async (code) => {
            if (code === SKIPPED_TEST_CLOSE_CODE) {
                console.log(`Test ${colors.yellow(`[${dir.name}]`)} was skipped`);
                return;
            }

            const took = (Date.now() - now) / 1000;
            const status = code === 0 ? 'success' : 'failure';
            const color = code === 0 ? 'green' : 'red';
            console.log(`${colors.yellow(`[${dir.name}] `)}${colors[color](`Test finished with status: ${status} `)}${colors.grey(`[took ${took}s]`)}`);

            await clearStorage(`${basePath}/${dir.name}`);
            const taskLogs = allLogs.get(dir.name);

            if (code !== 0 && taskLogs?.length > 0) {
                // Each log line already end with '\n',
                // So we join them with an empty string.
                console.log(taskLogs.join(''));
            }

            if (status === 'failure') failure = true;
        });
        await once(worker, 'exit');
    }
}

if (isMainThread) {
    await run();
    // We want to exit with non-zero code if any of the tests failed
    if (failure) process.exit(1);
} else {
    await import(`${basePath}/${workerData}/test.mjs`);
}
