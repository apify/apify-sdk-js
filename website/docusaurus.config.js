/* eslint-disable global-require,import/no-extraneous-dependencies */
const { externalLinkProcessor } = require('./tools/utils/externalLink');
const pkg = require('../packages/apify/package.json');

const [v1, v2] = pkg.version.split('.');
const version = [v1, v2].join('.');

const packages = [
    'apify',
    'scraper-tools',
];
const packagesOrder = [
    'apify',
    '@apify/scraper-tools',
];

/** @type {Partial<import('@docusaurus/types').DocusaurusConfig>} */
module.exports = {
    title: 'Apify SDK monorepo',
    tagline: 'Apify SDK is a toolkit for building actors',
    url: 'https://apify.github.io',
    baseUrl: '/apify-sdk-js/',
    trailingSlash: false,
    organizationName: 'apify',
    projectName: 'apify-sdk-js',
    scripts: ['/apify-sdk-js/js/custom.js'],
    favicon: 'img/favicon.ico',
    customFields: {
        markdownOptions: {
            html: true,
        },
        gaGtag: true,
        repoUrl: 'https://github.com/apify/apify-sdk-js',
    },
    onBrokenLinks:
    /** @type {import('@docusaurus/types').ReportingSeverity} */ ('warn'),
    onBrokenMarkdownLinks:
    /** @type {import('@docusaurus/types').ReportingSeverity} */ ('warn'),
    presets: /** @type {import('@docusaurus/types').PresetConfig[]} */ ([
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    versions: {
                        current: {
                            label: `v${version}`,
                        },
                    },
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    path: '../docs',
                    sidebarPath: './sidebars.js',
                    rehypePlugins: [externalLinkProcessor],
                },
                theme: {
                    customCss: '/src/css/custom.css',
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
            },
        ],
        [
            '@docusaurus/plugin-client-redirects',
            {
                redirects: [
                    {
                        from: '/docs',
                        to: '/docs/guides/apify-platform',
                    },
                    {
                        from: '/docs/next',
                        to: '/docs/next/guides/apify-platform',
                    },
                ],
            },
        ],
        // [
        //     'docusaurus-gtm-plugin',
        //     {
        //         id: 'GTM-TKBX678',
        //     },
        // ],
    ],
    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ ({
        docs: {
            versionPersistence: 'localStorage',
            sidebar: {
                hideable: true,
            },
        },
        navbar: {
            hideOnScroll: true,
            title: 'Apify SDK',
            logo: {
                src: 'img/apify_sdk.svg',
                srcDark: 'img/apify_sdk_white.svg',
            },
            items: [
                {
                    type: 'docsVersion',
                    to: 'docs',
                    label: 'Docs',
                    position: 'left',
                },
                {
                    type: 'docsVersion',
                    to: 'docs/examples',
                    label: 'Examples',
                    position: 'left',
                },
                {
                    type: 'docsVersion',
                    to: 'api/apify',
                    label: 'API',
                    position: 'left',
                    activeBaseRegex: 'api/(?!apify/changelog)',
                },
                {
                    to: 'api/apify/changelog',
                    label: 'Changelog',
                    position: 'left',
                    className: 'changelog',
                },
                {
                    type: 'docsVersionDropdown',
                    position: 'left',
                },
                {
                    href: 'https://github.com/apify/apify-sdk-js',
                    label: 'GitHub',
                    title: 'View on GitHub',
                    position: 'right',
                    className: 'icon',
                },
                {
                    href: 'https://discord.com/invite/jyEM2PRvMU',
                    label: 'Discord',
                    title: 'Chat on Discord',
                    position: 'right',
                    className: 'icon',
                },
            ],
        },
        colorMode: {
            defaultMode: 'light',
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        prism: {
            defaultLanguage: 'typescript',
            theme: require('prism-react-renderer/themes/github'),
            darkTheme: require('prism-react-renderer/themes/dracula'),
            additionalLanguages: ['docker', 'log'],
        },
        metadata: [],
        image: 'img/apify_og_SDK.png',
        footer: {
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Guides',
                            to: 'docs/guides',
                        },
                        {
                            label: 'Examples',
                            to: 'docs/examples',
                        },
                        {
                            label: 'API reference',
                            to: 'api/apify',
                        },
                        {
                            label: 'Upgrading to v3',
                            to: 'docs/upgrading/upgrading-to-v3',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Discord',
                            href: 'https://discord.com/invite/jyEM2PRvMU',
                        },
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/crawlee',
                        },
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/apify',
                        },
                        {
                            label: 'Facebook',
                            href: 'https://www.facebook.com/apifytech',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Apify Platform',
                            href: 'https://apify.com',
                        },
                        {
                            label: 'Docusaurus',
                            href: 'https://docusaurus.io',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/apify/crawlee',
                        },
                    ],
                },
            ],
            logo: {
                src: 'img/apify_logo.svg',
                href: '/',
                width: '60px',
                height: '60px',
            },
        },
        algolia: {
            appId: 'N8EOCSBQGH',
            apiKey: 'b43e67a96ed18c7f63f5fd965906a96d', // search only (public) API key
            indexName: 'apify_sdk',
            algoliaOptions: {
                facetFilters: ['version:VERSION'],
            },
        },
    }),
};
