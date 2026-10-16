import { Configuration } from 'apify';

import { APIFY_ENV_VARS } from '@apify/consts';

describe('Configuration', () => {
    describe('userIsPaying', () => {
        afterEach(() => {
            delete process.env[APIFY_ENV_VARS.USER_IS_PAYING];
        });

        test.each([
            ['1', true],
            ['true', true],
            ['0', false],
            ['false', false],
            ['', false],
            [undefined, false],
        ])('parses APIFY_USER_IS_PAYING=%j as %s', (raw, expected) => {
            if (raw === undefined) delete process.env[APIFY_ENV_VARS.USER_IS_PAYING];
            else process.env[APIFY_ENV_VARS.USER_IS_PAYING] = raw;

            expect(new Configuration().userIsPaying).toBe(expected);
        });

        test('constructor option takes precedence over the env var', () => {
            process.env[APIFY_ENV_VARS.USER_IS_PAYING] = '1';
            expect(new Configuration({ userIsPaying: false }).userIsPaying).toBe(false);
        });
    });
});
