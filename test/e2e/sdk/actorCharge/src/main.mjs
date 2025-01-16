import { Actor, log } from 'apify';

await Actor.init();

const chargeResult = await Actor.charge({
    eventName: 'foobar',
    count: 4,
});

log.info(`Charged: ${JSON.stringify(chargeResult)}`);

await Actor.exit();
