---
id: installation
title: Installation
description: 'Learn how to install the Apify SDK for JavaScript using npm, yarn, or the Apify CLI to start building Actors.'
---

The Apify SDK for JavaScript is available as the [`apify`](https://www.npmjs.com/package/apify) NPM package.

## Using Apify CLI

The recommended way to create a new Actor project is using the [Apify CLI](https://docs.apify.com/cli), which automatically installs the Apify SDK along with other necessary dependencies:

```bash
# Install Apify CLI globally
npm install -g apify-cli

# Create a new Actor project
apify create my-actor

# Navigate to the project directory
cd my-actor

# Run the Actor locally
apify run
```

## Manual installation

To install the Apify SDK manually in an existing project, use:

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
