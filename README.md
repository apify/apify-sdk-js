# Apify SDK

[![npm version](https://badge.fury.io/js/apify.svg)](https://www.npmjs.com/package/apify)
[![Downloads](https://img.shields.io/npm/dm/apify.svg)](https://www.npmjs.com/package/apify)
[![Chat on discord](https://img.shields.io/discord/801163717915574323?label=discord)](https://discord.gg/jyEM2PRvMU)
[![Build Status](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml/badge.svg?branch=master)](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml)

## Upgrading from v2

Visit the [Upgrading Guide](https://docs.apify.com/sdk/js/docs/upgrading/upgrading-to-v3) to find out what changes you need to make (especially the section related to this very [Apify SDK](https://docs.apify.com/sdk/js/docs/upgrading/upgrading-to-v3#apify-sdk)), and, if you encounter any issues, join our [Discord server](https://discord.gg/jyEM2PRvMU) for help!

## Quick Start

This short tutorial will set you up to start using Apify SDK in a minute or two.
If you want to learn more, proceed to the [Apify Platform](https://docs.apify.com/sdk/js/docs/guides/apify-platform)
guide that will take you step by step through running your Actor on Apify's platform.

Apify SDK requires [Node.js](https://nodejs.org/en/) 16 or later. Add Apify SDK to any Node.js project by running:

To initialize your Actor and to stop it use the `Actor.init()` and `Actor.exit()` functions. You also may use `Actor.main()` function for cases with multiple crawlers in one context.

### Using `Actor.init()` and `Actor.exit()`

```typescript
import { Actor } from 'apify';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
await Actor.setValue('OUTPUT', {
    message: 'Hello from Apify SDK!',
    input,
});

await Actor.exit();
```

### Using `Actor.main()`

```typescript
import { Actor } from 'apify';

await Actor.main(async () => {
    const output = {
        message: 'Hello from Apify SDK!',
        input,
    };

    await Actor.setValue('OUTPUT', output);
});
```

> You can also install the [`crawlee`](https://npmjs.org/crawlee) module, as it now provides the crawlers that were previously exported by Apify SDK. If you don't plan to use crawlers in your Actors, then you don't need to install it. Keep in mind that neither `playwright` nor `puppeteer` are bundled with `crawlee` in order to reduce install size and allow greater flexibility. That's why we manually install it with NPM. You can choose one, both, or neither. For more information and example please check [`documentation.`](https://docs.apify.com/sdk/js/docs/guides/apify-platform#running-crawlee-code-as-an-actor)

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
