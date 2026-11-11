import { testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

export const main = async () => {
    const { Actor, ApifyClient, log, LogLevel } = await import('apify');

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    const run = (await client.run(process.env.ACTOR_RUN_ID!).get())!;
    const {
        value: { maxTotalChargeUsd },
    } = (await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT')) as {
        value: { maxTotalChargeUsd?: number };
    };

    delete process.env.APIFY_IS_AT_HOME;
    delete process.env.ACTOR_MAX_TOTAL_CHARGE_USD;

    const actor = new Actor({
        useChargingLogDataset: true,
        testPayPerEvent: true,
        isAtHome: false,
        // The SDK treats `0`/unset as "no limit" — don't pass `Infinity`, which
        // isn't a valid config input (zod rejects non-finite numbers).
        maxTotalChargeUsd: maxTotalChargeUsd ?? 0,
        logLevel: LogLevel.DEBUG,
    });

    await actor.init();

    const chargeResult = await actor.charge({
        eventName: 'foobar',
        count: 4,
    });

    log.info(`Charged: ${JSON.stringify(chargeResult)}`);

    const chargingLogDataset = await actor.openDataset('charging_log');
    const data = await chargingLogDataset.getData();

    // Transfer contents of the local charging log dataset into the default dataset on the platform
    await client.dataset(run.defaultDatasetId).pushItems(data.items);

    await actor.exit();
};

const actor = sdkActor('actor-charge-local', import.meta.filename, main);

interface ChargingRecord {
    chargedCount: number;
    eventName: string;
}

testActor(actor, 'basic functionality', async ({ expect, run }) => {
    const result = await run({ input: {} });
    const runInfo = await result.getRunInfo();

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toBeUndefined();

    const { items } = await result.getDataset<ChargingRecord>();
    expect(
        items,
        `There must be exactly one item in the charging dataset (ID ${runInfo.defaultDatasetId})`,
    ).toHaveLength(1);
    expect(items[0].chargedCount).toBe(4);
    expect(items[0].eventName).toBe('foobar');
});

testActor(actor, 'charge limit', async ({ expect, run }) => {
    const result = await run({ input: { maxTotalChargeUsd: 2 } });
    const runInfo = await result.getRunInfo();

    expect(runInfo.status).toBe('SUCCEEDED');
    expect(runInfo.chargedEventCounts).toBeUndefined();

    const { items } = await result.getDataset<ChargingRecord>();
    expect(
        items,
        `There must be exactly one item in the charging dataset (ID ${runInfo.defaultDatasetId})`,
    ).toHaveLength(1);
    // The Actor tries to charge 4 events, the limit allows 2, but the SDK intentionally overcharges by 1 so that the Actor doesn't get stuck
    expect(items[0].chargedCount).toBe(3);
    expect(items[0].eventName).toBe('foobar');
});
