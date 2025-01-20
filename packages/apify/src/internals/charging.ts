import log from '@apify/log';
import { Dataset, KeyValueStore } from '@crawlee/core';
import { ApifyClient } from 'apify-client';

import { Configuration } from '../configuration.js';

/**
 * Handles pay-per-event charging.
 *
 * @internal
 */
export class ChargingManager {
    public readonly LOCAL_CHARGING_LOG_DATASET_NAME = 'charging_log';
    public readonly PLATFORM_CHARGING_LOG_DATASET_ID_KEY = 'CHARGING_LOG_DATASET_ID';

    private maxTotalChargeUsd: number;
    private isAtHome: boolean;
    private actorRunId: string | undefined;
    private pricingModel: string | undefined = undefined;
    private purgeChargingLogDataset: boolean;
    private notPpeWarningPrinted = false;

    private pricingInfo: Record<string, {price: number; title: string}> = {};
    private chargingState: Record<string, ChargingStateItem> | undefined = undefined;
    private chargingLogDataset: Dataset | undefined;

    private apifyClient: ApifyClient;

    constructor(configuration: Configuration, apifyClient: ApifyClient) {
        this.maxTotalChargeUsd = configuration.get('maxTotalChargeUsd') ?? Infinity;
        this.isAtHome = configuration.get('isAtHome');
        this.actorRunId = configuration.get('actorRunId');
        this.purgeChargingLogDataset = configuration.get('purgeOnStart');

        if (configuration.get('testPayPerEvent') === true) {
            if (this.isAtHome) {
                throw new Error('Using the ACTOR_TEST_PAY_PER_EVENT environment variable is only supported in a local development environment');
            }

            this.pricingModel = 'PAY_PER_EVENT';
        }

        this.apifyClient = apifyClient;
    }

    private get isPayPerEvent() {
        return this.pricingModel === 'PAY_PER_EVENT';
    }

    /**
     * Initialize the ChargingManager by loading pricing information and charging state via Apify API.
     */
    async init(): Promise<void> {
        this.chargingState = {};

        // Retrieve pricing information
        if (this.isAtHome) {
            const run = (await this.apifyClient.run(this.actorRunId!).get())!;
            this.pricingModel = run.pricingInfo?.pricingModel;

            // Load per-event pricing information
            if (run.pricingInfo?.pricingModel === 'PAY_PER_EVENT') {
                for (const [eventName, eventPricing] of Object.entries(run.pricingInfo.pricingPerEvent.actorChargeEvents)) {
                    this.pricingInfo[eventName] = {
                        price: eventPricing.eventPriceUsd,
                        title: eventPricing.eventTitle,
                    };
                }

                this.maxTotalChargeUsd = run.options.maxTotalChargeUsd ?? this.maxTotalChargeUsd;
            }

            // Load charged event counts
            for (const [eventName, chargeCount] of Object.entries(run.chargedEventCounts ?? {})) {
                this.chargingState[eventName] = {
                    chargeCount,
                    totalChargedAmount: chargeCount * (this.pricingInfo[eventName]?.price ?? 0),
                };
            }
        }

        if (this.isPayPerEvent) {
            // Set up charging log dataset
            if (this.isAtHome) {
                const datasetId = await (async () => {
                    const defaultStore = await KeyValueStore.open();

                    const storedDatasetId = await defaultStore.getValue<string>(this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY);
                    if (storedDatasetId !== null) {
                        return storedDatasetId;
                    }

                    const dataset = await this.apifyClient.datasets().getOrCreate();
                    await defaultStore.setValue(this.PLATFORM_CHARGING_LOG_DATASET_ID_KEY, dataset.id);
                    return dataset.id;
                })();

                this.chargingLogDataset = await Dataset.open(datasetId);
            } else {
                if (this.purgeChargingLogDataset) {
                    const dataset = await Dataset.open(this.LOCAL_CHARGING_LOG_DATASET_NAME);
                    await dataset.drop();
                }

                this.chargingLogDataset = await Dataset.open(this.LOCAL_CHARGING_LOG_DATASET_NAME);
            }
        }
    }

    getPricingInfo(): ActorPricingInfo {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return {
            pricingModel: this.pricingModel,
            isPayPerEvent: this.isPayPerEvent,
            perEventPrices: Object.fromEntries(
                Object.entries(this.pricingInfo).map(([eventName, { price }]) => [eventName, price]),
            ),
        };
    }

    /**
     * Charge for a specified number of events - sub-operations of the Actor.
     *
     * @param options The name of the event to charge for and the number of events to be charged.
     */
    async charge({ eventName, count = 1 }: ChargeOptions): Promise<ChargeResult> {
        const calculateChargeableWithinLimit = () => Object.fromEntries(
            Object.keys(this.pricingInfo).map(
                (name) => [name, this.calculateMaxEventChargeCountWithinLimit(name)],
            ),
        );

        if (!this.isPayPerEvent) {
            if (!this.notPpeWarningPrinted) {
                log.warning('Ignored attempt to charge for an event - the Actor does not use the pay-per-event pricing');
                this.notPpeWarningPrinted = true;
            }

            return {
                eventChargeLimitReached: false,
                chargedCount: 0,
                chargeableWithinLimit: calculateChargeableWithinLimit(),
            };
        }

        if (this.chargingState === undefined || this.chargingLogDataset === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        /* START OF CRITICAL SECTION - no awaits here */
        const chargedCount = Math.min(count, this.calculateMaxEventChargeCountWithinLimit(eventName));

        if (chargedCount === 0) {
            return {
                eventChargeLimitReached: true,
                chargedCount: 0,
                chargeableWithinLimit: calculateChargeableWithinLimit(),
            };
        }

        const pricingInfo = this.pricingInfo[eventName] ?? {
            price: 0,
            title: 'Unknown event',
        };

        this.chargingState[eventName] ??= { chargeCount: 0, totalChargedAmount: 0 };
        this.chargingState[eventName].chargeCount += chargedCount;
        this.chargingState[eventName].totalChargedAmount += chargedCount * pricingInfo.price;

        /* END OF CRITICAL SECTION */

        if (this.isAtHome) {
            if (this.pricingInfo[eventName] !== undefined) {
                await this.apifyClient.run(this.actorRunId!).charge({ eventName, count: chargedCount });
            } else {
                log.warning(`Attempting to charge for an unknown event '${eventName}'`);
            }
        }

        const timestamp = new Date().toISOString();

        for (let i = 0; i < chargedCount; i++) {
            await this.chargingLogDataset.pushData({
                eventName,
                eventTitle: pricingInfo.title,
                eventPriceUsd: pricingInfo.price,
                timestamp,
            });
        }

        if (chargedCount < count) {
            log.info(`Charging ${count} instances of ${eventName} event would exceed maxTotalChargeUsd - only ${chargedCount} events were charged`);
        }

        return {
            eventChargeLimitReached: this.calculateMaxEventChargeCountWithinLimit(eventName) <= 0,
            chargedCount,
            chargeableWithinLimit: calculateChargeableWithinLimit(),
        };
    }

    /**
     * Get the maximum amount of money that the Actor is allowed to charge.
     */
    getChargedEventCount(eventName: string): number {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.chargingState[eventName]?.chargeCount ?? 0;
    }

    /**
     * Get the number of events with given name that the Actor has charged for so far.
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

        const result = Object.values(this.chargingState).map(({ totalChargedAmount }) => totalChargedAmount).reduce((sum, inc) => sum + inc, 0);

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

        if (!this.pricingInfo[eventName]) {
            return Infinity;
        }

        // First round as Math.floor(4.9999999999999999) will incorrectly return 5
        return Math.floor(
            Number(
                ((this.maxTotalChargeUsd - this.calculateTotalChargedAmount())
                 / (this.pricingInfo[eventName].price)).toFixed(4),
            ),
        );
    }
}

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

export interface ChargeOptions {
    eventName: string;
    count?: number;
}

export interface ChargeResult {
    eventChargeLimitReached: boolean;
    chargedCount: number;
    chargeableWithinLimit: Record<string, number>;
}

export interface ActorPricingInfo {
    pricingModel: string | undefined;
    isPayPerEvent: boolean;
    perEventPrices: Record<string, number>;
}
