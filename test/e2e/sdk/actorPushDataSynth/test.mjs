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
                    'apify-actor-start': {
                        eventTitle: 'Actor start',
                        eventPriceUsd: 1,
                        eventDescription: 'Charged automatically at the start of the run',
                    },
                    'apify-default-dataset-item': {
                        eventTitle: 'Dataset item',
                        eventPriceUsd: 0.005,
                        eventDescription: 'Default charge per dataset item',
                    },
                    result: {
                        eventTitle: 'Result',
                        eventPriceUsd: 0.01,
                        eventDescription: 'Custom charge per result',
                    },
                },
            },
        },
    ],
});

// The platform reconciles `chargedEventCounts` onto the run record asynchronously
// after the run finishes, so poll until it reaches the expected value instead of
// racing a fixed delay (which made this test flaky).
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

test('pushData charges both apify-default-dataset-item and custom event', async () => {
    const run = await runActor(
        {},
        { maxTotalChargeUsd: 10 },
        {
            'apify-actor-start': 1,
            'apify-default-dataset-item': 100,
            result: 100,
        },
    );

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, {
        'apify-actor-start': 1,
        'apify-default-dataset-item': 100,
        result: 100,
    });
});

test('charge limit applies to combined cost of both events', async () => {
    // Budget: $1.50 total
    // apify-actor-start: 1 × $1 = $1
    // Remaining: $0.50
    // Each pushData item costs $0.005 (default) + $0.01 (result) = $0.015
    // Items within budget: floor($0.50 / $0.015) = 33
    const run = await runActor(
        {},
        { maxTotalChargeUsd: 1.5 },
        {
            'apify-actor-start': 1,
            'apify-default-dataset-item': 33,
            result: 33,
        },
    );

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, {
        'apify-actor-start': 1,
        'apify-default-dataset-item': 33,
        result: 33,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 100 });

    assert.strictEqual(items.length, 33, `default items (${items.length}) != 33`);
});
