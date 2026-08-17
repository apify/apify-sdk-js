import { createUrlPatternFilter } from '../../src/enqueue_links_filters.js';

describe('createUrlPatternFilter()', () => {
    test('matches globs case-insensitively and skips the rest', () => {
        const filter = createUrlPatternFilter({ globs: ['https://example.com/**'] });

        expect(filter({ url: 'https://EXAMPLE.com/foo/bar' })).toEqual({ url: 'https://EXAMPLE.com/foo/bar' });
        expect(filter({ url: 'https://other.com/foo' })).toBe(false);
    });

    test('matches pseudo-URLs', () => {
        const filter = createUrlPatternFilter({ pseudoUrls: ['https://example.com/pages/[(\\w|-)+]'] });

        expect(filter({ url: 'https://example.com/pages/my-page' })).toBeTruthy();
        expect(filter({ url: 'https://example.com/other/my-page' })).toBe(false);
    });

    test('applies the request options of the matched pattern', () => {
        const filter = createUrlPatternFilter({
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
        expect(createUrlPatternFilter({ globs: [] })({ url: 'https://example.com' })).toBe('unchanged');
    });
});
