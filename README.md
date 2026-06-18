# Apify SDK

[![npm version](https://badge.fury.io/js/apify.svg)](https://www.npmjs.com/package/apify)
[![Downloads](https://img.shields.io/npm/dm/apify.svg)](https://www.npmjs.com/package/apify)
[![Chat on discord](https://img.shields.io/discord/801163717915574323?label=discord)](https://discord.gg/jyEM2PRvMU)
[![Build Status](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml/badge.svg?branch=master)](https://github.com/apify/apify-sdk-js/actions/workflows/test-and-release.yaml)

`apify` is the official SDK for building [Apify Actors](https://docs.apify.com/platform/actors) in JavaScript and TypeScript. It handles the Actor lifecycle, storage access, platform events, proxy configuration, and more.

## Quick Start

This short tutorial will set you up to start using Apify SDK in a minute or two.
If you want to learn more, proceed to the [Apify Platform](https://docs.apify.com/sdk/js/docs/concepts/actor-lifecycle)
guide that will take you step by step through running your Actor on Apify's platform.

Apify SDK requires [Node.js](https://nodejs.org/en/) 16 or later. Add Apify SDK to any Node.js project by running:

```bash
npm install apify
```

To initialize your Actor and to stop it use the `Actor.init()` and `Actor.exit()` functions. You also may use `Actor.main()` function for cases with multiple crawlers in one context.

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

> You can also install the [`crawlee`](https://npmjs.org/crawlee) module, as it now provides the crawlers that were previously exported by Apify SDK. If you don't plan to use crawlers in your Actors, then you don't need to install it. Keep in mind that neither `playwright` nor `puppeteer` are bundled with `crawlee` in order to reduce install size and allow greater flexibility. That's why we manually install it with NPM. You can choose one, both, or neither. For more information and example please check [`documentation.`](https://docs.apify.com/sdk/js/docs/concepts/actor-lifecycle#running-crawlee-code-as-an-actor)

## What you can build

Almost any Node.js project can become an Actor, including projects for:

- **Web scraping and crawling** - The SDK works seamlessly with [Crawlee](https://crawlee.dev), which makes Apify a natural place to deploy and scale your crawlers. Start from a ready-made [Cheerio](https://apify.com/templates/js-crawlee-cheerio) template.
- **Browser automation** - Drive a real browser with [Playwright](https://playwright.dev), [Puppeteer](https://pptr.dev), or [Selenium](https://apify.com/apify/example-selenium) to automate tasks, fill in forms, or test web apps.
- **AI agents** - Host agents built with your framework of choice. Ready-made Actor templates cover [LangChain](https://apify.com/templates/js-langchain), [LangGraph](https://apify.com/templates/js-langgraph-agent), [BeeAI](https://apify.com/templates/ts-beeai-agent), and [Mastra](https://apify.com/templates/ts-mastraai).
- **MCP servers** - Deploy an MCP server as an Actor and make its tools available to any MCP client. See the [MCP server](https://apify.com/templates/ts-mcp-empty) and [MCP proxy](https://apify.com/templates/ts-mcp-proxy) templates.
- **Web servers and APIs** - Run a web server inside an Actor to serve HTTP requests, for example to expose your scraper as a live API. See the [Standby](https://apify.com/templates/js-standby) templates.

Whatever you build, the Apify SDK doesn't lock you into a particular framework. Bring the libraries you already use, and let Apify run your project in the cloud.

## Support

If you find any bug or issue with the Apify SDK, please [submit an issue on GitHub](https://github.com/apify/apify-sdk-js/issues).
For questions, you can ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/apify) or contact support@apify.com

## Upgrading

Visit the [Upgrading Guide](https://docs.apify.com/sdk/js/docs/upgrading/upgrading-to-v3) to find out what changes you might want to make, and, if you encounter any issues, join our [Discord server](https://discord.gg/jyEM2PRvMU) for help!

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
