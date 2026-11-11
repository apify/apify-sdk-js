import { join } from 'node:path';

import { testActor } from 'apify-test-tools';

import { sdkActor } from './harness.js';

export const main = async () => {
    const { Actor, log } = await import('apify');

    await Actor.init();

    const input = await Actor.getInput();

    log.info(`Input: ${JSON.stringify(input)}`);

    await Actor.setValue('RECEIVED_INPUT', input);

    await Actor.exit();
};

const actor = sdkActor('actor-input', import.meta.filename, main, join(import.meta.dirname, 'actors', 'actorInput'));

testActor(actor, 'defaults work', async ({ expect, run }) => {
    const result = await run({ input: {} });

    expect(result.status).toBe('SUCCEEDED');
    const record = await result.getKeyValueStoreClient().getRecord('RECEIVED_INPUT');
    expect(record?.value).toEqual({ foo: 'bar' });
});

testActor(actor, 'input is passed through', async ({ expect, run }) => {
    const result = await run({ input: { foo: 'baz' } });

    expect(result.status).toBe('SUCCEEDED');
    const record = await result.getKeyValueStoreClient().getRecord('RECEIVED_INPUT');
    expect(record?.value).toEqual({ foo: 'baz' });
});
