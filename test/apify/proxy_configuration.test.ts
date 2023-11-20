import { APIFY_ENV_VARS, LOCAL_APIFY_ENV_VARS } from '@apify/consts';
import { Actor, ProxyConfiguration } from 'apify';
import { UserClient } from 'apify-client';

const groups = ['GROUP1', 'GROUP2'];
const hostname = LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_HOSTNAME];
const port = Number(LOCAL_APIFY_ENV_VARS[APIFY_ENV_VARS.PROXY_PORT]);
const password = 'test12345';
const countryCode = 'CZ';
const sessionId = 538909250932;
const basicOpts = {
    groups,
    countryCode,
    password,
};
const basicOptsProxyUrl = 'http://groups-GROUP1+GROUP2,session-538909250932,country-CZ:test12345@proxy.apify.com:8000';
const proxyUrlNoSession = 'http://groups-GROUP1+GROUP2,country-CZ:test12345@proxy.apify.com:8000';

vitest.mock('@crawlee/utils', async (importActual) => {
    const mod = await importActual<typeof import('@crawlee/utils')>();

    return {
        ...mod,
        gotScraping: vitest.fn(),
    };
});

const { gotScraping } = await import('@crawlee/utils');

const gotScrapingSpy = vitest.mocked(gotScraping);

afterEach(() => {
    delete process.env[APIFY_ENV_VARS.TOKEN];
    delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
    delete process.env[APIFY_ENV_VARS.PROXY_HOSTNAME];
    delete process.env[APIFY_ENV_VARS.PROXY_STATUS_URL];
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

    test('newUrl() should return proxy URL', async () => {
        const proxyConfiguration = new ProxyConfiguration(basicOpts);

        expect(await proxyConfiguration.newUrl(sessionId)).toBe(basicOptsProxyUrl);
    });

    test('newProxyInfo() should return ProxyInfo object', async () => {
        const proxyConfiguration = new ProxyConfiguration(basicOpts);
        const url = basicOptsProxyUrl;

        const proxyInfo = {
            sessionId: `${sessionId}`,
            url,
            groups,
            countryCode,
            password,
            hostname,
            port,
        };
        expect(await proxyConfiguration.newProxyInfo(sessionId)).toStrictEqual(proxyInfo);
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

    test('should throw on invalid arguments structure', () => {
        // Group value
        const invalidGroups = ['GROUP1*'];
        let opts = { ...basicOpts };
        opts.groups = invalidGroups;

        expect(() => new ProxyConfiguration(opts)).toThrow('got `GROUP1*` in object');

        // Country code
        const invalidCountryCode = 'CZE';
        opts = { ...basicOpts };
        opts.countryCode = invalidCountryCode;
        expect(() => new ProxyConfiguration(opts)).toThrow('got `CZE` in object');
    });

    test('should throw on invalid groups and countryCode args', async () => {
        // @ts-expect-error invalid input
        expect(() => new ProxyConfiguration({ groups: [new Date()] })).toThrowError();
        // @ts-expect-error invalid input
        expect(() => new ProxyConfiguration({ groups: [{}, 'fff', 'ccc'] })).toThrowError();
        expect(() => new ProxyConfiguration({ groups: ['ffff', 'ff-hf', 'ccc'] })).toThrowError();
        expect(() => new ProxyConfiguration({ groups: ['ffff', 'fff', 'cc$c'] })).toThrowError();
        // @ts-expect-error invalid input
        expect(() => new ProxyConfiguration({ apifyProxyGroups: [new Date()] })).toThrowError();

        // @ts-expect-error invalid input
        expect(() => new ProxyConfiguration({ countryCode: new Date() })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: 'aa' })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: 'aB' })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: 'Ba' })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: '11' })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: 'DDDD' })).toThrow();
        expect(() => new ProxyConfiguration({ countryCode: 'dddd' })).toThrow();
        // @ts-expect-error invalid input
        expect(() => new ProxyConfiguration({ countryCode: 1111 })).toThrow();
    });

    test('newUrl() should throw on invalid session argument', async () => {
        const proxyConfiguration = new ProxyConfiguration();
        await Promise.all([
            expect(async () => proxyConfiguration.newUrl('a-b')).rejects.toThrow(),
            expect(proxyConfiguration.newUrl('a$b')).rejects.toThrow(),
            // @ts-expect-error invalid input
            expect(proxyConfiguration.newUrl({})).rejects.toThrow(),
            // @ts-expect-error invalid input
            expect(proxyConfiguration.newUrl(new Date())).rejects.toThrow(),
            expect(proxyConfiguration.newUrl(Array(51).fill('x').join(''))).rejects.toThrow(),

            expect(proxyConfiguration.newUrl('a_b')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('0.34252352')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('aaa~BBB')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('a_1_b')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('a_2')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('a')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl('1')).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl(123456)).resolves.not.toThrow(),
            expect(proxyConfiguration.newUrl(Array(50).fill('x').join(''))).resolves.not.toThrow(),
        ]);
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
        const customUrls = ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333',
            'http://proxy.com:4444', 'http://proxy.com:5555', 'http://proxy.com:6666'];
        const newUrlFunction = () => {
            return customUrls.pop();
        };
        const proxyConfiguration = new ProxyConfiguration({
            newUrlFunction,
        });

        // through newUrl()
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:6666');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:5555');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:4444');

        // through newProxyInfo()
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:3333');
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:2222');
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:1111');
    });

    test('async newUrlFunction should work correctly', async () => {
        const customUrls = ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333',
            'http://proxy.com:4444', 'http://proxy.com:5555', 'http://proxy.com:6666'];
        const newUrlFunction = async () => {
            await new Promise((r) => setTimeout(r, 5));
            return customUrls.pop();
        };
        const proxyConfiguration = new ProxyConfiguration({
            newUrlFunction,
        });

        // through newUrl()
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:6666');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:5555');
        expect(await proxyConfiguration.newUrl()).toEqual('http://proxy.com:4444');

        // through newProxyInfo()
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:3333');
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:2222');
        expect((await proxyConfiguration.newProxyInfo()).url).toEqual('http://proxy.com:1111');
    });

    describe('With proxyUrls options', () => {
        test('should rotate custom URLs correctly', async () => {
            const proxyConfiguration = new ProxyConfiguration({
                proxyUrls: ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'],
            });

            // @ts-expect-error private property
            const { proxyUrls } = proxyConfiguration;
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[0]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[1]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[2]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[0]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[1]);
            expect(await proxyConfiguration.newUrl()).toEqual(proxyUrls[2]);
        });

        test('newProxyInfo() should return correctly rotated URL', async () => {
            const proxyConfiguration = new ProxyConfiguration({
                proxyUrls: ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'],
            });

            // @ts-expect-error TODO private property?
            const { proxyUrls } = proxyConfiguration;
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[0]);
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[1]);
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[2]);
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[0]);
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[1]);
            expect((await proxyConfiguration.newProxyInfo()).url).toEqual(proxyUrls[2]);
        });

        test('should rotate custom URLs with sessions correctly', async () => {
            const sessions = ['sesssion_01', 'sesssion_02', 'sesssion_03', 'sesssion_04', 'sesssion_05', 'sesssion_06'];
            const proxyConfiguration = new ProxyConfiguration({
                proxyUrls: ['http://proxy.com:1111', 'http://proxy.com:2222', 'http://proxy.com:3333'],
            });

            // @ts-expect-error TODO private property?
            const { proxyUrls } = proxyConfiguration;
            // should use same proxy URL
            expect(await proxyConfiguration.newUrl(sessions[0])).toEqual(proxyUrls[0]);
            expect(await proxyConfiguration.newUrl(sessions[0])).toEqual(proxyUrls[0]);
            expect(await proxyConfiguration.newUrl(sessions[0])).toEqual(proxyUrls[0]);

            // should rotate different proxies
            expect(await proxyConfiguration.newUrl(sessions[1])).toEqual(proxyUrls[1]);
            expect(await proxyConfiguration.newUrl(sessions[2])).toEqual(proxyUrls[2]);
            expect(await proxyConfiguration.newUrl(sessions[3])).toEqual(proxyUrls[0]);
            expect(await proxyConfiguration.newUrl(sessions[4])).toEqual(proxyUrls[1]);
            expect(await proxyConfiguration.newUrl(sessions[5])).toEqual(proxyUrls[2]);

            // should remember already used session
            expect(await proxyConfiguration.newUrl(sessions[1])).toEqual(proxyUrls[1]);
            expect(await proxyConfiguration.newUrl(sessions[3])).toEqual(proxyUrls[0]);
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

    test('should work with all options', async () => {
        const status = { connected: true };
        const proxyUrl = proxyUrlNoSession;
        const url = 'http://proxy.apify.com/?format=json';
        gotScrapingSpy.mockResolvedValueOnce({ body: status } as any);

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

        expect(gotScrapingSpy).toBeCalledWith({ url, proxyUrl, timeout: { request: 4000 }, responseType: 'json' });
    });

    test('should work without password (with token)', async () => {
        process.env.APIFY_TOKEN = '123456789';
        const opts = { ...basicOpts };
        delete opts.password;

        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        const status = { connected: true };

        gotScrapingSpy.mockResolvedValueOnce({ body: status } as any);
        getUserSpy.mockResolvedValueOnce(userData as any);

        // FIXME this fails + 2 more tests here, probably another isAtHome?
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

        gotScrapingSpy.mockRestore();
        getUserSpy.mockRestore();
    });

    test('should show warning log', async () => {
        process.env.APIFY_TOKEN = '123456789';

        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        const status = { connected: true };
        const fakeUserData = { proxy: { password: 'some-other-users-password' } };
        getUserSpy.mockResolvedValueOnce(fakeUserData as any);
        gotScrapingSpy.mockResolvedValueOnce({ body: status } as any);

        const proxyConfiguration = new ProxyConfiguration(basicOpts);
        // @ts-expect-error
        const logMock = vitest.spyOn(proxyConfiguration.log, 'warning');
        await proxyConfiguration.initialize();
        expect(logMock).toBeCalledTimes(1);

        logMock.mockRestore();
        getUserSpy.mockRestore();
        gotScrapingSpy.mockRestore();
    });

    test('should throw missing password', async () => {
        delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
        delete process.env[APIFY_ENV_VARS.TOKEN];

        const status = { connected: true };

        const fakeCall = async () => {
            return { body: status };
        };

        gotScrapingSpy.mockImplementationOnce(fakeCall as any);

        await expect(Actor.createProxyConfiguration()).rejects.toThrow('Apify Proxy password must be provided');

        gotScrapingSpy.mockRestore();
    });

    test('should throw when group is not available', async () => {
        delete process.env[APIFY_ENV_VARS.PROXY_PASSWORD];
        process.env.APIFY_TOKEN = '123456789';
        const connectionError = 'Invalid username: proxy group "GROUP2"; not found or not accessible.';
        const status = { connected: false, connectionError };
        const getUserSpy = vitest.spyOn(UserClient.prototype, 'get');
        getUserSpy.mockResolvedValue(userData as any);
        gotScrapingSpy.mockResolvedValueOnce({ body: status } as any);

        await expect(Actor.createProxyConfiguration({ groups })).rejects.toThrow(connectionError);

        gotScrapingSpy.mockRestore();
        getUserSpy.mockRestore();
    });

    test('should not throw when access check is unresponsive', async () => {
        process.env.APIFY_PROXY_PASSWORD = '123456789';
        gotScrapingSpy.mockRejectedValueOnce(new Error('some error'));
        gotScrapingSpy.mockRejectedValueOnce(new Error('some error'));

        const proxyConfiguration = new ProxyConfiguration();
        // @ts-expect-error private property
        const logMock = vitest.spyOn(proxyConfiguration.log, 'warning');

        await proxyConfiguration.initialize();
        expect(logMock).toBeCalledTimes(1);

        gotScrapingSpy.mockRestore();
        logMock.mockRestore();
    });

    test('should connect to proxy in environments other than production', async () => {
        process.env.APIFY_PROXY_STATUS_URL = 'http://proxy-domain.apify.com';
        process.env.APIFY_PROXY_HOSTNAME = 'proxy-domain.apify.com';
        process.env.APIFY_PROXY_PASSWORD = password;

        gotScrapingSpy.mockResolvedValueOnce({ body: { connected: true } } as any);

        await Actor.createProxyConfiguration();
        expect(gotScrapingSpy).toBeCalledWith({
            url: `${process.env.APIFY_PROXY_STATUS_URL}/?format=json`,
            proxyUrl: `http://auto:${password}@${process.env.APIFY_PROXY_HOSTNAME}:8000`,
            responseType: 'json',
            timeout: {
                request: 4000,
            },
        });

        gotScrapingSpy.mockRestore();
    });
});
