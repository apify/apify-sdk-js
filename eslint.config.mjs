import tsEslint from 'typescript-eslint';
import apifyTypescriptConfig from '@apify/eslint-config/ts.js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
    {
        ignores: [
            '**/node_modules',
            '**/dist',
            'coverage',
            '**/*.js',
            '**/*.d.ts',
            'eslint.config.mjs',
            '**/docusaurus.config.mjs',
            'scripts/**/*',
            'vitest.config.ts',
        ],
    },
    ...apifyTypescriptConfig,
    {
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                project: 'tsconfig.eslint.json',
            },
        },
        ignores: ['website/**/*', 'docs/**/*'],
    },
    {
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
        },
        rules: {
            'no-void': 0,
            'no-console': 'error',
            'quote-props': ['error', 'consistent'],
            'keyword-spacing': ['error', { before: true }],
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/no-floating-promises': [
                'error',
                {
                    allowForKnownSafeCalls: [
                        {
                            from: 'package',
                            name: ['test'],
                            package: 'node:test',
                        },
                    ],
                },
            ],
            '@typescript-eslint/ban-ts-comment': 0,
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            'import/no-extraneous-dependencies': 'off',
            // Used extensively in generic scrapers
            'no-param-reassign': 'off',
        },
    },
    {
        files: ['website/**/*', 'docs/**/*'],
        rules: {
            // Allow console logs in docs examples
            'no-console': 'off',
        },
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                project: 'tsconfig.eslint.website.json',
            },
        },
    },
    eslintConfigPrettier,
];
