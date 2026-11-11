import { buildActor, testActor } from 'apify-test-tools';

import { sdkActor, setPayPerEvent, runWithChargedEvents } from './harness.js';

export const main = async () => {
    const { Actor, log } = await import('apify');

    const actor = new Actor();

    await actor.init();

    const chargeResult = await actor.charge({
        eventName: 'foobar',
        count: 4,
    });

    log.info(`Charged: ${JSON.stringify(chargeResult)}`);

    await actor.exit();
};

const actor = sdkActor('actor-charge', import.meta.filename, main);

beforeAll(async () => {
    const { actorRawId } = await buildActor(actor);
    await setPayPerEvent(actorRawId, { foobar: 0.1 });
});

testActor(actor, 'basic functionality', async ({ expect, run }) => {
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 10 } });
    const runInfo = await runWithChargedEvents(result.id, { foobar: 4 });

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual({ foobar: 4 });

    const record = await result.getKeyValueStoreClient().getRecord('CHARGING_LOG_DATASET_ID');
    expect(record?.value ?? null, 'Charging dataset ID must not be present').toBeNull();
});

testActor(actor, 'charge limit', async ({ expect, run }) => {
    const result = await run({ input: {}, options: { maxTotalChargeUsd: 0.2 } });
    const runInfo = await runWithChargedEvents(result.id, { foobar: 3 });

    expect(runInfo.status).toBe('SUCCEEDED');
    // The Actor tries to charge 4 events, the limit allows 2, but the SDK intentionally overcharges by 1 so that the Actor doesn't get stuck
    expect(runInfo.chargedEventCounts).toEqual({ foobar: 3 });
});

testActor(actor, 'default options start cost-unlimited runs', async ({ expect, run }) => {
    const result = await run({ input: {} });
    const runInfo = await runWithChargedEvents(result.id, { foobar: 4 });

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toEqual({ foobar: 4 });
});
