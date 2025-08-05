const { config } = require('@apify/docs-theme');
const { externalLinkProcessor } = require('./tools/utils/externalLink');
const versions = require('./versions.json');

const { absoluteUrl } = config;

const packages = ['apify'];
const packagesOrder = ['apify'];

/** @type {Partial<import('@docusaurus/types').DocusaurusConfig>} */
module.exports = {
    future: {
        experimental_faster: {
            swcJsLoader: true,
            swcJsMinimizer: true,
            swcHtmlMinimizer: true,
            lightningCssMinimizer: true,
            rspackBundler: true,
            mdxCrossCompilerCache: true,
            rspackPersistentCache: true,
        },
        v4: {
            removeLegacyPostBuildHeadAttribute: true,
            useCssCascadeLayers: false,
        },
    },
    title: 'SDK for JavaScript | Apify Documentation',
    url: absoluteUrl,
    baseUrl: '/sdk/js',
    trailingSlash: false,
    organizationName: 'apify',
    projectName: 'apify-sdk-js',
    favicon: 'img/favicon.svg',
    scripts: [...(config.scripts ?? [])],
    onBrokenLinks:
        /** @type {import('@docusaurus/types').ReportingSeverity} */ ('throw'),
    onBrokenMarkdownLinks:
        /** @type {import('@docusaurus/types').ReportingSeverity} */ ('throw'),
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
                            type: 'docsVersionDropdown',
                            position: 'left',
                            className: 'navbar__item', // fixes margin around dropdown - hackish, should be fixed in theme
                            'data-api-links': JSON.stringify([
                                'reference/next',
                                ...versions.map((version, i) => {
                                    if (i === 0) {
                                        return 'reference';
                                    }

                                    if (+version < 3) {
                                        return `docs/${version}/api/apify`;
                                    }

                                    return `reference/${version}`;
                                }),
                            ]),
                            dropdownItemsBefore: [],
                            dropdownItemsAfter: [],
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
                    // Docusaurus shows the author and date of last commit to entire repo, which doesn't make sense,
                    // so let's just disable showing author and last modification
                    showLastUpdateAuthor: false,
                    showLastUpdateTime: false,
                    path: '../docs',
                    sidebarPath: './sidebars.js',
                    rehypePlugins: [externalLinkProcessor],
                    editUrl:
                        'https://github.com/apify/apify-sdk-js/edit/master/website/',
                },
            }),
        ],
    ]),
    plugins: [
        [
            '@apify/docusaurus-plugin-typedoc-api',
            {
                projectRoot: `${__dirname}/..`,
                changelogs: true,
                readmes: true,
                sortPackages: (a, b) => {
                    return (
                        packagesOrder.indexOf(a.packageName) -
                        packagesOrder.indexOf(b.packageName)
                    );
                },
                packages: packages.map((name) => ({
                    path: `packages/${name}`,
                })),
                typedocOptions: {
                    excludeExternals: false,
                },
                routeBasePath: 'reference',
            },
        ],
        [
            '@signalwire/docusaurus-plugin-llms-txt',
            {
                content: {
                    includeVersionedDocs: false,
                    enableLlmsFullTxt: true,
                    includeBlog: true,
                    includeGeneratedIndex: false,
                    includePages: true,
                    relativePaths: false,
                    excludeRoutes: [
                        '/sdk/js/reference/3.*/**',
                        '/sdk/js/reference/3.*',
                        '/sdk/js/reference/next/**',
                        '/sdk/js/reference/next',
                    ],
                },
            },
        ],
        ...config.plugins,
    ],
    themeConfig: { ...config.themeConfig, versions },
    staticDirectories: ['node_modules/@apify/docs-theme/static', 'static'],
    customFields: {
        ...(config.customFields ?? []),
    },
};
