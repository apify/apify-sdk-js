import type { IncomingMessage } from 'node:http';

import type { Request } from '@crawlee/core';
import { Actor, Configuration } from 'apify';

import { APIFY_ENV_VARS } from '@apify/consts';

describe('Actor platform detection', () => {
    test('works', () => {
        expect(Actor.isAtHome()).toBe(false);
        expect(Actor.isRunningOnApify()).toBe(false);
        process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
        expect(Actor.isAtHome()).toBe(true);
        expect(Actor.isRunningOnApify()).toBe(true);
        delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
        expect(Actor.isAtHome()).toBe(false);
        expect(Actor.isRunningOnApify()).toBe(false);
    });
});

describe('Actor.newClient()', () => {
    // crawlee v4's Configuration snapshots env vars at construction (it is
    // immutable), so to observe env changes made within a test we build the
    // client from a freshly-constructed Configuration rather than the cached
    // global instance behind `Actor.newClient()`.
    const newClientFromCurrentEnv = () => new Actor({ configuration: new Configuration() }).newClient();

    test('reads environment variables correctly', () => {
        process.env[APIFY_ENV_VARS.API_BASE_URL] = 'http://www.example.com:1234/path';
        process.env[APIFY_ENV_VARS.TOKEN] = 'token';
        const client = newClientFromCurrentEnv();

        expect(client.constructor.name).toBe('ApifyClient');
        expect(client.token).toBe('token');
        expect(client.baseUrl).toBe('http://www.example.com:1234/path/v2');
    });

    test('uses correct default if APIFY_API_BASE_URL is not defined', () => {
        delete process.env[APIFY_ENV_VARS.API_BASE_URL];
        process.env[APIFY_ENV_VARS.TOKEN] = 'token';
        const client = newClientFromCurrentEnv();

        expect(client.token).toBe('token');
        expect(client.baseUrl).toBe('https://api.apify.com/v2');
    });
});
