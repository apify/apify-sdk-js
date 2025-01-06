import { Dataset } from 'apify';
import { ApifyClient } from 'apify-client';

import { Configuration } from '../configuration.js';

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

export class ChargingManager {
    private maxTotalChargeUsd: number;
    private isAtHome: boolean;
    private actorRunId: string | undefined;

    private pricingInfo: Record<string, {price: number, title: string}> = {};
    private chargingState: Record<string, ChargingStateItem> | undefined = undefined;
    private chargingLogDataset: Dataset | undefined;

    private apifyClient: ApifyClient;

    constructor(configuration: Configuration, apifyClient: ApifyClient) {
        this.maxTotalChargeUsd = configuration.get('maxTotalChargeUsd') ?? Infinity;
        this.isAtHome = configuration.get('isAtHome');
        this.actorRunId = configuration.get('actorRunId');

        this.apifyClient = apifyClient;
    }

    async init(): Promise<void> {
        if (this.isAtHome) {
            const run = (await this.apifyClient.run(this.actorRunId!).get())!;
            if (run.pricingInfo?.pricingModel === 'PAY_PER_EVENT') {
                Object.entries(run.pricingInfo.pricingPerEvent.actorChargeEvents).forEach(([eventName, eventPricing]) => {
                    this.pricingInfo[eventName] = {
                        price: eventPricing.eventPriceUsd,
                        title: eventPricing.eventTitle,
                    };
                });
            }
        }

        // TODO set up dataset
    }

    async charge({ eventName, count = 1 }: ChargeOptions): Promise<ChargeResult> {
        if (this.chargingState === undefined || this.chargingLogDataset === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        if (this.isAtHome) {
            await this.apifyClient.run(this.actorRunId!).charge({ eventName, count });
        }

        const timestamp = new Date().toISOString();

        const pricingInfo = this.pricingInfo[eventName] ?? {
            price: 0,
            title: "Unknown event",
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
