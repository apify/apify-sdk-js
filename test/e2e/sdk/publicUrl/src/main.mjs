import { Actor, log } from 'apify';

const PUBLIC_RECORD_KEY = 'public-record-key';

await Actor.init();

await Actor.setValue(PUBLIC_RECORD_KEY, JSON.stringify({ exposedData: 'test' }), { contentType: `application/json` });

const defaultKeyValueStore = await Actor.openKeyValueStore();
const publicUrl = defaultKeyValueStore.getPublicUrl(PUBLIC_RECORD_KEY);

log.info('Generated public url', { publicUrl });

await Actor.pushData({ publicUrl });

await Actor.exit();
