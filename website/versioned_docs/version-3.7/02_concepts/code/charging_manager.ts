import { Actor } from 'apify';

await Actor.init();

const chargingManager = Actor.getChargingManager();

// Check the total budget for this run
const maxCharge = chargingManager.getMaxTotalChargeUsd();
console.log(`Max charge: ${maxCharge}`);

// Check how many events can still be charged before reaching the limit
const remainingCharge = chargingManager.calculateMaxEventChargeCountWithinLimit(
    'result-item',
);
console.log(`Remaining number of events: ${remainingCharge}`);

await Actor.exit();
