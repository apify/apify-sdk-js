import { Actor, log } from 'apify';

await Actor.init();

const { data } = await Actor.getInput();

await Actor.setValue('public-record-key', JSON.stringify(data), {
    contentType: `application/json`,
});

const defaultKeyValueStore = await Actor.openKeyValueStore();
const publicUrl = defaultKeyValueStore.getPublicUrl('public-record-key');

// Here we store the url itself
await Actor.setValue('urlToPublicData', publicUrl);

log.info('Generated public url', { publicUrl });

await Actor.pushData({ publicUrl });

await Actor.exit();
