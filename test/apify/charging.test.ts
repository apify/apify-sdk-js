import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import log from '@apify/log';

import { Actor } from '../../src/index.js';
import { MemoryStorageEmulator } from '../MemoryStorageEmulator.js';

describe('ChargingManager', () => {
    const localStorageEmulator = new MemoryStorageEmulator();

    beforeEach(async () => {
        await localStorageEmulator.init();

        // Set up environment for pay-per-event testing
        process.env.ACTOR_TEST_PAY_PER_EVENT = '1';
        process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '10';
    });

    afterEach(async () => {
        await Actor.exit({ exit: false });

        // @ts-expect-error
        Actor._instance = undefined; // eslint-disable-line no-underscore-dangle

        await localStorageEmulator.destroy();

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
            // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '1.5';
            process.env.APIFY_IS_AT_HOME = '1';
            process.env.APIFY_TOKEN = 'this-wont-work';
            process.env.ACTOR_RUN_ID = 'test-run-id';

            // Set pricing info via env vars (as if coming from platform)
            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: {
                    actorChargeEvents: {
                        'some-event': {
                            eventTitle: 'Some Event',
                            eventPriceUsd: 1.0,
                        },
                        'another-event': {
                            eventTitle: 'Another Event',
                            eventPriceUsd: 1.0,
                        },
                    },
                },
            });
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({});

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

            delete process.env.APIFY_IS_AT_HOME;
            delete process.env.ACTOR_RUN_ID;
        });

        test('should verify charge API call with count=0 vs count>0', async () => {
            // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '10.0';
            process.env.APIFY_IS_AT_HOME = '1';
            process.env.APIFY_TOKEN = 'this-wont-work';
            process.env.ACTOR_RUN_ID = 'test-run-id';

            // Set pricing info via env vars
            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: {
                    actorChargeEvents: {
                        'test-event': {
                            eventTitle: 'Test Event',
                            eventPriceUsd: 1.0,
                        },
                    },
                },
            });
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({});

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
                // Arrange

                // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
                delete process.env.ACTOR_TEST_PAY_PER_EVENT;

                process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '10.0';
                process.env.APIFY_IS_AT_HOME = '1';
                process.env.APIFY_TOKEN = 'this-wont-work';
                process.env.ACTOR_RUN_ID = 'test-run-id';

                process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                    pricingModel: 'PAY_PER_EVENT',
                    pricingPerEvent: { actorChargeEvents: {} },
                });
                process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify(
                    {},
                );

                await Actor.init();
                const chargingManager = Actor.getChargingManager();

                // Act
                const chargeResult = await chargingManager.charge({
                    eventName: 'unknown-event',
                    count: 5,
                });

                // Assert
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
                process.env.ACTOR_TEST_PAY_PER_EVENT = '1';

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
            // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '0.00025';

            // Set pricing info and already charged events that overdraw the budget
            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: {
                    actorChargeEvents: {
                        event: {
                            eventTitle: 'Event',
                            eventPriceUsd: 0.0003,
                        },
                        'apify-actor-start': {
                            eventTitle: 'Actor start',
                            eventPriceUsd: 0.00005,
                        },
                    },
                },
            });
            // Already charged 2 events worth $0.00035, which exceeds the $0.00025 budget
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({
                event: 1,
                'apify-actor-start': 1,
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
            // Arrange

            // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '0.00025';
            process.env.APIFY_IS_AT_HOME = '1';
            process.env.APIFY_TOKEN = 'this-wont-work';
            process.env.ACTOR_RUN_ID = 'test-run-id';

            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: { actorChargeEvents: {} },
            });
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({});

            await Actor.init();
            const chargingManager = Actor.getChargingManager();

            // Act
            const maxCount =
                chargingManager.calculateMaxEventChargeCountWithinLimit(
                    'unknown-event',
                );

            // Assert
            expect(maxCount).toBe(Infinity);
        });
    });

    describe('charge() with overdrawn budget', () => {
        test('should handle charging when budget is already overdrawn', async () => {
            // Don't use ACTOR_TEST_PAY_PER_EVENT when simulating Apify platform
            delete process.env.ACTOR_TEST_PAY_PER_EVENT;

            process.env.ACTOR_MAX_TOTAL_CHARGE_USD = '0.00025';
            process.env.APIFY_IS_AT_HOME = '1';
            process.env.APIFY_TOKEN = 'this-wont-work';
            process.env.ACTOR_RUN_ID = 'test-run-id';

            // Set pricing info
            process.env.APIFY_ACTOR_PRICING_INFO = JSON.stringify({
                pricingModel: 'PAY_PER_EVENT',
                pricingPerEvent: {
                    actorChargeEvents: {
                        event: {
                            eventTitle: 'Event',
                            eventPriceUsd: 0.0003,
                        },
                        'apify-actor-start': {
                            eventTitle: 'Actor start',
                            eventPriceUsd: 0.00005,
                        },
                    },
                },
            });
            // Already charged actor-start, leaving only $0.0002 which is less than the event cost
            process.env.APIFY_CHARGED_ACTOR_EVENT_COUNTS = JSON.stringify({
                event: 0,
                'apify-actor-start': 1,
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
