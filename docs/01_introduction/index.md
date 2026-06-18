---
id: introduction
title: Apify SDK for JavaScript
sidebar_label: Overview
slug: /overview
description: 'The official library for creating Apify Actors in JavaScript and TypeScript, for web scraping, browser automation, AI agents, and more.'
---

The Apify SDK for JavaScript is the official library for creating [Apify Actors](https://docs.apify.com/platform/actors) using JavaScript or TypeScript. It provides useful features like Actor lifecycle management, local storage emulation, and Actor event handling.

```js
import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
console.log(input);

await Actor.exit();
```

## What are Actors?

Actors are serverless programs that can do almost anything. From simple scripts and web scrapers to complex automation workflows, AI agents, or even always-on services that expose HTTP endpoints.

They can run either locally or on the Apify platform, where you can scale their execution, monitor runs, schedule tasks, integrate them with other services, or even publish and monetize them. If you're new to Apify, learn more about the platform in the [Apify documentation](https://docs.apify.com/platform/about).

For more context, read the [Actor whitepaper](https://whitepaper.actor/).

## What you can build

Almost any Node.js project can become an Actor, including projects for:

- **Web scraping and crawling** - The SDK works seamlessly with [Crawlee](https://crawlee.dev), which makes Apify a natural place to deploy and scale your crawlers. Start from a ready-made [Cheerio](https://apify.com/templates/js-crawlee-cheerio) template.
- **Browser automation** - Drive a real browser with [Playwright](guides/playwright-crawler), [Puppeteer](guides/puppeteer-crawler), or [Selenium](https://apify.com/apify/example-selenium) to automate tasks, fill in forms, or test web apps.
- **AI agents** - Host agents built with your framework of choice. Ready-made Actor templates cover [LangChain](https://apify.com/templates/js-langchain), [LangGraph](https://apify.com/templates/js-langgraph-agent), [BeeAI](https://apify.com/templates/ts-beeai-agent), and [Mastra](https://apify.com/templates/ts-mastraai).
- **MCP servers** - Deploy an MCP server as an Actor and make its tools available to any MCP client. See the [MCP server](https://apify.com/templates/ts-mcp-empty) and [MCP proxy](https://apify.com/templates/ts-mcp-proxy) templates.
- **Web servers and APIs** - Run a web server inside an Actor to serve HTTP requests, for example to expose your scraper as a live API. See the [Standby mode](https://docs.apify.com/platform/actors/development/programming-interface/standby) templates ([JavaScript](https://apify.com/templates/js-standby), [TypeScript](https://apify.com/templates/ts-standby)).

Whatever you build, the Apify SDK doesn't lock you into a particular framework. Bring the libraries you already use, and let Apify run your project in the cloud.

## Quick start

To create and run Actors using Apify Console, check out [Apify Console documentation](https://docs.apify.com/platform/console). For creating and running JavaScript Actors locally, refer to the [Actor lifecycle guide](concepts/actor-lifecycle).

Explore the Guides section in the sidebar for a deeper understanding of the SDK's features and best practices.

## Installation

The Apify SDK for JavaScript is typically installed when you create a new Actor project using the [Apify CLI](https://docs.apify.com/cli). To install it manually in an existing project, use:

```bash
npm install apify
```

:::note API client alternative

If you need to interact with the Apify API programmatically without creating Actors, use the [Apify API client for JavaScript](https://docs.apify.com/api/client/js) instead.

:::
