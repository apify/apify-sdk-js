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
                    result: {
                        eventTitle: 'Result',
                        eventPriceUsd: 0.01,
                        eventDescription: 'Single dataset item',
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

test('unlimited push', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 10 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, {
        'apify-actor-start': 1,
        result: 100,
    });
});

test('charge limit works as intended', async () => {
    const run = await runActor({}, { maxTotalChargeUsd: 1.5 });

    assert.strictEqual(run.status, 'SUCCEEDED');
    assert.deepEqual(run.chargedEventCounts, {
        'apify-actor-start': 1,
        result: 50,
    });

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems({ limit: 100 });

    assert.strictEqual(
        items.length,
        50,
        `default items (${items.length}) != 50`,
    );
});
