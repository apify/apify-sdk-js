import { Dataset, KeyValueStore } from '@crawlee/core';
import type { Actor as ClientActor, ActorRun, ActorRunPricingInfo, ApifyClient } from 'apify-client';

import { META_ORIGINS } from '@apify/consts';
import log from '@apify/log';

import type { Configuration } from './configuration.js';

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

export const DEFAULT_DATASET_ITEM_EVENT = 'apify-default-dataset-item';

/**
 * The pricing history includes scheduled future changes, so the effective entry is the latest one
 * with `startedAt <= now`, not the last one.
 *
 * Resolved once at init on purpose. A change kicking in mid-run only affects local event titles and
 * "unknown event" warnings; the platform prices each charge from its own current pricing anyway.
 */
function getEffectivePricingInfo(pricingInfos: ActorRunPricingInfo[], now = new Date()) {
    return pricingInfos
        .filter((info) => new Date(info.startedAt) <= now)
        .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
        .at(-1);
}

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

    /**
     * An idempotency key to prevent multiple unintended charges.
     */
    idempotencyKey?: string;

    /**
     * ID of the Server Actor request being charged, taken from the `X-Actor-Request-ID` header of the incoming request.
     * Required for multi-tenant Server Actor runs, where it maps the charge to the caller's account instead of the account that started the run.
     * Ignored elsewhere.
     */
    requestId?: string;
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

export function mergeChargeResults(a: ChargeResult, b: ChargeResult): ChargeResult {
    return {
        eventChargeLimitReached: a.eventChargeLimitReached || b.eventChargeLimitReached,
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
    private readonly PLATFORM_CHARGING_LOG_DATASET_ID_KEY = 'CHARGING_LOG_DATASET_ID';

    private maxTotalChargeUsd: number;
    private isAtHome: boolean;
    private actorRunId?: string;
    private pricingModel?: ActorRunPricingInfo['pricingModel'];
    /** Multi-tenant Server Actor runs carry no pricing snapshot; pricing comes from the Actor and the platform prices per caller. */
    private multiTenant = false;
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
        private getCurrentRun: () => Promise<ActorRun | undefined>,
        private getCurrentActor: () => Promise<ClientActor | undefined>,
    ) {
        this.maxTotalChargeUsd = configuration.get('maxTotalChargeUsd') || Infinity; // convert `0` to `Infinity` in case the value is an empty string
        this.isAtHome = configuration.get('isAtHome');
        this.actorRunId = configuration.get('actorRunId');
        this.purgeChargingLogDataset = configuration.get('purgeOnStart');
        this.useChargingLogDataset = configuration.get('useChargingLogDataset');

        this.apifyClient = apifyClient;
    }

    private get isPayPerEvent() {
        return this.pricingModel === 'PAY_PER_EVENT';
    }

    /** True in a multi-tenant Server Actor run, which charges per request with `requestId` only. */
    get isMultiTenant(): boolean {
        return this.multiTenant;
    }

    private async fetchPricingInfo(): Promise<{
        pricingInfo?: ActorRunPricingInfo;
        chargedEventCounts?: Record<string, number>;
        maxTotalChargeUsd: number;
    }> {
        if (this.configuration.get('actorPricingInfo') && this.configuration.get('chargedEventCounts')) {
            const pricingInfo = JSON.parse(this.configuration.get('actorPricingInfo')) as ActorRunPricingInfo;

            // Multi-tenant runs get an empty snapshot (`{}`); only the run tells them apart from free Server Actor runs.
            const isMultiTenantCandidate =
                pricingInfo.pricingModel === undefined &&
                this.isAtHome &&
                this.configuration.get('metaOrigin') === META_ORIGINS.STANDBY;

            if (!isMultiTenantCandidate) {
                return {
                    pricingInfo,
                    chargedEventCounts: JSON.parse(this.configuration.get('chargedEventCounts')) as Record<
                        string,
                        number
                    >,
                    maxTotalChargeUsd: this.configuration.get('maxTotalChargeUsd') || Infinity,
                };
            }
        }

        if (this.isAtHome) {
            if (this.actorRunId === undefined) {
                throw new Error('Actor run ID not found even though the Actor is running on Apify');
            }

            const run = await this.getCurrentRun();
            if (run === undefined) {
                throw new Error('Actor run not found');
            }

            if (run.standby?.deployment.startsWith('MULTI_TENANT')) {
                const actor = await this.getCurrentActor();
                if (actor === undefined) {
                    throw new Error('Actor not found');
                }

                this.multiTenant = true;

                return {
                    pricingInfo: getEffectivePricingInfo(actor.pricingInfos ?? []),
                    chargedEventCounts: {}, // the run's counts mix all callers
                    maxTotalChargeUsd: Infinity, // the platform prices and limits per caller
                };
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
            maxTotalChargeUsd: this.configuration.get('maxTotalChargeUsd') || Infinity,
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
        const { pricingInfo, chargedEventCounts, maxTotalChargeUsd } = await this.fetchPricingInfo();

        if (this.configuration.get('testPayPerEvent')) {
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
     * **Note:** `idempotencyKey` is scoped to the whole run, not to `requestId`. In a multi-tenant
     * Server Actor run, a key reused across requests charges only the first caller, so it must
     * be globally unique (e.g. derived from `requestId`).
     *
     * @param options The name of the event to charge for and the number of events to be charged.
     */
    async charge({ eventName, count = 1, idempotencyKey, requestId }: ChargeOptions): Promise<ChargeResult> {
        const calculateChargeableWithinLimit = () =>
            Object.fromEntries(
                Object.keys(this.pricingInfo).map((name) => [name, this.calculateMaxEventChargeCountWithinLimit(name)]),
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

        if (this.multiTenant) {
            return await this.chargeServerRequest(eventName, count, idempotencyKey, requestId);
        }

        // Match the Python SDK: a non-positive count never reaches the platform and never
        // mutates local charge state (a negative count would otherwise decrement the budget).
        if (count <= 0) {
            return {
                eventChargeLimitReached: false,
                chargedCount: 0,
                chargeableWithinLimit: calculateChargeableWithinLimit(),
            };
        }

        /* START OF CRITICAL SECTION - no awaits here */
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
        this.chargingState[eventName].totalChargedAmount += chargedCount * pricingInfo.price;

        /* END OF CRITICAL SECTION */

        if (this.isAtHome) {
            if (eventName.startsWith('apify-')) {
                // Synthetic events (e.g. apify-default-dataset-item) are tracked locally only,
                // the platform handles them automatically based on dataset writes.
            } else if (this.pricingInfo[eventName] !== undefined) {
                await this.apifyClient
                    .run(this.actorRunId!)
                    .charge({ eventName, count: chargedCount, idempotencyKey, requestId });
            } else {
                log.warning(`Attempting to charge for an unknown event '${eventName}'`);
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
                requestId,
            });
        }

        if (chargedCount < count) {
            const subject = count === 1 ? 'instance' : 'instances';
            log.info(
                `Charging ${count} ${subject} of '${eventName}' event would exceed maxTotalChargeUsd - only ${chargedCount} events were charged`,
            );
        }

        return {
            eventChargeLimitReached: this.calculateMaxEventChargeCountWithinLimit(eventName) <= 0,
            chargedCount,
            chargeableWithinLimit: calculateChargeableWithinLimit(),
        };
    }

    /**
     * The platform prices, limits and deduplicates each caller's charges itself, so nothing is counted or enforced locally.
     */
    private async chargeServerRequest(
        eventName: string,
        count: number,
        idempotencyKey: string | undefined,
        requestId: string | undefined,
    ): Promise<ChargeResult> {
        if (eventName.startsWith('apify-')) {
            throw new Error(`Cannot charge for synthetic event '${eventName}' in a multi-tenant Server Actor run`);
        }

        if (!requestId) {
            throw new Error(
                `Charging for '${eventName}' in a multi-tenant Server Actor run requires \`requestId\` - pass the value of the incoming request's X-Actor-Request-ID header to Actor.charge().`,
            );
        }

        let chargedCount = 0;

        if (count <= 0) {
            // Nothing to charge.
        } else if (this.pricingInfo[eventName] === undefined) {
            log.warning(`Attempting to charge for an unknown event '${eventName}'`);
        } else {
            await this.apifyClient.run(this.actorRunId!).charge({ eventName, count, idempotencyKey, requestId });
            chargedCount = count;
        }

        return {
            eventChargeLimitReached: false,
            chargedCount,
            chargeableWithinLimit: Object.fromEntries(
                Object.keys(this.pricingInfo).map((name) => [name, this.calculateMaxEventChargeCountWithinLimit(name)]),
            ),
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
        const unroundedResult = (this.maxTotalChargeUsd - this.calculateTotalChargedAmount()) / price;

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

        // Multi-tenant runs charge per request only, so dataset writes charge nothing there.
        if (!this.isPayPerEvent || this.multiTenant) {
            return {
                limitedItems: itemsArray,
                eventsToCharge: {},
            };
        }

        const itemPrice =
            ((eventName !== undefined ? this.calculateEventPrice(eventName) : undefined) ?? 0) +
            ((isDefaultDataset ? this.calculateEventPrice(DEFAULT_DATASET_ITEM_EVENT) : undefined) ?? 0);

        const maxChargedCount = itemPrice > 0 ? this.calculateMaxChargesByPrice(itemPrice) : Infinity;

        const itemsToKeep = (() => {
            if (maxChargedCount >= itemsArray.length) {
                return itemsArray.length;
            }

            // If the caller tries to push items even though the limit is depleted, overcharge by one
            // so that the Platform terminates the run.
            // But don't do this if already strictly over the budget - no point piling on charges.
            if (
                itemsArray.length > 0 &&
                maxChargedCount === 0 &&
                this.calculateTotalChargedAmount() <= this.maxTotalChargeUsd
            ) {
                return 1;
            }

            return maxChargedCount;
        })();

        const eventsToCharge: Record<string, number> = {};
        if (eventName !== undefined && itemsToKeep > 0) {
            eventsToCharge[eventName] = itemsToKeep;
        }
        if (isDefaultDataset && itemsToKeep > 0) {
            eventsToCharge[DEFAULT_DATASET_ITEM_EVENT] = itemsToKeep;
        }

        return {
            limitedItems: itemsToKeep >= itemsArray.length ? itemsArray : itemsArray.slice(0, itemsToKeep),
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
    const { limitedItems, eventsToCharge } = chargingManager.calculatePushDataLimits({
        items,
        eventName,
        isDefaultDataset,
    });

    if (limitedItems.length > 0) {
        // Preserve original call shape for single items
        await pushFn(Array.isArray(items) ? limitedItems : (limitedItems[0] as T | T[]));
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

        // Merge all charge results so that eventChargeLimitReached reflects
        // whether ANY of the charged events hit their limit.
        return Object.values(results).reduce(mergeChargeResults);
    }

    const itemsArray = Array.isArray(items) ? items : [items];
    const allItemsTrimmed = itemsArray.length > 0 && limitedItems.length === 0;

    return {
        eventChargeLimitReached: allItemsTrimmed,
        chargedCount: 0,
        chargeableWithinLimit: {},
    };
}
