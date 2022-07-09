---
id: upgrading-to-v3
title: Upgrading to v3
---

- TS rewrite
- monorepo split...

### Breaking changes

- `Apify.call()` is now just a shortcut for running `ApifyClient.actor(actorId).call(input, options)`, while also taking the token inside env vars into account
- `Apify.callTask()` is now just a shortcut for running `ApifyClient.task(taskId).call(input, options)`, while also taking the token inside env vars into account
- `Apify.metamorph()` is now just a shortcut for running `ApifyClient.task(taskId).metamorph(input, options)`, while also taking the ACTOR_RUN_ID inside env vars into account
- `Apify.waitForRunToFinish()` has been removed, use `ApifyClient.waitForFinish()` instead
- (internal) `QueueOperationInfo.request` is no longer available
- (internal) `Request.handledAt` is now string date in ISO format
- (perf/internal) `Request.inProgress` and `Request.reclaimed` are now `Set`s instead of dictionaries
- `injectUnderscore` from puppeteer utils has been removed

