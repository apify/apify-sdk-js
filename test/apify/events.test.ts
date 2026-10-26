import { EventType, MemoryStorageBackend, serviceLocator } from '@crawlee/core';
import type { Dictionary } from '@crawlee/types';
import { sleep } from '@crawlee/utils';
import { Actor, Configuration, PlatformEventManager } from 'apify';
import { type WebSocket, WebSocketServer } from 'ws';

import { ACTOR_ENV_VARS, ACTOR_EVENT_NAMES, APIFY_ENV_VARS } from '@apify/consts';

import { createIsolatedActor } from '../createIsolatedActor.js';

describe('events', () => {
    let wss: WebSocketServer = null!;
    let config: Configuration = null!;
    let events: PlatformEventManager = null!;

    beforeEach(() => {
        // crawlee v4's Configuration snapshots env vars at construction, so the
        // WS URL must be set *before* the config is (re-)resolved below.
        process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL] = 'ws://localhost:9099/someRunId';
        process.env[APIFY_ENV_VARS.TOKEN] = 'dummy';

        // crawlee v4's serviceLocator throws when a service is re-set, so start
        // each test from a clean locator and re-resolve the global config.
        serviceLocator.reset();
        config = Configuration.getGlobalConfiguration();
        wss = new WebSocketServer({ port: 9099 });
        events = new PlatformEventManager(config);
        serviceLocator.setEventManager(events);

        vitest.useFakeTimers();
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
        const interval = config.persistStateIntervalMillis!;

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

    beforeEach(() => {
        // Use an incrementing port to avoid port reuse issues between tests.
        testPort++;
        // crawlee v4's Configuration snapshots env vars at construction, so the
        // per-test WS URL must be set before each isolated actor's config is built.
        process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL] = `ws://localhost:${testPort}/someRunId`;
        process.env[APIFY_ENV_VARS.TOKEN] = 'dummy';
        wss = new WebSocketServer({ port: testPort });
        // Mock process.exit to prevent actual exit during tests.
        processExitSpy = vitest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    });

    afterEach(async () => {
        delete process.env[ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL];
        delete process.env[APIFY_ENV_VARS.TOKEN];
        processExitSpy.mockRestore();
        // Each test's isolated Actor closes its own event manager via
        // createIsolatedActor's onTestFinished hook; here we only own the server.
        for (const client of wss.clients) {
            client.terminate();
        }
        await new Promise<void>((resolve) => {
            wss.close(() => resolve());
        });
    });

    // Each test drives an Actor bound to its own ServiceLocator, so its services
    // are isolated from the global locator and from the other tests — no
    // `resetGlobalState()` / `serviceLocator.reset()` required between runs.
    test('should automatically call Actor.exit() on aborting event by default', async () => {
        const { actor } = createIsolatedActor();
        let exitCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(JSON.stringify({ name: ACTOR_EVENT_NAMES.ABORTING, data: {} }));
                resolve();
            });
        });

        const exitSpy = vitest.spyOn(actor, 'exit').mockImplementation(async () => {
            exitCalled = true;
        });

        // Default behavior should register handlers.
        await actor.init();
        await eventReceived;

        // Wait for the setTimeout(0) in the handler to fire.
        await sleep(50);

        expect(exitCalled).toBe(true);
        exitSpy.mockRestore();
    }, 10e3);

    test('should automatically call Actor.reboot() on migrating event by default', async () => {
        const { actor } = createIsolatedActor();
        let rebootCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(JSON.stringify({ name: ACTOR_EVENT_NAMES.MIGRATING, data: {} }));
                resolve();
            });
        });

        const rebootSpy = vitest.spyOn(actor, 'reboot').mockImplementation(async () => {
            rebootCalled = true;
        });

        // Default behavior should register handlers.
        await actor.init();
        await eventReceived;

        // Wait for the setTimeout(0) in the handler to fire.
        await sleep(50);

        expect(rebootCalled).toBe(true);
        rebootSpy.mockRestore();
    }, 10e3);

    test('should not register handlers when gracefulShutdown is false (opt-out)', async () => {
        const { actor } = createIsolatedActor();
        let exitCalled = false;

        const eventReceived = new Promise<void>((resolve) => {
            wss.on('connection', (ws) => {
                ws.send(JSON.stringify({ name: ACTOR_EVENT_NAMES.ABORTING, data: {} }));
                resolve();
            });
        });

        const exitSpy = vitest.spyOn(actor, 'exit').mockImplementation(async () => {
            exitCalled = true;
        });

        // Opt-out (gracefulShutdown: false) should NOT register handlers.
        await actor.init({ gracefulShutdown: false });
        await eventReceived;

        await sleep(50);

        expect(exitCalled).toBe(false);
        exitSpy.mockRestore();
    }, 10e3);
});

describe('reconnection', () => {
    const port = 9095;
    const url = `ws://localhost:${port}/someRunId`;
    let wss: WebSocketServer | undefined;
    let events: PlatformEventManager = null!;
    /** Server-side sockets of the currently open connections. */
    let clients: WebSocket[] = [];
    /** Number of connections the server has accepted so far. */
    let attempts = 0;

    const startServer = async (onConnection?: (ws: WebSocket) => void) => {
        await new Promise<void>((resolve) => {
            wss = new WebSocketServer({ port }, resolve);
            wss.on('connection', (ws) => {
                attempts++;
                clients.push(ws);
                ws.on('close', () => clients.splice(clients.indexOf(ws), 1));
                onConnection?.(ws);
            });
        });
    };

    const stopServer = async () => {
        const server = wss;
        wss = undefined;
        if (!server) return;
        for (const client of server.clients) client.terminate();
        await new Promise<void>((resolve) => server.close(() => resolve()));
    };

    const waitFor = async (condition: () => boolean, timeoutMillis = 10e3) => {
        const deadline = Date.now() + timeoutMillis;
        while (!condition()) {
            if (Date.now() > deadline) throw new Error('Timed out waiting for condition');
            await sleep(20);
        }
    };

    const sendEvent = (ws: WebSocket, data: Dictionary) => ws.send(JSON.stringify({ name: 'systemInfo', data }));

    beforeEach(() => {
        clients = [];
        attempts = 0;
        // Make the first backoff delay (`Math.random() * 5000`) deterministic.
        vitest.spyOn(Math, 'random').mockReturnValue(0);
        events = new PlatformEventManager(new Configuration({ actorEventsWsUrl: url }));
    });

    afterEach(async () => {
        await events.close();
        await stopServer();
    });

    test('init() rejects when the first connection cannot be established', async () => {
        await expect(events.init()).rejects.toThrow('Error connecting to platform events websocket!');
        expect(events.isInitialized()).toBe(false);
    });

    test.each([
        [1000, 'was closed (code=1000', 'info'],
        [1011, 'was lost (code=1011', 'warning'],
    ] as const)('reconnects after the server closes the connection with code %i', async (code, expectedLog, level) => {
        await startServer();
        const logSpy = vitest.spyOn(events['log'], level);
        const infoSpy = vitest.spyOn(events['log'], 'info');
        const received: unknown[] = [];
        events.on(EventType.SYSTEM_INFO, (data) => received.push(data));

        await events.init();
        expect(attempts).toBe(1);

        clients[0].close(code, 'Simulated connection drop');
        await waitFor(() => attempts === 2 && clients.length === 1);

        sendEvent(clients[0], { foo: 'bar' });
        await waitFor(() => received.length === 1);
        expect(received).toEqual([{ foo: 'bar' }]);

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(expectedLog));
        expect(infoSpy).toHaveBeenCalledWith('Reconnected to the platform events websocket.');
    });

    test('does not reconnect after a non-retryable close code', async () => {
        await startServer((ws) => ws.close(1008, 'policy violation'));
        const errorSpy = vitest.spyOn(events['log'], 'error');

        await events.init();
        await sleep(500);

        expect(attempts).toBe(1);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('non-retryable code (code=1008'));
    });

    test('backs off on repeated rapid closes', async () => {
        await startServer((ws) => ws.close(1011, 'internal error'));
        const warningSpy = vitest.spyOn(events['log'], 'warning');

        await events.init();
        // The first two drops retry immediately, the third waits 3.1 s. Without backoff this would be hundreds.
        await sleep(1500);

        expect(attempts).toBeGreaterThanOrEqual(2);
        expect(attempts).toBeLessThanOrEqual(3);
        expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('was lost (code=1011'));
    });

    test('reconnects once an unreachable server is back', async () => {
        await startServer();
        const infoSpy = vitest.spyOn(events['log'], 'info');
        const received: unknown[] = [];
        events.on(EventType.SYSTEM_INFO, (data) => received.push(data));

        await events.init();
        await stopServer();

        // Let a couple of attempts fail against the closed port before bringing the server back.
        await sleep(200);
        expect(attempts).toBe(1);
        await startServer();
        await waitFor(() => attempts === 2);

        sendEvent(clients[0], { foo: 'bar' });
        await waitFor(() => received.length === 1);
        expect(infoSpy).toHaveBeenCalledWith('Reconnected to the platform events websocket.');
    });

    test('close() stops a pending reconnection', async () => {
        vitest.spyOn(Math, 'random').mockReturnValue(0.1); // first backoff delay of 500 ms
        await startServer();

        await events.init();
        await stopServer();
        await sleep(100);
        await events.close();

        await startServer();
        await sleep(1000);
        expect(attempts).toBe(1);
    });
});

describe('listeners registered before init()', () => {
    // These tests use the global locator on purpose: the bug only shows up when
    // `on()` runs before anything seeded the locator with a configuration.
    beforeEach(() => {
        serviceLocator.reset();
        Actor.setDefaultInstance();
    });

    afterEach(async () => {
        if (Actor.getDefaultInstance().initialized) {
            await Actor.exit({ exit: false });
        }
        Actor.setDefaultInstance();
        serviceLocator.reset();
    });

    test('on() before init() does not break init() and the listener receives events', async () => {
        const received: unknown[] = [];
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, (data) => received.push(data));

        await Actor.init({ storage: new MemoryStorageBackend() });

        serviceLocator.getEventManager().emit(ACTOR_EVENT_NAMES.ABORTING, { foo: 'bar' });
        expect(received).toEqual([{ foo: 'bar' }]);
    });

    test('off() before init() removes a queued listener', async () => {
        const kept = vitest.fn();
        const removed = vitest.fn();
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, kept);
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, removed);
        Actor.off(ACTOR_EVENT_NAMES.ABORTING, removed);

        await Actor.init({ storage: new MemoryStorageBackend() });

        serviceLocator.getEventManager().emit(ACTOR_EVENT_NAMES.ABORTING, {});
        expect(kept).toHaveBeenCalledTimes(1);
        expect(removed).not.toHaveBeenCalled();
    });

    test('off() without a listener before init() removes all queued listeners for the event', async () => {
        const aborting = vitest.fn();
        const migrating = vitest.fn();
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, aborting);
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, vitest.fn());
        Actor.on(ACTOR_EVENT_NAMES.MIGRATING, migrating);
        Actor.off(ACTOR_EVENT_NAMES.ABORTING);

        await Actor.init({ storage: new MemoryStorageBackend() });

        const events = serviceLocator.getEventManager();
        events.emit(ACTOR_EVENT_NAMES.ABORTING, {});
        events.emit(ACTOR_EVENT_NAMES.MIGRATING, {});
        expect(aborting).not.toHaveBeenCalled();
        expect(migrating).toHaveBeenCalledTimes(1);
    });

    test('on() and off() after init() go straight to the event manager', async () => {
        await Actor.init({ storage: new MemoryStorageBackend() });
        const events = serviceLocator.getEventManager();

        // init() registers its own graceful-shutdown handler for this event.
        const before = events.listenerCount(ACTOR_EVENT_NAMES.ABORTING);

        const listener = vitest.fn();
        Actor.on(ACTOR_EVENT_NAMES.ABORTING, listener);
        expect(events.listenerCount(ACTOR_EVENT_NAMES.ABORTING)).toBe(before + 1);

        events.emit(ACTOR_EVENT_NAMES.ABORTING, {});
        expect(listener).toHaveBeenCalledTimes(1);

        Actor.off(ACTOR_EVENT_NAMES.ABORTING, listener);
        expect(events.listenerCount(ACTOR_EVENT_NAMES.ABORTING)).toBe(before);
    });
});
