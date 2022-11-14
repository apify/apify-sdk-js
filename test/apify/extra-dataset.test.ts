import { ENV_VARS } from '@apify/consts';
import { Actor, Configuration, PlatformEventManager, log } from 'apify';
import { Server } from 'ws';
import { Dataset } from 'apify-extra';

describe('forEachParallel', () => {
    let wss: Server = null;
    const config = Configuration.getGlobalConfig();
    const events = new PlatformEventManager(config);
    config.useEventManager(events);

    beforeEach(() => {
        wss = new Server({ port: 9099 });
        process.env[ENV_VARS.ACTOR_EVENTS_WS_URL] = 'ws://localhost:9099/someRunId';
        process.env[ENV_VARS.TOKEN] = 'dummy';
    });
    afterEach((done) => {
        delete process.env[ENV_VARS.ACTOR_EVENTS_WS_URL];
        delete process.env[ENV_VARS.TOKEN];
        wss.close(done);
    });

    test('slicing should work', async () => {
        const getDataSpy = jest.spyOn(Dataset.prototype, 'getData').mockImplementation(async ({ limit }) => (
            { items: [...new Array(limit).keys()] } as any
        ));
        jest.spyOn(Dataset.prototype, 'getInfo').mockImplementation(async () => ({
            itemCount: 229, // a prime number
        } as any));
        jest.spyOn(Actor.prototype, 'getValue').mockImplementation(async () => ({}));

        const dataset = new Dataset({
            client: Configuration.getStorageClient(),
            id: 'dataset-forEachParallel-test',
        });

        await dataset.forEachParallel((x) => { log.debug(`processing ${x}`); }, { persistState: true, batchSize: 7 });

        expect(getDataSpy).toBeCalledTimes(Math.ceil(229 / 7));

        [...Array(Math.ceil(229 / 7))].forEach((_, i) => {
            expect(getDataSpy).toBeCalledWith(
                expect.objectContaining({
                    limit: 7,
                    offset: i * 7,
                }));
        });
        getDataSpy.mockRestore();
    }, 60e3);
});
