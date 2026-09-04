import { AsyncLocalStorage } from 'node:async_hooks';

import { Dataset, KeyValueStore } from '@crawlee/core';
import type { ActorRunPricingInfo, ApifyClient } from 'apify-client';

import log from '@apify/log';

import type { Configuration } from './configuration.js';

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

export const DEFAULT_DATASET_ITEM_EVENT = 'apify-default-dataset-item';

export interface ChargeOptions {
    /**
     * The name of the event type to charge for.
     * This should match one of the event names defined in the Actor's pricing configuration.
     */
    eventName: string;

    /**
     * The number of events to charge for.
     * @default 1
     */
    count?: number;
}

export interface ChargeResult {
    /**
     * Whether the charge limit was reached for the specific event type that was being charged.
     *
     * When `true`, it means no more events of this specific type can be charged without exceeding
     * the total budget limit. This does NOT mean the limit for all events was reached - other
     * event types might still be chargeable.
     *
     * For more flexible budget checking across all event types, use the `chargeableWithinLimit` field.
     */
    eventChargeLimitReached: boolean;

    /**
     * The actual number of events that were successfully charged.
     *
     * This may be less than the requested count if charging the full amount would exceed
     * the maximum total charge limit (`maxTotalChargeUsd`).
     */
    chargedCount: number;

    /**
     * A record showing how many events of each type can still be charged within the budget limit.
     *
     * The keys are event names and the values are the maximum number of events of that type
     * that can still be charged without exceeding `maxTotalChargeUsd`. This provides a comprehensive
     * view of remaining budget capacity across all event types.
     *
     * Use this field when you need flexible budget management across multiple event types,
     * rather than relying on `eventChargeLimitReached` which only applies to the current event.
     */
    chargeableWithinLimit: Record<string, number>;
}

export interface ActorPricingInfo {
    pricingModel?: ActorRunPricingInfo['pricingModel'];
    maxTotalChargeUsd: number;
    isPayPerEvent: boolean;
    perEventPrices: Record<string, number>;
}

/**
 * A FIFO mutex that a critical section may re-enter from a nested call — the charge lock is taken by
 * `Actor.pushData()` and again, one level down, by the dataset backend it pushes through.
 */
class ReentrantAsyncLock {
    private tail: Promise<unknown> = Promise.resolve();
    private readonly held = new AsyncLocalStorage<true>();

    async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
        if (this.held.getStore()) {
            return await fn();
        }

        const run = this.tail.then(async () => this.held.run(true, fn));
        // Keep the chain alive even when the critical section throws.
        this.tail = run.catch(() => {});
        return await run;
    }
}

/**
 * Handles pay-per-event charging.
 */
export class ChargingManager {
    private readonly LOCAL_CHARGING_LOG_DATASET_NAME = 'charging_log';
    private readonly PLATFORM_CHARGING_LOG_DATASET_ID_KEY = 'CHARGING_LOG_DATASET_ID';

    private maxTotalChargeUsd: number;
    private isAtHome: boolean;
    private actorRunId?: string;
    private pricingModel?: ActorRunPricingInfo['pricingModel'];
    private purgeChargingLogDataset: boolean;
    private useChargingLogDataset: boolean;
    private notPpeWarningPrinted = false;

    private pricingInfo: Record<string, { price: number; title: string }> = {};
    private chargingState?: Record<string, ChargingStateItem>;
    private chargingLogDataset?: Dataset;

    private readonly chargeLock = new ReentrantAsyncLock();

    private apifyClient: ApifyClient;

    constructor(
        private configuration: Configuration,
        apifyClient: ApifyClient,
    ) {
        this.maxTotalChargeUsd = configuration.maxTotalChargeUsd || Infinity; // convert `0` to `Infinity` in case the value is an empty string
        this.isAtHome = configuration.isAtHome;
        this.actorRunId = configuration.actorRunId;
        this.purgeChargingLogDataset = configuration.purgeOnStart;
        this.useChargingLogDataset = configuration.useChargingLogDataset;

        this.apifyClient = apifyClient;
    }

    /** A shortcut - true if the Actor runs with the pay-per-event pricing model. */
    get isPayPerEvent(): boolean {
        return this.pricingModel === 'PAY_PER_EVENT';
    }

    private async fetchPricingInfo(): Promise<{
        pricingInfo?: ActorRunPricingInfo;
        chargedEventCounts?: Record<string, number>;
        maxTotalChargeUsd: number;
    }> {
        if (this.configuration.actorPricingInfo && this.configuration.chargedEventCounts) {
            return {
                pricingInfo: JSON.parse(this.configuration.actorPricingInfo) as ActorRunPricingInfo,
                chargedEventCounts: JSON.parse(this.configuration.chargedEventCounts) as Record<string, number>,
                maxTotalChargeUsd: this.configuration.maxTotalChargeUsd || Infinity,
            };
        }

        if (this.isAtHome) {
            if (this.actorRunId === undefined) {
                throw new Error('Actor run ID not found even though the Actor is running on Apify');
            }

            const run = await this.apifyClient.run(this.actorRunId).get();
            if (run === undefined) {
                throw new Error('Actor run not found');
            }

            return {
                pricingInfo: run.pricingInfo,
                chargedEventCounts: run.chargedEventCounts,
                maxTotalChargeUsd: run.options.maxTotalChargeUsd || Infinity,
            };
        }

        return {
            pricingInfo: undefined,
            chargedEventCounts: {},
            maxTotalChargeUsd: this.configuration.maxTotalChargeUsd || Infinity,
        };
    }

    /**
     * Initialize the ChargingManager by loading pricing information and charging state via Apify API.
     */
    async init(): Promise<void> {
        // Validate config - it may have changed since the instantiation
        if (this.useChargingLogDataset && this.isAtHome) {
            throw new Error(
                'Using the ACTOR_USE_CHARGING_LOG_DATASET environment variable is only supported in a local development environment',
            );
        }

        if (this.configuration.testPayPerEvent) {
            if (this.isAtHome) {
                throw new Error(
                    'Using the ACTOR_TEST_PAY_PER_EVENT environment variable is only supported in a local development environment',
                );
            }
        }

        // Retrieve pricing information
        const { pricingInfo, chargedEventCounts, maxTotalChargeUsd } = await this.fetchPricingInfo();

        if (this.configuration.testPayPerEvent) {
            this.pricingModel = 'PAY_PER_EVENT';
        } else {
            this.pricingModel ??= pricingInfo?.pricingModel;
        }

        // Load per-event pricing information
        if (pricingInfo?.pricingModel === 'PAY_PER_EVENT') {
            for (const [eventName, eventPricing] of Object.entries(pricingInfo.pricingPerEvent.actorChargeEvents)) {
                this.pricingInfo[eventName] = {
                    price: eventPricing.eventPriceUsd,
                    title: eventPricing.eventTitle,
                };
            }

            this.maxTotalChargeUsd = maxTotalChargeUsd;
        }

        this.chargingState = {};

        for (const [eventName, chargeCount] of Object.entries(chargedEventCounts ?? {})) {
            this.chargingState[eventName] = {
                chargeCount,
                totalChargedAmount: chargeCount * (this.pricingInfo[eventName]?.price ?? 0),
            };
        }

        if (!this.isPayPerEvent || !this.useChargingLogDataset) {
            return;
        }

        // Set up charging log dataset
        if (this.isAtHome) {
            const datasetId = await this.ensureChargingLogDatasetOnPlatform();

            this.chargingLogDataset = await Dataset.open(datasetId);
        } else {
            if (this.purgeChargingLogDataset) {
                const dataset = await Dataset.open(this.LOCAL_CHARGING_LOG_DATASET_NAME);
                await dataset.drop();
            }

            this.chargingLogDataset = await Dataset.open(this.LOCAL_CHARGING_LOG_DATASET_NAME);
        }
    }

    private async ensureChargingLogDatasetOnPlatform(): Promise<string> {
        const defaultStore = await KeyValueStore.open();

        const storedDatasetId = await defaultStore.getValue<string>(this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY);
        if (storedDatasetId !== null) {
            return storedDatasetId;
        }

        const dataset = await this.apifyClient.datasets().getOrCreate();
        await defaultStore.setValue(this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY, dataset.id);
        return dataset.id;
    }

    /**
     * Whether {@link ChargingManager.init} has run. All charging operations (including
     * {@link ChargingManager.getPricingInfo}) require an initialized manager.
     */
    get isInitialized(): boolean {
        return this.chargingState !== undefined;
    }

    /**
     * Get information about the pricing for this Actor.
     */
    getPricingInfo(): ActorPricingInfo {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return {
            pricingModel: this.pricingModel,
            isPayPerEvent: this.isPayPerEvent,
            maxTotalChargeUsd: this.maxTotalChargeUsd,
            perEventPrices: Object.fromEntries(
                Object.entries(this.pricingInfo).map(([eventName, { price }]) => [eventName, price]),
            ),
        };
    }

    /**
     * Charge for a specified number of events - sub-operations of the Actor.
     *
     * This method attempts to charge for the specified number of events, but may charge fewer
     * if doing so would exceed the total budget limit (`maxTotalChargeUsd`).
     *
     * **Important:** When using the `count` parameter to charge for multiple events at once,
     * be aware that the charge may be partially fulfilled, i.e. `chargedCount` can be less
     * than the requested `count`. Always check the returned `chargedCount` to know how many
     * events were actually charged, and only perform that much work. If your work is
     * meaningfully divisible into individual units, prefer calling `charge()` once per unit
     * rather than batching via `count` — this gives finer control over budget consumption
     * and avoids situations where more work is requested than the budget allows.
     *
     * @param options The name of the event to charge for and the number of events to be charged.
     */
    async charge({ eventName, count = 1 }: ChargeOptions): Promise<ChargeResult> {
        if (!this.isPayPerEvent) {
            if (!this.notPpeWarningPrinted) {
                log.warning(
                    'Ignored attempt to charge for an event - the Actor does not use the pay-per-event pricing',
                );
                this.notPpeWarningPrinted = true;
            }

            return {
                eventChargeLimitReached: false,
                chargedCount: 0,
                chargeableWithinLimit: this.calculateChargeableWithinLimit(),
            };
        }

        const { chargingState } = this;

        if (chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return await this.withChargeLock(async () => {
            const maxEventChargeCount = this.calculateMaxEventChargeCountWithinLimit(eventName);

            const chargedCount = (() => {
                if (count <= maxEventChargeCount) {
                    return count;
                }

                // If the caller tries to charge more than the budget allows, overcharge by one event
                // so that the Actor is detected by the platform and terminated.
                // But don't do this if already strictly over the budget - no point piling on charges.
                if (this.calculateTotalChargedAmount() <= this.maxTotalChargeUsd) {
                    return maxEventChargeCount + 1;
                }

                return 0;
            })();

            if (chargedCount === 0) {
                return {
                    eventChargeLimitReached: count > 0, // Only true if user wanted to charge but couldn't
                    chargedCount: 0,
                    chargeableWithinLimit: this.calculateChargeableWithinLimit(),
                };
            }

            const pricingInfo = this.pricingInfo[eventName] ?? {
                price: this.isAtHome ? 0 : 1, // Use a nonzero price for local development so that the maximum budget can be reached
                title: `Unknown event '${eventName}'`,
            };

            chargingState[eventName] ??= {
                chargeCount: 0,
                totalChargedAmount: 0,
            };
            chargingState[eventName].chargeCount += chargedCount;
            chargingState[eventName].totalChargedAmount += chargedCount * pricingInfo.price;

            if (this.isAtHome) {
                if (eventName.startsWith('apify-')) {
                    // Synthetic events (e.g. apify-default-dataset-item) are tracked locally only,
                    // the platform handles them automatically based on dataset writes.
                } else if (this.pricingInfo[eventName] !== undefined) {
                    await this.apifyClient.run(this.actorRunId!).charge({ eventName, count: chargedCount });
                } else {
                    log.warning(`Attempting to charge for an unknown event '${eventName}'`);
                }
            }

            if (this.chargingLogDataset !== undefined) {
                await this.chargingLogDataset.pushData({
                    eventName,
                    eventTitle: pricingInfo.title,
                    eventPriceUsd: pricingInfo.price,
                    chargedCount,
                    timestamp: new Date().toISOString(),
                });
            }

            if (chargedCount < count) {
                const subject = count === 1 ? 'instance' : 'instances';
                log.info(
                    `Charging ${count} ${subject} of '${eventName}' event would exceed maxTotalChargeUsd - only ${chargedCount} events were charged`,
                );
            }

            return {
                eventChargeLimitReached: this.isEventChargeLimitReached(eventName),
                chargedCount,
                chargeableWithinLimit: this.calculateChargeableWithinLimit(),
            };
        });
    }

    /**
     * Get the number of events with given name that the Actor has charged for so far.
     */
    getChargedEventCount(eventName: string): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.chargingState[eventName]?.chargeCount ?? 0;
    }

    /**
     * Get the maximum amount of money that the Actor is allowed to charge.
     */
    getMaxTotalChargeUsd(): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.maxTotalChargeUsd;
    }

    private calculateTotalChargedAmount(): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const result = Object.values(this.chargingState)
            .map(({ totalChargedAmount }) => totalChargedAmount)
            .reduce((sum, inc) => sum + inc, 0);

        // Keeping float precision issues at bay
        return Number(result.toFixed(6));
    }

    /**
     * How many events of a given type can still be charged for before reaching the limit;
     * If the event is not registered, returns Infinity (free of charge)
     */
    calculateMaxEventChargeCountWithinLimit(eventName: string): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const price = this.calculateEventPrice(eventName);

        if (!price) {
            return Infinity;
        }

        return this.calculateMaxChargesByPrice(price);
    }

    private calculateEventPrice(eventName: string): number | undefined {
        return this.isAtHome ? this.pricingInfo[eventName]?.price : 1; // Use a nonzero price for local development so that the maximum budget can be reached
    }

    private calculateMaxChargesByPrice(price: number): number {
        // The raw number of events allowed by the budget
        const unroundedResult = (this.maxTotalChargeUsd - this.calculateTotalChargedAmount()) / price;

        // First round as Math.floor(4.9999999999999999) will incorrectly return 5
        const roundedResult = Math.floor(Number(unroundedResult.toFixed(4)));

        return Math.max(0, roundedResult);
    }

    /**
     * Whether the remaining budget is insufficient to charge even a single event of the given type.
     * Always false when nothing is charged in the first place.
     */
    isEventChargeLimitReached(eventName: string): boolean {
        return this.isPayPerEvent && this.calculateMaxEventChargeCountWithinLimit(eventName) <= 0;
    }

    /**
     * How many events of each known type can still be charged within the limit.
     */
    calculateChargeableWithinLimit(): Record<string, number> {
        return Object.fromEntries(
            Object.keys(this.pricingInfo).map((name) => [name, this.calculateMaxEventChargeCountWithinLimit(name)]),
        );
    }

    /**
     * How many of `itemsCount` items may be pushed to a dataset within the remaining budget.
     *
     * The budget is measured against the combined per-item price of the explicit `eventName` and - on
     * the default dataset - the synthetic {@link DEFAULT_DATASET_ITEM_EVENT}, since pushing one item
     * charges both.
     *
     * When the budget cannot cover a single item, one item is still allowed through so that the
     * resulting overcharge makes the platform terminate the run - unless the run is already strictly
     * over budget, in which case nothing is allowed through.
     */
    calculatePushDataLimit(
        itemsCount: number,
        { eventName, isDefaultDataset = false }: { eventName?: string; isDefaultDataset?: boolean } = {},
    ): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        if (!this.isPayPerEvent || itemsCount === 0) {
            return itemsCount;
        }

        const itemPrice =
            (eventName === undefined ? 0 : (this.calculateEventPrice(eventName) ?? 0)) +
            (isDefaultDataset ? (this.calculateEventPrice(DEFAULT_DATASET_ITEM_EVENT) ?? 0) : 0);

        if (itemPrice === 0) {
            return itemsCount;
        }

        const maxChargedCount = this.calculateMaxChargesByPrice(itemPrice);

        if (maxChargedCount >= itemsCount) {
            return itemsCount;
        }

        if (maxChargedCount > 0) {
            return maxChargedCount;
        }

        return this.calculateTotalChargedAmount() <= this.maxTotalChargeUsd ? 1 : 0;
    }

    /**
     * Runs `fn` under the charge lock, which keeps a limit reservation and the charge that acts on it
     * atomic against concurrent pushes. Only pay-per-event runs charge anything, so for every other
     * run there is nothing to serialize and the lock is skipped.
     *
     * @internal
     */
    async withChargeLock<T>(fn: () => Promise<T>): Promise<T> {
        return this.isPayPerEvent ? await this.chargeLock.runExclusive(fn) : await fn();
    }
}
