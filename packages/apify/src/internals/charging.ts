import log from '@apify/log';
import { Dataset, KeyValueStore } from '@crawlee/core';
import { ApifyClient } from 'apify-client';

import { Configuration } from '../configuration.js';

export class ChargingManager {
    public readonly LOCAL_CHARGING_LOG_DATASET_NAME = 'charging_log';
    public readonly PLATFORM_CHARGING_LOG_DATASET_ID_KEY = 'CHARGING_LOG_DATASET_ID';

    private maxTotalChargeUsd: number;
    private isAtHome: boolean;
    private actorRunId: string | undefined;
    private purgeChargingLogDataset: boolean;

    private isPayPerEvent = false;
    private pricingInfo: Record<string, {price: number; title: string}> = {};
    private chargingState: Record<string, ChargingStateItem> | undefined = undefined;
    private chargingLogDataset: Dataset | undefined;

    private apifyClient: ApifyClient;

    constructor(configuration: Configuration, apifyClient: ApifyClient) {
        this.maxTotalChargeUsd = configuration.get('maxTotalChargeUsd') ?? Infinity;
        this.isAtHome = configuration.get('isAtHome');
        this.actorRunId = configuration.get('actorRunId');
        this.purgeChargingLogDataset = configuration.get('purgeOnStart');

        this.apifyClient = apifyClient;
    }

    async init(): Promise<void> {
        this.chargingState = {};

        // Retrieve pricing information
        if (this.isAtHome) {
            const run = (await this.apifyClient.run(this.actorRunId!).get())!;
            this.isPayPerEvent = run.pricingInfo?.pricingModel === 'PAY_PER_EVENT';

            // Load per-event pricing information
            if (this.isPayPerEvent) {
                for (const [eventName, eventPricing] of run.pricingInfo.pricingPerEvent.actorChargeEvents) {
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

    async charge({ eventName, count = 1 }: ChargeOptions): Promise<ChargeResult> {
        if (!this.isPayPerEvent) {
            log.info('Ignored attempt to charge for an event - the Actor does not use the pay-per-event pricing');
            return {
                eventChargeLimitReached: false,
                chargedCount: 0,
            };
        }

        if (this.chargingState === undefined || this.chargingLogDataset === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const chargedCount = Math.min(count, this.calculateEventChargeCountTillLimit(eventName));

        if (chargedCount === 0) {
            return {
                eventChargeLimitReached: true,
                chargedCount: 0,
            };
        }

        if (this.isAtHome) {
            if (this.pricingInfo[eventName] !== undefined) {
                await this.apifyClient.run(this.actorRunId!).charge({ eventName, count: chargedCount });
            } else {
                log.warning(`Attempting to charge for an unknown event '${eventName}'`);
            }
        }

        const timestamp = new Date().toISOString();

        const pricingInfo = this.pricingInfo[eventName] ?? {
            price: 0,
            title: 'Unknown event',
        };

        this.chargingState[eventName] ??= { chargeCount: 0, totalChargedAmount: 0 };
        this.chargingState[eventName].chargeCount += count;
        this.chargingState[eventName].totalChargedAmount += count * pricingInfo.price;

        for (let i = 0; i < chargedCount; i++) {
            await this.chargingLogDataset.pushData({
                eventName,
                eventTitle: pricingInfo.title,
                eventPriceUsd: pricingInfo.price,
                timestamp,
            });
        }

        return {
            eventChargeLimitReached: this.calculateTotalChargedAmount() >= this.maxTotalChargeUsd,
            chargedCount,
        };
    }

    async getChargedEventCount(eventName: string): Promise<number> {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.chargingState[eventName]?.chargeCount ?? 0;
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
    private calculateEventChargeCountTillLimit(eventName: string): number {
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
}
