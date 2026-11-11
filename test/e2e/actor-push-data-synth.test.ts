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

const actor = sdkActor('actor-push-data-synth', import.meta.filename, main);

beforeAll(async () => {
    const { actorRawId } = await buildActor(actor);
    await setPayPerEvent(actorRawId, { 'apify-actor-start': 1, 'apify-default-dataset-item': 0.005, result: 0.01 });
});

testActor(actor, 'pushData charges both apify-default-dataset-item and custom event', async ({ expect, run }) => {
    const expected = { 'apify-actor-start': 1, 'apify-default-dataset-item': 100, result: 100 };
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 10 } });
    const runInfo = await runWithChargedEvents(result.id, expected);

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual(expected);
});

testActor(actor, 'charge limit applies to combined cost of both events', async ({ expect, run }) => {
    // Budget: $1.50 total
    // apify-actor-start: 1 × $1 = $1
    // Remaining: $0.50
    // Each pushData item costs $0.005 (default) + $0.01 (result) = $0.015
    // Items within budget: floor($0.50 / $0.015) = 33
    const expected = { 'apify-actor-start': 1, 'apify-default-dataset-item': 33, result: 33 };
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 1.5 } });
    const runInfo = await runWithChargedEvents(result.id, expected);

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual(expected);

    const { items } = await result.getDataset();
    expect(items).toHaveLength(33);
});
