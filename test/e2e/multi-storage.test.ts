import { join } from 'node:path';

import { pollUntil, testActor } from 'apify-test-tools';

import { sdkActor, client } from './harness.js';

export const main = async () => {
    const { Actor } = await import('apify');

    const actor = new Actor();

    await actor.init();

    // Open storages by alias — these should resolve via ACTOR_STORAGES_JSON
    const resultsDataset = await actor.openDataset({ alias: 'results' });

    // Write data to the aliased dataset
    await resultsDataset.pushData([
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://example.org', title: 'Example Org' },
    ]);

    // Store the ID so the test script can find them
    await Actor.setValue('ALIASED_DATASET_ID', resultsDataset.id);

    await actor.exit();
};

const actor = sdkActor(
    'multi-storage',
    import.meta.filename,
    main,
    join(import.meta.dirname, 'actors', 'multiStorage'),
);

testActor(actor, 'aliased storages are resolved and written to correctly', async ({ expect, run }) => {
    const result = await run({ input: {} });
    const runInfo = await result.getRunInfo();

    expect(runInfo.status).toBe('SUCCEEDED');

    const aliasedDatasetId = (await result.getKeyValueStoreClient().getRecord('ALIASED_DATASET_ID'))?.value;
    expect(aliasedDatasetId, 'Aliased dataset ID must be present').toBeTruthy();
    expect(aliasedDatasetId, 'Aliased dataset should differ from the default dataset').not.toBe(
        runInfo.defaultDatasetId,
    );

    const { items } = await pollUntil(
        async () => client.dataset(aliasedDatasetId as string).listItems(),
        ({ count }) => count === 2,
    );
    expect(items, 'Aliased dataset should have 2 items').toEqual([
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://example.org', title: 'Example Org' },
    ]);
});
