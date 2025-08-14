import { Actor, log } from 'apify';

await Actor.init();

const defaultKeyValueStore = await Actor.openKeyValueStore();
const keysPublicUrl = defaultKeyValueStore.createKeysPublicUrl();

// Here we store the url itself
await Actor.setValue('keysPublicUrl', keysPublicUrl);

log.info('Generated store keys public url', { keysPublicUrl });

await Actor.exit();
