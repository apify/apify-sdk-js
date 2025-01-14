import { Actor } from 'apify';

await Actor.init();

await Actor.charge({
    eventName: 'foobar',
    count: 4,
});

await Actor.exit();
