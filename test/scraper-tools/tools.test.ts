import { tools, constants } from '@apify/scraper-tools';
import { Request } from '@crawlee/core';

describe('tools.', () => {
    describe('ensureMetaData()', () => {
        it('should work', () => {
            const request = new Request({ url: 'https://www.example.com' });
            tools.ensureMetaData(request);

            expect(typeof request.userData[constants.META_KEY]).toBe('object');

            // TODO: type this correctly
            const meta = request.userData[constants.META_KEY] as { depth: number; parentRequestId: null };

            expect(meta.depth).toBe(0);
            expect(meta.parentRequestId).toBeNull();
        });
    });
});
