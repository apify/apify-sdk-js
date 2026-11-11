import { buildActor, testActor } from 'apify-test-tools';

import { sdkActor, setPayPerEvent, runWithChargedEvents } from './harness.js';

export const main = async () => {
    const { Actor, log } = await import('apify');

    const actor = new Actor();

    await actor.init();

    const chargeResult = await actor.pushData(new Array(100).fill({ hello: 'world' }), 'result');

    log.info(`Charged: ${JSON.stringify(chargeResult)}`);

    await actor.exit();
};

const actor = sdkActor('actor-push-data-ppe', import.meta.filename, main);

beforeAll(async () => {
    const { actorRawId } = await buildActor(actor);
    await setPayPerEvent(actorRawId, { 'apify-actor-start': 1, result: 0.01 });
});

testActor(actor, 'unlimited push', async ({ expect, run }) => {
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 10 } });
    const runInfo = await runWithChargedEvents(result.id, { 'apify-actor-start': 1, result: 100 });

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual({ 'apify-actor-start': 1, result: 100 });
});

testActor(actor, 'charge limit works as intended', async ({ expect, run }) => {
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 1.5 } });
    const runInfo = await runWithChargedEvents(result.id, { 'apify-actor-start': 1, result: 50 });

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual({ 'apify-actor-start': 1, result: 50 });

    const { items } = await result.getDataset();
    expect(items).toHaveLength(50);
});
