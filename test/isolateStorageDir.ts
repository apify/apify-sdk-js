import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll } from 'vitest';

// Vitest runs test files in parallel worker processes, but every Configuration
// defaults to the same cwd-relative `./storage` dir — one file's purge-on-init
// races against another file's reads/writes (ENOENT from the fs backend), so
// this setup file (wired in vitest.config.mts) points each file at its own dir.
const storageDir = await mkdtemp(join(tmpdir(), 'apify-sdk-test-storage-'));
process.env.CRAWLEE_STORAGE_DIR = storageDir;

afterAll(async () => {
    await rm(storageDir, { recursive: true, force: true });
});
