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
                        eventDescription:
                            'Charged automatically at the start of the run',
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

const runActor = async (input, options) => {
    const { id: runId } = await actor.call(input, options);
    await client.run(runId).waitForFinish();
    await sleep(6000); // wait for updates to propagate to MongoDB
    return await client.run(runId).get();
};

test('pushData charges both apify-default-dataset-item and custom event', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 10 });

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
    const run = await runActor({}, { maxTotalChargeUsd: 1.5 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, {
        'apify-actor-start': 1,
        'apify-default-dataset-item': 33,
        result: 33,
    });

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems({ limit: 100 });

    assert.strictEqual(
        items.length,
        33,
        `default items (${items.length}) != 33`,
    );
});
