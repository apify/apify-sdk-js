---
id: introduction
title: Introduction
sidebar_label: Introduction
---

The Apify SDK for JavaScript is the official library for creating [Apify Actors](https://docs.apify.com/platform/actors) using JavaScript or TypeScript. It provides useful features like actor lifecycle management, local storage emulation, and actor event handling.

```javascript
import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
console.log(input);

await Actor.exit();
```

## What are Actors?

Actors are serverless cloud programs capable of performing tasks in a web browser, similar to what a human can do. These tasks can range from simple operations, such as filling out forms or unsubscribing from services, to complex jobs like scraping and processing large numbers of web pages.

Actors can be executed locally or on the [Apify platform](https://docs.apify.com/platform/), which provides features for running them at scale, monitoring, scheduling, and even publishing and monetizing them.

## Quick start

To create and run Actors using the Apify Console, see the [Console documentation](https://docs.apify.com/platform/console). For creating and running JavaScript Actors locally, refer to the [Apify platform guide](./guides/apify-platform).

Explore the [Examples](./examples) section to see the SDK in action, and refer to the [Guides](./guides) section for a deeper understanding of the SDK's features and best practices.

## Installation

When creating an Actor using the Apify CLI, the Apify SDK for JavaScript is installed automatically. To install it manually in your project, use:

```bash
npm install apify
```

If your goal is not to develop Apify Actors but to interact with the Apify API from JavaScript, consider using the [Apify API client for JavaScript](https://docs.apify.com/api/client/js) directly.
