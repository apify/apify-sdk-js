/* eslint-disable import/no-default-export, import/extensions */
import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    oxc: {
        target: 'es2022',
        keepNames: true,
    },
    test: {
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'cobertura'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/test/**'],
        },
        clearMocks: true,
        restoreMocks: true,
        alias: [
            {
                find: 'apify',
                replacement: resolve(__dirname, './src'),
            },
        ],
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['test/apify/**/*.test.ts'],
                    // Give each test file its own storage dir - parallel workers must not
                    // share (and purge) the same on-disk `./storage`.
                    setupFiles: ['./test/isolateStorageDir.ts'],
                    testTimeout: 60_000,
                    hookTimeout: 60_000,
                },
            },
            {
                extends: true,
                test: {
                    name: 'e2e',
                    include: ['test/e2e/**/*.test.ts'],
                    globalSetup: ['./test/e2e/global-setup.ts'],
                    // Platform builds plus runs; a file shares one Actor across its tests.
                    testTimeout: 15 * 60_000,
                    hookTimeout: 30 * 60_000,
                },
            },
        ],
    },
});
