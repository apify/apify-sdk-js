import { Actor } from 'apify';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import log from '@apify/log';

import { mergeChargeResults } from '../../src/charging.js';
import { MemoryStorageEmulator } from '../MemoryStorageEmulator.js';

/**
 * Sets up environment variables to simulate running on the Apify platform.
 * Use this when you need to test behavior that depends on actual pricing info.
 */
function setUpPlatformEnv(
    options: {
        maxTotalChargeUsd?: string;
        pricingInfo?: Record<
            string,
            {
                eventTitle: string;
                eventPriceUsd: number;
                eventDescription?: string;
            }
        >;
        chargedEventCounts?: Record<string, number>;
    } = {},
) {
    delete process.env.ACTOR_TEST_PAY_PER_EVENT;

    process.env.APIFY_IS_AT_HOME = '1';
    process.env.APIFY_TOKEN = 'test-token';
    process.env.ACTOR_RUN_ID = 'test-run-id';

    if (options.maxTotalChargeUsd !== undefined) {
        process.env.ACTOR_MAX_TOTAL_CHARGE_USD = options.maxTotalChargeUsd;
    }

    if (options.pricingInfo !== undefined) {
        process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
            pricingModel: 'PAY_PER_EVENT',
            pricingPerEvent: {
                actorChargeEvents: options.pricingInfo,
            },
        });
    }

    process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify(
        options.chargedEventCounts ?? {},
    );
}

/**
 * Sets up environment variables for local pay-per-event testing.
 * In local mode, all events cost 1 USD regardless of pricing info.
 */
function setUpLocalTestEnv(options: { maxTotalChargeUsd?: string } = {}) {
    process.env.ACTOR_TEST_PAY_PER_EVENT = '1';

    if (options.maxTotalChargeUsd !== undefined) {
        process.env.ACTOR_MAX_TOTAL_CHARGE_USD = options.maxTotalChargeUsd;
    }
}

describe('mergeChargeResults()', () => {
    test('should sum chargedCount values', () => {
        const a = {
            eventChargeLimitReached: false,
            chargedCount: 3,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: false,
            chargedCount: 5,
            chargeableWithinLimit: {},
        };
        expect(mergeChargeResults(a, b).chargedCount).toBe(8);
    });

    test('should return false when both eventChargeLimitReached are false', () => {
        const a = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        expect(mergeChargeResults(a, b).eventChargeLimitReached).toBe(false);
    });

    test('should return true when first eventChargeLimitReached is true', () => {
        const a = {
            eventChargeLimitReached: true,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        expect(mergeChargeResults(a, b).eventChargeLimitReached).toBe(true);
    });

    test('should return true when second eventChargeLimitReached is true', () => {
        const a = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: true,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        expect(mergeChargeResults(a, b).eventChargeLimitReached).toBe(true);
    });

    test('should return true when both eventChargeLimitReached are true', () => {
        const a = {
            eventChargeLimitReached: true,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: true,
            chargedCount: 1,
            chargeableWithinLimit: {},
        };
        expect(mergeChargeResults(a, b).eventChargeLimitReached).toBe(true);
    });

    test('should take minimum of chargeableWithinLimit for each key', () => {
        const a = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: { event1: 10, event2: 5 },
        };
        const b = {
            eventChargeLimitReached: false,
            chargedCount: 1,
            chargeableWithinLimit: { event1: 3, event2: 8 },
        };
        const result = mergeChargeResults(a, b);
        expect(result.chargeableWithinLimit).toEqual({ event1: 3, event2: 5 });
    });

    test('should handle empty chargeableWithinLimit objects', () => {
        const a = {
            eventChargeLimitReached: false,
            chargedCount: 2,
            chargeableWithinLimit: {},
        };
        const b = {
            eventChargeLimitReached: false,
            chargedCount: 3,
            chargeableWithinLimit: {},
        };
        const result = mergeChargeResults(a, b);
        expect(result.chargeableWithinLimit).toEqual({});
    });
});

describe('ChargingManager', () => {
    const localStorageEmulator = new MemoryStorageEmulator();

    beforeEach(async () => {
        await localStorageEmulator.init();

        // Default to local test mode - individual tests can switch to platform mode
        setUpLocalTestEnv({ maxTotalChargeUsd: '10' });
    });

    afterEach(async () => {
        await Actor.exit({ exit: false });

        // @ts-expect-error
        Actor._instance = undefined; // eslint-disable-line no-underscore-dangle

        await localStorageEmulator.destroy();

        // Clean up all charging-related env vars
        delete process.env.ACTOR_TEST_PAY_PER_EVENT;
        delete process.env.ACTOR_MAX_TOTAL_CHARGE_USD;
        delete process.env.APIFY_ACTOR_PRICING_INFO;
        delete process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS;
        delete process.env.APIFY_IS_AT_HOME;
        delete process.env.APIFY_TOKEN;
        delete process.env.ACTOR_RUN_ID;
    });

    describe('charge()', () => {
        test('should return eventChargeLimitReached=false when count=0 even after hitting budget limit', async () => {
            await Actor.init();

            // First, hit the budget limit with a large charge
            const limitResult = await Actor.charge({
                eventName: 'test-event-limit',
                count: 1000,
            });
            expect(limitResult.eventChargeLimitReached).toBe(true);
            expect(limitResult.chargedCount).toBeLessThan(1000);

            // Then verify that count=0 still returns false for eventChargeLimitReached
            const zeroResult = await Actor.charge({
                eventName: 'test-event-limit',
                count: 0,
            });
            expect(zeroResult.eventChargeLimitReached).toBe(false);
            expect(zeroResult.chargedCount).toBe(0);
        });

        test('should charge events when ACTOR_MAX_TOTAL_CHARGE_USD is set to "" (cost-unlimited)', async () => {
            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '';

            // Set pricing info via env vars (as if coming from platform)
            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
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
            });
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({});

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            const chargeResult = await Actor.charge({
                eventName: 'foobar',
                count: 4,
            });

            expect(chargeResult.chargedCount).toBe(4);
            expect(chargeResult.eventChargeLimitReached).toBe(false);
        });

        test('should overcharge by one item via pushData when budget is exhausted', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '1.5',
                pricingInfo: {
                    'some-event': {
                        eventTitle: 'Some Event',
                        eventPriceUsd: 1.0,
                    },
                    'another-event': {
                        eventTitle: 'Another Event',
                        eventPriceUsd: 1.0,
                    },
                },
            });

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            // Mock the API client charge method
            const chargeSpy = vitest.fn().mockResolvedValue(undefined);
            vitest.spyOn(Actor.apifyClient, 'run').mockReturnValue({
                charge: chargeSpy,
            } as any);

            // Exhaust most of the budget (events cost $1 each)
            const result1 = await Actor.charge({
                eventName: 'some-event',
                count: 1,
            }); // Costs $1, leaving $0.5
            expect(result1.chargedCount).toBe(1);
            expect(chargeSpy).toHaveBeenCalledTimes(1);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'some-event',
                count: 1,
            });

            chargeSpy.mockClear();

            // Now try to push 10 items - budget only allows 0 more events at $1 each
            // pushData should overcharge by 1 item so the platform detects the overspend
            const result = await Actor.pushData(
                Array(10).fill({ hello: 'world' }),
                'another-event',
            );

            // The API should be called with the overcharge of 1 event
            expect(chargeSpy).toHaveBeenCalledTimes(1);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'another-event',
                count: 1,
            });

            expect(result).toBeDefined();
            expect(result!.chargedCount).toBe(1);
            expect(result!.eventChargeLimitReached).toBe(true);

            // Verify exactly 1 item was pushed (the overcharge item)
            const dataset = await Actor.openDataset();
            const items = await dataset.getData();
            expect(items.items).toHaveLength(1);
        });

        test('should overcharge by one item via pushData when budget starts fully depleted', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.10',
                pricingInfo: {
                    'my-event': {
                        eventTitle: 'My Event',
                        eventPriceUsd: 0.1,
                    },
                },
                // Budget is already fully used up
                chargedEventCounts: { 'my-event': 1 },
            });

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            const chargeSpy = vitest.fn().mockResolvedValue(undefined);
            vitest.spyOn(Actor.apifyClient, 'run').mockReturnValue({
                charge: chargeSpy,
            } as any);

            const result = await Actor.pushData(
                [{ a: 1 }, { b: 2 }, { c: 3 }],
                'my-event',
            );

            // Budget is fully depleted → pushData overcharges by 1 item
            expect(result).toBeDefined();
            expect(result!.chargedCount).toBe(1);
            expect(result!.eventChargeLimitReached).toBe(true);

            expect(chargeSpy).toHaveBeenCalledTimes(1);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'my-event',
                count: 1,
            });

            const dataset = await Actor.openDataset();
            const items = await dataset.getData();
            expect(items.items).toHaveLength(1);
        });

        test('should verify charge API call with count=0 vs count>0', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '10.0',
                pricingInfo: {
                    'test-event': {
                        eventTitle: 'Test Event',
                        eventPriceUsd: 1.0,
                    },
                },
            });

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            // Mock the API client charge method
            const chargeSpy = vitest.fn().mockResolvedValue(undefined);
            vitest.spyOn(Actor.apifyClient, 'run').mockReturnValue({
                charge: chargeSpy,
            } as any);

            // Call charge with count=0 - this should NOT call the API
            const result1 = await Actor.charge({
                eventName: 'test-event',
                count: 0,
            });
            expect(chargeSpy).not.toHaveBeenCalled();
            expect(result1.chargedCount).toBe(0);

            // Call charge with count=1 - this SHOULD call the API
            const result2 = await Actor.charge({
                eventName: 'test-event',
                count: 1,
            });
            expect(chargeSpy).toHaveBeenCalledTimes(1);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'test-event',
                count: 1,
            });
            expect(result2.chargedCount).toBe(1);
        });

        describe('with an unknown event', () => {
            let loggerWarnSpy: MockInstance;

            beforeEach(() => {
                loggerWarnSpy = vitest
                    .spyOn(log, 'warning')
                    .mockImplementation(() => {});
            });

            test('when on the platform should ignore it and log a warning', async () => {
                setUpPlatformEnv({
                    maxTotalChargeUsd: '10.0',
                    pricingInfo: {},
                });

                await Actor.init();
                const chargingManager = Actor.getChargingManager();

                const chargeResult = await chargingManager.charge({
                    eventName: 'unknown-event',
                    count: 5,
                });

                expect(chargeResult).toStrictEqual({
                    chargedCount: 5,
                    eventChargeLimitReached: false,
                    chargeableWithinLimit: {},
                });
                expect(loggerWarnSpy).toHaveBeenCalledWith(
                    "Attempting to charge for an unknown event 'unknown-event'",
                );
            });

            test('when running locally should pretend to charge it', async () => {
                setUpLocalTestEnv({ maxTotalChargeUsd: '10' });

                await Actor.init();
                const chargingManager = Actor.getChargingManager();

                const chargeResult = await chargingManager.charge({
                    eventName: 'unknown-event',
                    count: 3,
                });

                expect(chargeResult).toStrictEqual({
                    chargedCount: 3,
                    eventChargeLimitReached: false,
                    chargeableWithinLimit: {},
                });
                expect(loggerWarnSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe('calculateMaxEventChargeCountWithinLimit()', () => {
        test('should not return negative values when budget is overdrawn', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.00025',
                pricingInfo: {
                    event: {
                        eventTitle: 'Event',
                        eventPriceUsd: 0.0003,
                    },
                    'apify-actor-start': {
                        eventTitle: 'Actor start',
                        eventPriceUsd: 0.00005,
                    },
                },
                // Already charged 2 events worth $0.00035, which exceeds the $0.00025 budget
                chargedEventCounts: {
                    event: 1,
                    'apify-actor-start': 1,
                },
            });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const maxCount =
                chargingManager.calculateMaxEventChargeCountWithinLimit(
                    'event',
                );

            expect(maxCount).toBe(0);
        });

        test('should fallback to infinity for unknown event on the platform', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.00025',
                pricingInfo: {},
            });

            await Actor.init();
            const chargingManager = Actor.getChargingManager();

            const maxCount =
                chargingManager.calculateMaxEventChargeCountWithinLimit(
                    'unknown-event',
                );

            expect(maxCount).toBe(Infinity);
        });
    });

    describe('calculatePushDataLimits()', () => {
        test('should return all items when budget allows', async () => {
            setUpLocalTestEnv({ maxTotalChargeUsd: '10' });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }, { c: 3 }],
                eventName: 'test-event',
                isDefaultDataset: false,
            });

            expect(result.limitedItems).toHaveLength(3);
            expect(result.eventsToCharge).toEqual({ 'test-event': 3 });
        });

        test('should limit items when budget is insufficient', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.15',
                pricingInfo: {
                    'expensive-event': {
                        eventTitle: 'Expensive',
                        eventPriceUsd: 0.1,
                    },
                },
            });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }],
                eventName: 'expensive-event',
                isDefaultDataset: false,
            });

            // Budget allows 1 item ($0.15 / $0.1 = 1), 5 are requested → caps to 1 (no overcharge since budget is not fully depleted)
            expect(result.limitedItems).toHaveLength(1);
            expect(result.eventsToCharge).toEqual({ 'expensive-event': 1 });
        });

        test('should include synthetic event for default dataset', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '10',
                pricingInfo: {
                    'apify-default-dataset-item': {
                        eventTitle: 'Dataset Item',
                        eventPriceUsd: 0.01,
                    },
                },
            });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }],
                eventName: undefined,
                isDefaultDataset: true,
            });

            expect(result.limitedItems).toHaveLength(2);
            expect(result.eventsToCharge).toEqual({
                'apify-default-dataset-item': 2,
            });
        });

        test('should include both events when pushing to default dataset with explicit eventName', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '10',
                pricingInfo: {
                    'apify-default-dataset-item': {
                        eventTitle: 'Dataset Item',
                        eventPriceUsd: 0.01,
                    },
                    'custom-event': {
                        eventTitle: 'Custom',
                        eventPriceUsd: 0.05,
                    },
                },
            });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }],
                eventName: 'custom-event',
                isDefaultDataset: true,
            });

            expect(result.limitedItems).toHaveLength(2);
            expect(result.eventsToCharge).toEqual({
                'apify-default-dataset-item': 2,
                'custom-event': 2,
            });
        });

        test('should handle single item (non-array) input', async () => {
            setUpLocalTestEnv({ maxTotalChargeUsd: '10' });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: { single: 'item' },
                eventName: 'test-event',
                isDefaultDataset: false,
            });

            expect(result.limitedItems).toHaveLength(1);
            expect(result.limitedItems[0]).toEqual({ single: 'item' });
            expect(result.eventsToCharge).toEqual({ 'test-event': 1 });
        });

        test('should overcharge by one item when budget is exhausted', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.05',
                pricingInfo: {
                    'expensive-event': {
                        eventTitle: 'Expensive',
                        eventPriceUsd: 0.1,
                    },
                },
            });

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }],
                eventName: 'expensive-event',
                isDefaultDataset: false,
            });

            // Budget allows 0 items ($0.05 / $0.1 = 0), but 2 are requested → overcharge by 1
            expect(result.limitedItems).toHaveLength(1);
            expect(result.eventsToCharge).toEqual({ 'expensive-event': 1 });
        });

        test('should not charge for events when actor is not PPE', async () => {
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            await Actor.init();

            const chargingManager = Actor.getChargingManager();
            const result = chargingManager.calculatePushDataLimits({
                items: [{ a: 1 }, { b: 2 }, { c: 3 }],
                eventName: undefined,
                isDefaultDataset: true,
            });

            expect(result.limitedItems).toHaveLength(3);
            expect(result.eventsToCharge).toEqual({});
        });
    });

    describe('charge() with overdrawn budget', () => {
        test('should overcharge by one event when budget cannot cover the charge', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.00025',
                pricingInfo: {
                    event: {
                        eventTitle: 'Event',
                        eventPriceUsd: 0.0003,
                    },
                    'apify-actor-start': {
                        eventTitle: 'Actor start',
                        eventPriceUsd: 0.00005,
                    },
                },
                // Already charged actor-start, leaving only $0.0002 which is less than the event cost
                chargedEventCounts: {
                    event: 0,
                    'apify-actor-start': 1,
                },
            });

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            // Mock the API client charge method
            const chargeSpy = vitest.fn().mockResolvedValue(undefined);
            vitest.spyOn(Actor.apifyClient, 'run').mockReturnValue({
                charge: chargeSpy,
            } as any);

            // Try to charge - the budget doesn't allow another event,
            // but we deliberately overcharge by 1 so that the platform detects the overspend and terminates the run
            const chargeResult = await Actor.charge({
                eventName: 'event',
                count: 1,
            });
            expect(chargeResult.chargedCount).toBe(1);
            expect(chargeResult.eventChargeLimitReached).toBe(true);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'event',
                count: 1,
            });

            chargeSpy.mockClear();

            // After the overcharge, we're already strictly over budget - subsequent charges should not pile on
            const pushResult = await Actor.pushData(
                [{ hello: 'world' }],
                'event',
            );
            expect(pushResult!.chargedCount).toBe(0);
            expect(pushResult!.eventChargeLimitReached).toBe(true);
            expect(chargeSpy).not.toHaveBeenCalled();
        });
    });

    describe('charge() overcharge behavior', () => {
        test('should overcharge by exactly 1 event when count exceeds remaining budget', async () => {
            setUpLocalTestEnv({ maxTotalChargeUsd: '3' });

            await Actor.init();

            // Budget is $3, events cost $1 each locally → max 3 events
            // Charge 2 events first to leave room for only 1 more
            const result1 = await Actor.charge({
                eventName: 'test-event',
                count: 2,
            });
            expect(result1.chargedCount).toBe(2);

            // Now only 1 event fits in the budget, but we ask for 5
            // Should overcharge to maxEventChargeCount + 1 = 1 + 1 = 2
            const result2 = await Actor.charge({
                eventName: 'test-event',
                count: 5,
            });
            expect(result2.chargedCount).toBe(2);
            expect(result2.eventChargeLimitReached).toBe(true);
        });

        test('should not overcharge when the requested count fits within budget', async () => {
            setUpLocalTestEnv({ maxTotalChargeUsd: '5' });

            await Actor.init();

            // Budget is $5, events cost $1 each locally → max 5 events
            const result = await Actor.charge({
                eventName: 'test-event',
                count: 3,
            });
            expect(result.chargedCount).toBe(3);
            expect(result.eventChargeLimitReached).toBe(false);
        });

        test('should overcharge by 1 when budget allows zero events', async () => {
            // In local test mode, all events cost $1 each, so a $0.5 budget means 0 events fit
            setUpLocalTestEnv({ maxTotalChargeUsd: '0.5' });

            await Actor.init();

            // Budget is $0.5, events cost $1 each → maxEventChargeCount = 0
            // Requesting count=1 exceeds the limit, so we overcharge: 0 + 1 = 1
            const result = await Actor.charge({
                eventName: 'test-event',
                count: 1,
            });
            expect(result.chargedCount).toBe(1);
            expect(result.eventChargeLimitReached).toBe(true);
        });

        test('should not overcharge when count exactly equals remaining budget', async () => {
            setUpLocalTestEnv({ maxTotalChargeUsd: '3' });

            await Actor.init();

            // Budget is $3, events cost $1 each → exactly 3 events fit
            const result = await Actor.charge({
                eventName: 'test-event',
                count: 3,
            });
            expect(result.chargedCount).toBe(3);
            expect(result.eventChargeLimitReached).toBe(true); // limit is now reached
        });

        test('should overcharge on the platform so the run gets terminated', async () => {
            setUpPlatformEnv({
                maxTotalChargeUsd: '0.20',
                pricingInfo: {
                    task: {
                        eventTitle: 'Task',
                        eventPriceUsd: 0.1,
                    },
                },
                // Already charged 2 tasks = $0.20, budget fully used
                chargedEventCounts: { task: 2 },
            });

            await Actor.init();
            localStorageEmulator.reapplyStorageClient();

            const chargeSpy = vitest.fn().mockResolvedValue(undefined);
            vitest.spyOn(Actor.apifyClient, 'run').mockReturnValue({
                charge: chargeSpy,
            } as any);

            // Budget is fully exhausted, but we try to charge 1 more
            // Should overcharge: 0 + 1 = 1 event charged
            const result = await Actor.charge({
                eventName: 'task',
                count: 1,
            });
            expect(result.chargedCount).toBe(1);
            expect(result.eventChargeLimitReached).toBe(true);
            expect(chargeSpy).toHaveBeenCalledWith({
                eventName: 'task',
                count: 1,
            });
        });
    });
});
