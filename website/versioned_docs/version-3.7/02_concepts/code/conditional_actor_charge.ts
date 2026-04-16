import { Actor } from 'apify';

await Actor.init();

// Check the dataset because there might already be items if the run migrated or was restarted
const defaultDataset = await Actor.openDataset();
let chargedItems = (await defaultDataset.getInfo())!.itemCount;

// highlight-start
if (Actor.getChargingManager().getPricingInfo().isPayPerEvent) {
    // highlight-end
    await Actor.pushData({ hello: 'world' }, 'dataset-item');
} else if (chargedItems < Number(process.env.ACTOR_MAX_PAID_DATASET_ITEMS)) {
    await Actor.pushData({ hello: 'world' });
    chargedItems += 1;
}

await Actor.exit();
