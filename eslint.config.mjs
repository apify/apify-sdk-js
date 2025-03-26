import tsEslint from 'typescript-eslint';
import apifyTypescriptConfig from '@apify/eslint-config/ts.js';

export default [
    {
        ignores: [
            "node_modules",
            "dist",
            "coverage",
            "**/*.js",
            "**/*.d.ts"
        ]
    },
    ...apifyTypescriptConfig,
    {
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                project: 'tsconfig.eslint.json'
            },
        },
    },
    {
        plugins: {
            "@typescript-eslint": tsEslint.plugin,
        },
        rules: {
            "no-void": 0,
            "no-console": "error",
            "quote-props": ["error", "consistent"],
            "keyword-spacing": ["error", { "before": true }],
            "@typescript-eslint/array-type": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/ban-ts-comment": 0,
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-function": "off",
            "import/no-extraneous-dependencies": "off"
        }
    },
];
