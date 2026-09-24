import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { KeyValueStoreRecord } from '@crawlee/types';
import { ApifyFileSystemStorageBackend } from 'apify';

// The Actor input arrives in the default key-value store as a bare `INPUT` / `INPUT.json` file with
// no metadata sidecar: written by the Apify CLI (under a `__CLI_` key it points the run at), by a
// project template, or by hand. The backend adopts it as the record under the input key and keeps it
// across the purge on start. Content types come from the extension alone; parsing a bare file as JSON
// is `Actor.getInput()`'s job.

const payload = JSON.stringify({ hello: 'from disk' });

let directory: string;

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'apify-fs-backend-'));
});

afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
});

/** A fresh backend over the test directory, seeded with sidecar-less files in one key-value store. */
async function seedStore(store: string, files: Record<string, string>, inputKey?: string) {
    const backend = new ApifyFileSystemStorageBackend({ localDataDirectory: directory, inputKey });
    const storeDirectory = join(backend.keyValueStoresDirectory, store);
    await mkdir(storeDirectory, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
        await writeFile(join(storeDirectory, file), content);
    }
    return backend;
}

describe('ApifyFileSystemStorageBackend', () => {
    test('adopts a bare INPUT.json in the default store as the record INPUT', async () => {
        const backend = await seedStore('default', { 'INPUT.json': payload });
        const store = await backend.createKeyValueStoreBackend();

        expect(await store.getValue('INPUT')).toStrictEqual<KeyValueStoreRecord>({
            key: 'INPUT',
            value: Buffer.from(payload),
            contentType: 'application/json; charset=utf-8',
        });
        expect((await store.listKeys()).items.map((item) => item.key)).toEqual(['INPUT']);
        expect(await store.getPublicUrl('INPUT')).toMatch(/\/INPUT\.json$/);

        // The extension is the file's, not the key's.
        expect(await store.getValue('INPUT.json')).toBeUndefined();
    });

    test('adopts a bare INPUT as bytes', async () => {
        const backend = await seedStore('default', { INPUT: payload });
        const store = await backend.createKeyValueStoreBackend();

        expect(await store.getValue('INPUT')).toStrictEqual<KeyValueStoreRecord>({
            key: 'INPUT',
            value: Buffer.from(payload),
            contentType: 'application/octet-stream',
        });
    });

    test('fails the open when both INPUT and INPUT.json are present', async () => {
        const backend = await seedStore('default', { INPUT: 'bytes', 'INPUT.json': payload });

        await expect(backend.createKeyValueStoreBackend()).rejects.toThrow(/Multiple candidate files for key 'INPUT'/);
    });

    test('adopts the configured input key alongside INPUT', async () => {
        const backend = await seedStore(
            'default',
            { '__CLI_INPUT.json': JSON.stringify({ from: 'cli' }), 'INPUT.json': payload },
            '__CLI_INPUT',
        );
        const store = await backend.createKeyValueStoreBackend();

        expect((await store.getValue('__CLI_INPUT'))?.value.toString()).toBe(JSON.stringify({ from: 'cli' }));
        expect((await store.getValue('INPUT'))?.value.toString()).toBe(payload);
        expect((await store.listKeys()).items.map((item) => item.key)).toEqual(['INPUT', '__CLI_INPUT']);
    });

    test('leaves a tracked INPUT record alone when a stray INPUT.json appears', async () => {
        const backend = await seedStore('default', {});
        const store = await backend.createKeyValueStoreBackend();
        await store.setValue({ key: 'INPUT', value: 'tracked', contentType: 'text/plain; charset=utf-8' });
        await writeFile(join(backend.keyValueStoresDirectory, 'default', 'INPUT.json'), payload);

        const reopened = await new ApifyFileSystemStorageBackend({
            localDataDirectory: directory,
        }).createKeyValueStoreBackend();

        expect((await reopened.getValue('INPUT'))?.value.toString()).toBe('tracked');
        expect((await reopened.listKeys()).items.map((item) => item.key)).toEqual(['INPUT']);
    });

    test('treats an INPUT.json in a non-default store as an ordinary file', async () => {
        const backend = await seedStore('named-store', { 'INPUT.json': payload });
        const store = await backend.createKeyValueStoreBackend({ name: 'named-store' });

        expect(await store.getValue('INPUT')).toBeUndefined();
        expect((await store.getValue('INPUT.json'))?.value.toString()).toBe(payload);
    });

    test('keeps the input keys across the purge on start and drops everything else', async () => {
        const backend = await seedStore(
            'default',
            {
                'INPUT.json': payload,
                '__CLI_INPUT.json': JSON.stringify({ from: 'cli' }),
                'leftover.json': '{}',
            },
            '__CLI_INPUT',
        );

        await backend.purge();

        const store = await backend.createKeyValueStoreBackend();
        expect((await store.listKeys()).items.map((item) => item.key)).toEqual(['INPUT', '__CLI_INPUT']);
        expect((await store.getValue('INPUT'))?.value.toString()).toBe(payload);
        expect(await readdir(join(backend.keyValueStoresDirectory, 'default'))).not.toContain('leftover.json');
    });

    test('purges an alias-keyed store in full, INPUT included', async () => {
        const backend = await seedStore('other', { 'INPUT.json': payload });
        await backend.createKeyValueStoreBackend({ alias: 'other' });

        await backend.purge();

        expect(await readdir(join(backend.keyValueStoresDirectory, 'other'))).not.toContain('INPUT.json');
    });
});
