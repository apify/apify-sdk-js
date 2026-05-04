import { defineConfig } from '@apify/oxlint-config';

export default defineConfig({
    ignorePatterns: ['**/node_modules', '**/dist', 'coverage', 'website', 'docs', 'scripts', '**/*.d.ts'],
    rules: {
        'typescript/no-explicit-any': 'off',
        'typescript/ban-ts-comment': 'off',
        'no-param-reassign': 'off',
        'no-void': 'off',
    },
    overrides: [
        {
            files: ['*.config.ts', '*.config.mts', '*.config.mjs'],
            rules: {
                'no-console': 'off',
                'import/no-default-export': 'off',
            },
        },
        {
            files: ['test/**'],
            rules: {
                'no-console': 'off',
                'no-useless-constructor': 'off',
                'typescript/no-empty-function': 'off',
                'typescript/no-unused-vars': 'off',
                'jest/no-conditional-expect': 'off',
                'vitest/no-conditional-expect': 'off',
                'jest/expect-expect': 'off',
                'vitest/expect-expect': 'off',
                'jest/no-standalone-expect': 'off',
                'vitest/no-standalone-expect': 'off',
                'jest/no-disabled-tests': 'off',
                'vitest/no-disabled-tests': 'off',
                'jest/valid-title': 'off',
                'vitest/valid-title': 'off',
            },
        },
    ],
});
