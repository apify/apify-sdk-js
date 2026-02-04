---
id: installation
title: Installation
description: 'Learn how to install the Apify SDK for JavaScript using npm, yarn, or the Apify CLI to start building Actors.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Apify SDK for JavaScript is available as the [`apify`](https://www.npmjs.com/package/apify) NPM package.

## Installation

To install the Apify SDK in your project, use:

<Tabs groupId="package-manager">
<TabItem value="npm" label="npm" default>

```bash
npm install apify
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```bash
yarn add apify
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add apify
```

</TabItem>
<TabItem value="bun" label="Bun">

```bash
bun add apify
```

</TabItem>
</Tabs>

## Create a new Actor project

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
