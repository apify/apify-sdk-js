import { createTransformRequestFunction } from '../../src/enqueue_links_filters.js';

describe('createTransformRequestFunction()', () => {
    test('matches globs case-insensitively and skips the rest', () => {
        const filter = createTransformRequestFunction({ globs: ['https://example.com/**'] });

        expect(filter({ url: 'https://EXAMPLE.com/foo/bar' })).toEqual({ url: 'https://EXAMPLE.com/foo/bar' });
        expect(filter({ url: 'https://other.com/foo' })).toBe(false);
    });

    test('matches pseudo-URLs', () => {
        const filter = createTransformRequestFunction({ pseudoUrls: ['https://example.com/pages/[(\\w|-)+]'] });

        expect(filter({ url: 'https://example.com/pages/my-page' })).toEqual({
            url: 'https://example.com/pages/my-page',
        });
        expect(filter({ url: 'https://example.com/other/my-page' })).toBe(false);
    });

    test('applies the request options of the matched pattern', () => {
        const filter = createTransformRequestFunction({
            globs: [{ glob: 'https://example.com/a/**', method: 'POST', userData: { label: 'A' } }],
            pseudoUrls: [{ purl: 'https://example.com/b/[.*]', headers: { 'x-foo': 'bar' } }],
        });

        expect(filter({ url: 'https://example.com/a/1' })).toEqual({
            url: 'https://example.com/a/1',
            method: 'POST',
            userData: { label: 'A' },
        });
        expect(filter({ url: 'https://example.com/b/1' })).toEqual({
            url: 'https://example.com/b/1',
            headers: { 'x-foo': 'bar' },
        });
    });

    test('passes everything through when no pattern is given', () => {
        expect(createTransformRequestFunction({ globs: [] })({ url: 'https://example.com' })).toBe('unchanged');
    });

    test('trims globs and ignores empty ones', () => {
        const filter = createTransformRequestFunction({ globs: ['  https://example.com/**  '] });

        expect(filter({ url: 'https://example.com/foo' })).toEqual({ url: 'https://example.com/foo' });
        expect(filter({ url: 'https://other.com/foo' })).toBe(false);

        expect(createTransformRequestFunction({ globs: ['   '] })({ url: 'https://example.com' })).toBe('unchanged');
        expect(createTransformRequestFunction({ pseudoUrls: ['   '] })({ url: 'https://example.com' })).toBe(
            'unchanged',
        );
    });

    test('passes the label shortcut through', () => {
        const filter = createTransformRequestFunction({
            globs: [{ glob: 'https://example.com/a/**', label: 'A' }],
            pseudoUrls: [{ purl: 'https://example.com/b/[.*]', label: 'B' }],
        });

        expect(filter({ url: 'https://example.com/a/1' })).toEqual({ url: 'https://example.com/a/1', label: 'A' });
        expect(filter({ url: 'https://example.com/b/1' })).toEqual({ url: 'https://example.com/b/1', label: 'B' });
    });

    test('skips nullish and keyless pattern items', () => {
        const filter = createTransformRequestFunction({
            globs: [null, { userData: { label: 'X' } }] as any,
            pseudoUrls: [undefined, {}] as any,
        });

        expect(filter({ url: 'https://example.com' })).toBe('unchanged');
    });

    test('the first matching pattern wins, globs before pseudo-URLs', () => {
        const filter = createTransformRequestFunction({
            globs: [{ glob: 'https://example.com/**', userData: { label: 'GLOB' } }],
            pseudoUrls: [{ purl: 'https://example.com/[.*]', userData: { label: 'PURL' } }],
        });

        expect(filter({ url: 'https://example.com/foo' })).toEqual({
            url: 'https://example.com/foo',
            userData: { label: 'GLOB' },
        });
    });
});
