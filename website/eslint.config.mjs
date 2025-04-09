import { getEslintConfig } from '../eslint.config.mjs';

export default [
    ...getEslintConfig('tsconfig.eslint.json'),
    {
        rules: {
            // Allow console statements in documentation files
            'no-console': 'off',
        },
    },
    {
        ignores: ['.docusaurus/docusaurus.config.mjs'],
    },
];
