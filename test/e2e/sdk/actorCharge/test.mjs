import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient } from 'apify';
import { sleep } from 'crawlee';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);
await actor.update({
    pricingInfos: [
        {
            pricingModel: 'PAY_PER_EVENT',
            pricingPerEvent: {
                actorChargeEvents: {
                    foobar: {
                        eventTitle: 'Foo bar',
                        eventPriceUsd: 0.1,
                        eventDescription: 'Foo foo bar bar',
                    },
                },
            },
        },
    ],
});

// The platform reconciles `chargedEventCounts` onto the run record asynchronously
// after the run finishes — and noticeably slower for runs that hit the charge
// limit — so poll until it reaches the expected value instead of racing a fixed
// delay (which made this test flaky).
const runActor = async (input, options, expectedChargedEventCounts) => {
    const { id: runId } = await actor.call(input, options);
    await client.run(runId).waitForFinish();

    const expected = JSON.stringify(expectedChargedEventCounts);
    const deadline = Date.now() + 60_000;
    let run = await client.run(runId).get();
    while (JSON.stringify(run.chargedEventCounts ?? {}) !== expected && Date.now() < deadline) {
        await sleep(2000);
        run = await client.run(runId).get();
    }
    return run;
};

test('basic functionality', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 10 }, { foobar: 4 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, { foobar: 4 });

    const record = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('CHARGING_LOG_DATASET_ID');
    const chargingDatasetId = record?.value ?? null;
    assert.equal(chargingDatasetId, null, 'Charging dataset ID must not be present');
});

test('charge limit', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 0.2 }, { foobar: 3 });

    assert.strictEqual(run.status, 'SUCCEEDED');

    // The Actor tries to charge 4 events, the limit allows 2, but the SDK intentionally overcharges by 1 so that the Actor doesn't get stuck
    assert.deepEqual(run.chargedEventCounts, { foobar: 3 });
});

test('default options start cost-unlimited runs', async () => {
    const run = await runActor({}, {}, { foobar: 4 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, { foobar: 4 });
});
