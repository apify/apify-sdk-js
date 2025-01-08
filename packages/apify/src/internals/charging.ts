import log from '@apify/log';
import { Dataset, KeyValueStore } from '@crawlee/core';
import { ApifyClient } from 'apify-client';

import { Configuration } from '../configuration.js';

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

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

            if (this.isPayPerEvent) {
                Object.entries(run.pricingInfo.pricingPerEvent.actorChargeEvents).forEach(([eventName, eventPricing]) => {
                    this.pricingInfo[eventName] = {
                        price: eventPricing.eventPriceUsd,
                        title: eventPricing.eventTitle,
                    };
                });
            }

            // TODO load charged event counts
            // TODO load maxTotalChargeUsd
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
            };
        }

        // TODO check against maxTotalChargeUsd
        if (this.chargingState === undefined || this.chargingLogDataset === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        if (this.isAtHome) {
            await this.apifyClient.run(this.actorRunId!).charge({ eventName, count });
        }

        const timestamp = new Date().toISOString();

        const pricingInfo = this.pricingInfo[eventName] ?? {
            price: 0,
            title: 'Unknown event',
        };

        this.chargingState[eventName] ??= { chargeCount: 0, totalChargedAmount: 0 };
        this.chargingState[eventName].chargeCount += count;
        this.chargingState[eventName].totalChargedAmount += count * pricingInfo.price;

        const totalCharged = Object.values(this.chargingState).map(({ totalChargedAmount }) => totalChargedAmount).reduce((sum, inc) => sum + inc, 0);

        for (let i = 0; i < count; i++) {
            await this.chargingLogDataset.pushData({
                eventName,
                eventTitle: pricingInfo.title,
                eventPriceUsd: pricingInfo.price,
                timestamp,
            });
        }

        return { eventChargeLimitReached: totalCharged >= this.maxTotalChargeUsd };
    }

    async getChargedEventCount(eventName: string): Promise<number> {
        if (this.chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.chargingState[eventName]?.chargeCount ?? 0;
    }
}

export interface ChargeOptions {
    eventName: string;
    count?: number;
}

export interface ChargeResult {
    eventChargeLimitReached: boolean;
}
