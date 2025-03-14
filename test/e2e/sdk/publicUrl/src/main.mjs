import { Actor, log } from 'apify';

// Also needs to be changed in test.mjs
const PUBLIC_RECORD_KEY = 'public-record-key';
const PUBLIC_DATA = { exposedData: 'test' };

await Actor.init();

await Actor.setValue(PUBLIC_RECORD_KEY, JSON.stringify(PUBLIC_DATA), { contentType: `application/json` });

const defaultKeyValueStore = await Actor.openKeyValueStore();
const publicUrl = defaultKeyValueStore.getPublicUrl(PUBLIC_RECORD_KEY);

// Here we store the url itself
await Actor.setValue('urlToPublicData', publicUrl);

log.info('Generated public url', { publicUrl });

await Actor.pushData({ publicUrl });

await Actor.exit();
