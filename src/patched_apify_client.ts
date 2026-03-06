/* eslint-disable max-classes-per-file */
import { AsyncLocalStorage } from 'node:async_hooks';

import type { ApifyClientOptions } from 'apify-client';
import { ApifyClient, DatasetClient } from 'apify-client';

import {
    type ChargeResult,
    type ChargingManager,
    DEFAULT_DATASET_ITEM_EVENT,
    mergeChargeResults,
    pushDataAndCharge,
} from './charging.js';
import type { Configuration } from './configuration.js';

export const USES_PUSH_DATA_INTERCEPTION = Symbol(
    'apify:uses-push-data-interception',
);

/**
 * Context of a single Actor.pushData() call that is shared with the PatchedDatasetClient.pushItems() method calls.
 *
 * Purpose:
 * 1. Propagate eventName: When Actor.pushData() is called with an eventName,
 *    this context allows the intercepted pushItems() to know which event to charge.
 * 2. Aggregate ChargeResults: A single Actor.pushData() call may trigger multiple
 *    DatasetClient.pushItems() calls (due to batching in Crawlee). This context
 *    aggregates the ChargeResult from all those calls into a single result.
 */
export interface PpeAwarePushDataContext {
    eventName: string | undefined;
    chargeResult?: ChargeResult;
}

export const pushDataChargingContext =
    new AsyncLocalStorage<PpeAwarePushDataContext>();

export function createPatchedApifyClient(
    options: ApifyClientOptions,
    actor: { config: Configuration; getChargingManager: () => ChargingManager },
): ApifyClient {
    class PatchedDatasetClient<
        Data extends Record<string | number, any> = Record<
            string | number,
            unknown
        >,
    > extends DatasetClient<Data> {
        private normalizeItems(
            items: string | Data | string[] | Data[],
        ): Data[] {
            if (typeof items === 'string') {
                const parsed = JSON.parse(items);
                return Array.isArray(parsed) ? parsed : [parsed];
            }

            if (Array.isArray(items)) {
                return items.flatMap((item) =>
                    typeof item === 'string'
                        ? (JSON.parse(item) as Data | Data[])
                        : item,
                ) as Data[];
            }

            return [items];
        }

        override async pushItems(
            items: string | Data | string[] | Data[],
        ): Promise<void> {
            const context = pushDataChargingContext.getStore();

            // Normalize string inputs: a single JSON string may encode multiple items
            // (e.g. '[{"a":1},{"b":2}]'), which would be miscounted by the charging logic.
            // Parse strings into arrays so each logical item is counted individually.
            const normalizedItems = this.normalizeItems(items);

            const result = await pushDataAndCharge({
                chargingManager: actor.getChargingManager(),
                items: normalizedItems,
                eventName: context?.eventName,
                isDefaultDataset: true,
                pushFn: async (limitedItems) =>
                    super.pushItems(JSON.stringify(limitedItems)), // stringify the items for faster validation in Apify client
            });

            if (!context) return;

            // For a single invocation of Dataset.pushData, there may be more than one call to DatasetClient.pushItems.
            // Aggregate `ChargeResult` objects across such calls.
            if (context.chargeResult === undefined) {
                context.chargeResult = result;
            } else {
                context.chargeResult = mergeChargeResults(
                    context.chargeResult,
                    result,
                );
            }
        }
    }

    class PatchedApifyClient extends ApifyClient {
        override dataset<
            Data extends Record<string | number, any> = Record<
                string | number,
                unknown
            >,
        >(id: string): DatasetClient<Data> {
            const isDefaultDataset =
                id === actor.config.get('defaultDatasetId');

            const datasetOptions = {
                id,
                baseUrl: this.baseUrl,
                publicBaseUrl: this.publicBaseUrl,
                apifyClient: this,
                httpClient: this.httpClient,
            };

            const hasDefaultDatasetItemEvent =
                DEFAULT_DATASET_ITEM_EVENT in
                actor.getChargingManager().getPricingInfo().perEventPrices;

            if (!isDefaultDataset || !hasDefaultDatasetItemEvent) {
                return new DatasetClient(datasetOptions);
            }

            const client = new PatchedDatasetClient<Data>(datasetOptions);

            Object.assign(client as object, {
                [USES_PUSH_DATA_INTERCEPTION]: true,
            });

            return client;
        }
    }

    return new PatchedApifyClient(options);
}
