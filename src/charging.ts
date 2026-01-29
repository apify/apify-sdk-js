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

export function mergeChargeResults(
    a: ChargeResult,
    b: ChargeResult,
): ChargeResult {
    return {
        eventChargeLimitReached:
            a.eventChargeLimitReached || b.eventChargeLimitReached,
        chargedCount: a.chargedCount + b.chargedCount,
        chargeableWithinLimit: Object.fromEntries(
            Object.entries(a.chargeableWithinLimit).map(([key, oldValue]) => [
                key,
                Math.min(oldValue, b.chargeableWithinLimit[key]),
            ]),
        ),
    };
}

/**
 * Handles pay-per-event charging.
 */
export class ChargingManager {
    private readonly LOCAL_CHARGING_LOG_DATASET_NAME = 'charging_log';
    private readonly PLATFORM_CHARGING_LOG_DATASET_ID_KEY =
        'CHARGING_LOG_DATASET_ID';

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

    private apifyClient: ApifyClient;

    constructor(
        private configuration: Configuration,
        apifyClient: ApifyClient,
    ) {
        this.maxTotalChargeUsd =
            configuration.get('maxTotalChargeUsd') || Infinity; // convert `0` to `Infinity` in case the value is an empty string
        this.isAtHome = configuration.get('isAtHome');
        this.actorRunId = configuration.get('actorRunId');
        this.purgeChargingLogDataset = configuration.get('purgeOnStart');
        this.useChargingLogDataset = configuration.get('useChargingLogDataset');

        this.apifyClient = apifyClient;
    }

    private get isPayPerEvent() {
        return this.pricingModel === 'PAY_PER_EVENT';
    }

    private async fetchPricingInfo(): Promise<{
        pricingInfo?: ActorRunPricingInfo;
        chargedEventCounts?: Record<string, number>;
        maxTotalChargeUsd: number;
    }> {
        if (
            this.configuration.get('actorPricingInfo') &&
            this.configuration.get('chargedEventCounts')
        ) {
            return {
                pricingInfo: JSON.parse(
                    this.configuration.get('actorPricingInfo'),
                ) as ActorRunPricingInfo,
                chargedEventCounts: JSON.parse(
                    this.configuration.get('chargedEventCounts'),
                ) as Record<string, number>,
                maxTotalChargeUsd:
                    this.configuration.get('maxTotalChargeUsd') || Infinity,
            };
        }

        if (this.isAtHome) {
            if (this.actorRunId === undefined) {
                throw new Error(
                    'Actor run ID not found even though the Actor is running on Apify',
                );
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
            maxTotalChargeUsd:
                this.configuration.get('maxTotalChargeUsd') || Infinity,
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

        if (this.configuration.get('testPayPerEvent')) {
            if (this.isAtHome) {
                throw new Error(
                    'Using the ACTOR_TEST_PAY_PER_EVENT environment variable is only supported in a local development environment',
                );
            }
        }

        // Retrieve pricing information
        const { pricingInfo, chargedEventCounts, maxTotalChargeUsd } =
            await this.fetchPricingInfo();

        if (this.configuration.get('testPayPerEvent')) {
            this.pricingModel = 'PAY_PER_EVENT';
        } else {
            this.pricingModel ??= pricingInfo?.pricingModel;
        }

        // Load per-event pricing information
        if (pricingInfo?.pricingModel === 'PAY_PER_EVENT') {
            for (const [eventName, eventPricing] of Object.entries(
                pricingInfo.pricingPerEvent.actorChargeEvents,
            )) {
                this.pricingInfo[eventName] = {
                    price: eventPricing.eventPriceUsd,
                    title: eventPricing.eventTitle,
                };
            }

            this.maxTotalChargeUsd = maxTotalChargeUsd;
        }

        this.chargingState = {};

        for (const [eventName, chargeCount] of Object.entries(
            chargedEventCounts ?? {},
        )) {
            this.chargingState[eventName] = {
                chargeCount,
                totalChargedAmount:
                    chargeCount * (this.pricingInfo[eventName]?.price ?? 0),
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
                const dataset = await Dataset.open(
                    this.LOCAL_CHARGING_LOG_DATASET_NAME,
                );
                await dataset.drop();
            }

            this.chargingLogDataset = await Dataset.open(
                this.LOCAL_CHARGING_LOG_DATASET_NAME,
            );
        }
    }

    private async ensureChargingLogDatasetOnPlatform(): Promise<string> {
        const defaultStore = await KeyValueStore.open();

        const storedDatasetId = await defaultStore.getValue<string>(
            this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY,
        );
        if (storedDatasetId !== null) {
            return storedDatasetId;
        }

        const dataset = await this.apifyClient.datasets().getOrCreate();
        await defaultStore.setValue(
            this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY,
            dataset.id,
        );
        return dataset.id;
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
                Object.entries(this.pricingInfo).map(
                    ([eventName, { price }]) => [eventName, price],
                ),
            ),
        };
    }

    /**
     * Charge for a specified number of events - sub-operations of the Actor.
     *
     * This method attempts to charge for the specified number of events, but may charge fewer
     * if doing so would exceed the total budget limit (`maxTotalChargeUsd`).
     *
     * @param options The name of the event to charge for and the number of events to be charged.
     */
    async charge({
        eventName,
        count = 1,
    }: ChargeOptions): Promise<ChargeResult> {
        const calculateChargeableWithinLimit = () =>
            Object.fromEntries(
                Object.keys(this.pricingInfo).map((name) => [
                    name,
                    this.calculateMaxEventChargeCountWithinLimit(name),
                ]),
            );

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
                chargeableWithinLimit: calculateChargeableWithinLimit(),
            };
        }

        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        /* START OF CRITICAL SECTION - no awaits here */
        const chargedCount = Math.min(
            count,
            this.calculateMaxEventChargeCountWithinLimit(eventName),
        );

        if (chargedCount === 0) {
            return {
                eventChargeLimitReached: count > 0, // Only true if user wanted to charge but couldn't
                chargedCount: 0,
                chargeableWithinLimit: calculateChargeableWithinLimit(),
            };
        }

        const pricingInfo = this.pricingInfo[eventName] ?? {
            price: this.isAtHome ? 0 : 1, // Use a nonzero price for local development so that the maximum budget can be reached
            title: `Unknown event '${eventName}'`,
        };

        this.chargingState[eventName] ??= {
            chargeCount: 0,
            totalChargedAmount: 0,
        };
        this.chargingState[eventName].chargeCount += chargedCount;
        this.chargingState[eventName].totalChargedAmount +=
            chargedCount * pricingInfo.price;

        /* END OF CRITICAL SECTION */

        if (this.isAtHome) {
            if (eventName.startsWith('apify-')) {
                // Synthetic events (e.g. apify-default-dataset-item) are tracked locally only,
                // the platform handles them automatically based on dataset writes.
            } else if (this.pricingInfo[eventName] !== undefined) {
                await this.apifyClient
                    .run(this.actorRunId!)
                    .charge({ eventName, count: chargedCount });
            } else {
                log.warning(
                    `Attempting to charge for an unknown event '${eventName}'`,
                );
            }
        }

        const timestamp = new Date().toISOString();

        if (this.chargingLogDataset !== undefined) {
            await this.chargingLogDataset.pushData({
                eventName,
                eventTitle: pricingInfo.title,
                eventPriceUsd: pricingInfo.price,
                chargedCount,
                timestamp,
            });
        }

        if (chargedCount < count) {
            const subject = count === 1 ? 'instance' : 'instances';
            log.info(
                `Charging ${count} ${subject} of '${eventName}' event would exceed maxTotalChargeUsd - only ${chargedCount} events were charged`,
            );
        }

        return {
            eventChargeLimitReached:
                this.calculateMaxEventChargeCountWithinLimit(eventName) <= 0,
            chargedCount,
            chargeableWithinLimit: calculateChargeableWithinLimit(),
        };
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
        const unroundedResult =
            (this.maxTotalChargeUsd - this.calculateTotalChargedAmount()) /
            price;

        // First round as Math.floor(4.9999999999999999) will incorrectly return 5
        const roundedResult = Math.floor(Number(unroundedResult.toFixed(4)));

        return Math.max(0, roundedResult);
    }

    /**
     * Helper to calculate how many items can be pushed within charging limits.
     * Returns the limited items and count to charge.
     */
    calculatePushDataLimits<T>({
        items,
        eventName,
        isDefaultDataset,
    }: {
        items: T | T[];
        eventName: string | undefined;
        isDefaultDataset: boolean;
    }): { limitedItems: T[]; eventsToCharge: Record<string, number> } {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const itemsArray = Array.isArray(items) ? items : [items];

        const itemPrice =
            ((eventName !== undefined
                ? this.calculateEventPrice(eventName)
                : undefined) ?? 0) +
            ((isDefaultDataset
                ? this.calculateEventPrice(DEFAULT_DATASET_ITEM_EVENT)
                : undefined) ?? 0);

        const maxChargedCount =
            itemPrice > 0
                ? this.calculateMaxChargesByPrice(itemPrice)
                : Infinity;

        const itemsToKeep = Math.min(itemsArray.length, maxChargedCount);

        const eventsToCharge: Record<string, number> = {};
        if (eventName !== undefined) {
            eventsToCharge[eventName] = itemsToKeep;
        }
        if (isDefaultDataset) {
            eventsToCharge[DEFAULT_DATASET_ITEM_EVENT] = itemsToKeep;
        }

        return {
            limitedItems:
                itemsToKeep >= itemsArray.length
                    ? itemsArray
                    : itemsArray.slice(0, itemsToKeep),
            eventsToCharge,
        };
    }
}

/**
 * Helper for PPE-aware pushing of data to the dataset.
 *
 * 1. Calculate limits based on budget
 * 2. Push limited items via the provided callback
 * 3. Charge for the events
 *
 * @internal
 */
export async function pushDataAndCharge<T>({
    chargingManager,
    items,
    eventName,
    isDefaultDataset,
    pushFn,
}: {
    chargingManager: ChargingManager;
    items: T | T[];
    eventName: string | undefined;
    isDefaultDataset: boolean;
    pushFn: (limitedItems: T | T[]) => Promise<void>;
}): Promise<ChargeResult> {
    const { limitedItems, eventsToCharge } =
        chargingManager.calculatePushDataLimits({
            items,
            eventName,
            isDefaultDataset,
        });

    if (limitedItems.length > 0) {
        // Preserve original call shape for single items
        await pushFn(
            Array.isArray(items) ? limitedItems : (limitedItems[0] as T | T[]),
        );
    }

    if (Object.keys(eventsToCharge).length > 0) {
        const results: Record<string, ChargeResult> = {};
        await Promise.all(
            Object.entries(eventsToCharge).map(async ([name, count]) => {
                results[name] = await chargingManager.charge({
                    eventName: name,
                    count,
                });
            }),
        );

        if (eventName !== undefined) {
            return results[eventName];
        }

        // Return synthetic event result when pushing to default dataset without explicit eventName.
        if (isDefaultDataset && results[DEFAULT_DATASET_ITEM_EVENT]) {
            return results[DEFAULT_DATASET_ITEM_EVENT];
        }
    }

    return {
        eventChargeLimitReached: false,
        chargedCount: 0,
        chargeableWithinLimit: {},
    };
}
