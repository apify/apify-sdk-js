/* eslint-disable global-require,import/no-extraneous-dependencies */
const { externalLinkProcessor } = require('./tools/utils/externalLink');

const packages = [
    'apify',
];
const packagesOrder = [
    'apify',
];

/** @type {Partial<import('@docusaurus/types').DocusaurusConfig>} */
module.exports = {
    title: 'Apify SDK',
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
                    {
                        from: '/docs/guides/getting-started',
                        to: '/docs/guides/apify-platform',
                    },
                    {
                        from: '/docs/next/guides/getting-started',
                        to: '/docs/next/guides/apify-platform',
                    },
                ],
                createRedirects(existingPath) {
                    if (!existingPath.endsWith('/')) {
                        return `${existingPath}/`;
                    }

                    return undefined; // Return a falsy value: no redirect created
                },
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
                    type: 'doc',
                    docId: 'guides/apify-platform',
                    label: 'Docs',
                    position: 'left',
                    activeBaseRegex: 'guides',
                },
                {
                    type: 'doc',
                    docId: 'examples/examples',
                    label: 'Examples',
                    position: 'left',
                    activeBaseRegex: 'examples',
                },
                {
                    type: 'custom-api',
                    to: 'apify',
                    label: 'API',
                    position: 'left',
                    activeBaseRegex: '(api|typedefs)/(?!.*/changelog)',
                },
                {
                    // TODO redirect or hide in older versions? or can we have it somehow there?
                    type: 'custom-api',
                    to: 'apify/changelog',
                    label: 'Changelog',
                    position: 'left',
                    className: 'changelog',
                    activeBaseRegex: 'changelog',
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
                            href: 'https://stackoverflow.com/questions/tagged/apify',
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
                            label: 'Crawlee',
                            href: 'https://crawlee.dev',
                        },
                        {
                            label: 'Docusaurus',
                            href: 'https://docusaurus.io',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/apify/apify-sdk-js',
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
