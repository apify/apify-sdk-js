/* eslint-disable import/no-default-export, import/extensions */
import { resolve } from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    esbuild: {
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
        // Give each test file its own storage dir - parallel workers must not
        // share (and purge) the same on-disk `./storage`.
        setupFiles: ['./test/isolateStorageDir.ts'],
        testTimeout: 60_000,
        hookTimeout: 60_000,
        alias: [
            {
                find: 'apify',
                replacement: resolve(__dirname, './src'),
            },
        ],
    },
});
