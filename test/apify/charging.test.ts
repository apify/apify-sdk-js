import { Actor } from '../../packages/apify/src/index.js';
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
        await localStorageEmulator.destroy();

        delete process.env.ACTOR_TEST_PAY_PER_EVENT;
        delete process.env.ACTOR_MAX_TOTAL_CHARGE_USD;
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
    });
});
