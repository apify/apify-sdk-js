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

    private pricePerEvent: Record<string, number> = {};
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
            // TODO read event prices
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

        this.chargingState[eventName] ??= { chargeCount: 0, totalChargedAmount: 0 };
        this.chargingState[eventName].chargeCount += count;
        this.chargingState[eventName].totalChargedAmount += count * (this.pricePerEvent[eventName] ?? 0);

        const totalCharged = Object.values(this.chargingState).map(({ totalChargedAmount }) => totalChargedAmount).reduce((sum, inc) => sum + inc, 0);

        for (let i = 0; i < count; i++) {
            await this.chargingLogDataset.pushData({ eventName });
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
