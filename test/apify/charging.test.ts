import { Actor } from 'apify';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import log from '@apify/log';

import { mergeChargeResults } from '../../src/index.js';
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

        test('should not call API when budget is exhausted during pushData', async () => {
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

            // Now try to push data - we can't afford even 1 more event
            const result = await Actor.pushData(
                Array(10).fill({ hello: 'world' }),
                'another-event',
            );

            // The API should NOT be called when count=0
            expect(chargeSpy).not.toHaveBeenCalled();

            // Correctly returns result with chargedCount=0
            expect(result).toBeDefined();
            expect(result!.chargedCount).toBe(0);
            // Note: eventChargeLimitReached is false because count=0 was passed to charge()
            // This is by design - see charging.ts line 318
            expect(result!.eventChargeLimitReached).toBe(false);

            // Verify no items were pushed (the important part)
            const dataset = await Actor.openDataset();
            const items = await dataset.getData();
            expect(items.items).toHaveLength(0);
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

            expect(result.limitedItems).toHaveLength(1); // Only $0.15 budget, $0.1 per item
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

        test('should return empty array when budget is exhausted', async () => {
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

            expect(result.limitedItems).toHaveLength(0);
            expect(result.eventsToCharge).toEqual({ 'expensive-event': 0 });
        });
    });

    describe('charge() with overdrawn budget', () => {
        test('should handle charging when budget is already overdrawn', async () => {
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

            // Try to charge - the budget doesn't allow another event
            const chargeResult = await Actor.charge({
                eventName: 'event',
                count: 1,
            });
            expect(chargeResult.chargedCount).toBe(0);

            // Try to push data - the budget doesn't allow this either
            const pushResult = await Actor.pushData(
                [{ hello: 'world' }],
                'event',
            );
            expect(pushResult!.chargedCount).toBe(0);

            // The API should NOT have been called in either case
            expect(chargeSpy).not.toHaveBeenCalled();
        });
    });
});
