import * as apify from 'apify';
import * as apifyClient from 'apify-client';

// Every error class apify-client exports must be reachable from the package root, so
// users can handle API errors without depending on apify-client directly.
describe('apify-client error re-exports', () => {
    const clientErrorNames = Object.keys(apifyClient).filter((name) => name.endsWith('Error'));

    test('apify-client exports at least one error class', () => {
        expect(clientErrorNames).not.toHaveLength(0);
    });

    test.each(clientErrorNames)('%s is re-exported from apify', (name) => {
        const clientError = (apifyClient as Record<string, unknown>)[name];
        const sdkError = (apify as Record<string, unknown>)[name];

        expect(typeof clientError).toBe('function');
        expect(sdkError).toBe(clientError);
    });

    test('the re-exported classes keep the client hierarchy', () => {
        expect(apify.NotFoundError.prototype).toBeInstanceOf(apify.ApifyApiError);
        expect(apify.RateLimitError.prototype).toBeInstanceOf(apify.ApifyApiError);
        expect(apify.ServerError.prototype).toBeInstanceOf(apify.ApifyApiError);
    });
});
