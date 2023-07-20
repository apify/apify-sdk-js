# Apify SDK

[![npm version](https://badge.fury.io/js/apify.svg)](https://www.npmjs.com/package/apify)
[![Downloads](https://img.shields.io/npm/dm/apify.svg)](https://www.npmjs.com/package/apify)
[![Chat on discord](https://img.shields.io/discord/801163717915574323?label=discord)](https://discord.gg/jyEM2PRvMU)
[![Build Status](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml/badge.svg?branch=master)](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml)

Apify SDK provides the tools required to run your own Apify actors. The crawlers and scraping related tools, previously included in Apify SDK (v2), have been split into a brand-new module - [`crawlee`](https://npmjs.org/crawlee), while keeping the Apify specific parts in this module.

> Would you like to work with us on Crawlee, Apify SDK or similar projects? We are hiring [Node.js engineers](https://apify.com/jobs#senior-node.js-engineer).

## Upgrading from v2

A lot of things have changed since version 2 of the Apify SDK, including the split of the crawlers to the new [`crawlee`](https://npmjs.org/crawlee) module. We've written a guide to help you easily migrate from v2 to v3. Visit the [Upgrading Guide](https://sdk.apify.com/docs/upgrading/upgrading-to-v3) to find out what changes you need to make (especially the section related to this very [Apify SDK](https://sdk.apify.com/docs/upgrading/upgrading-to-v3#apify-sdk)), and, if you encounter any issues, join our [Discord server](https://discord.gg/jyEM2PRvMU) for help!

## Quick Start

This short tutorial will set you up to start using Apify SDK in a minute or two.
If you want to learn more, proceed to the [Apify Platform](https://sdk.apify.com/docs/guides/apify-platform)
guide that will take you step by step through running your actor on Apify's platform.

Apify SDK requires [Node.js](https://nodejs.org/en/) 16 or later. Add Apify SDK to any Node.js project by running:

```bash
npm install apify crawlee playwright
```

> For this example, we'll also install the [`crawlee`](https://npmjs.org/crawlee) module, as it now provides the crawlers that were previously exported by Apify SDK. If you don't plan to use crawlers in your actors, then you don't need to install it. Keep in mind that neither `playwright` nor `puppeteer` are bundled with `crawlee` in order to reduce install size and allow greater flexibility. That's why we manually install it with NPM. You can choose one, both, or neither.

There are two ways to initialize your actor: by using the `Actor.main()` function you're probably used to, or by calling `Actor.init()` and `Actor.exit()` manually. We prefer explicitly calling `init` and `exit`.

### Using `Actor.init()` and `Actor.exit()`

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init()

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks }) {
        // Extract HTML title of the page.
        const title = await page.title();
        console.log(`Title of ${request.url}: ${title}`);

        // Add URLs that point to the same hostname.
        await enqueueLinks();
    },
});

await crawler.run(['https://crawlee.dev/']);

await Actor.exit();
```

### Using `Actor.main()`

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.main(async () => {
    const crawler = new PlaywrightCrawler({
        async requestHandler({ request, page, enqueueLinks }) {
            // Extract HTML title of the page.
            const title = await page.title();
            console.log(`Title of ${request.url}: ${title}`);

            // Add URLs that point to the same hostname.
            await enqueueLinks();
        },
    });

    await crawler.run(['https://crawlee.dev/']);
});
```

## Support

If you find any bug or issue with the Apify SDK, please [submit an issue on GitHub](https://github.com/apify/apify-sdk-js/issues).
For questions, you can ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/apify) or contact support@apify.com

## Contributing

Your code contributions are welcome, and you'll be praised to eternity!
If you have any ideas for improvements, either submit an issue or create a pull request.
For contribution guidelines and the code of conduct,
see [CONTRIBUTING.md](https://github.com/apify/apify-sdk-js/blob/master/CONTRIBUTING.md).

## License

This project is licensed under the Apache License 2.0 -
see the [LICENSE.md](https://github.com/apify/apify-sdk-js/blob/master/LICENSE.md) file for details.

## Acknowledgments

Many thanks to [Chema Balsas](https://www.npmjs.com/~jbalsas) for giving up the `apify` package name
on NPM and renaming his project to [jsdocify](https://www.npmjs.com/package/jsdocify).
