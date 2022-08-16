import { Actor } from '../src/index';

describe('Should read from env on first actor method calls', () => {
    describe('with env', () => {
        let oldValue: string | undefined;

        beforeAll(() => {
            oldValue = process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID;
            process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID = 'hello_world';
        });

        afterAll(() => {
            process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID = oldValue;
        });

        test('calling Actor.openKeyValueStore() should open the hello_world key-value store', async () => {
            const actor = new Actor();
            const store = await actor.openKeyValueStore();

            expect(store.name).toEqual('hello_world');
        });
    });

    describe('default', () => {
        test('calling Actor.openKeyValueStore() should open the default key-value store', async () => {
            const actor = new Actor();
            const store = await actor.openKeyValueStore();

            expect(store.name).toEqual('undefined');
        });
    });
});
