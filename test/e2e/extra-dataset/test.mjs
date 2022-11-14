import { getTestDir, initialize, expect } from '../tools.mjs';
import { Dataset } from 'apify-extra';
import { Actor, Configuration, log } from 'apify';

const testDir = getTestDir(import.meta.url);

const exit = process.exit;
process.exit = () => {};

await initialize(testDir);
await Actor.openDataset('dataset-forEachParallel-test');
const dataset = new Dataset({
    id: 'dataset-forEachParallel-test',
    client: Configuration.getStorageClient(),
});

const ITEM_COUNT = 229;
const target = [];

await dataset.pushDataParallel([...new Array(ITEM_COUNT)].map((_, i) => ({ index: i })), { batchSize: 10, parallelPushes: 4 });
await dataset.forEachParallel((x) => target.push(x), { persistState: true, batchSize: 10 });

expect((await dataset.getData()).total === ITEM_COUNT, 'all items pushed');
expect([...new Array(ITEM_COUNT)].every((_, i) => target.some(x => x.index === i)), 'all items processed');

expect(target.length === ITEM_COUNT, `forEach called ${target.length} times.`);

process.exit = exit;
process.exit(0);
