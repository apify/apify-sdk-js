import { readFile, writeFile } from 'node:fs/promises';

import { Actor } from 'apify';

// Outside the storage directory: the next lifecycle's `init()` purges the default storages, summaries included.
const summariesFile = new URL('./lifecycle-summaries.json', import.meta.url);

const actor = new Actor({ logLevel: 'DEBUG' });

await actor.init();

// Open storages by alias — locally, an alias gets an unnamed storage of its own
const resultsDataset = await actor.openDataset({ alias: 'results' });

// Write data to the aliased storages
await resultsDataset.pushData([
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://example.org', title: 'Example Org' },
]);

// Aliased storages are purged by `init()`, not on open: opening the same alias again and writing
// more data must leave the previously written data in place.
const resultsDatasetAgain = await actor.openDataset({ alias: 'results' });
await resultsDatasetAgain.pushData([{ url: 'https://example.net', title: 'Example Net' }]);

// Read back all data from the aliased dataset
const allData = await resultsDatasetAgain.getData();

const summaries = JSON.parse(await readFile(summariesFile, 'utf8').catch(() => '[]'));
summaries.push({ datasetItemCount: allData.count, datasetItems: allData.items });
await writeFile(summariesFile, JSON.stringify(summaries));

await actor.setValue('LIFECYCLE_SUMMARIES', summaries);

await actor.exit();
