import { testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

const PUBLIC_DATA = { exposedData: 'test' };

export const main = async () => {
    const { Actor, log } = await import('apify');

    await Actor.init();

    const { data } = (await Actor.getInput<{ data: unknown }>())!;

    await Actor.setValue('public-record-key', JSON.stringify(data), {
        contentType: `application/json`,
    });

    const defaultKeyValueStore = await Actor.openKeyValueStore();
    const publicUrl = await defaultKeyValueStore.getPublicUrl('public-record-key');

    // Here we store the url itself
    await Actor.setValue('urlToPublicData', publicUrl);

    log.info('Generated public url', { publicUrl });

    await Actor.pushData({ publicUrl });

    await Actor.exit();
};

const actor = sdkActor('public-url', import.meta.filename, main);

testActor(actor, 'a public record URL serves the stored data', async ({ expect, run }) => {
    const result = await run({ input: { data: PUBLIC_DATA } });

    expect(result.status).toBe('SUCCEEDED');

    const publicUrl = (await result.getKeyValueStoreClient().getRecord('urlToPublicData'))?.value as string;
    const data = await fetch(publicUrl).then(async (res) => res.json());

    expect(data).toEqual(PUBLIC_DATA);
});
