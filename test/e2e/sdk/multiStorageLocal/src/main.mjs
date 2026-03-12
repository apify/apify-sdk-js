import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import log from '@apify/log';

const dir = dirname(fileURLToPath(import.meta.url));
const lifecyclePath = join(dir, 'lifecycle.mjs');

// Run two separate "lifecycle" processes that share the same filesystem.
// The second process should purge the aliased dataset on first open,
// proving that purge-on-first-open works across Actor restarts.
for (const phase of ['first', 'second']) {
    log.info(`--- Running ${phase} lifecycle ---`);
    execFileSync('node', [lifecyclePath], {
        stdio: 'inherit',
        env: process.env,
    });
}

// Both lifecycle processes pushed a summary to the platform default dataset.
// The test script will verify both summaries.
log.info('Both lifecycles completed successfully');
