import { Actor, log } from 'apify';

await Actor.init();

const input = await Actor.getInput();

log.info(`Input: ${JSON.stringify(input)}`);

await Actor.setValue('RECEIVED_INPUT', input);

await Actor.exit();
