import { Actor, log } from 'apify';

const actor = new Actor();

await actor.init();

const chargeResult = await actor.pushData(
    new Array(100).fill({ hello: 'world' }),
    'result',
);

log.info(`Charged: ${JSON.stringify(chargeResult)}`);

await actor.exit();
