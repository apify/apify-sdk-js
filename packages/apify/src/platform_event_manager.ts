import { ACTOR_EVENT_NAMES, ACTOR_ENV_VARS } from '@apify/consts';
import { betterClearInterval } from '@apify/utilities';
import { EventType, EventManager } from '@crawlee/core';
import WebSocket from 'ws';

import { Configuration } from './configuration';

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
 *   and it indicates whether the actor is using the maximum of available CPU resources.
 *   If that's the case, the actor should not add more workload.
 *   For example, this event is used by the {@apilink AutoscaledPool} class.
 * - `migrating`: `void`
 *   Emitted when the actor running on the Apify platform is going to be migrated to another worker server soon.
 *   You can use it to persist the state of the actor and gracefully stop your in-progress tasks,
 *   so that they are not interrupted by the migration.
 *   For example, this is used by the {@apilink RequestList} class.
 * - `aborting`: `void`
 *   When a user aborts an actor run on the Apify platform, they can choose to abort gracefully to allow
 *   the actor some time before getting killed. This graceful abort emits the `aborting` event which the SDK
 *   uses to gracefully stop running crawls and you can use it to do your own cleanup as well.
 * - `persistState`: `{ "isMigrating": Boolean }`
 *   Emitted in regular intervals (by default 60 seconds) to notify all components of Apify SDK that it is time to persist
 *   their state, in order to avoid repeating all work when the actor restarts.
 *   This event is automatically emitted together with the `migrating` event,
 *   in which case the `isMigrating` flag is set to `true`. Otherwise the flag is `false`.
 *   Note that the `persistState` event is provided merely for user convenience,
 *   you can achieve the same effect using `setInterval()` and listening for the `migrating` event.
 */
export class PlatformEventManager extends EventManager {
    /** Websocket connection to actor events. */
    private eventsWs?: WebSocket;

    constructor(override readonly config = Configuration.getGlobalConfig()) {
        super();
    }

    /**
     * Initializes `Actor.events` event emitter by creating a connection to a websocket that provides them.
     * This is an internal function that is automatically called by `Actor.main()`.
     */
    override async init() {
        if (this.initialized) {
            return;
        }

        await super.init();
        const eventsWsUrl = this.config.get('actorEventsWsUrl');

        // Locally there is no web socket to connect, so just print a log message.
        if (!eventsWsUrl) {
            this.log.debug(`Environment variable ${ACTOR_ENV_VARS.EVENTS_WEBSOCKET_URL} is not set, no events from Apify platform will be emitted.`);
            return;
        }

        this.createWebSocketConnection(eventsWsUrl);
    }

    private createWebSocketConnection(eventsWsUrl: string) {
        this.eventsWs = new WebSocket(eventsWsUrl);
        this.eventsWs.on('message', (message) => {
            if (!message) return;

            try {
                const {
                    name,
                    data,
                } = JSON.parse(String(message));
                this.events.emit(name, data);

                if (name === ACTOR_EVENT_NAMES.MIGRATING) {
                    betterClearInterval(this.intervals.persistState!); // Don't send any other persist state event.
                    this.events.emit(EventType.PERSIST_STATE, { isMigrating: true });
                }
            } catch (err) {
                this.log.exception(err as Error, 'Cannot parse actor event');
            }
        });
        this.eventsWs.on('error', (err) => {
            // Don't print this error as this happens in the case of very short Actor.main().
            if (err.message === 'WebSocket was closed before the connection was established') return;

            this.log.exception(err, 'web socket connection failed');
        });
        this.eventsWs.on('close', () => {
            this.log.debug('web socket has been closed');
            this.eventsWs = undefined;
        });
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
        this.eventsWs?.close();
    }
}
