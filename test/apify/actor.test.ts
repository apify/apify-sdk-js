import { createPublicKey } from 'node:crypto';

import { ACTOR_ENV_VARS, ACT_JOB_STATUSES, APIFY_ENV_VARS, KEY_VALUE_STORE_KEYS, WEBHOOK_EVENT_TYPES } from '@apify/consts';
import { encryptInputSecrets } from '@apify/input_secrets';
import log from '@apify/log';
import { Configuration, EventType, StorageManager } from '@crawlee/core';
import { sleep } from '@crawlee/utils';
import type { ApifyEnv } from 'apify';
import { Actor, ProxyConfiguration, KeyValueStore, Dataset } from 'apify';
import type { WebhookUpdateData } from 'apify-client';
import { ActorClient, ApifyClient, RunClient, TaskClient } from 'apify-client';

import { MemoryStorageEmulator } from '../MemoryStorageEmulator';

const getEmptyEnv = () => {
    return {
        // internalPort: null,
        actorId: null,
        actorRunId: null,
        userId: null,
        token: null,
        startedAt: null,
        timeoutAt: null,
        defaultKeyValueStoreId: null,
        defaultDatasetId: null,
        memoryMbytes: null,
    } as ApifyEnv;
};

const setEnv = (env: ApifyEnv) => {
    delete process.env.ACTOR_ID;
    delete process.env.ACTOR_RUN_ID;
    delete process.env.APIFY_USER_ID;
    delete process.env.APIFY_TOKEN;
    delete process.env.ACTOR_STARTED_AT;
    delete process.env.ACTOR_TIMEOUT_AT;
    delete process.env.ACTOR_DEFAULT_KEY_VALUE_STORE_ID;
    delete process.env.ACTOR_DEFAULT_DATASET_ID;
    delete process.env.ACTOR_MEMORY_MBYTES;

    if (env.actorId) process.env.ACTOR_ID = env.actorId;
    if (env.actorRunId) process.env.ACTOR_RUN_ID = env.actorRunId;
    if (env.userId) process.env.APIFY_USER_ID = env.userId;
    if (env.token) process.env.APIFY_TOKEN = env.token;
    if (env.startedAt) process.env.ACTOR_STARTED_AT = env.startedAt.toISOString();
    if (env.timeoutAt) process.env.ACTOR_TIMEOUT_AT = env.timeoutAt.toISOString();
    if (env.defaultKeyValueStoreId) process.env.ACTOR_DEFAULT_KEY_VALUE_STORE_ID = env.defaultKeyValueStoreId;
    if (env.defaultDatasetId) process.env.ACTOR_DEFAULT_DATASET_ID = env.defaultDatasetId;
    if (env.memoryMbytes) process.env.ACTOR_MEMORY_MBYTES = env.memoryMbytes.toString();
};

const testingPublicKey = createPublicKey({
    // eslint-disable-next-line max-len
    key: Buffer.from('LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF0dis3NlNXbklhOFFKWC94RUQxRQpYdnBBQmE3ajBnQnVYenJNUU5adjhtTW1RU0t2VUF0TmpOL2xacUZpQ0haZUQxU2VDcGV1MnFHTm5XbGRxNkhUCnh5cXJpTVZEbFNKaFBNT09QSENISVNVdFI4Tk5lR1Y1MU0wYkxJcENabHcyTU9GUjdqdENWejVqZFRpZ1NvYTIKQWxrRUlRZWQ4UVlDKzk1aGJoOHk5bGcwQ0JxdEdWN1FvMFZQR2xKQ0hGaWNuaWxLVFFZay9MZzkwWVFnUElPbwozbUppeFl5bWFGNmlMZTVXNzg1M0VHWUVFVWdlWmNaZFNjaGVBMEdBMGpRSFVTdnYvMEZjay9adkZNZURJOTVsCmJVQ0JoQjFDbFg4OG4wZUhzUmdWZE5vK0NLMDI4T2IvZTZTK1JLK09VaHlFRVdPTi90alVMdGhJdTJkQWtGcmkKOFFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==', 'base64'),
});
// eslint-disable-next-line max-len
const testingPrivateKeyFile = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpQcm9jLVR5cGU6IDQsRU5DUllQVEVECkRFSy1JbmZvOiBERVMtRURFMy1DQkMsNTM1QURERjIzNUQ4QkFGOQoKMXFWUzl0S0FhdkVhVUVFMktESnpjM3plMk1lZkc1dmVEd2o1UVJ0ZkRaMXdWNS9VZmIvcU5sVThTSjlNaGhKaQp6RFdrWExueUUzSW0vcEtITVZkS0czYWZkcFRtcis2TmtidXptd0dVMk0vSWpzRjRJZlpad0lGbGJoY09jUnp4CmZmWVIvTlVyaHNrS1RpNGhGV0lBUDlLb3Z6VDhPSzNZY3h6eVZQWUxYNGVWbWt3UmZzeWkwUU5Xb0tGT3d0ZC8KNm9HYzFnd2piRjI5ZDNnUThZQjFGWmRLa1AyMTJGbkt1cTIrUWgvbE1zTUZrTHlTQTRLTGJ3ZG1RSXExbE1QUwpjbUNtZnppV3J1MlBtNEZoM0dmWlQyaE1JWHlIRFdEVzlDTkxKaERodExOZ2RRamFBUFpVT1E4V2hwSkE5MS9vCjJLZzZ3MDd5Z2RCcVd5dTZrc0pXcjNpZ1JpUEJ5QmVNWEpEZU5HY3NhaUZ3Q2c5eFlja1VORXR3NS90WlRsTjIKSEdZV0NpVU5Ed0F2WllMUHR1SHpIOFRFMGxsZm5HR0VuVC9QQlp1UHV4andlZlRleE1mdzFpbGJRU3lkcy9HMgpOOUlKKzkydms0N0ZXR2NOdGh1Q3lCbklva0NpZ0c1ZlBlV2IwQTdpdjk0UGtwRTRJZ3plc0hGQ0ZFQWoxWldLCnpQdFRBQlkwZlJrUzBNc3UwMHYxOXloTTUrdFUwYkVCZWo2eWpzWHRoYzlwS01hcUNIZWlQTC9TSHRkaWsxNVMKQmU4Sml4dVJxZitUeGlYWWVuNTg2aDlzTFpEYzA3cGpkUGp2NVNYRnBYQjhIMlVxQ0tZY2p4R3RvQWpTV0pjWApMNHc3RHNEby80bVg1N0htR09iamlCN1ZyOGhVWEJDdFh2V0dmQXlmcEFZNS9vOXowdm4zREcxaDc1NVVwdDluCkF2MFZrbm9qcmJVYjM1ZlJuU1lYTVltS01LSnpNRlMrdmFvRlpwV0ZjTG10cFRWSWNzc0JGUEYyZEo3V1c0WHMKK0d2Vkl2eFl3S2wyZzFPTE1TTXRZa09vekdlblBXTzdIdU0yMUVKVGIvbHNEZ25GaTkrYWRGZHBLY3R2cm0zdgpmbW1HeG5pRmhLU05GU0xtNms5YStHL2pjK3NVQVBhb2FZNEQ3NHVGajh0WGp0eThFUHdRRGxVUGRVZld3SE9PClF3bVgyMys1REh4V0VoQy91Tm8yNHNNY2ZkQzFGZUpBV281bUNuVU5vUVVmMStNRDVhMzNJdDhhMmlrNUkxUWoKeSs1WGpRaG0xd3RBMWhWTWE4aUxBR0toT09lcFRuK1VBZHpyS0hvNjVtYzNKbGgvSFJDUXJabnVxWkErK0F2WgpjeWU0dWZGWC8xdmRQSTdLb2Q0MEdDM2dlQnhweFFNYnp1OFNUcGpOcElJRkJvRVc5dFRhemUzeHZXWnV6dDc0CnFjZS8xWURuUHBLeW5lM0xGMk94VWoyYWVYUW5YQkpYcGhTZTBVTGJMcWJtUll4bjJKWkl1d09RNHV5dm94NjUKdG9TWGNac054dUs4QTErZXNXR3JSN3pVc0djdU9QQTFERE9Ja2JjcGtmRUxMNjk4RTJRckdqTU9JWnhrcWdxZQoySE5VNktWRmV2NzdZeEJDbm1VcVdXZEhYMjcyU2NPMUYzdWpUdFVnRVBNWGN0aEdBckYzTWxEaUw1Q0k0RkhqCnhHc3pVemxzalRQTmpiY2MzdUE2MjVZS3VVZEI2c1h1Rk5NUHk5UDgwTzBpRWJGTXl3MWxmN2VpdFhvaUUxWVoKc3NhMDVxTUx4M3pPUXZTLzFDdFpqaFp4cVJMRW5pQ3NWa2JVRlVYclpodEU4dG94bGpWSUtpQ25qbitORmtqdwo2bTZ1anpBSytZZHd2Nk5WMFB4S0gwUk5NYVhwb1lmQk1oUmZ3dGlaS3V3Y2hyRFB5UEhBQ2J3WXNZOXdtUE9rCnpwdDNxWi9JdDVYTmVqNDI0RzAzcGpMbk1sd1B1T1VzYmFQUWQ2VHU4TFhsckZReUVjTXJDNHdjUTA1SzFVN3kKM1NNN3RFaTlnbjV3RjY1YVI5eEFBR0grTUtMMk5WNnQrUmlTazJVaWs1clNmeDE4Mk9wYmpSQ2grdmQ4UXhJdwotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
const testingPrivateKeyPassphrase = 'pwd1234';

describe('Actor', () => {
    const localStorageEmulator = new MemoryStorageEmulator();

    beforeEach(async () => {
        await localStorageEmulator.init();
    });

    afterAll(async () => {
        await localStorageEmulator.destroy();
    });

    describe('new Actor({ ... })', () => {
        describe('getEnv()', () => {
            let prevEnv: ApifyEnv;

            beforeAll(() => { prevEnv = new Actor().getEnv(); });
            afterAll(() => { setEnv(prevEnv); });

            test('works with null values', () => {
                const expectedEnv = getEmptyEnv();
                setEnv(expectedEnv);

                const env = new Actor().getEnv();
                expect(env).toMatchObject(expectedEnv);
            });

            test('works with with non-null values', () => {
                const expectedEnv = {
                    ...getEmptyEnv(),
                    // internalPort: 12345,
                    actorId: 'test actId',
                    actorRunId: 'test actId',
                    userId: 'some user',
                    token: 'auth token',
                    startedAt: new Date('2017-01-01'),
                    timeoutAt: new Date(),
                    defaultKeyValueStoreId: 'some store',
                    defaultDatasetId: 'some dataset',
                    memoryMbytes: 1234,
                };
                setEnv(expectedEnv);

                const env = new Actor().getEnv();
                expect(env).toMatchObject(expectedEnv);
            });
        });

        describe('main()', () => {
            test('throws on invalid args', async () => {
                // @ts-expect-error invalid options
                await expect(async () => new Actor().main()).rejects.toThrow();
            });

            test('works with simple user function', async () => {
                await expect(new Actor().main(() => {}, { exit: false })).resolves.not.toThrow();
            });

            test('works with promised user function', async () => {
                let called = false;
                await Actor.main(async () => {
                    await sleep(20);
                    called = true;
                }, { exit: false });
                expect(called).toBe(true);
            });

            test('on exception in simple user function the process exits with code 91', async () => {
                const exitSpy = vitest.spyOn(process, 'exit');
                exitSpy.mockImplementation((() => {}) as any);
                await Actor.main(async () => {
                    throw new Error('Test exception I');
                });
                expect(exitSpy).toBeCalledWith(91);
            });

            test('on exception in promised user function the process exits with code 91', async () => {
                const exitSpy = vitest.spyOn(process, 'exit');
                exitSpy.mockImplementation((() => {}) as any);
                await Actor.main(async () => {
                    await sleep(20);
                    throw new Error('Test exception I');
                });
                expect(exitSpy).toBeCalledWith(91);
            });
        });

        // TODO just test we call the client method via vitest spy and use the token if available
        describe.skip('call()', () => {
            const token = 'some-token';
            const actId = 'some-act-id';
            const defaultKeyValueStoreId = 'some-store-id';
            const input = 'something';
            const contentType = 'text/plain';
            const outputKey = 'OUTPUT';
            const outputValue = 'some-output';
            const build = 'xxx';

            const run = { id: 'some-run-id', actId, defaultKeyValueStoreId };
            const finishedRun = { ...run, status: ACT_JOB_STATUSES.SUCCEEDED };
            const failedRun = { ...run, status: ACT_JOB_STATUSES.ABORTED };
            const runningRun = { ...run, status: ACT_JOB_STATUSES.RUNNING };
            const readyRun = { ...run, status: ACT_JOB_STATUSES.READY };

            const output = { contentType, key: outputKey, value: outputValue };
            const expected = { ...finishedRun, output: { contentType, body: outputValue } };

            test('works as expected', async () => {
                const memory = 1024;
                const timeout = 60;
                const webhooks = [{ a: 'a' }, { b: 'b' }] as unknown as WebhookUpdateData[];

                const getRecordMock = vitest.fn();
                getRecordMock.mockResolvedValueOnce(output);
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                keyValueStoreSpy.mockReturnValueOnce({ getRecord: getRecordMock } as any);

                const callOutput = await new Actor().call(actId, input, {
                    contentType,
                    build,
                    memory,
                    timeout,
                    webhooks,
                });

                expect(callOutput).toEqual(expected);
                expect(keyValueStoreSpy).toBeCalledTimes(1);
                expect(keyValueStoreSpy).toBeCalledWith('some-store-id');
            });

            test('works as expected with fetchOutput = false', async () => {
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);

                const callOutput = await new Actor().call(actId);

                expect(keyValueStoreSpy).not.toBeCalled();
                expect(callOutput).toEqual(finishedRun);
            });

            test('works with token', async () => {
                const memory = 1024;
                const timeout = 60;
                const webhooks = [{ a: 'a' }, { b: 'b' }] as any;

                const newClientSpy = vitest.spyOn(Actor.prototype, 'newClient');
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const getRecordMock = vitest.fn();
                getRecordMock.mockResolvedValueOnce(output);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                keyValueStoreSpy.mockReturnValueOnce({ getRecord: getRecordMock } as any);

                const callOutput = await new Actor({ storageClientOptions: { token } }).call(actId, input, {
                    contentType,
                    build,
                    memory,
                    timeout,
                    webhooks,
                });

                expect(callOutput).toEqual(expected);
                expect(newClientSpy).toBeCalledWith({ token });
                expect(actorSpy).toBeCalledWith(actId);
                expect(callMock).toBeCalledWith(input, {
                    token,
                    build,
                    contentType: `${contentType}; charset=utf-8`,
                    memory,
                    timeout,
                    webhooks,
                });
                expect(keyValueStoreSpy).toBeCalledWith(run.defaultKeyValueStoreId);
                expect(getRecordMock).toBeCalledWith('OUTPUT', { buffer: true });
            });

            test('works as expected with unfinished run', async () => {
                const waitSecs = 1;

                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(runningRun);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');

                const callOutput = await new Actor().call(actId, undefined, { waitSecs });

                expect(callOutput).toEqual(runningRun);
                expect(actorSpy).toBeCalledWith('some-act-id');
                expect(keyValueStoreSpy).not.toBeCalled();
            });

            test('returns immediately with zero ', async () => {
                const waitSecs = 0;

                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(readyRun);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');

                const callOutput = await new Actor().call(actId, undefined, { waitSecs });

                expect(callOutput).toEqual(readyRun);
                expect(actorSpy).toBeCalledWith('some-act-id');
                expect(keyValueStoreSpy).not.toBeCalled();
            });

            test("throws if run doesn't succeed", async () => {
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(failedRun);
                const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
                actorSpy.mockReturnValueOnce({ call: callMock } as any);

                expect(actorSpy).toBeCalledWith('some-act-id');
            });
        });

        // TODO just test we call the client method via vitest spy and use the token if available
        describe.skip('callTask()', () => {
            const taskId = 'some-task-id';
            const actId = 'xxx';
            const token = 'some-token';
            const defaultKeyValueStoreId = 'some-store-id';
            const run = { id: 'some-run-id', actId, defaultKeyValueStoreId };
            const readyRun = { ...run, status: ACT_JOB_STATUSES.READY };
            const runningRun = { ...run, status: ACT_JOB_STATUSES.RUNNING };
            const finishedRun = { ...run, status: ACT_JOB_STATUSES.SUCCEEDED };
            const failedRun = { ...run, status: ACT_JOB_STATUSES.ABORTED };
            const contentType = 'application/json';
            const outputKey = 'OUTPUT';
            const outputValue = 'some-output';
            const output = { contentType, key: outputKey, value: outputValue };
            const expected = { ...finishedRun, output: { contentType, body: outputValue } };
            const input = { foo: 'bar' };
            const memory = 256;
            const timeout = 60;
            const build = 'beta';
            const webhooks = [{ a: 'a' }, { b: 'b' }] as any;

            test('works as expected', async () => {
                const getRecordMock = vitest.fn();
                getRecordMock.mockResolvedValueOnce(output);
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                keyValueStoreSpy.mockReturnValueOnce({ getRecord: getRecordMock } as any);

                const callOutput = await new Actor().callTask(taskId, input, { memory, timeout, build, webhooks });

                expect(callOutput).toEqual(expected);
                expect(taskSpy).toBeCalledWith('some-task-id');
            });

            test('works with token', async () => {
                const newClientSpy = vitest.spyOn(Actor.prototype, 'newClient');
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const getRecordMock = vitest.fn();
                getRecordMock.mockResolvedValueOnce(output);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                keyValueStoreSpy.mockReturnValueOnce({ getRecord: getRecordMock } as any);

                const callOutput = await new Actor({ storageClientOptions: { token } }).callTask(taskId, input, {
                    build,
                    memory,
                    timeout,
                    webhooks,
                });

                expect(callOutput).toEqual(expected);
                expect(newClientSpy).toBeCalledWith({ token });
                expect(taskSpy).toBeCalledWith(taskId);
                expect(callMock).toBeCalledWith(input, {
                    token,
                    build,
                    memory,
                    timeout,
                    webhooks,
                });
                expect(keyValueStoreSpy).toBeCalledWith(run.defaultKeyValueStoreId);
                expect(getRecordMock).toBeCalledWith('OUTPUT', { buffer: true });
            });

            test('works as expected with fetchOutput = false', async () => {
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(finishedRun);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);

                const callOutput = await new Actor().callTask(taskId, undefined, {});

                expect(keyValueStoreSpy).not.toBeCalled();
                expect(callOutput).toEqual(finishedRun);
                expect(taskSpy).toBeCalledWith('some-task-id');
            });

            test('works as expected with unfinished run', async () => {
                const waitSecs = 1;

                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(runningRun);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');

                const callOutput = await new Actor().callTask(taskId, undefined, { waitSecs });

                expect(callOutput).toEqual(runningRun);
                expect(keyValueStoreSpy).not.toBeCalled();
                expect(taskSpy).toBeCalledWith('some-task-id');
            });

            test('returns immediately with zero ', async () => {
                const waitSecs = 0;

                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(readyRun);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);
                const keyValueStoreSpy = vitest.spyOn(ApifyClient.prototype, 'keyValueStore');

                const callOutput = await new Actor().callTask(taskId, undefined, { waitSecs });

                expect(callOutput).toEqual(readyRun);
                expect(keyValueStoreSpy).not.toBeCalled();
                expect(taskSpy).toBeCalledWith('some-task-id');
            });

            test("throws if run doesn't succeed", async () => {
                const callMock = vitest.fn();
                callMock.mockResolvedValueOnce(failedRun);
                const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
                taskSpy.mockReturnValueOnce({ call: callMock } as any);

                expect(taskSpy).toBeCalledWith('some-task-id');
            });
        });

        // TODO just test we call the client method via vitest spy and use the token if available
        describe.skip('metamorph()', () => {
            const runId = 'some-run-id';
            const actorId = 'some-actor-id';
            const targetActorId = 'some-target-actor-id';
            const contentType = 'application/json';
            const input = '{ "foo": "bar" }';
            const build = 'beta';
            const run = { id: runId, actorId };

            beforeEach(() => {
                process.env[ACTOR_ENV_VARS.ID] = actorId;
                process.env[ACTOR_ENV_VARS.RUN_ID] = runId;
            });

            afterEach(() => {
                delete process.env[ACTOR_ENV_VARS.ID];
                delete process.env[ACTOR_ENV_VARS.RUN_ID];
            });

            test('works as expected', async () => {
                const metamorphMock = vitest.fn();
                metamorphMock.mockResolvedValueOnce(run);
                const runSpy = vitest.spyOn(ApifyClient.prototype, 'run');
                runSpy.mockReturnValueOnce({ metamorph: metamorphMock } as any);

                await new Actor().metamorph(targetActorId, input, { contentType, build, customAfterSleepMillis: 1 });

                expect(metamorphMock).toBeCalledWith(targetActorId, input, {
                    build,
                    contentType: `${contentType}; charset=utf-8`,
                });
            });

            test('works without opts and input', async () => {
                const metamorphMock = vitest.fn();
                metamorphMock.mockResolvedValueOnce(run);
                const runSpy = vitest.spyOn(ApifyClient.prototype, 'run');
                runSpy.mockReturnValueOnce({ metamorph: metamorphMock } as any);

                await new Actor().metamorph(targetActorId, undefined, { customAfterSleepMillis: 1 });

                expect(metamorphMock).toBeCalledWith(targetActorId, undefined, {});
            });
        });

        describe('addWebhook()', () => {
            const runId = 'my-run-id';
            const expectedEventTypes = [WEBHOOK_EVENT_TYPES.ACTOR_RUN_SUCCEEDED];
            const expectedRequestUrl = 'http://example.com/api';
            const expectedPayloadTemplate = '{"hello":{{world}}';
            const expectedIdempotencyKey = 'some-key';
            const webhook = {
                isAdHoc: true,
                eventTypes: expectedEventTypes,
                condition: {
                    actorRunId: runId,
                },
                requestUrl: expectedRequestUrl,
                payloadTemplate: expectedPayloadTemplate,
                idempotencyKey: expectedIdempotencyKey,
            };

            test('works', async () => {
                process.env[ACTOR_ENV_VARS.RUN_ID] = runId;
                process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';

                const createMock = vitest.fn();
                createMock.mockResolvedValueOnce(webhook);
                const webhooksSpy = vitest.spyOn(ApifyClient.prototype, 'webhooks');
                webhooksSpy.mockReturnValueOnce({ create: createMock } as any);

                await new Actor().addWebhook({
                    eventTypes: expectedEventTypes,
                    requestUrl: expectedRequestUrl,
                    payloadTemplate: expectedPayloadTemplate,
                    idempotencyKey: expectedIdempotencyKey,
                });

                delete process.env[ACTOR_ENV_VARS.RUN_ID];
                delete process.env[APIFY_ENV_VARS.IS_AT_HOME];

                expect(webhooksSpy).toBeCalledTimes(1);
            });

            test('on local logs warning and does nothing', async () => {
                const warningMock = vitest.spyOn(log, 'warning');
                const metamorphMock = vitest.fn();
                const runSpy = vitest.spyOn(RunClient.prototype, 'metamorph');
                runSpy.mockImplementationOnce(metamorphMock);

                const sdk = new Actor();
                await sdk.addWebhook({ eventTypes: expectedEventTypes, requestUrl: expectedRequestUrl });

                expect(metamorphMock).not.toBeCalled();
                expect(warningMock).toBeCalledWith('Actor.addWebhook() is only supported when running on the Apify platform. The webhook will not be invoked.');
                warningMock.mockRestore();
            });

            test('should fail without actor run ID', async () => {
                process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';

                let isThrow;
                try {
                    await new Actor().addWebhook({ eventTypes: expectedEventTypes, requestUrl: expectedRequestUrl });
                } catch (err) {
                    isThrow = true;
                }
                expect(isThrow).toBe(true);

                delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
            });

            test('Actor.createProxyConfiguration() allows useApifyProxy option', async () => {
                const proxyConfiguration = {
                    useApifyProxy: true,
                    apifyProxyGroups: [
                        'RESIDENTIAL',
                    ],
                    apifyProxyCountry: 'US',
                };

                const initializeSpy = vitest.spyOn(ProxyConfiguration.prototype, 'initialize');
                initializeSpy.mockImplementationOnce(async () => {});
                await expect(Actor.createProxyConfiguration(proxyConfiguration)).resolves.toBeInstanceOf(ProxyConfiguration);
                expect(initializeSpy).toBeCalledTimes(1);
            });

            test('createProxyConfiguration should create ProxyConfiguration', async () => {
                const sdk = new Actor();
                const initializeSpy = vitest.spyOn(ProxyConfiguration.prototype, 'initialize');
                initializeSpy.mockImplementationOnce(async () => {});
                await sdk.createProxyConfiguration();
                expect(initializeSpy).toBeCalledTimes(1);
            });
        });

        describe('Storage API', () => {
            let sdk: Actor<{ foo: string }>;

            beforeEach(async () => { sdk = new Actor({ storageClientOptions: { storageDir: await localStorageEmulator.init() } }); });
            afterAll(async () => localStorageEmulator.destroy());

            test('getInput()', async () => {
                const getValueSpy = vitest.spyOn(KeyValueStore.prototype, 'getValue');
                getValueSpy.mockImplementation(async () => 123);

                // Uses default value.
                const val1 = await sdk.getInput();
                expect(getValueSpy).toBeCalledTimes(1);
                expect(getValueSpy).toBeCalledWith(KEY_VALUE_STORE_KEYS.INPUT);
                expect(val1).toBe(123);

                // Uses value from config
                sdk.config.set('inputKey', 'some-value');
                const val2 = await sdk.getInput();
                expect(getValueSpy).toBeCalledTimes(2);
                expect(getValueSpy).toBeCalledWith('some-value');
                expect(val2).toBe(123);
                sdk.config.set('inputKey', undefined); // restore defaults
            });

            test('setValue()', async () => {
                const record = { foo: 'bar' };
                const setValueSpy = vitest.spyOn(KeyValueStore.prototype, 'setValue');
                setValueSpy.mockImplementationOnce(async () => {});

                await sdk.setValue('key-1', record);
                expect(setValueSpy).toBeCalledTimes(1);
                expect(setValueSpy).toBeCalledWith('key-1', record, {});
            });

            test('getValue()', async () => {
                const getValueSpy = vitest.spyOn(KeyValueStore.prototype, 'getValue');
                getValueSpy.mockImplementationOnce(async () => 123);

                const val = await sdk.getValue('key-1');
                expect(getValueSpy).toBeCalledTimes(1);
                expect(getValueSpy).toBeCalledWith('key-1');
                expect(val).toBe(123);
            });

            test('pushData()', async () => {
                const pushDataSpy = vitest.spyOn(Dataset.prototype, 'pushData');
                pushDataSpy.mockImplementationOnce(async () => {});

                await sdk.pushData({ foo: 'bar' });
                expect(pushDataSpy).toBeCalledTimes(1);
                expect(pushDataSpy).toBeCalledWith({ foo: 'bar' });
            });

            test('openRequestQueue should open storage', async () => {
                const queueId = 'abc';
                const options = { forceCloud: true };
                const openStorageSpy = vitest.spyOn(StorageManager.prototype, 'openStorage');
                openStorageSpy.mockImplementationOnce(async (i) => i);
                await sdk.openRequestQueue(queueId, options);
                expect(openStorageSpy).toBeCalledWith(queueId, sdk.apifyClient);
                expect(openStorageSpy).toBeCalledTimes(1);
            });

            test('openDataset should open storage', async () => {
                const datasetName = 'abc';
                const options = { forceCloud: true };
                const mockOpenStorage = vitest.spyOn(StorageManager.prototype, 'openStorage');
                mockOpenStorage.mockResolvedValueOnce(vitest.fn());
                const ds = await sdk.openDataset(datasetName, options);
                expect(mockOpenStorage).toBeCalledTimes(1);
                expect(mockOpenStorage).toBeCalledWith(datasetName, sdk.apifyClient);
            });
        });
    });

    const globalOptions = {
        token: 'some-token',
        actId: 'some-act-id',
        defaultKeyValueStoreId: 'some-store-id',
        input: { foo: 'bar' },
        contentType: 'application/json',
        outputKey: 'OUTPUT',
        outputValue: 'some-output',
        build: 'xxx',
        taskId: 'some-task-id',
        runId: 'some-run-id',
        targetActorId: 'some-target-actor-id',
    };

    const runKeys = ['run', 'output', 'finishedRun', 'failedRun', 'runningRun', 'readyRun', 'expected'] as const;

    // @ts-expect-error
    const runConfigs : Record<typeof runKeys[number], any> = {
        run: { id: globalOptions.runId, actId: globalOptions.actId, defaultKeyValueStoreId: globalOptions.defaultKeyValueStoreId },
        output: { contentType: globalOptions.contentType, key: globalOptions.outputKey, value: globalOptions.outputValue },
        init() {
        // @ts-expect-error
            this.finishedRun = { ...this.run, status: ACT_JOB_STATUSES.SUCCEEDED };
            // @ts-expect-error
            this.failedRun = { ...this.run, status: ACT_JOB_STATUSES.ABORTED };
            // @ts-expect-error
            this.runningRun = { ...this.run, status: ACT_JOB_STATUSES.RUNNING };
            // @ts-expect-error
            this.readyRun = { ...this.run, status: ACT_JOB_STATUSES.READY };
            // @ts-expect-error
            this.expected = { ...this.finishedRun, output: { contentType: globalOptions.contentType, body: globalOptions.outputValue } };
            return this;
        },
    }.init();

    describe('Actor.getEnv()', () => {
        let prevEnv: ApifyEnv;

        beforeAll(() => {
            prevEnv = Actor.getEnv();
        });

        afterAll(() => {
            setEnv(prevEnv);
        });

        test('works with null values', () => {
            const expectedEnv = getEmptyEnv();
            setEnv(expectedEnv);

            const env = Actor.getEnv();
            expect(env).toMatchObject(expectedEnv);
        });

        test('works with with non-null values', () => {
            const expectedEnv = {
                ...getEmptyEnv(),
                ...{
                    // internalPort: 12345,
                    actorId: 'test actId',
                    actorRunId: 'test actId',
                    userId: 'some user',
                    token: 'auth token',
                    startedAt: new Date('2017-01-01'),
                    timeoutAt: new Date(),
                    defaultKeyValueStoreId: 'some store',
                    defaultDatasetId: 'some dataset',
                    memoryMbytes: 1234,
                } };
            setEnv(expectedEnv);

            const env = Actor.getEnv();
            expect(env).toMatchObject(expectedEnv);
        });
    });

    // TODO we should remove the duplication if possible
    describe('Actor.call()', () => {
        const { contentType, build, actId, input, token } = globalOptions;

        test('works as expected', async () => {
            const memory = 1024;
            const timeout = 60;
            const webhooks = [{ a: 'a' }, { b: 'b' }] as unknown as WebhookUpdateData[];

            const options = { contentType, build, memory, timeout, webhooks };

            const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
            const callSpy = vitest.spyOn(ActorClient.prototype, 'call').mockReturnValue(runConfigs.finishedRun);
            await Actor.call(actId, input, options);

            expect(actorSpy).toBeCalledWith(actId);
            expect(callSpy).toBeCalledWith(input, options);
        });

        test('works with token', async () => {
            const memory = 1024;
            const timeout = 60;
            const webhooks = [{ a: 'a' }, { b: 'b' }] as unknown as WebhookUpdateData[];

            const newClientSpy = vitest.spyOn(Actor.prototype, 'newClient');
            const actorSpy = vitest.spyOn(ApifyClient.prototype, 'actor');
            const callSpy = vitest.spyOn(ActorClient.prototype, 'call').mockReturnValue(runConfigs.finishedRun);
            await Actor.call(actId, input, { contentType, build, token, memory, timeout, webhooks });

            expect(newClientSpy).toBeCalledWith({ token });
            expect(actorSpy).toBeCalledWith(actId);
            expect(callSpy).toBeCalledWith(input, {
                build,
                contentType,
                memory,
                timeout,
                webhooks,
            });
        });
    });

    // TODO we should remove the duplication if possible
    describe('Actor.callTask()', () => {
        const memory = 256; // m
        const timeout = 60; // se
        const webhooks = [{ a: 'a' }, { b: 'b' }] as unknown as WebhookUpdateData[];

        const { input, taskId, token, build } = globalOptions;
        const { finishedRun } = runConfigs;

        test('works as expected', async () => {
            const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
            const callSpy = vitest.spyOn(TaskClient.prototype, 'call').mockReturnValue(finishedRun);

            const options = { memory, timeout, build, webhooks };
            const callOutput = await Actor.callTask(taskId, input, options);

            expect(callOutput).toEqual(finishedRun);

            expect(taskSpy).toBeCalledTimes(1);
            expect(taskSpy).toBeCalledWith(taskId);

            expect(callSpy).toBeCalledTimes(1);
            expect(callSpy).toBeCalledWith(input, options);
        });

        test('works with token', async () => {
            const options = { memory, timeout, build, webhooks };

            const newClientSpy = vitest.spyOn(Actor.prototype, 'newClient');
            const taskSpy = vitest.spyOn(ApifyClient.prototype, 'task');
            const callSpy = vitest.spyOn(TaskClient.prototype, 'call').mockReturnValue(finishedRun);
            const callOutput = await Actor.callTask(taskId, input, { token, ...options });

            expect(newClientSpy).toBeCalledWith({ token });
            expect(taskSpy).toBeCalledWith(taskId);
            expect(callSpy).toBeCalledWith(input, options);

            expect(callOutput).toEqual(finishedRun);
        });
    });

    // TODO we should remove the duplication if possible
    describe('Actor.metamorph()', () => {
        const { actId, runId, targetActorId, input, contentType, build } = globalOptions;

        const { run } = runConfigs;

        beforeEach(() => {
            process.env[ACTOR_ENV_VARS.ID] = actId;
            process.env[ACTOR_ENV_VARS.RUN_ID] = runId;
            process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
        });

        afterEach(() => {
            delete process.env[ACTOR_ENV_VARS.ID];
            delete process.env[ACTOR_ENV_VARS.RUN_ID];
            delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
            vitest.restoreAllMocks();
        });

        test('works as expected', async () => {
            const metamorphMock = vitest.fn();
            metamorphMock.mockResolvedValueOnce(run);

            const runSpy = vitest.spyOn(ApifyClient.prototype, 'run');
            runSpy.mockReturnValueOnce({ metamorph: metamorphMock } as any);

            await Actor.metamorph(targetActorId, input, { contentType, build, customAfterSleepMillis: 1 });

            expect(runSpy).toBeCalledTimes(1);

            expect(metamorphMock).toBeCalledWith(targetActorId, input, {
                build,
                contentType,
            });
        });

        test('works without opts and input', async () => {
            const metamorphMock = vitest.fn();
            metamorphMock.mockResolvedValueOnce(run);
            const runSpy = vitest.spyOn(ApifyClient.prototype, 'run');
            runSpy.mockReturnValueOnce({ metamorph: metamorphMock } as any);

            await Actor.metamorph(targetActorId, undefined, { customAfterSleepMillis: 1 });

            expect(metamorphMock).toBeCalledWith(targetActorId, undefined, {});
        });
    });

    describe('Actor.reboot()', () => {
        const { actId, runId } = globalOptions;
        const { run } = runConfigs;

        beforeEach(() => {
            process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';
            process.env[ACTOR_ENV_VARS.ID] = actId;
            process.env[ACTOR_ENV_VARS.RUN_ID] = runId;
        });

        afterEach(() => {
            delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
            delete process.env[ACTOR_ENV_VARS.ID];
            delete process.env[ACTOR_ENV_VARS.RUN_ID];
            vitest.restoreAllMocks();
        });

        test('reboot waits for persistState/migrating listeners before rebooting', async () => {
            const rebootMock = vitest.fn();
            rebootMock.mockResolvedValueOnce(run);
            const rebootSpy = vitest.spyOn(ApifyClient.prototype, 'run');
            rebootSpy.mockReturnValueOnce({ reboot: rebootMock } as any);

            const persistenceStore = [];

            const persistResource = (delay: number) => async () : Promise<void> => {
                await new Promise((res) => setTimeout(res, delay));
                persistenceStore.push('PERSISTED ITEM');
            };

            const migratingSpy = vitest.fn(persistResource(50));
            const persistStateSpy = vitest.fn(persistResource(50));
            const events = Configuration.getEventManager();

            events.on(EventType.PERSIST_STATE, persistStateSpy);
            events.on(EventType.MIGRATING, migratingSpy);

            await Actor.reboot({ customAfterSleepMillis: 1 });

            events.off(EventType.PERSIST_STATE, persistStateSpy);
            events.off(EventType.MIGRATING, migratingSpy);

            // Do the listeners get called?
            expect(migratingSpy).toBeCalledTimes(1);
            expect(persistStateSpy).toBeCalledTimes(1);

            // Do the listeners finish?
            expect(persistenceStore.length).toBe(2);

            // Did the client's reboot method get called?
            expect(rebootMock).toBeCalledTimes(1);
        });
    });

    describe('Actor.addWebhook()', () => {
        const { runId } = globalOptions;
        const expectedEventTypes = ['ACTOR.RUN.SUCCEEDED'] as const;
        const expectedRequestUrl = 'http://example.com/api';
        const expectedPayloadTemplate = '{"hello":{{world}}';
        const expectedIdempotencyKey = 'some-key';
        const webhook = {
            isAdHoc: true,
            eventTypes: expectedEventTypes,
            condition: {
                actorRunId: runId,
            },
            requestUrl: expectedRequestUrl,
            payloadTemplate: expectedPayloadTemplate,
            idempotencyKey: expectedIdempotencyKey,
        };

        test('works', async () => {
            process.env[ACTOR_ENV_VARS.RUN_ID] = runId;
            process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';

            const clientMock = vitest.spyOn(Actor.apifyClient, 'webhooks')
                .mockReturnValueOnce({ create: async () => webhook } as any);

            await Actor.addWebhook({
                eventTypes: expectedEventTypes,
                requestUrl: expectedRequestUrl,
                payloadTemplate: expectedPayloadTemplate,
                idempotencyKey: expectedIdempotencyKey,
            });

            delete process.env[ACTOR_ENV_VARS.RUN_ID];
            delete process.env[APIFY_ENV_VARS.IS_AT_HOME];

            expect(clientMock).toBeCalledTimes(1);
        });

        test('on local logs warning and does nothing', async () => {
            const clientMock = vitest.spyOn(Actor.apifyClient, 'webhooks')
                .mockImplementation((() => {}) as any);

            const warningStub = vitest.spyOn(log, 'warning').mockImplementation(() => {});

            await Actor.addWebhook({ eventTypes: expectedEventTypes, requestUrl: expectedRequestUrl });

            expect(warningStub).toBeCalledTimes(1);
            expect(clientMock).toBeCalledTimes(0);
        });

        test('should fail without actor run ID', async () => {
            process.env[APIFY_ENV_VARS.IS_AT_HOME] = '1';

            await expect(async () => Actor.addWebhook({ eventTypes: expectedEventTypes, requestUrl: expectedRequestUrl }))
                .rejects
                .toThrow();

            delete process.env[APIFY_ENV_VARS.IS_AT_HOME];
        });
    });

    describe('Actor.getInput', () => {
        const TestingActor = new Actor();

        test('should work', async () => {
            await expect(TestingActor.getInput()).resolves.toBeNull();
            await expect(TestingActor.getInputOrThrow()).rejects.toThrowError('Input does not exist');

            const mockGetValue = vitest.spyOn(TestingActor, 'getValue');
            mockGetValue.mockImplementation(async (key) => expect(key).toEqual(KEY_VALUE_STORE_KEYS.INPUT));

            await TestingActor.getInput();

            // Uses value from env var.
            process.env[ACTOR_ENV_VARS.INPUT_KEY] = 'some-value';
            mockGetValue.mockImplementation(async (key) => expect(key).toBe('some-value'));
            await TestingActor.getInput();

            delete process.env[ACTOR_ENV_VARS.INPUT_KEY];
            mockGetValue.mockRestore();
        });

        test('should work with input secrets', async () => {
            const mockGetValue = vitest.spyOn(TestingActor, 'getValue');
            const originalInput = { secret: 'foo', nonSecret: 'bar' };
            const likeInputSchema = { properties: { secret: { type: 'string', isSecret: true } }, nonSecret: { type: 'string' } };
            const encryptedInput = encryptInputSecrets({ input: originalInput, inputSchema: likeInputSchema, publicKey: testingPublicKey });
            // Checks if encrypts the right value
            expect(encryptedInput.secret.startsWith('ENCRYPTED_')).toBe(true);
            expect(encryptedInput.nonSecret).toBe(originalInput.nonSecret);

            mockGetValue.mockImplementation(async (key) => encryptedInput);

            process.env[APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_FILE] = testingPrivateKeyFile;
            process.env[APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE] = testingPrivateKeyPassphrase;
            const input = await TestingActor.getInput();

            expect(input).toStrictEqual(originalInput);

            delete process.env[APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_FILE];
            delete process.env[APIFY_ENV_VARS.INPUT_SECRETS_PRIVATE_KEY_PASSPHRASE];
            mockGetValue.mockRestore();
        });
    });

    describe('Actor.setValue', () => {
        test('should work', async () => {
            const record = { foo: 'bar' };
            const defaultStore = await KeyValueStore.open();
            const setValueSpy = vitest.spyOn(defaultStore, 'setValue');

            setValueSpy.mockImplementation(async () => {});

            await Actor.setValue('key-1', record);

            expect(setValueSpy).toHaveBeenCalledWith('key-1', record, {});
        });
    });

    describe('Actor.getValue', () => {
        test('should work', async () => {
            const defaultStore = await KeyValueStore.open();
            const getValueSpy = vitest.spyOn(defaultStore, 'getValue');

            getValueSpy.mockImplementationOnce(async () => {});

            await Actor.getValue('key-1');

            expect(getValueSpy).toHaveBeenCalledWith('key-1');
        });
    });

    describe('Actor.pushData', () => {
        test('should work', async () => {
            const defaultStore = await Dataset.open();
            const pushDataSpy = vitest.spyOn(defaultStore, 'pushData');

            pushDataSpy.mockImplementationOnce(async () => {});

            await Actor.pushData({ hello: 'apify' });

            expect(pushDataSpy).toHaveBeenCalledWith({ hello: 'apify' });
        });
    });
});
