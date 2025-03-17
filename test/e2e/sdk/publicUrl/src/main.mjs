import { Actor, log } from 'apify';

await Actor.init();

const { data, recordKey } = await Actor.getInput();

await Actor.setValue(recordKey, JSON.stringify(data), { contentType: `application/json` });

const defaultKeyValueStore = await Actor.openKeyValueStore();
const publicUrl = defaultKeyValueStore.getPublicUrl(recordKey);

// Here we store the url itself
await Actor.setValue('urlToPublicData', publicUrl);

log.info('Generated public url', { publicUrl });

await Actor.pushData({ publicUrl });

await Actor.exit();
