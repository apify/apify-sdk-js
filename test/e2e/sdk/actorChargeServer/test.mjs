import assert from 'node:assert/strict';
import test from 'node:test';

import { ApifyClient } from 'apify';

import { cryptoRandomObjectId } from '@apify/utilities';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const actor = client.actor(process.argv[2]);
await actor.update({
    // The harness name is too long for the `<username>--<actor-name>` hostname label of the server URL (63 characters).
    name: `sdk-mt-${cryptoRandomObjectId(8).toLowerCase()}`,
    pricingInfos: [
        {
            pricingModel: 'PAY_PER_EVENT',
            pricingPerEvent: {
                actorChargeEvents: {
                    'api-call': {
                        eventTitle: 'API call',
                        eventPriceUsd: 0.01,
                        eventDescription: 'One API call',
                    },
                },
            },
        },
    ],
    actorStandby: { isEnabled: true, tenancy: 'MULTI_TENANT' },
});

test('charges with the request ID and rejects charges without it', async () => {
    let withId;
    let withoutId;
    let runs;
    try {
        withId = (await actor.server().request()).data;
        withoutId = (await actor.server().request('/', { params: { omitRequestId: true } })).data;
    } finally {
        runs = await actor.runs().list();
        await Promise.all(runs.items.map(async ({ id }) => client.run(id).abort()));
        // The harness swaps the pricing for a free one before deleting the Actor, which a multi-tenant one rejects.
        await actor.update({ actorStandby: { isEnabled: false } });
    }

    // The SDK must detect the run itself; the platform-side checks below can't tell a correct client from a lucky one.
    assert.equal(withId.isMultiTenant, true);
    assert.equal(withId.chargedCount, 1);
    assert.ok(withId.requestId);
    // Matches the SDK's own message, not a platform rejection that might also mention the request ID.
    assert.match(withoutId.error, /X-Actor-Request-ID header to Actor\.charge\(\)/);

    const run = await client.run(runs.items[0].id).get();
    assert.ok(run.standby?.deployment.startsWith('MULTI_TENANT'));
});
