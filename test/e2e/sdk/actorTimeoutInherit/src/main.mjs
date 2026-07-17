import { createRequire } from 'node:module';
import { setTimeout as sleep } from 'node:timers/promises';

import { Actor, log } from 'apify';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const env = Actor.getEnv();
const { version: apifyVersion } = createRequire(import.meta.url)('apify/package.json');

if (input.role === 'child') {
    // Child role: report the timeout this run was actually started with.
    const run = await Actor.apifyClient.run(env.actorRunId).get();

    await Actor.setValue('OUTPUT', {
        apifyVersion,
        timeoutSecs: run.options.timeoutSecs,
        startedAt: run.startedAt,
        timeoutAtEnv: process.env.ACTOR_TIMEOUT_AT ?? null,
    });
} else {
    // Parent role: burn some of the run time, then call this very Actor
    // as a child with an inherited timeout.
    await sleep(input.waitMillis ?? 5000);

    const remainingMillisBeforeCall = env.timeoutAt.getTime() - Date.now();
    log.info(`Calling the child with an inherited timeout, ${remainingMillisBeforeCall}ms remaining`);

    const childRun = await Actor.call(env.actorId, { role: 'child' }, { timeout: 'inherit' });

    await Actor.setValue('OUTPUT', {
        apifyVersion,
        remainingMillisBeforeCall,
        childRunId: childRun.id,
        childStatus: childRun.status,
        childTimeoutSecs: childRun.options.timeoutSecs,
        childDefaultKeyValueStoreId: childRun.defaultKeyValueStoreId,
    });
}

await Actor.exit();
