---
id: overview
title: Apify SDK for JavaScript
sidebar_label: Overview
---

The Apify SDK for JavaScript is the official library for creating [Apify Actors](https://docs.apify.com/platform/actors) using JavaScript or TypeScript. It provides useful features like Actor lifecycle management, local storage emulation, and Actor event handling.

```js
import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
console.log(input);

await Actor.exit();
```

## What are Actors

Actors are serverless cloud programs capable of performing tasks in a web browser, similar to what a human can do. These tasks can range from simple operations, such as filling out forms or unsubscribing from services, to complex jobs like scraping and processing large numbers of web pages.

Actors can be executed locally or on the [Apify platform](https://docs.apify.com/platform). The Apify platform lets you run Actors at scale and provides features for monitoring, scheduling, publishing, and monetizing them.

## Quick start

To create and run Actors using Apify Console, check out [Apify Console documentation](https://docs.apify.com/platform/console). For creating and running JavaScript Actors locally, refer to the [Apify platform guide](./guides/apify-platform).

Explore the [Examples](./examples) section to see the SDK in action, and refer to the [Guides](./guides) section for a deeper understanding of the SDK's features and best practices.

## Installation

The Apify SDK for JavaScript is typically installed when you create a new Actor project using the [Apify CLI](https://docs.apify.com/cli). To install it manually in an existing project, use:

```bash
npm install apify
```

:::note API client alternative

If you need to interact with the Apify API programmatically without creating Actors, use the [Apify API client for JavaScript](https://docs.apify.com/api/client/js) instead.

:::
