import { ENV_VARS } from '@apify/consts';
import { Actor, Configuration, PlatformEventManager, log } from 'apify';
import { Server } from 'ws';
import { Dataset } from 'apify-extra';

describe('apify-extra dataset', () => {
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

    test('forEachParallel', async () => {
        // let wsClosed = false;
        // const isWsConnected = new Promise((resolve) => {
        //     wss.on('connection', (ws, req) => {
        //         ws.on('close', () => {
        //             wsClosed = true;
        //         });
        //         resolve(ws);
        //         expect(req.url).toBe('/someRunId');
        //         const send = (obj: Dictionary) => ws.send(JSON.stringify(obj));

        //         setTimeout(() => send({ name: 'migrating' }), 10);
        //     });
        // });

        const forEachSpy = jest.spyOn(Dataset.prototype, 'forEach').mockImplementation();
        jest.spyOn(Dataset.prototype, 'getInfo').mockImplementation(async () => ({
            itemCount: 20,
        } as any));
        jest.spyOn(Actor.prototype, 'getValue').mockImplementation(async () => ({}));

        // await isWsConnected;

        const dataset = new Dataset({
            client: Configuration.getStorageClient(),
            id: 'dataset-forEachParallel-test',
        });

        await dataset.forEachParallel(() => { log.debug('noop'); }, { persistState: true });

        // // Cleanup.
        // await new Promise<void>((resolve) => {
        //     wss.close(async () => {
        //         await sleep(10); // Here must be short sleep to get following line to later tick
        //         expect(wsClosed).toBe(true);
        //         resolve();
        //     });
        // });
    }, 60e3);
});
