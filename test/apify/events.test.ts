import { ACTOR_ENV_VARS, APIFY_ENV_VARS } from '@apify/consts';
import { EventType } from '@crawlee/core';
import type { Dictionary } from '@crawlee/utils';
import { sleep } from '@crawlee/utils';
import { Actor, Configuration, PlatformEventManager } from 'apify';
import WebSocket from 'ws';

describe('events', () => {
    let wss: WebSocket.Server = null;
    const config = Configuration.getGlobalConfig();
    const events = new PlatformEventManager(config);
    config.useEventManager(events);

    beforeEach(() => {
        wss = new WebSocket.Server({ port: 9099 });
        vitest.useFakeTimers();
        process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL] = 'ws://localhost:9099/someRunId';
        process.env[APIFY_ENV_VARS.TOKEN] = 'dummy';
    });
    afterEach(async () => {
        vitest.useRealTimers();
        delete process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL];
        delete process.env[APIFY_ENV_VARS.TOKEN];
        await new Promise((resolve) => wss.close(resolve));
    });

    test('should work in main()', async () => {
        let wsClosed = false;
        const isWsConnected = new Promise((resolve) => {
            wss.on('connection', (ws, req) => {
                ws.on('close', () => {
                    wsClosed = true;
                });
                resolve(ws);

                expect(req.url).toBe('/someRunId');

                const send = (obj: Dictionary) => ws.send(JSON.stringify(obj));

                setTimeout(() => send({ name: 'aborting', data: [1, 2, 3] }), 50);
                setTimeout(() => send({ name: 'aborting', data: { foo: 'bar' } }), 100);
                setTimeout(() => send({ name: 'migrating', data: [1] }), 50);
                setTimeout(() => send({ name: 'migrating', data: [2] }), 50);
            });
        });

        const eventsReceived: unknown[] = [];
        // Run main and store received events
        expect(wsClosed).toBe(false);
        await Actor.init();
        await isWsConnected;
        Actor.on('aborting', (data) => eventsReceived.push(data));
        vitest.advanceTimersByTime(150);
        vitest.useRealTimers();
        await sleep(10);
        await Actor.exit({ exit: false });

        expect(eventsReceived).toEqual([[1, 2, 3], { foo: 'bar' }]);

        // Cleanup.
        await new Promise<void>((resolve) => {
            wss.close(async () => {
                await sleep(10); // Here must be short sleep to get following line to later tick
                expect(wsClosed).toBe(true);
                resolve();
            });
        });
    }, 60e3);

    test('should work without main()', async () => {
        let wsClosed = false;
        let finish: (value?: unknown) => void;
        const closePromise = new Promise((resolve) => {
            finish = resolve;
        });
        const isWsConnected = new Promise((resolve) => {
            wss.on('connection', (ws, req) => {
                ws.on('close', () => {
                    wsClosed = true;
                    finish();
                });
                resolve(ws);

                expect(req.url).toBe('/someRunId');

                const send = (obj: Dictionary) => ws.send(JSON.stringify(obj));

                setTimeout(() => send({ name: 'aborting', data: [1, 2, 3] }), 50);
                setTimeout(() => send({ name: 'aborting', data: { foo: 'bar' } }), 100);
                setTimeout(() => send({ name: 'migrating', data: [1] }), 50);
                setTimeout(() => send({ name: 'migrating', data: [2] }), 50);
            });
        });

        const eventsReceived: unknown[] = [];
        // Connect to websocket and receive events.
        expect(wsClosed).toBe(false);
        await events.init();
        await isWsConnected;
        events.on('aborting', (data) => eventsReceived.push(data));
        vitest.advanceTimersByTime(150);
        vitest.useRealTimers();
        await sleep(10);

        expect(eventsReceived).toEqual([[1, 2, 3], { foo: 'bar' }]);

        expect(wsClosed).toBe(false);
        await events.close();
        await closePromise;
        expect(wsClosed).toBe(true);
    });

    test('should send persist state events in regular interval', async () => {
        const eventsReceived = [];
        events.on(EventType.PERSIST_STATE, (data) => eventsReceived.push(data));
        await events.init();
        vitest.advanceTimersByTime(60001);
        vitest.advanceTimersByTime(60001);
        vitest.advanceTimersByTime(60001);
        await events.close();
        expect(eventsReceived.length).toBe(5);
    });
});
