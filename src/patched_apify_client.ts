/* eslint-disable max-classes-per-file */
import { AsyncLocalStorage } from 'node:async_hooks';

import type { ApifyClientOptions } from 'apify-client';
import { ApifyClient, DatasetClient } from 'apify-client';

import {
    type ChargeResult,
    type ChargingManager,
    mergeChargeResults,
    pushDataAndCharge,
} from './charging.js';
import type { Configuration } from './configuration.js';

export const USES_PUSH_DATA_INTERCEPTION = Symbol(
    'apify:uses-push-data-interception',
);

export interface PpeAwarePushDataContext {
    eventName: string | undefined;
    chargeResult?: ChargeResult;
}

// Shared context used by Actor.pushData() and PatchedDatasetClient.pushItems().
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
        override async pushItems(
            items: string | Data | string[] | Data[],
        ): Promise<void> {
            const context = pushDataChargingContext.getStore();

            const result = await pushDataAndCharge({
                chargingManager: actor.getChargingManager(),
                items,
                eventName: context?.eventName,
                isDefaultDataset: true,
                pushFn: async (limitedItems) =>
                    super.pushItems(limitedItems as typeof items),
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

            if (!isDefaultDataset) {
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
