import { Actor, log } from 'apify';

const actor = new Actor({useChargingLogDataset: true});

await actor.init();

const chargeResult = await actor.charge({
    eventName: 'foobar',
    count: 4,
});

log.info(`Charged: ${JSON.stringify(chargeResult)}`);

await actor.exit();
