import { Actor } from 'apify';

await Actor.init();

let chargedItems = 0;

// highlight-start
if (Actor.getChargingManager().getPricingInfo().isPayPerEvent) {
// highlight-end
    await Actor.pushData({ 'hello': 'world' }, 'dataset-item');
} else {
    if (chargedItems < Number(process.env['ACTOR_MAX_PAID_DATASET_ITEMS'])) {
        await Actor.pushData({ 'hello': 'world' });
        chargedItems += 1;
    }
}

await Actor.exit();
