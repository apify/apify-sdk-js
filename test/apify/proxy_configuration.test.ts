import { Actor, ArgumentValidationError, ProxyConfiguration } from 'apify';
import { UserClient } from 'apify-client';
import { type Dictionary, sleep } from 'crawlee';
import type { MockInstance } from 'vitest';

import { APIFY_ENV_VARS, LOCAL_APIFY_ENV_VARS } from '@apify/consts';

import { resetGlobalState } from '../resetGlobalState.js';

const groups = ['GROUP1', 'GROUP2'];
const hostname = LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_HOSTNAME];
const port = Number(LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_PORT]);
const password = 'test12345';
const countryCode = 'CZ';
const basicOpts = {
    groups,
    countryCode,
    password,
};
// Apify Proxy URLs always carry a fresh random `session-XXXX` segment; tests
// match against this pattern rather than a hard-coded session id.
const apifyProxyUrlPattern =
    /^http:\/\/groups-GROUP1\+GROUP2,session-[A-Za-z0-9]+,country-CZ:test12345@proxy\.apify\.com:8000$/;

// The proxy status check is a `node:http` request through the proxy, encapsulated
// in `_requestStatus(statusUrl, proxyUrl)`. Spy on it to stub the status response
// and to assert the (session/groups/country) proxy URL the request is routed
// through — without touching the network.
//
// The spy is (re)created in `beforeEach` because the vitest config has
// `restoreMocks: true`, which un-spies module-level spies between tests. It
// defaults to "unavailable" so tests that don't set a status never hit the real
// network; tests opt in via `requestStatusSpy.mockResolvedValueOnce(...)`.
let requestStatusSpy: MockInstance;

beforeEach(() => {
    requestStatusSpy = vitest.spyOn(ProxyConfiguration.prototype as never, '_requestStatus');
    requestStatusSpy.mockRejectedValue(new Error('Proxy status unavailable in tests'));
});

afterEach(() => {
    delete process.env[APIFY_ENV_VARS.TOKEN];
    delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
    delete process.env[APIFY_ENV_VARS.PROXY_HOSTNAME];
    delete process.env[APIFY_ENV_VARS.PROXY_STATUS_URL];
    delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
});

describe('ProxyConfiguration', () => {
    test('should accept all options', () => {
        const proxyConfiguration = new ProxyConfiguration(basicOpts);

        expect(proxyConfiguration).toBeInstanceOf(ProxyConfiguration);
        // @ts-expect-error private property
        expect(proxyConfiguration.groups).toBe(groups);
        // @ts-expect-error private property
        expect(proxyConfiguration.countryCode).toBe(countryCode);
        // @ts-expect-error private property
        expect(proxyConfiguration.password).toBe(password);
        // @ts-expect-error private property
        expect(proxyConfiguration.hostname).toBe(hostname);
        // @ts-expect-error private property
        expect(proxyConfiguration.port).toBe(port);
    });

    test('newUrl() returns an Apify Proxy URL with a random session id', async () => {
        const proxyConfiguration = new ProxyConfiguration(basicOpts);

        const url1 = await proxyConfiguration.newUrl();
        const url2 = await proxyConfiguration.newUrl();

        expect(url1).toMatch(apifyProxyUrlPattern);
        expect(url2).toMatch(apifyProxyUrlPattern);
        // Consecutive calls must produce independent URLs.
        expect(url1).not.toBe(url2);
    });

    test('newProxyInfo() returns a ProxyInfo object with a fresh URL', async () => {
        const proxyConfiguration = new ProxyConfiguration(basicOpts);

        const info = await proxyConfiguration.newProxyInfo();
        expect(info).toBeDefined();
        expect(info!.url).toMatch(apifyProxyUrlPattern);
        expect(info!.groups).toEqual(groups);
        expect(info!.countryCode).toBe(countryCode);
        expect(info!.password).toBe(password);
        expect(info!.hostname).toBe(hostname);
        expect(info!.port).toBe(String(port));
        expect(info!.username).toMatch(/^groups-GROUP1\+GROUP2,session-[A-Za-z0-9]+,country-CZ$/);
    });

    test('newProxyInfo() works with custom proxyUrls and special characters', async () => {
        const url = 'http://user%40name:pass%40word@proxy.com:1111';
        const proxyConfiguration = new ProxyConfiguration({ proxyUrls: [url] });

        expect(await proxyConfiguration.newProxyInfo()).toEqual({
            url,
            username: 'user@name',
            password: 'pass@word',
            hostname: 'proxy.com',
            port: '1111',
        });
    });

    test('actor UI input schema should work', () => {
        const apifyProxyGroups = ['GROUP1', 'GROUP2'];
        const apifyProxyCountry = 'CZ';

        const input = {
            apifyProxyGroups,
            apifyProxyCountry,
        };

        const proxyConfiguration = new ProxyConfiguration(input);

        // @ts-expect-error
        expect(proxyConfiguration.groups).toStrictEqual(apifyProxyGroups);
        // @ts-expect-error
        expect(proxyConfiguration.countryCode).toStrictEqual(apifyProxyCountry);
    });

    describe('subdivisionCode', () => {
        test('is embedded into the country username parameter', async () => {
            const proxyConfiguration = new ProxyConfiguration({
                groups,
                countryCode: 'US',
                subdivisionCode: 'CA',
                password,
            });

            const info = (await proxyConfiguration.newProxyInfo())!;
            expect(info.subdivisionCode).toBe('CA');
            expect(info.username).toMatch(/^groups-GROUP1\+GROUP2,session-[A-Za-z0-9]+,country-US_CA$/);
        });

        test('can be supplied via the apifyProxySubdivision alias', () => {
            const proxyConfiguration = new ProxyConfiguration({
                groups,
                apifyProxyCountry: 'US',
                apifyProxySubdivision: 'TX',
                password,
            });

            // @ts-expect-error private
            expect(proxyConfiguration.subdivisionCode).toBe('TX');
        });

        test('requires countryCode to be set', () => {
            expect(() => new ProxyConfiguration({ subdivisionCode: 'CA', password })).toThrow(
                'ProxyConfiguration: "subdivisionCode" requires "countryCode" to be set.',
            );
        });

        test('throws on an invalid subdivisionCode', () => {
            expect(
                () =>
                    new ProxyConfiguration({
                        countryCode: 'US',
                        subdivisionCode: 'California',
                        password,
                    }),
            ).toThrow('Invalid string: must match pattern /^[A-Z0-9]{1,3}$/ at `subdivisionCode`, got `California`');
            expect(
                () =>
                    new ProxyConfiguration({
                        countryCode: 'US',
                        subdivisionCode: 'ca',
                        password,
                    }),
            ).toThrow('Invalid string: must match pattern /^[A-Z0-9]{1,3}$/ at `subdivisionCode`, got `ca`');
        });
    });

    test('should throw on invalid arguments structure', () => {
        // Validation errors are plain, human-readable sentences that name the
        // offending field *and* the value it received, not a JSON dump.
        const invalidGroups = ['GROUP1*'];
        let opts = { ...basicOpts };
        opts.groups = invalidGroups;

        expect(() => new ProxyConfiguration(opts)).toThrow(
            'Invalid string: must match pattern /^[\\w._~]+$/ at `groups[0]`, got `GROUP1*`',
        );

        // Country code
        const invalidCountryCode = 'CZE';
        opts = { ...basicOpts };
        opts.countryCode = invalidCountryCode;
        expect(() => new ProxyConfiguration(opts)).toThrow(
            'Invalid string: must match pattern /^[A-Z]{2}$/ at `countryCode`, got `CZE`',
        );
    });

    test('throws an ArgumentValidationError exposing the structured issues', () => {
        let caught: unknown;
        try {
            new ProxyConfiguration({ countryCode: 'CZE' });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(ArgumentValidationError);
        const error = caught as ArgumentValidationError;
        expect(error.message).toContain('got `CZE`');
        // `issues` is accessible directly (no need to reach into `cause`).
        expect(error.issues).toHaveLength(1);
        expect(error.issues[0].path).toEqual(['countryCode']);
    });

    test('should throw on invalid groups and countryCode args', async () => {
        expect(
            // @ts-expect-error invalid input
            () => new ProxyConfiguration({ groups: [new Date()] }),
        ).toThrow('Invalid input: expected string, received Date');
        expect(
            // @ts-expect-error invalid input
            () => new ProxyConfiguration({ groups: [{}, 'fff', 'ccc'] }),
        ).toThrow('Invalid input: expected string, received object');
        expect(() => new ProxyConfiguration({ groups: ['ffff', 'ff-hf', 'ccc'] })).toThrow('must match pattern');
        expect(() => new ProxyConfiguration({ groups: ['ffff', 'fff', 'cc$c'] })).toThrow('must match pattern');
        expect(
            // @ts-expect-error invalid input
            () => new ProxyConfiguration({ apifyProxyGroups: [new Date()] }),
        ).toThrow('Invalid input: expected string, received Date');

        expect(
            // @ts-expect-error invalid input
            () => new ProxyConfiguration({ countryCode: new Date() }),
        ).toThrow('Invalid input: expected string, received Date');
        expect(() => new ProxyConfiguration({ countryCode: 'aa' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(() => new ProxyConfiguration({ countryCode: 'aB' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(() => new ProxyConfiguration({ countryCode: 'Ba' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(() => new ProxyConfiguration({ countryCode: '11' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(() => new ProxyConfiguration({ countryCode: 'DDDD' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(() => new ProxyConfiguration({ countryCode: 'dddd' })).toThrow('must match pattern /^[A-Z]{2}$/');
        expect(
            // @ts-expect-error invalid input
            () => new ProxyConfiguration({ countryCode: 1111 }),
        ).toThrow('Invalid input: expected string, received number');
    });

    test('should throw on invalid newUrlFunction', async () => {
        const newUrlFunction = () => {
            return 'http://proxy.com:1111*invalid_url';
        };
        const proxyConfiguration = new ProxyConfiguration({
            newUrlFunction,
        });
        try {
            await proxyConfiguration.newUrl();
            throw new Error('wrong error');
        } catch (err) {
            expect((err as Error).message).toMatch('The provided newUrlFunction did not return');
        }
    });

    test('newUrlFunction should correctly generate URLs', async () => {
        const customUrls = [
            'http://proxy.com:1111',
            'http://proxy.com:2222',
            'http://proxy.com:3333',
            'http://proxy.com:4444',
            'http://proxy.com:5555',
            'http://proxy.com:6666',
        ];
        const newUrlFunction = () => {
            return customUrls.pop() ?? null;
        };
        const proxyConfiguration = new ProxyConfiguration({
            newUrlFunction,
        });

        // through newUrl()
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:6666');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:5555');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:4444');

        // through newProxyInfo()
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:3333');
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:2222');
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:1111');
    });

    test('async newUrlFunction should work correctly', async () => {
        const customUrls = [
            'http://proxy.com:1111',
            'http://proxy.com:2222',
            'http://proxy.com:3333',
            'http://proxy.com:4444',
            'http://proxy.com:5555',
            'http://proxy.com:6666',
        ];
        const newUrlFunction = async () => {
            await sleep(5);
            return customUrls.pop() ?? null;
        };
        const proxyConfiguration = new ProxyConfiguration({
            newUrlFunction,
        });

        // through newUrl()
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:6666');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:5555');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:4444');

        // through newProxyInfo()
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:3333');
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:2222');
        expect((await proxyConfiguration.newProxyInfo())?.url).toEqual('http://proxy.com:1111');
    });

    describe('With proxyUrls options', () => {
        test('should rotate custom URLs correctly', async () => {
            const proxyConfiguration = new ProxyConfiguration({
                proxyUrls: ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'],
            });

            // @ts-expect-error private property
            const { proxyUrls } = proxyConfiguration;
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![0]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![1]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![2]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![0]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![1]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls![2]);
        });

        test('newProxyInfo() should return correctly rotated URL', async () => {
            const proxyConfiguration = new ProxyConfiguration({
                proxyUrls: ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'],
            });

            // @ts-expect-error TODO private property?
            const { proxyUrls } = proxyConfiguration;
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![0]);
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![1]);
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![2]);
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![0]);
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![1]);
            expect((await proxyConfiguration.newProxyInfo())!.url).toEqual(proxyUrls![2]);
        });

        test('should throw cannot combine custom proxies with Apify Proxy', async () => {
            const proxyUrls = ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'];
            const newUrlFunction = () => {
                return proxyUrls[Math.floor(Math.random() * proxyUrls.length)];
            };
            try {
                const proxyConfiguration = new ProxyConfiguration({
                    groups: ['GROUP1'],
                    proxyUrls,
                });
                throw new Error('wrong error');
            } catch (err) {
                expect((err as Error).message).toMatch('Cannot combine custom proxies with Apify Proxy!');
            }

            try {
                const proxyConfiguration = new ProxyConfiguration({
                    groups: ['GROUP1'],
                    newUrlFunction,
                });
                throw new Error('wrong error');
            } catch (err) {
                expect((err as Error).message).toMatch('Cannot combine custom proxies with Apify Proxy!');
            }
        });

        test('should throw cannot combine custom methods', async () => {
            const proxyUrls = ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'];
            const newUrlFunction = () => {
                return proxyUrls[Math.floor(Math.random() * proxyUrls.length)];
            };
            try {
                const proxyConfiguration = new ProxyConfiguration({
                    proxyUrls,
                    newUrlFunction,
                });
                throw new Error('wrong error');
            } catch (err) {
                expect((err as Error).message).toMatch('Cannot combine custom proxies "options.proxyUrls"');
            }
        });

        test('should throw proxyUrls array is empty', async () => {
            try {
                const proxyConfiguration = new ProxyConfiguration({
                    proxyUrls: [],
                });
                throw new Error('wrong error');
            } catch (err) {
                expect((err as Error).message).toMatch('Expected property array `proxyUrls` to not be empty');
            }
        });

        test('should throw invalid custom URL form', async () => {
            try {
                const proxyConfiguration = new ProxyConfiguration({
                    proxyUrls: ['http://proxy.com:1111*invalid_url'],
                });
                throw new Error('wrong error');
            } catch (err) {
                expect((err as Error).message).toMatch('to be a URL, got `http://proxy.com:1111*invalid_url`');
            }
        });
    });
});

describe('Actor.createProxyConfiguration()', () => {
    const userData = { proxy: { password } };

    beforeEach(() => {
        resetGlobalState();
    });

    test('should work with all options', async () => {
        const status = { connected: true };
        const url = 'http://proxy.apify.com/?format=json';
        requestStatusSpy.mockResolvedValueOnce(status);

        const proxyConfiguration = await Actor.createProxyConfiguration(basicOpts);

        expect(proxyConfiguration).toBeInstanceOf(ProxyConfiguration);
        // @ts-expect-error private property
        expect(proxyConfiguration.groups).toBe(groups);
        // @ts-expect-error private property
        expect(proxyConfiguration.countryCode).toBe(countryCode);
        // @ts-expect-error private property
        expect(proxyConfiguration.password).toBe(password);
        // @ts-expect-error private property
        expect(proxyConfiguration.hostname).toBe(hostname);
        // @ts-expect-error private property
        expect(proxyConfiguration.port).toBe(port);

        // The status endpoint is fetched through a proxy whose URL carries the
        // groups/country/session built from the options.
        expect(requestStatusSpy).toBeCalledWith(url, expect.stringMatching(apifyProxyUrlPattern));
    });

    test('disabling `checkAccess` skips the proxy status check', async () => {
        const proxyConfiguration = await Actor.createProxyConfiguration({
            ...basicOpts,
            checkAccess: false,
        });

        expect(proxyConfiguration).toBeInstanceOf(ProxyConfiguration);
        // The status endpoint must not be hit when access checking is disabled.
        expect(requestStatusSpy).not.toHaveBeenCalled();
    });

    test('should work without password (with token)', async () => {
        process.env.APIFY_TOKEN = '123456789';
        const opts: Dictionary = { ...basicOpts };
        delete opts.password;

        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        const status = { connected: true };

        requestStatusSpy.mockResolvedValueOnce(status);
        getUserSpy.mockResolvedValueOnce(userData as any);

        const proxyConfiguration = await Actor.createProxyConfiguration(opts);

        expect(proxyConfiguration).toBeInstanceOf(ProxyConfiguration);
        // @ts-expect-error private property
        expect(proxyConfiguration.groups).toBe(groups);
        // @ts-expect-error private property
        expect(proxyConfiguration.countryCode).toBe(countryCode);
        // @ts-expect-error private property
        expect(proxyConfiguration.hostname).toBe(hostname);
        // @ts-expect-error private property
        expect(proxyConfiguration.port).toBe(port);

        getUserSpy.mockRestore();
    });

    test(`shouldn't request password from API when both PROXY_PASSWORD and TOKEN envs are provided`, async () => {
        process.env[APIFY_ENV_VARS.TOKEN] = 'some_token';
        process.env[APIFY_ENV_VARS.PROXY_PASSWORD] = 'proxy_password';

        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        const proxyConfiguration = new ProxyConfiguration();
        await proxyConfiguration.initialize();
        expect(getUserSpy).toBeCalledTimes(0);

        getUserSpy.mockRestore();
    });

    // TODO: test that on platform we throw but locally we only print warning
    test('should throw missing password', async () => {
        delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
        delete process.env[APIFY_ENV_VARS.TOKEN];
        process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';

        const status = { connected: true };

        requestStatusSpy.mockResolvedValueOnce(status);

        await expect(Actor.createProxyConfiguration()).rejects.toThrow('Apify Proxy password must be provided');

        delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
        await expect(Actor.createProxyConfiguration()).resolves.toBeInstanceOf(ProxyConfiguration);
    });

    test('should throw when group is not available', async () => {
        delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
        process.env.APIFY_TOKEN = '123456789';
        process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
        const connectionError = 'Invalid username: proxy group "GROUP2"; not found or not accessible.';
        const status = { connected: false, connectionError };
        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        getUserSpy.mockResolvedValue(userData as any);
        requestStatusSpy.mockResolvedValueOnce(status);

        await expect(Actor.createProxyConfiguration({ groups })).rejects.toThrow(connectionError);

        getUserSpy.mockRestore();

        delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
        await expect(Actor.createProxyConfiguration({ groups })).resolves.toBeInstanceOf(ProxyConfiguration);
    });

    test('should not throw when access check is unresponsive', async () => {
        process.env.APIFY_PROXY_PASSWORD = '123456789';
        requestStatusSpy.mockRejectedValue(new Error('some error'));

        const proxyConfiguration = new ProxyConfiguration();
        // @ts-expect-error private property
        const logMock = vitest.spyOn(proxyConfiguration.log, 'warning');

        await proxyConfiguration.initialize();
        expect(logMock).toBeCalledTimes(1);

        logMock.mockRestore();
    });

    test('should connect to proxy in environments other than production', async () => {
        process.env.APIFY_PROXY_STATUS_URL = 'http://proxy-domain.apify.com';
        process.env.APIFY_PROXY_HOSTNAME = 'proxy-domain.apify.com';
        process.env.APIFY_PROXY_PASSWORD = password;

        requestStatusSpy.mockResolvedValueOnce({ connected: true });

        await Actor.createProxyConfiguration();
        expect(requestStatusSpy).toBeCalledWith(
            `${process.env.APIFY_PROXY_STATUS_URL}/?format=json`,
            expect.stringMatching(
                new RegExp(`^http://session-[A-Za-z0-9]+:${password}@${process.env.APIFY_PROXY_HOSTNAME}:8000$`),
            ),
        );
    });
});
