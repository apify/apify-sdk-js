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

To create a new Apify Actor on your computer, you can use the [Apify CLI](/cli), and select one of the [JavaScript Actor templates](https://apify.com/templates?category=javascript).

For example, to create an Actor from the "Getting started with JavaScript" template, you can use the [`apify create` command](/cli/docs/reference#apify-create-actorname).

```bash
apify create my-first-actor
```

This will create a new folder called `my-first-actor`, download and extract the Actor template there, install the dependencies using npm, and set up the project structure.

## Step 2: Running the Actor

To run the Actor, you can use the [`apify run` command](/cli/docs/reference#apify-run):

```bash
cd my-first-actor
apify run
```

This command:

- Starts the Actor with the appropriate environment variables for local running
- Configures it to use local storages from the `storage` folder
- Automatically watches for file changes and restarts the Actor when needed

The Actor input, for example, will be in `storage/key_value_stores/default/INPUT.json`.

## Step 3: Understanding Actor structure

All JavaScript Actor templates follow the same structure.

The `.actor` directory contains the [Actor configuration](/platform/actors/development/actor-config), such as the Actor's definition and input schema, and the Dockerfile necessary to run the Actor on the Apify platform.

The Actor's runtime dependencies are specified in the `package.json` file.

The Actor's source code is typically in the `src` folder (or root for simple Actors). The main entry point is usually `src/main.js` or `src/main.ts`:

```js
import { Actor } from 'apify';

// Initialize the Actor
await Actor.init();

// Get input from the Actor
const input = await Actor.getInput();
Actor.log.info('Actor input:', input);

// Your Actor logic goes here
await Actor.setValue('OUTPUT', { message: 'Hello, world!' });

// Gracefully exit the Actor
await Actor.exit();
```

### Key methods

- **`Actor.init()`** - Initializes the Actor runtime, sets up storage, and prepares the environment
- **`Actor.getInput()`** - Retrieves input data passed to the Actor
- **`Actor.setValue()`** - Stores data in the default key-value store
- **`Actor.exit()`** - Gracefully shuts down the Actor and saves its state

## Step 4: Next steps

### Guides

To see how you can integrate the Apify SDK with some of the most popular web scraping libraries, check out our guides for working with:

- [CheerioCrawler](../guides/cheerio-crawler)
- [PuppeteerCrawler](../guides/puppeteer-crawler)
- [PlaywrightCrawler](../guides/playwright-crawler)
- [Request storage](../guides/request-storage)
- [Result storage](../guides/result-storage)

### Concepts

To learn more about the features of the Apify SDK and how to use them, check out the Concepts section in the sidebar, especially the guides for:

- [Actor lifecycle](../concepts/actor-lifecycle)
- [Working with storages](../concepts/storages)
- [Handling Actor events](../concepts/actor-events)
- [How to use proxies](../concepts/proxy-management)
