import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Request, RequestList } from '@crawlee/core';
import type { Dictionary } from '@crawlee/types';

import { ApifyRequestList } from '../../src/apify_request_list.js';
import { ArgumentValidationError } from '../../src/utils.js';

const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'] as const;

const OPTIONAL_INPUTS: Record<string, { payload?: string; userData?: Dictionary; headers?: Record<string, string> }> = {
    minimal: {},
    allOptions: {
        payload: 'some payload',
        userData: { 'some key': 'some value' },
        headers: { h1: 'v1', h2: 'v2' },
    },
    nonStringUserData: { userData: { depth: 1, isStartUrl: true, nested: { key: 'value' } } },
};

async function fetchAll(requestList: RequestList): Promise<Request[]> {
    const requests: Request[] = [];

    for await (const request of requestList) {
        requests.push(request);
    }

    return requests;
}

describe('ApifyRequestList', () => {
    let server: Server;
    let responses: Record<string, string | Buffer>;
    let receivedPaths: string[];

    const urlFor = (path: string) => `http://127.0.0.1:${(server.address() as AddressInfo).port}${path}`;

    beforeAll(async () => {
        server = createServer((req, res) => {
            receivedPaths.push(req.url!);
            res.end(responses[req.url!] ?? '');
        });
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');
    });

    afterAll(async () => {
        server.close();
        await once(server, 'close');
    });

    beforeEach(() => {
        responses = {};
        receivedPaths = [];
    });

    test.each(
        METHODS.flatMap((method) => Object.entries(OPTIONAL_INPUTS).map(([name, input]) => ({ method, name, input })))
            // Crawlee rejects a payload on GET requests, see the test below.
            .filter(({ method, name }) => !(method === 'GET' && name === 'allOptions')),
    )('creates a request from a $method url with $name input', async ({ method, input }) => {
        const sourceInput = { url: 'https://www.abc.com', method, ...input };

        const requestList = await ApifyRequestList.open({ requestListSourcesInput: [sourceInput] });
        const requests = await fetchAll(requestList);

        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe(method);
        expect(requests[0].url).toBe(sourceInput.url);
        expect(requests[0].payload).toBe(input.payload);
        expect(requests[0].userData).toEqual(input.userData ?? {});
        expect(requests[0].headers).toEqual(input.headers ?? {});
    });

    test('rejects a payload on GET requests', async () => {
        const requestList = await ApifyRequestList.open({
            requestListSourcesInput: [{ url: 'https://www.abc.com', method: 'GET', payload: 'some payload' }],
        });

        await expect(fetchAll(requestList)).rejects.toThrow('Request with GET method cannot have a payload.');
    });

    test('fetches every remote url list', async () => {
        await ApifyRequestList.open({
            requestListSourcesInput: [
                { requestsFromUrl: urlFor('/file.txt'), method: 'GET' },
                { requestsFromUrl: urlFor('/file2'), method: 'PUT' },
                {
                    requestsFromUrl: urlFor('/something'),
                    method: 'POST',
                    headers: { key: 'value' },
                    payload: 'some_payload',
                    userData: { another_key: 'another_value' },
                },
            ],
        });

        expect(receivedPaths.toSorted()).toEqual(['/file.txt', '/file2', '/something']);
    });

    test('reads urls from remote url lists and simple input in the input order', async () => {
        responses['/file.txt'] =
            'blablabla http://www.something.com more blablabla https://www.somethingelse.com , even more blablabla. http://www.bla.net ';
        responses['/file2'] =
            'some stuff http://www.ok.com more stuff https://www.true-positive.com www.false_positive.com';

        const requestList = await ApifyRequestList.open({
            requestListSourcesInput: [
                { requestsFromUrl: urlFor('/file.txt'), method: 'GET' },
                { url: 'https://www.someurl.com', method: 'GET' },
                { requestsFromUrl: urlFor('/file2'), method: 'GET' },
            ],
        });

        expect((await fetchAll(requestList)).map((request) => request.url)).toEqual([
            'http://www.something.com',
            'https://www.somethingelse.com',
            'http://www.bla.net',
            'https://www.someurl.com',
            'http://www.ok.com',
            'https://www.true-positive.com',
        ]);
    });

    test('applies the request details to requests from a remote url list', async () => {
        responses['/file.txt'] = 'https://www.someurl.com';
        const sourceInput = {
            requestsFromUrl: urlFor('/file.txt'),
            method: 'POST',
            headers: { key: 'value' },
            payload: 'some_payload',
            userData: { another_key: 'another_value' },
        };

        const requestList = await ApifyRequestList.open({ requestListSourcesInput: [sourceInput] });
        const [request] = await fetchAll(requestList);

        expect(request.url).toBe('https://www.someurl.com');
        expect(request.method).toBe(sourceInput.method);
        expect(request.headers).toEqual(sourceInput.headers);
        expect(request.payload).toBe(sourceInput.payload);
        expect(request.userData).toEqual(sourceInput.userData);
    });

    test('gives every request from a remote url list its own copy of userData', async () => {
        responses['/file.txt'] = 'https://www.one.com https://www.two.com';

        const requestList = await ApifyRequestList.open({
            requestListSourcesInput: [
                { requestsFromUrl: urlFor('/file.txt'), userData: { depth: 1, nested: { key: 'value' } } },
            ],
        });
        const requests = await fetchAll(requestList);

        expect(requests.map((request) => request.url)).toEqual(['https://www.one.com', 'https://www.two.com']);
        for (const request of requests) {
            expect(request.userData).toEqual({ depth: 1, nested: { key: 'value' } });
        }

        requests[0].userData.nested.key = 'mutated';
        expect(requests[1].userData.nested).toEqual({ key: 'value' });
    });

    test('handles a non-UTF-8 remote url list', async () => {
        responses['/file.txt'] = Buffer.from('café https://www.someurl.com naïve', 'latin1');

        const requestList = await ApifyRequestList.open({
            requestListSourcesInput: [{ requestsFromUrl: urlFor('/file.txt'), method: 'GET' }],
        });

        expect((await fetchAll(requestList)).map((request) => request.url)).toEqual(['https://www.someurl.com']);
    });

    test.each(['HTTPS://example.com/b', 'https://EXAMPLE.COM/a', 'https://example.Com/c'])(
        'extracts %s from a remote url list case-insensitively',
        async (url) => {
            responses['/file.txt'] = `see ${url} here`;

            const requestList = await ApifyRequestList.open({
                requestListSourcesInput: [{ requestsFromUrl: urlFor('/file.txt') }],
            });

            expect((await fetchAll(requestList)).map((request) => request.url)).toEqual([url]);
        },
    );

    test('does not fetch the remote url lists again when reopened with the same name', async () => {
        responses['/file.txt'] = 'https://www.one.com https://www.two.com';
        const options = { name: 'some-name', requestListSourcesInput: [{ requestsFromUrl: urlFor('/file.txt') }] };

        await ApifyRequestList.open(options);
        const reopened = await ApifyRequestList.open(options);

        expect(receivedPaths).toEqual(['/file.txt']);
        expect((await fetchAll(reopened)).map((request) => request.url)).toEqual([
            'https://www.one.com',
            'https://www.two.com',
        ]);
    });

    test('returns an empty list without input', async () => {
        expect(await fetchAll(await ApifyRequestList.open())).toEqual([]);
    });

    test('rejects entries with neither url nor requestsFromUrl', async () => {
        await expect(ApifyRequestList.open({ requestListSourcesInput: [{ foo: 'bar' }] })).rejects.toThrow(
            ArgumentValidationError,
        );
    });
});
