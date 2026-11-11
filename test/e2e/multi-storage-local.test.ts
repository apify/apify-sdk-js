import { join } from 'node:path';

import { testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

export const main = async () => {
    const { execFileSync } = await import('node:child_process');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const { default: log } = await import('@apify/log');

    const dir = dirname(fileURLToPath(import.meta.url));
    const lifecyclePath = join(dir, 'lifecycle.mjs');

    // Run two separate "lifecycle" processes that share the same filesystem.
    // The second process should purge the aliased dataset left behind by the first one,
    // proving that purge-on-start covers aliased storages across Actor restarts.
    for (const phase of ['first', 'second']) {
        log.info(`--- Running ${phase} lifecycle ---`);
        execFileSync('node', [lifecyclePath], {
            stdio: 'inherit',
            env: process.env,
        });
    }

    // Both lifecycle processes pushed a summary to the platform default dataset.
    // The test script will verify both summaries.
    log.info('Both lifecycles completed successfully');
};

const actor = sdkActor(
    'multi-storage-local',
    import.meta.filename,
    main,
    join(import.meta.dirname, 'actors', 'multiStorageLocal'),
);

interface LifecycleSummary {
    datasetItemCount: number;
    datasetItems: { url: string; title: string }[];
}

testActor(actor, 'aliased storages work locally and are purged on start across restarts', async ({ expect, run }) => {
    // The actor runs two lifecycle processes in sequence, sharing the same filesystem. Each
    // lifecycle inits a fresh Actor (purging the aliased dataset left behind by the previous one),
    // opens the aliased dataset, writes data, and pushes a summary to the platform default dataset.
    const result = await run({ input: {} });

    expect(result.status).toBe('SUCCEEDED');

    const { items } = await result.getDataset<LifecycleSummary>();
    expect(items, 'There must be exactly two summary items (one per lifecycle)').toHaveLength(2);

    // First lifecycle: fresh local storage, writes 3 items total (2 + 1 from second open)
    const [first, second] = items;
    expect(first.datasetItemCount, 'First lifecycle: purge only happened on first open').toBe(3);
    expect(first.datasetItems).toEqual([
        { url: 'https://example.com', title: 'Example' },
        { url: 'https://example.org', title: 'Example Org' },
        { url: 'https://example.net', title: 'Example Net' },
    ]);

    // Second lifecycle: the aliased dataset from the first lifecycle is still on disk. Its first
    // openDataset({ alias: 'results' }) purges it, then writes 3 fresh items; without the purge there would be 6.
    expect(second.datasetItemCount, 'Second lifecycle: stale data from first lifecycle was purged').toBe(3);
});
