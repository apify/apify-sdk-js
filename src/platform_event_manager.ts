import { setTimeout as sleep } from 'node:timers/promises';

import type { EventTypeName } from '@crawlee/core';
import { EventManager, EventType } from '@crawlee/core';
import { WebSocket } from 'ws';

import { ACTOR_ENV_VARS, ACTOR_EVENT_NAMES } from '@apify/consts';
import { betterClearInterval } from '@apify/utilities';

import { Configuration } from './configuration.js';

/**
 * WebSocket close codes for a permanent condition, on which the connection is not re-established.
 *
 * The platform sends `1008` (policy violation) for an unknown/missing run ID or an exceeded per-run connection limit.
 * The rest are protocol, data, or mandatory-extension failures that reconnecting cannot resolve.
 */
const NON_RETRYABLE_CLOSE_CODES = new Set([1002, 1003, 1007, 1008, 1010]);

/** Close codes of a clean close, as opposed to a lost connection. */
const CLEAN_CLOSE_CODES = new Set([1000, 1001]);

/** How long a connection must stay open to count as healthy, after which a drop reconnects without backoff. */
const HEALTHY_CONNECTION_MIN_DURATION_MILLIS = 1000;

/**
 * Delays between reconnection attempts, mirroring the Python `websockets` library
 * (see RFC 6455, section 7.2.3): a random initial delay, then exponential growth up to a cap.
 */
function* backoffDelays(): Generator<number, never> {
    yield Math.random() * 5000;

    let delay = 3100;
    while (delay < 90_000) {
        yield delay;
        delay *= 1.618;
    }

    while (true) yield 90_000;
}

/**
 * Gets an instance of a Node.js'
 * [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
 * class that emits various events from the SDK or the Apify platform.
 * The event emitter is initialized by calling the {@apilink Actor.main} function.
 *
 * **Example usage:**
 *
 * ```javascript
 * Actor.on('cpuInfo', (data) => {
 *   if (data.isCpuOverloaded) console.log('Oh no, the CPU is overloaded!');
 * });
 * ```
 *
 * The following events are emitted:
 *
 * - `cpuInfo`: `{ "isCpuOverloaded": Boolean }`
 *   The event is emitted approximately every second
 *   and it indicates whether the Actor is using the maximum of available CPU resources.
 *   If that's the case, the Actor should not add more workload.
 *   For example, this event is used by the {@apilink AutoscaledPool} class.
 * - `migrating`: `void`
 *   Emitted when the Actor running on the Apify platform is going to be migrated to another worker server soon.
 *   You can use it to persist the state of the Actor and gracefully stop your in-progress tasks,
 *   so that they are not interrupted by the migration.
 *   For example, this is used by the {@apilink RequestList} class.
 * - `aborting`: `void`
 *   When a user aborts an Actor run on the Apify platform, they can choose to abort gracefully to allow
 *   the Actor some time before getting killed. This graceful abort emits the `aborting` event which the SDK
 *   uses to gracefully stop running crawls and you can use it to do your own cleanup as well.
 * - `persistState`: `{ "isMigrating": Boolean }`
 *   Emitted in regular intervals (by default 60 seconds) to notify all components of Apify SDK that it is time to persist
 *   their state, in order to avoid repeating all work when the Actor restarts.
 *   This event is automatically emitted together with the `migrating` event,
 *   in which case the `isMigrating` flag is set to `true`. Otherwise the flag is `false`.
 *   Note that the `persistState` event is provided merely for user convenience,
 *   you can achieve the same effect using `setInterval()` and listening for the `migrating` event.
 *
 * The connection to the platform events websocket is re-established after it drops, unless it was closed
 * with a code signalling a permanent condition (e.g. `1008` for an unknown run ID).
 */
export class PlatformEventManager extends EventManager {
    /** Websocket connection to Actor events. */
    #eventsWs?: WebSocket;

    /** Aborted by `close()`, which stops any pending reconnection and marks the final close as intentional. */
    #abortController = new AbortController();

    /** Backoff for rapid reconnections; reset after a connection that stayed open long enough to count as healthy. */
    #backoff?: Generator<number, never>;

    /**
     * Listeners of the SDK itself, which `off()` doesn't remove and `listeners()` doesn't return, so that user code
     * removing all listeners of an event keeps the SDK's own handling of it.
     */
    #internalListeners = new Map<EventTypeName, Set<(...args: any[]) => unknown>>();

    /** Calls of the internal listeners that are still in progress. */
    #internalListenerCalls = new Set<Promise<unknown>>();

    constructor(readonly configuration = Configuration.getGlobalConfiguration()) {
        super({
            persistStateIntervalMillis: configuration.persistStateIntervalMillis,
        });
    }

    /**
     * Initializes `Actor.events` event emitter by creating a connection to a websocket that provides them.
     * This is an internal function that is automatically called by `Actor.main()`.
     *
     * Rejects if the first connection cannot be established. Later drops are handled by reconnecting.
     */
    override async init() {
        if (this.initialized) {
            return;
        }

        await super.init();
        const eventsWsUrl = this.configuration.actorEventsWsUrl;

        // Locally there is no web socket to connect, so just print a log message.
        if (!eventsWsUrl) {
            this.log.debug(
                `Environment variable ${ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL} is not set, no events from Apify platform will be emitted.`,
            );
            return;
        }

        this.#abortController = new AbortController();
        this.#backoff = undefined;

        try {
            await this.#connect(eventsWsUrl);
        } catch (err) {
            // Leave no `persistState` interval behind, so that `init()` can be retried.
            await this.close();
            throw new Error('Error connecting to platform events websocket!', { cause: err });
        }
    }

    /**
     * Closes websocket providing events from Actor infrastructure and also stops sending internal events
     * of Apify package such as `persistState`.
     * This is automatically called at the end of `Actor.main()`.
     */
    override async close() {
        if (!this.initialized) {
            return;
        }

        await super.close();
        this.#abortController.abort();
        this.#eventsWs?.close();
    }

    /**
     * Registers a listener of the SDK itself, which `off()` doesn't remove.
     *
     * @internal
     */
    onInternal(event: EventTypeName, listener: (...args: any[]) => unknown) {
        if (!this.#internalListeners.has(event)) this.#internalListeners.set(event, new Set());
        this.#internalListeners.get(event)!.add(listener);
    }

    /**
     * Removes a listener registered by `onInternal()`.
     *
     * @internal
     */
    offInternal(event: EventTypeName, listener: (...args: any[]) => unknown) {
        this.#internalListeners.get(event)?.delete(listener);
    }

    override emit(event: EventTypeName, ...args: unknown[]) {
        super.emit(event, ...args);

        for (const listener of this.#internalListeners.get(event) ?? []) {
            const call = (async () => listener(...args))()
                .catch((err) => this.log.exception(err as Error, `Internal listener of the "${event}" event failed`))
                .finally(() => this.#internalListenerCalls.delete(call));
            this.#internalListenerCalls.add(call);
        }
    }

    override async waitForAllListenersToComplete() {
        const [completed] = await Promise.all([super.waitForAllListenersToComplete(), ...this.#internalListenerCalls]);
        return completed;
    }

    /** Opens a new connection; resolves once it is established and rejects if it fails before that. */
    async #connect(eventsWsUrl: string) {
        await new Promise<void>((resolve, reject) => {
            // `ws` has no default handshake timeout, so without it a silent server would block `init()` forever.
            const ws = new WebSocket(eventsWsUrl, { handshakeTimeout: 10_000 });
            this.#eventsWs = ws;

            let openedAt: number | undefined;
            let lastError: Error | undefined;

            ws.on('open', () => {
                openedAt = Date.now();
                resolve();
            });
            ws.on('message', (message) => this.#handleMessage(message));
            ws.on('error', (err) => {
                // Before the connection is open, the error is reported through the `close` event.
                lastError = err;
                if (openedAt !== undefined) this.log.exception(err, 'Platform events websocket error');
            });
            ws.on('close', (code, reason) => {
                if (this.#eventsWs === ws) this.#eventsWs = undefined;

                if (openedAt === undefined) {
                    reject(
                        lastError ??
                            new Error(`Web socket closed before the connection was established (code=${code})`),
                    );
                    return;
                }

                this.#handleClose(eventsWsUrl, { code, reason: reason.toString(), openedAt });
            });
        });
    }

    #handleMessage(message: unknown) {
        if (!message) return;

        try {
            const { name, data } = JSON.parse(String(message));
            this.emit(name, data);

            if (name === ACTOR_EVENT_NAMES.MIGRATING) {
                betterClearInterval(this.intervals.persistState!); // Don't send any other persist state event.
                this.events.emit(EventType.PERSIST_STATE, {
                    isMigrating: true,
                });
            }
        } catch (err) {
            this.log.exception(err as Error, 'Cannot parse Actor event');
        }
    }

    /** Logs the close of an established connection and schedules a reconnection, unless the close is final. */
    #handleClose(eventsWsUrl: string, { code, reason, openedAt }: { code: number; reason: string; openedAt: number }) {
        if (this.#abortController.signal.aborted) {
            this.log.debug('web socket has been closed');
            return;
        }

        const details = `code=${code}, reason=${JSON.stringify(reason)}`;

        if (NON_RETRYABLE_CLOSE_CODES.has(code)) {
            this.log.error(
                `Connection to platform events websocket was closed with a non-retryable code (${details}); not reconnecting. ` +
                    'No further platform events will be received for the rest of this run, so migration and abort handling ' +
                    '(e.g. persisting state before a migration) is now disabled.',
            );
            return;
        }

        if (CLEAN_CLOSE_CODES.has(code)) {
            this.log.info(`Connection to platform events websocket was closed (${details}), reconnecting...`);
        } else {
            this.log.warning(`Connection to platform events websocket was lost (${details}), reconnecting...`);
        }

        // Reconnect a healthy connection immediately; back off only on repeated rapid drops. The first rapid drop
        // retries without delay (it just primes the backoff), each consecutive one waits for the next interval.
        let delay = 0;
        if (Date.now() - openedAt >= HEALTHY_CONNECTION_MIN_DURATION_MILLIS) {
            this.#backoff = undefined;
        } else if (this.#backoff) {
            delay = this.#backoff.next().value;
        } else {
            this.#backoff = backoffDelays();
        }

        this.#reconnect(eventsWsUrl, delay).catch((err) => {
            this.log.exception(err as Error, 'Reconnecting to platform events websocket failed');
        });
    }

    /** Keeps trying to connect, with backoff between failed attempts, until it succeeds or `close()` is called. */
    async #reconnect(eventsWsUrl: string, initialDelayMillis: number) {
        const { signal } = this.#abortController;
        await this.#sleep(initialDelayMillis, signal);

        while (!signal.aborted) {
            try {
                await this.#connect(eventsWsUrl);
                this.log.info('Reconnected to the platform events websocket.');
                return;
            } catch (err) {
                if (signal.aborted) return;
                this.log.warning(`Reconnecting to platform events websocket failed: ${(err as Error).message}`);
            }

            this.#backoff ??= backoffDelays();
            await this.#sleep(this.#backoff.next().value, signal);
        }
    }

    /** Sleeps for the given time, or until the signal is aborted. */
    async #sleep(millis: number, signal: AbortSignal) {
        if (millis <= 0 || signal.aborted) return;

        // Rejects with an `AbortError` when aborted, which just means there is nothing left to wait for.
        await sleep(millis, undefined, { signal }).catch(() => {});
    }
}
