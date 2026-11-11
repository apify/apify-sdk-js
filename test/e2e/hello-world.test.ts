import { testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

export const main = async () => {
    const { Actor } = await import('apify');
    await Actor.init();
    await Actor.pushData({ hello: 'world' });
    await Actor.exit();
};

const actor = sdkActor('hello-world', import.meta.filename, main);

testActor(actor, 'pushes data', async ({ expect, run }) => {
    const result = await run({ input: {} });

    expect(result.status).toBe('SUCCEEDED');
    expect((await result.getDataset()).items).toEqual([{ hello: 'world' }]);
});
