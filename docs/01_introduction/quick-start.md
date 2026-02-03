---
id: quick-start
title: Quick start
sidebar_label: Quick start
description: 'Get started with the Apify SDK for JavaScript by creating your first Actor and learning the basics.'
---

Learn how to create and run Actors using the Apify SDK for JavaScript.

---

## Step 1: Creating Actors

To create and run Actors in Apify Console, refer to the [Console documentation](/platform/actors/development/quick-start/web-ide).

To create an Actor on your computer, use the [Apify CLI](/cli):

```bash
apify create my-first-actor
```

The CLI will prompt you to select a template. After you choose a template, the CLI creates a new folder called `my-first-actor`, downloads and extracts the selected template, and installs dependencies using npm.

## Step 2: Running the Actor

To run the Actor, you can use the [`apify run` command](/cli/docs/reference#apify-run):

```bash
cd my-first-actor
apify run
```

This command:

- Starts the Actor with the appropriate environment variables for local running
- Configures it to use local storages from the `storage` folder

The Actor input, for example, will be in `storage/key_value_stores/default/INPUT.json`.

## Step 3: Understanding Actor structure

All JavaScript Actor templates follow the same structure.

The `.actor` directory contains the [Actor configuration](/platform/actors/development/actor-config), such as the Actor's definition and input schema, and the Dockerfile necessary to run the Actor on the Apify platform.

The Actor's runtime dependencies are specified in the `package.json` file.

The Actor's source code is typically in the `src` folder (or root for simple Actors). The main entry point is usually `src/main.js` or `src/main.ts`:

```js
import { Actor, log } from 'apify';

// Initialize the Actor
await Actor.init();

// Get input from the Actor
const input = await Actor.getInput();
log.info('Actor input:', input);

// Your Actor logic goes here
await Actor.pushData({ message: 'Hello, world!' });

// Gracefully exit the Actor
await Actor.exit();
```

### Key methods

- **`Actor.init()`** - Initializes the Actor runtime, sets up storage, and prepares the environment
- **`Actor.getInput()`** - Retrieves input data passed to the Actor
- **`Actor.pushData()`** - Stores data in the default dataset
- **`Actor.exit()`** - Gracefully shuts down the Actor and saves its state

## Next steps

### Guides

To see how you can integrate the Apify SDK with some of the most popular web scraping libraries, check out our guides for working with:

- [CheerioCrawler](../guides/cheerio-crawler)
- [PuppeteerCrawler](../guides/puppeteer-crawler)
- [PlaywrightCrawler](../guides/playwright-crawler)

### Concepts

To learn more about the features of the Apify SDK and how to use them, check out the Concepts section in the sidebar, especially:

- [Actor lifecycle](../concepts/actor-lifecycle)
- [Request storage](../concepts/request-storage)
- [Result storage](../concepts/result-storage)
- [Proxy management](../concepts/proxy-management)
