# Apify SDK monorepo

[![npm version](https://badge.fury.io/js/apify.svg)](https://www.npmjs.com/package/apify)
[![Downloads](https://img.shields.io/npm/dm/apify.svg)](https://www.npmjs.com/package/apify)
[![Chat on discord](https://img.shields.io/discord/801163717915574323?label=discord)](https://discord.gg/jyEM2PRvMU)
[![Build Status](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml/badge.svg?branch=master)](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml)

Apify SDK is the core set of tools and utilities that we've built to help make your interaction with the [Apify Platform](https://apify.com) easier.
This monorepo holds all the components and tools that we've created for it!

This monorepo also used to hold the source code of generic scraper Actors. These have been moved to a separate repository - [apify/actor-scraper](https://github.com/apify/actor-scraper).

> Would you like to work with us on Crawlee, Apify SDK or similar projects? [We are hiring!](https://apify.com/jobs#senior-node.js-engineer)

| package                                                                | version                                                                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`apify`](https://github.com/apify/apify-sdk-js/blob/master/README.md) | [![NPM version](https://img.shields.io/npm/v/apify.svg)](https://www.npmjs.com/package/apify) |

## Apify SDK

Apify SDK provides the tools required to run your own Apify Actors! The crawlers and scraping related tools, previously included in Apify SDK (v2), have been split into
a brand-new module - [`crawlee`](https://npmjs.org/crawlee) (which you can use outside Apify too!), while keeping the Apify specific parts in this module!

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
