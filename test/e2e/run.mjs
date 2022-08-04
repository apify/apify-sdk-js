import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import { isMainThread, Worker, workerData } from 'worker_threads';
import { colors, getApifyToken } from './tools.mjs';

const basePath = dirname(fileURLToPath(import.meta.url));

process.env.APIFY_LOG_LEVEL = 0; // switch off logs for better test results visibility
process.env.APIFY_HEADLESS = 1; // run browser in headless mode (default on platform)
process.env.APIFY_TOKEN = process.env.APIFY_TOKEN ?? await getApifyToken();
process.env.APIFY_CONTAINER_URL = process.env.APIFY_CONTAINER_URL ?? 'http://127.0.0.1';
process.env.APIFY_CONTAINER_PORT = process.env.APIFY_CONTAINER_PORT ?? '8000';

async function run() {
    const paths = await readdir(basePath, { withFileTypes: true })
    const dirs = paths.filter(dirent => dirent.isDirectory());

    for (const dir of dirs) {
        if (process.argv.length === 3 && dir.name !== process.argv[2]) {
            continue;
        }

        const now = Date.now();
        const worker = new Worker(fileURLToPath(import.meta.url), {
            workerData: dir.name,
            stdout: true,
        });
        worker.stdout.on('data', (data) => {
            const match = data.toString().match(/\[assertion] (passed|failed): (.*)/);

            if (match) {
                const c = match[1] === 'passed' ? colors.green : colors.red;
                console.log(`${colors.yellow(`[${dir.name}]`)} ${match[2]}: ${c(match[1])}`);
            }
        });
        worker.on('exit', (code) => {
            const took = (Date.now() - now) / 1000;
            console.log(`Test ${colors.yellow(`[${dir.name}]`)} finished with status: ${code === 0 ? colors.green('success') : colors.red('failure')} ${colors.grey(`[took ${took}s]`)}`);
        });
    }
}

if (isMainThread) {
    await run();
} else {
    await import(`${basePath}/${workerData}/test.mjs`);
}
