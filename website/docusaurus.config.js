/* eslint-disable global-require,import/no-extraneous-dependencies */
const { config } = require('@apify/docs-theme');
const { externalLinkProcessor } = require('./tools/utils/externalLink');
const versions = require('./versions.json');

const { absoluteUrl } = config;

const packages = [
    'apify',
];
const packagesOrder = [
    'apify',
];

/** @type {Partial<import('@docusaurus/types').DocusaurusConfig>} */
module.exports = {
    title: 'SDK for JavaScript | Apify Documentation',
    url: absoluteUrl,
    baseUrl: '/sdk/js',
    trailingSlash: false,
    organizationName: 'apify',
    projectName: 'apify-sdk-js',
    favicon: 'img/favicon.ico',
    onBrokenLinks:
    /** @type {import('@docusaurus/types').ReportingSeverity} */ ('warn'),
    onBrokenMarkdownLinks:
    /** @type {import('@docusaurus/types').ReportingSeverity} */ ('warn'),
    themes: [
        [
            '@apify/docs-theme',
            {
                subNavbar: {
                    title: 'SDK for JavaScript',
                    items: [
                        {
                            type: 'doc',
                            docId: 'guides/apify-platform',
                            label: 'Docs',
                            position: 'left',
                            activeBaseRegex: 'guides',
                        },
                        {
                            type: 'doc',
                            docId: '/examples',
                            label: 'Examples',
                            position: 'left',
                            activeBaseRegex: 'examples',
                        },
                        {
                            to: 'reference',
                            label: 'Reference',
                            position: 'left',
                            activeBaseRegex: 'reference',
                        },
                        {
                            to: 'docs/changelog',
                            label: 'Changelog',
                            position: 'left',
                            activeBaseRegex: 'changelog',
                        },
                        {
                            href: 'https://github.com/apify/apify-sdk-js',
                            label: 'GitHub',
                            position: 'left',
                        },
                        {
                            'type': 'docsVersionDropdown',
                            'position': 'left',
                            'className': 'navbar__item', // fixes margin around dropdown - hackish, should be fixed in theme
                            'data-api-links': JSON.stringify([
                                'reference/next',
                                ...versions.map((version, i) => (i === 0 ? 'reference' : `reference/${version}`)),
                            ]),
                            'dropdownItemsBefore': [],
                            'dropdownItemsAfter': [],
                        },
                    ],
                },
            },
        ],
    ],
    presets: /** @type {import('@docusaurus/types').PresetConfig[]} */ ([
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    path: '../docs',
                    sidebarPath: './sidebars.js',
                    rehypePlugins: [externalLinkProcessor],
                },
            }),
        ],
    ]),
    plugins: [
        [
            'docusaurus-plugin-typedoc-api',
            {
                projectRoot: `${__dirname}/..`,
                changelogs: true,
                readmes: true,
                sortPackages: (a, b) => {
                    return packagesOrder.indexOf(a.packageName) - packagesOrder.indexOf(b.packageName);
                },
                packages: packages.map((name) => ({ path: `packages/${name}` })),
                typedocOptions: {
                    excludeExternals: false,
                },
                routeBasePath: 'reference',
            },
        ],
        ...config.plugins,
    ],
    themeConfig: { ...config.themeConfig, versions },
    staticDirectories: ['node_modules/@apify/docs-theme/static', 'static'],
};
