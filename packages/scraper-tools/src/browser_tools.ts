import { inspect } from 'node:util';

import log from '@apify/log';
import type { CommonPage } from '@crawlee/browser-pool';
import { Actor } from 'apify';

import { RESOURCE_LOAD_ERROR_MESSAGE, SNAPSHOT } from './consts';
import { createRandomHash } from './tools';

export interface Page extends CommonPage {
    exposeFunction(name: string, callback: () => unknown): Promise<void>;
    on(eventName: string, handler: (msg: any) => Promise<void>): unknown;
    content(): unknown;
    screenshot(): unknown;
}

/**
 * Creates a string with an appended pageFunction to be evaluated in
 * the browser context and placed within the given namespace.
 */
export function wrapPageFunction(pageFunctionString: string, namespace: string) {
    return `if (typeof window['${namespace}'] !== 'object') window['${namespace}'] = {};
    window['${namespace}'].pageFunction = ${pageFunctionString}`;
}

/**
 * Attaches the provided function to the Browser context
 * by exposing it via page.exposeFunction. Returns a string
 * handle to be used to reference the exposed function in
 * the browser context.
 */
export async function createBrowserHandle(page: Page, fun: (...args: unknown[]) => unknown) {
    const handle = await createRandomHash();
    await page.exposeFunction(handle, fun);
    return handle;
}

/**
 * Looks up a property descriptor for the given key in
 * the given object and its prototype chain.
 */
export function getPropertyDescriptor(target: object, key: PropertyKey): PropertyDescriptor | null {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (descriptor) {
        return descriptor;
    }
    const prototype = Reflect.getPrototypeOf(target);
    if (prototype === Reflect.getPrototypeOf({}) || !prototype) {
        return null;
    }
    return getPropertyDescriptor(prototype, key);
}

/**
 * Exposes selected properties of an instance (of a Class or just an Object)
 * in the Browser context and returns their mapping.
 *
 * @param getters as TS will build all module methods as getters, we need to whitelist what are actual getters here
 */
export async function createBrowserHandlesForObject<Instance extends object, Keys extends keyof Instance & string = keyof Instance & string>(
    page: Page,
    instance: Instance, properties: readonly Keys[], getters: readonly PropertyKey[] = [],
) {
    const promises = properties.map((prop) => {
        const descriptor = getPropertyDescriptor(instance, prop);
        if (!descriptor) {
            throw new Error(`Cannot create a browser handle for property: ${prop} on object ${instance}. No such property descriptor.`);
        }
        if (descriptor.value) {
            return {
                name: prop,
                value: descriptor.value,
                type: typeof descriptor.value === 'function' ? 'METHOD' : 'VALUE',
            } as const;
        }
        if (descriptor.get) {
            const value = getters.includes(prop) ? descriptor.get : descriptor.get();
            const type = getters.includes(prop) ? 'GETTER' : 'METHOD';
            return { name: prop, value, type } as const;
        }
        throw new Error(`Cannot create a browser handle for property: ${prop} on object ${instance}. No getter or value for descriptor.`);
    }).map(async ({ name, value, type }) => {
        if (/^METHOD|GETTER$/.test(type)) value = await createBrowserHandle(page, value.bind(instance));
        return { name, value, type };
    });

    const props = await Promise.all(promises);
    return props.reduce((mappings, { name, value, type }) => {
        mappings[name] = { value, type };
        return mappings;
    }, {} as { [K in Keys]: { value: Instance[K] extends (...args: any[]) => any ? string : Instance[K]; type: 'METHOD' | 'VALUE' | 'GETTER' } });
}

export interface DumpConsoleOptions {
    /**
     * Prevents Browser context errors from being logged by default,
     * since there are usually a lot of errors produced by scraping
     * due to blocking resources, running headless, etc.
     */
    logErrors?: boolean;
}

/**
 * Attaches a console listener to page's console that
 * mirrors all console messages to the Node context.
 *
 * This is used instead of the "dumpio" launch option
 * to prevent cluttering the STDOUT with unnecessary
 * Chromium messages, usually internal errors, occurring in page.
 */
export function dumpConsole(page: Page, options: DumpConsoleOptions = {}) {
    page.on('console', async (msg: any) => {
        const msgType = msg.type();

        if (msgType === 'error' && !options.logErrors) return;

        // Do not ever log "Failed to load resource" errors, because they flood the log.
        if (msg.text() === RESOURCE_LOAD_ERROR_MESSAGE) return;

        // Check for JSHandle tags in .text(), since .args() will
        // always include JSHandles, even for strings.
        const hasJSHandles = msg.text().includes('JSHandle@');

        // If there are any unresolved JSHandles, get their JSON representations.
        // Otherwise, just use the text immediately.
        let message;
        if (hasJSHandles) {
            const msgPromises = msg.args().map((jsh: any) => {
                return jsh.jsonValue()
                    .catch((e: Error) => log.exception(e, `Stringification of console.${msgType} in browser failed.`));
            });
            message = (await Promise.all(msgPromises))
                .map((m: string) => inspect(m))
                .join(' '); // console.log('a', 'b') produces 'a b'
        } else {
            message = msg.text();
        }

        if (msgType in log) {
            log[msgType as 'info'](message);
        } else {
            log.info(message);
        }
    });
}

/**
 * Tracking variable for snapshot throttling.
 */
let lastSnapshotTimestamp = 0;

export interface SnapshotOptions {
    page?: Page;
    body?: Buffer | string;
    contentType?: string | null;
    json?: any;
}

/**
 * Saves raw body and a screenshot to the default key value store
 * under the SNAPSHOT-BODY and SNAPSHOT-SCREENSHOT keys.
 */
export async function saveSnapshot({ page, body, contentType, json }: SnapshotOptions) {
    // Throttle snapshots.
    const now = Date.now();
    if (now - lastSnapshotTimestamp < SNAPSHOT.TIMEOUT_SECS * 1000) {
        log.warning('Aborting saveSnapshot(). It can only be invoked once '
            + `in ${SNAPSHOT.TIMEOUT_SECS} secs to prevent database overloading.`);
        return;
    }
    lastSnapshotTimestamp = now;

    if (json) {
        await Actor.setValue(SNAPSHOT.KEYS.BODY, json);
    } else if (body && contentType) {
        await Actor.setValue(SNAPSHOT.KEYS.BODY, body, { contentType });
    } else if (page) {
        const htmlP = page.content();
        const screenshotP = page.screenshot();
        const [html, screenshot] = await Promise.all([htmlP, screenshotP]);
        await Promise.all([
            Actor.setValue(SNAPSHOT.KEYS.BODY, html, { contentType: 'text/html' }),
            Actor.setValue(SNAPSHOT.KEYS.SCREENSHOT, screenshot, { contentType: 'image/png' }),
        ]);
    } else {
        throw new Error('One of parameters "page" or "json" or "body" with "contentType" must be provided.');
    }
}
