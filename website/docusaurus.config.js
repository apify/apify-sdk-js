/* eslint-disable global-require,import/no-extraneous-dependencies */
const { createHref } = require('./tools/utils/createHref');
const { externalLinkProcessor } = require('./tools/utils/externalLink');

/** @type {Partial<import('@docusaurus/types').DocusaurusConfig>} */
module.exports = {
    title: 'Apify SDK monorepo',
    tagline: 'The scalable web crawling, scraping and automation library for JavaScript/Node.js',
    url: 'https://apify.github.io',
    baseUrl: '/apify-sdk-js/',
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
                    disableVersioning: true,
                    lastVersion: 'current',
                    versions: {
                        current: {
                            label: '3.0.0',
                        },
                    },
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    path: '../docs',
                    sidebarPath: './sidebars.js',
                    rehypePlugins: [externalLinkProcessor],
                },
                theme: {
                    customCss: '/src/css/customTheme.css',
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
                packages: [
                    {
                        path: 'packages/apify',
                    },
                ],
                typedocOptions: {
                    excludeExternals: false,
                },
            },
        ],
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
                // {
                //     type: 'docsVersion',
                //     to: 'docs/guides',
                //     label: 'Guides',
                //     position: 'left',
                // },
                // {
                //     type: 'docsVersion',
                //     to: 'docs/examples',
                //     label: 'Examples',
                //     position: 'left',
                // },
                {
                    type: 'docsVersion',
                    to: 'api/apify',
                    label: 'API reference',
                    position: 'left',
                    activeBaseRegex: 'api/(?!apify/changelog)',
                },
                // {
                //     to: 'api/apify/changelog',
                //     label: 'Changelog',
                //     position: 'left',
                //     className: 'changelog',
                // },
                {
                    type: 'docsVersionDropdown',
                    position: 'right',
                    dropdownItemsAfter: [
                        {
                            href: 'https://sdk.apify.com/docs/guides/getting-started',
                            label: '2.2',
                        },
                        {
                            href: 'https://sdk.apify.com/docs/1.3.1/guides/getting-started',
                            label: '1.3',
                        },
                    ],
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
                        // {
                        //     label: 'Guides',
                        //     to: 'docs/guides',
                        // },
                        // {
                        //     label: 'Examples',
                        //     to: 'docs/examples',
                        // },
                        {
                            label: 'API reference',
                            to: 'api/apify',
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
                            html: createHref(
                                'https://apify.com',
                                'Apify Platform',
                            ),
                        },
                        {
                            html: createHref(
                                'https://docusaurus.io',
                                'Docusaurus',
                            ),
                        },
                        {
                            html: createHref(
                                'https://github.com/apify/apify-sdk-js',
                                'GitHub',
                            ),
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Apify Technologies s.r.o.`,
            logo: {
                src: 'img/apify_logo.svg',
                href: '/',
                width: '60px',
                height: '60px',
            },
        },
        // algolia: {
        //     // FIXME those are crawlee.dev credentials, we will need new one for this monorepo
        //     appId: 'UXG5NIR52R',
        //     apiKey: '83302bb4196d8377aa5b3526c6d904fb', // search only (public) API key
        //     indexName: 'apify_sdk', // FIXME wrong index name
        //     algoliaOptions: {
        //         facetFilters: ['version:VERSION'],
        //     },
        // },
        gaGtag: {
            // FIXME we might want different tracking id?
            trackingID: 'UA-67003981-4',
        },
    }),
};
