---
---
## Overview

The Apify SDK is available as the [`apify`](https://www.npmjs.com/package/apify) NPM package and it provides the following tools:

- [`Actor`](https://sdk.apify.com/api/apify/class/Actor) - Serves as an alternative approach to the static helpers exported from the package.
This class can be used to control the current actor run and to interact with the actor's environment. 

- [`ApifyClient`](https://sdk.apify.com/api/apify/class/ApifyClient) - Allows user to interact with the Apify platform from code, control and schedule actors on the platform and access the result data stores.

- [`Configuration`](https://sdk.apify.com/api/apify/class/Configuration) - Helper class encapsulating the configuration of the current actor run.

- [`PlatformEventManager`](https://sdk.apify.com/api/apify/class/PlatformEventManager) - Event emitter for the platform and SDK events. Can be used to track actor run performance or serverless container migration.

- [`ProxyConfiguration`](https://sdk.apify.com/api/apify/class/ProxyConfiguration) - Configures connection to a proxy server with the provided options. Setting proxy configuration in your crawlers automatically configures them to use the selected proxies for all connections. The proxy servers are managed by Apify Proxy.

- [`RequestQueue`](https://sdk.apify.com/api/apify/class/RequestQueue) - Represents a queue of URLs to crawl,
  which is stored either on a local filesystem or in the [Apify Cloud](https://apify.com). The queue is used
  for deep crawling of websites, where you start with several URLs and then recursively follow links to other pages.
  The data structure supports both breadth-first and depth-first crawling orders.

- [`Dataset`](https://sdk.apify.com/api/apify/class/Dataset) - Provides a store for structured data and enables their export
  to formats like JSON, JSONL, CSV, XML, Excel or HTML. The data is stored on a local filesystem or in the Apify Cloud.
  Datasets are useful for storing and sharing large tabular crawling results, such as a list of products or real estate offers.

- [`KeyValueStore`](https://sdk.apify.com/api/apify/class/KeyValueStore) - A simple key-value store for arbitrary data
  records or files, along with their MIME content type. It is ideal for saving screenshots of web pages, PDFs
  or to persist the state of your crawlers. The data is stored on a local filesystem or in the Apify Cloud.

Additionally, the package provides various helper functions to simplify running your code on the Apify Cloud and thus
take advantage of its pool of proxies, job scheduler, data storage, etc.
For more information, see the [Apify SDK Programmer's Reference](https://sdk.apify.com).
