import { testActor } from 'apify-test-tools';

import { getJsonRecord, sdkActor } from './harness.js';

export const main = async () => {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { Actor, log, LogLevel } = await import('apify');

    // The limit configures the Actor, so the input is read before there is one to ask for it.
    const inputFile = join(process.env.CRAWLEE_STORAGE_DIR!, 'key_value_stores', 'default', 'INPUT.json');
    const { maxTotalChargeUsd } = JSON.parse(await readFile(inputFile, 'utf8')) as { maxTotalChargeUsd?: number };

    const actor = new Actor({
        useChargingLogDataset: true,
        testPayPerEvent: true,
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

    // Not the default dataset: a push there is charged for too, so it's dropped once the limit is reached.
    await actor.setValue('CHARGING_LOG', data.items);

    await actor.exit();
};

const actor = sdkActor('actor-charge-local', import.meta.filename, main);

interface ChargingRecord {
    chargedCount: number;
    eventName: string;
}

testActor(actor, 'basic functionality', async ({ expect, run }) => {
    const result = await run({ runtime: 'local', input: {} });

    expect(result.status).toBe('SUCCEEDED');
    expect((await result.getRunInfo()).chargedEventCounts).toBeUndefined();

    const items = await getJsonRecord<ChargingRecord[]>(result, 'CHARGING_LOG');
    expect(items, 'There must be exactly one item in the charging dataset').toHaveLength(1);
    expect(items[0].chargedCount).toBe(4);
    expect(items[0].eventName).toBe('foobar');
});

testActor(actor, 'charge limit', async ({ expect, run }) => {
    const result = await run({ runtime: 'local', input: { maxTotalChargeUsd: 2 } });

    expect(result.status).toBe('SUCCEEDED');
    expect((await result.getRunInfo()).chargedEventCounts).toBeUndefined();

    const items = await getJsonRecord<ChargingRecord[]>(result, 'CHARGING_LOG');
    expect(items, 'There must be exactly one item in the charging dataset').toHaveLength(1);
    // The Actor tries to charge 4 events, the limit allows 2, but the SDK intentionally overcharges by 1 so that the Actor doesn't get stuck
    expect(items[0].chargedCount).toBe(3);
    expect(items[0].eventName).toBe('foobar');
});
