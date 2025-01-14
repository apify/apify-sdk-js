import assert from 'node:assert/strict';

import { ApifyClient } from 'apify';

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
                    },
                },
            },
        },
    ],
});

const run = await actor.call({}, { waitSecs: 15 });
