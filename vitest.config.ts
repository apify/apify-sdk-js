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
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/test/**',
            ],
        },
        restoreMocks: true,
        testTimeout: 60_000,
        hookTimeout: 60_000,
        alias: [
            { find: 'apify', replacement: resolve(__dirname, './packages/apify/src') },
            { find: '@apify/scraper-tools', replacement: resolve(__dirname, './packages/scraper-tools/src') },
        ],
    },
});
