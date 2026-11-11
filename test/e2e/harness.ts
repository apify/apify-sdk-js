import { join } from 'node:path';

import { type ActorUpdateOptions, ApifyClient } from 'apify-client';
import { defineActor, pollUntil } from 'apify-test-tools';
import { ActorSource, inlineMain } from 'apify-test-tools/ad-hoc';
import { inject } from 'vitest';

/**
 * The Actor `apify-sdk-js-e2e-<label>`: `test/e2e/actor-base` overlaid with `overlay` dirs, with `main` (a top-level
 * function of the test file at `filename`) as `src/main.mjs`, pinned to the packed SDK.
 */
export const sdkActor = (label: string, filename: string, main: () => unknown, ...overlay: string[]) =>
    defineActor(`apify-sdk-js-e2e-${label}`, {
        source: ActorSource.dirs(join(import.meta.dirname, 'actor-base'), ...overlay)
            .with(inlineMain(filename, main, { path: 'src/main.mjs' }))
            .pin(inject('packs')),
        syncDelayMs: 0,
    });

/** For run/storage lookups by ID that `RunTestResult` doesn't cover. */
export const client = new ApifyClient({ token: process.env.TESTER_APIFY_TOKEN });

interface PricingInfo {
    pricingModel: string;
    pricingPerEvent?: { actorChargeEvents: Record<string, { eventPriceUsd: number }> };
}

/**
 * Switches the Actor to PAY_PER_EVENT pricing with the given event prices (USD). `pricingInfos` is append-only on
 * the platform, and the Actor persists between runs, so a record is added only when the current prices differ.
 * The client types want the server-set fields (`createdAt`, …) on every `pricingInfos` record, hence the casts.
 */
export const setPayPerEvent = async (actorId: string, events: Record<string, number>) => {
    const { pricingInfos = [] } = (await client.actor(actorId).get()) as { pricingInfos?: PricingInfo[] };
    const current = pricingInfos.at(-1);
    const currentPrices = Object.fromEntries(
        Object.entries(current?.pricingPerEvent?.actorChargeEvents ?? {}).map(([name, { eventPriceUsd }]) => [
            name,
            eventPriceUsd,
        ]),
    );
    if (current?.pricingModel === 'PAY_PER_EVENT' && JSON.stringify(currentPrices) === JSON.stringify(events)) return;

    await client.actor(actorId).update({
        pricingInfos: [
            ...pricingInfos,
            {
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: {
                    actorChargeEvents: Object.fromEntries(
                        Object.entries(events).map(([name, eventPriceUsd]) => [
                            name,
                            { eventTitle: name, eventDescription: name, eventPriceUsd },
                        ]),
                    ),
                },
            },
        ],
    } as unknown as ActorUpdateOptions);
};

/**
 * The platform reconciles `chargedEventCounts` onto the run record asynchronously after the run finishes
 * (noticeably slower for runs that hit the charge limit), so wait for the expected value instead of a fixed delay.
 */
export const runWithChargedEvents = (runId: string, expected: Record<string, number>) =>
    pollUntil(
        async () => (await client.run(runId).get())!,
        (run) => JSON.stringify(run.chargedEventCounts ?? {}) === JSON.stringify(expected),
        { timeout: 60_000 },
    );
