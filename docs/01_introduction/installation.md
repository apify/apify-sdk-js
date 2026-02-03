---
id: installation
title: Installation
description: 'Learn how to install the Apify SDK for JavaScript using npm, yarn, or the Apify CLI to start building Actors.'
---

The Apify SDK for JavaScript is available as the [`apify`](https://www.npmjs.com/package/apify) NPM package.

## Installation

To install the Apify SDK in your project, use:

```bash
npm install apify
```

Or with other package managers:

```bash
# Yarn
yarn add apify

# pnpm
pnpm add apify

# Bun
bun add apify
```

## Creating a new Actor project

To quickly scaffold a new Actor project with the SDK already configured, use the [Apify CLI](https://docs.apify.com/cli):

```bash
# Install Apify CLI globally
npm install -g apify-cli

# Create a new Actor project (prompts for template selection)
apify create my-actor
```

This creates a complete Actor project structure with the SDK pre-installed and configured.

## Requirements

- **Node.js**: Version 16 or higher is required
- **TypeScript** (optional): Version 4.0 or higher for TypeScript projects

## API client alternative

If you need to interact with the Apify API programmatically without creating Actors, use the [Apify API client for JavaScript](https://docs.apify.com/api/client/js) instead.

```bash
npm install apify-client
```

## Next steps

- [Quick Start Guide](./quick-start) - Get started with your first Actor
- [Apify Platform Guide](../concepts/actor-lifecycle) - Learn about Actor lifecycle and platform integration
