import { EventType } from '@crawlee/core';
import type { Dictionary } from '@crawlee/utils';
import { sleep } from '@crawlee/utils';
import { Actor, Configuration, PlatformEventManager } from 'apify';
import { WebSocketServer } from 'ws';

import {
    ACTOR_ENV_VARS,
    ACTOR_EVENT_NAMES,
    APIFY_ENV_VARS,
} from '@apify/consts';

describe('events', () => {
    let wss: WebSocketServer = null!;
    const config = Configuration.getGlobalConfig();
    let events: PlatformEventManager = null!;

    beforeEach(() => {
        wss = new WebSocketServer({ port: 9099 });
        events = new PlatformEventManager(config);
        config.useEventManager(events);

        vitest.useFakeTimers();
        process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL] =
            'ws://localhost:9099/someRunId';
        process.env[APIFY_ENV_VARS.TOKEN] = 'dummy';
    });
    afterEach(async () => {
        vitest.useRealTimers();
        delete process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL];
        delete process.env[APIFY_ENV_VARS.TOKEN];
        await new Promise((resolve) => {
            wss.close(resolve);
        });
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

                setTimeout(
                    () => send({ name: 'aborting', data: [1, 2, 3] }),
                    50,
                );
                setTimeout(
                    () => send({ name: 'aborting', data: { foo: 'bar' } }),
                    100,
                );
                setTimeout(() => send({ name: 'migrating', data: [1] }), 50);
                setTimeout(() => send({ name: 'migrating', data: [2] }), 50);
            });
        });

        const eventsReceived: unknown[] = [];
        // Run main and store received events
        expect(wsClosed).toBe(false);
        await Actor.init({ gracefulShutdown: false });
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

                setTimeout(
                    () => send({ name: 'aborting', data: [1, 2, 3] }),
                    50,
                );
                setTimeout(
                    () => send({ name: 'aborting', data: { foo: 'bar' } }),
                    100,
                );
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
        const interval = config.get('persistStateIntervalMillis')!;

        events.on(EventType.PERSIST_STATE, (data) => eventsReceived.push(data));
        await events.init();
        await vitest.advanceTimersByTimeAsync(1.1 * interval);
        await vitest.advanceTimersByTimeAsync(1.1 * interval);
        await vitest.advanceTimersByTimeAsync(1.1 * interval);
        await events.close();
        expect(eventsReceived.length).toBe(5);
    });
});

describe('graceful exit handlers', () => {
    let wss: WebSocketServer = null!;
    let processExitSpy: ReturnType<typeof vitest.spyOn>;
    let testPort = 9098;
    const gracefulConfig = Configuration.getGlobalConfig();
    let testEvents: PlatformEventManager = null!;

    beforeEach(() => {
        // Use incrementing port to avoid port reuse issues between tests
        testPort++;
        wss = new WebSocketServer({ port: testPort });
        process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL] =
            `ws://localhost:${testPort}/someRunId`;
        process.env[APIFY_ENV_VARS.TOKEN] = 'dummy';
        // Create a fresh PlatformEventManager for each test to avoid shared state
        testEvents = new PlatformEventManager(gracefulConfig);
        gracefulConfig.useEventManager(testEvents);
        // Mock process.exit to prevent actual exit during tests
        processExitSpy = vitest
            .spyOn(process, 'exit')
            .mockImplementation((() => {}) as never);
    });

    afterEach(async () => {
        delete process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL];
        delete process.env[APIFY_ENV_VARS.TOKEN];
        processExitSpy.mockRestore();
        // Close the event manager to clean up WebSocket connections
        await testEvents.close();
        // Close the WebSocket server - terminate all connections first
        for (const client of wss.clients) {
            client.terminate();
        }
        await new Promise<void>((resolve) => {
            wss.close(() => resolve());
        });
    });

    test('should automatically call Actor.exit() on aborting event when gracefulShutdown is true', async () => {
        const actor = new Actor();
        let exitCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(
                    JSON.stringify({
                        name: ACTOR_EVENT_NAMES.ABORTING,
                        data: {},
                    }),
                );
                resolve();
            });
        });

        const exitSpy = vitest
            .spyOn(actor, 'exit')
            .mockImplementation(async () => {
                exitCalled = true;
            });

        await actor.init({ gracefulShutdown: true });
        await eventReceived;

        // Wait for setTimeout(0) in the handler to fire
        await sleep(50);

        expect(exitCalled).toBe(true);
        exitSpy.mockRestore();
    }, 10e3);

    test('should automatically call Actor.reboot() on migrating event when gracefulShutdown is true', async () => {
        const actor = new Actor();
        let rebootCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(
                    JSON.stringify({
                        name: ACTOR_EVENT_NAMES.MIGRATING,
                        data: {},
                    }),
                );
                resolve();
            });
        });

        const rebootSpy = vitest
            .spyOn(actor, 'reboot')
            .mockImplementation(async () => {
                rebootCalled = true;
            });

        await actor.init({ gracefulShutdown: true });
        await eventReceived;

        // Wait for setTimeout(0) in the handler to fire
        await sleep(50);

        expect(rebootCalled).toBe(true);
        rebootSpy.mockRestore();
    }, 10e3);

    test('should not register handlers by default (opt-in behavior)', async () => {
        const actor = new Actor();
        let exitCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(
                    JSON.stringify({
                        name: ACTOR_EVENT_NAMES.ABORTING,
                        data: {},
                    }),
                );
                resolve();
            });
        });

        const exitSpy = vitest
            .spyOn(actor, 'exit')
            .mockImplementation(async () => {
                exitCalled = true;
            });

        // Default behavior (no gracefulShutdown option) should NOT register handlers
        await actor.init();
        await eventReceived;

        await sleep(50);

        expect(exitCalled).toBe(false);
        exitSpy.mockRestore();
    }, 10e3);
});
