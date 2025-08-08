import { Actor, log } from 'apify';

await Actor.init();

const defaultDataset = await Actor.openDataset();
const itemsPublicUrl = defaultDataset.createItemsPublicUrl();

// Here we store the url itself
await Actor.setValue('itemsPublicUrl', itemsPublicUrl);

log.info('Generated store items public url', { itemsPublicUrl });

await Actor.exit();
