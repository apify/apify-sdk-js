import { Actor } from 'apify';

await Actor.init();
await Actor.pushData({ hello: 'world' });
await Actor.exit();
