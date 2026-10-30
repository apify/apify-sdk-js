import { Dataset, KeyValueStore } from '@crawlee/core';
import type { ActorResource, ActorRunPricingInfo, ApifyClient, Run as ClientActorRun } from 'apify-client';

import log from '@apify/log';

import type { Configuration } from './configuration.js';
import { ReentrantAsyncLock } from './utils.js';

interface ChargingStateItem {
    chargeCount: number;
    totalChargedAmount: number;
}

interface IdempotentCharge {
    eventName: string;
    chargedCount: number;
    /** Timestamp in milliseconds after which the key is forgotten. */
    expiresAt: number;
}

/** How long a charge is remembered by its idempotency key - the same as the platform's own records. */
const IDEMPOTENCY_KEY_TTL_MILLIS = 3 * 60 * 1000;

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
     * A unique key preventing a retried operation from being charged for twice - e.g. a request handler rerun by a retry.
     * A repeat under the same key within three minutes is not sent to the API and reports the `chargedCount` of
     * the original call, or zero if it names a different event. Like the platform, the key is forgotten afterwards.
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

/**
 * Handles pay-per-event charging.
 */
export class ChargingManager {
    readonly #LOCAL_CHARGING_LOG_DATASET_NAME = 'charging_log';
    readonly #PLATFORM_CHARGING_LOG_DATASET_ID_KEY = 'CHARGING_LOG_DATASET_ID';

    #maxTotalChargeUsd: number;
    #isAtHome: boolean;
    #actorRunId?: string;
    #pricingModel?: ActorRunPricingInfo['pricingModel'];
    /** Multi-tenant Server Actor runs carry no pricing snapshot; pricing comes from the Actor and the platform prices per caller. */
    #isMultiTenant = false;
    #purgeChargingLogDataset: boolean;
    #useChargingLogDataset: boolean;
    #notPpeWarningPrinted = false;

    #pricingInfo: Record<string, { price: number; title: string }> = {};
    #chargingState?: Record<string, ChargingStateItem>;
    #chargingLogDataset?: Dataset;

    /** Charges made with an idempotency key, by key, in insertion (and therefore expiry) order. */
    readonly #idempotentCharges = new Map<string, IdempotentCharge>();

    readonly #chargeLock = new ReentrantAsyncLock();

    #apifyClient: ApifyClient;
    #configuration: Configuration;
    #getCurrentRun: () => Promise<ClientActorRun | undefined>;
    #getCurrentActor: () => Promise<ActorResource | undefined>;

    constructor(
        configuration: Configuration,
        apifyClient: ApifyClient,
        getCurrentRun: () => Promise<ClientActorRun | undefined>,
        getCurrentActor: () => Promise<ActorResource | undefined>,
    ) {
        this.#configuration = configuration;
        this.#maxTotalChargeUsd = configuration.maxTotalChargeUsd || Infinity; // convert `0` to `Infinity` in case the value is an empty string
        this.#isAtHome = configuration.isAtHome;
        this.#actorRunId = configuration.actorRunId;
        this.#purgeChargingLogDataset = configuration.purgeOnStart;
        this.#useChargingLogDataset = configuration.useChargingLogDataset;

        this.#apifyClient = apifyClient;
        this.#getCurrentRun = getCurrentRun;
        this.#getCurrentActor = getCurrentActor;
    }

    /** A shortcut - true if the Actor runs with the pay-per-event pricing model. */
    get isPayPerEvent(): boolean {
        return this.#pricingModel === 'PAY_PER_EVENT';
    }

    private async fetchPricingInfo(): Promise<{
        pricingInfo?: ActorRunPricingInfo;
        chargedEventCounts?: Record<string, number>;
        maxTotalChargeUsd: number;
    }> {
        if (this.#configuration.actorPricingInfo && this.#configuration.chargedEventCounts) {
            return {
                pricingInfo: JSON.parse(this.#configuration.actorPricingInfo) as ActorRunPricingInfo,
                chargedEventCounts: JSON.parse(this.#configuration.chargedEventCounts) as Record<string, number>,
                maxTotalChargeUsd: this.#configuration.maxTotalChargeUsd || Infinity,
            };
        }

        if (this.#isAtHome) {
            if (this.#actorRunId === undefined) {
                throw new Error('Actor run ID not found even though the Actor is running on Apify');
            }

            const run = await this.#getCurrentRun();
            if (run === undefined) {
                throw new Error('Actor run not found');
            }

            if (run.standby?.deployment.startsWith('MULTI_TENANT')) {
                const actor = await this.#getCurrentActor();
                if (actor === undefined) {
                    throw new Error('Actor not found');
                }

                this.#isMultiTenant = true;

                return {
                    pricingInfo: getEffectivePricingInfo(actor.pricingInfos ?? []),
                    chargedEventCounts: run.chargedEventCounts,
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
            maxTotalChargeUsd: this.#configuration.maxTotalChargeUsd || Infinity,
        };
    }

    /**
     * Initialize the ChargingManager by loading pricing information and charging state via Apify API.
     */
    async init(): Promise<void> {
        // Validate config - it may have changed since the instantiation
        if (this.#useChargingLogDataset && this.#isAtHome) {
            throw new Error(
                'Using the ACTOR_USE_CHARGING_LOG_DATASET environment variable is only supported in a local development environment',
            );
        }

        if (this.#configuration.testPayPerEvent) {
            if (this.#isAtHome) {
                throw new Error(
                    'Using the ACTOR_TEST_PAY_PER_EVENT environment variable is only supported in a local development environment',
                );
            }
        }

        // Retrieve pricing information
        const { pricingInfo, chargedEventCounts, maxTotalChargeUsd } = await this.fetchPricingInfo();

        if (this.#configuration.testPayPerEvent) {
            this.#pricingModel = 'PAY_PER_EVENT';
        } else {
            this.#pricingModel ??= pricingInfo?.pricingModel;
        }

        // Load per-event pricing information
        if (pricingInfo?.pricingModel === 'PAY_PER_EVENT') {
            for (const [eventName, eventPricing] of Object.entries(
                pricingInfo.pricingPerEvent.actorChargeEvents ?? {},
            )) {
                this.#pricingInfo[eventName] = {
                    price: eventPricing.eventPriceUsd ?? 0,
                    title: eventPricing.eventTitle,
                };
            }

            this.#maxTotalChargeUsd = maxTotalChargeUsd;
        }

        this.#chargingState = {};

        for (const [eventName, chargeCount] of Object.entries(chargedEventCounts ?? {})) {
            this.#chargingState[eventName] = {
                chargeCount,
                totalChargedAmount: chargeCount * (this.#pricingInfo[eventName]?.price ?? 0),
            };
        }

        if (!this.isPayPerEvent || !this.#useChargingLogDataset) {
            return;
        }

        // Set up charging log dataset
        if (this.#isAtHome) {
            const datasetId = await this.ensureChargingLogDatasetOnPlatform();

            this.#chargingLogDataset = await Dataset.open(datasetId);
        } else {
            if (this.#purgeChargingLogDataset) {
                const dataset = await Dataset.open(this.#LOCAL_CHARGING_LOG_DATASET_NAME);
                await dataset.drop();
            }

            this.#chargingLogDataset = await Dataset.open(this.#LOCAL_CHARGING_LOG_DATASET_NAME);
        }
    }

    private async ensureChargingLogDatasetOnPlatform(): Promise<string> {
        const defaultStore = await KeyValueStore.open();

        const storedDatasetId = await defaultStore.getValue<string>(this.#PLATFORM_CHARGING_LOG_DATASET_ID_KEY);
        if (storedDatasetId !== null) {
            return storedDatasetId;
        }

        const dataset = await this.#apifyClient.datasets().getOrCreate();
        await defaultStore.setValue(this.#PLATFORM_CHARGING_LOG_DATASET_ID_KEY, dataset.id);
        return dataset.id;
    }

    /**
     * Whether {@link ChargingManager.init} has run. All charging operations (including
     * {@link ChargingManager.getPricingInfo}) require an initialized manager.
     */
    get isInitialized(): boolean {
        return this.#chargingState !== undefined;
    }

    /**
     * Get information about the pricing for this Actor.
     */
    getPricingInfo(): ActorPricingInfo {
        if (this.#chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return {
            pricingModel: this.#pricingModel,
            isPayPerEvent: this.isPayPerEvent,
            maxTotalChargeUsd: this.#maxTotalChargeUsd,
            perEventPrices: Object.fromEntries(
                Object.entries(this.#pricingInfo).map(([eventName, { price }]) => [eventName, price]),
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
    async charge({ eventName, count = 1, idempotencyKey, requestId }: ChargeOptions): Promise<ChargeResult> {
        if (idempotencyKey !== undefined && idempotencyKey.trim() === '') {
            throw new Error('idempotencyKey must not be blank');
        }

        if (this.#isMultiTenant && requestId === undefined && !eventName.startsWith('apify-')) {
            throw new Error(
                `Charging for '${eventName}' in a multi-tenant Server Actor run requires \`requestId\` - pass the value of the incoming request's X-Actor-Request-ID header to Actor.charge().`,
            );
        }

        if (!this.isPayPerEvent) {
            if (!this.#notPpeWarningPrinted) {
                log.warning(
                    'Ignored attempt to charge for an event - the Actor does not use the pay-per-event pricing',
                );
                this.#notPpeWarningPrinted = true;
            }

            return {
                eventChargeLimitReached: false,
                chargedCount: 0,
                chargeableWithinLimit: this.calculateChargeableWithinLimit(),
            };
        }

        const chargingState = this.#chargingState;

        if (chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return await this.withChargeLock(async () => {
            // A repeat the platform would discard is resolved here too - counting it would inflate the charging state
            // and make the run hit `maxTotalChargeUsd` early. The key alone decides, as on the platform.
            const previous = idempotencyKey === undefined ? undefined : this.getIdempotentCharge(idempotencyKey);

            if (previous !== undefined) {
                let repeatedCount: number;

                if (previous.eventName === eventName) {
                    log.debug(`Skipped a repeated charge of event '${eventName}' under key '${idempotencyKey}'.`);
                    repeatedCount = previous.chargedCount;
                } else {
                    log.warning(
                        `Idempotency key '${idempotencyKey}' was already used to charge for event '${previous.eventName}', so the charge of event '${eventName}' is skipped.`,
                    );
                    repeatedCount = 0;
                }

                return {
                    eventChargeLimitReached: this.isEventChargeLimitReached(eventName),
                    chargedCount: repeatedCount,
                    chargeableWithinLimit: this.calculateChargeableWithinLimit(),
                };
            }

            const maxEventChargeCount = this.calculateMaxEventChargeCountWithinLimit(eventName);

            const chargedCount = (() => {
                if (count <= maxEventChargeCount) {
                    return count;
                }

                // If the caller tries to charge more than the budget allows, overcharge by one event
                // so that the Actor is detected by the platform and terminated.
                // But don't do this if already strictly over the budget - no point piling on charges.
                if (this.calculateTotalChargedAmount() <= this.#maxTotalChargeUsd) {
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

            const pricingInfo = this.#pricingInfo[eventName] ?? {
                price: this.#isAtHome ? 0 : 1, // Use a nonzero price for local development so that the maximum budget can be reached
                title: `Unknown event '${eventName}'`,
            };

            if (this.#isAtHome) {
                if (eventName.startsWith('apify-')) {
                    // Synthetic events (e.g. apify-default-dataset-item) are tracked locally only,
                    // the platform handles them automatically based on dataset writes.
                } else if (this.#pricingInfo[eventName] !== undefined) {
                    await this.#apifyClient.run(this.#actorRunId!).charge({
                        eventName,
                        count: chargedCount,
                        idempotencyKey,
                        requestId,
                    });
                } else {
                    log.warning(`Attempting to charge for an unknown event '${eventName}'`);
                }
            }

            // Count the charge only after the API call succeeds, so a failed call retried under the same key
            // is counted once.
            chargingState[eventName] ??= {
                chargeCount: 0,
                totalChargedAmount: 0,
            };
            chargingState[eventName].chargeCount += chargedCount;
            chargingState[eventName].totalChargedAmount += chargedCount * pricingInfo.price;

            // Remember the key for every charge that was counted, including events the API never receives,
            // such as synthetic ones - those are counted locally and a repeat would count them twice.
            if (idempotencyKey !== undefined) {
                this.setIdempotentCharge(idempotencyKey, { eventName, chargedCount });
            }

            if (this.#chargingLogDataset !== undefined) {
                await this.#chargingLogDataset.pushData({
                    eventName,
                    eventTitle: pricingInfo.title,
                    eventPriceUsd: pricingInfo.price,
                    chargedCount,
                    idempotencyKey,
                    requestId,
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

    private getIdempotentCharge(idempotencyKey: string): IdempotentCharge | undefined {
        const charge = this.#idempotentCharges.get(idempotencyKey);

        if (charge !== undefined && charge.expiresAt <= Date.now()) {
            this.#idempotentCharges.delete(idempotencyKey);
            return undefined;
        }

        return charge;
    }

    private setIdempotentCharge(idempotencyKey: string, charge: Omit<IdempotentCharge, 'expiresAt'>): void {
        const now = Date.now();

        // Entries expire in insertion order, so pruning can stop at the first live one.
        for (const [key, { expiresAt }] of this.#idempotentCharges) {
            if (expiresAt > now) {
                break;
            }

            this.#idempotentCharges.delete(key);
        }

        this.#idempotentCharges.set(idempotencyKey, { ...charge, expiresAt: now + IDEMPOTENCY_KEY_TTL_MILLIS });
    }

    /**
     * Get the number of events with given name that the Actor has charged for so far.
     */
    getChargedEventCount(eventName: string): number {
        if (this.#chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.#chargingState[eventName]?.chargeCount ?? 0;
    }

    /**
     * Get the maximum amount of money that the Actor is allowed to charge.
     */
    getMaxTotalChargeUsd(): number {
        if (this.#chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        return this.#maxTotalChargeUsd;
    }

    private calculateTotalChargedAmount(): number {
        if (this.#chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const result = Object.values(this.#chargingState)
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
        if (this.#chargingState === undefined) {
            throw new Error('ChargingManager is not initialized');
        }

        const price = this.calculateEventPrice(eventName);

        if (!price) {
            return Infinity;
        }

        return this.calculateMaxChargesByPrice(price);
    }

    private calculateEventPrice(eventName: string): number | undefined {
        return this.#isAtHome ? this.#pricingInfo[eventName]?.price : 1; // Use a nonzero price for local development so that the maximum budget can be reached
    }

    private calculateMaxChargesByPrice(price: number): number {
        // The raw number of events allowed by the budget
        const unroundedResult = (this.#maxTotalChargeUsd - this.calculateTotalChargedAmount()) / price;

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
            Object.keys(this.#pricingInfo).map((name) => [name, this.calculateMaxEventChargeCountWithinLimit(name)]),
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
        if (this.#chargingState === undefined) {
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

        return this.calculateTotalChargedAmount() <= this.#maxTotalChargeUsd ? 1 : 0;
    }

    /**
     * Runs `fn` under the charge lock, which keeps a limit reservation and the charge that acts on it
     * atomic against concurrent pushes. Only pay-per-event runs charge anything, so for every other
     * run there is nothing to serialize and the lock is skipped.
     *
     * @internal
     */
    async withChargeLock<T>(fn: () => Promise<T>): Promise<T> {
        return this.isPayPerEvent ? await this.#chargeLock.runExclusive(fn) : await fn();
    }
}
