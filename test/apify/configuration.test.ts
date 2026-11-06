import { Configuration } from 'apify';

import { ACTOR_ENV_VARS, APIFY_ENV_VARS } from '@apify/consts';

// Every env var touched below, cleared before each test so a freshly built
// `Configuration` sees only what the test itself sets.
const ENV_VARS = [
    ACTOR_ENV_VARS.BUILD_ID,
    APIFY_ENV_VARS.ACTOR_BUILD_ID,
    ACTOR_ENV_VARS.BUILD_NUMBER,
    APIFY_ENV_VARS.ACTOR_BUILD_NUMBER,
    ACTOR_ENV_VARS.BUILD_TAGS,
    ACTOR_ENV_VARS.FULL_NAME,
    APIFY_ENV_VARS.WORKFLOW_KEY,
    ACTOR_ENV_VARS.STARTED_AT,
    APIFY_ENV_VARS.STARTED_AT,
    ACTOR_ENV_VARS.TIMEOUT_AT,
    APIFY_ENV_VARS.TIMEOUT_AT,
    ACTOR_ENV_VARS.MAX_PAID_DATASET_ITEMS,
    APIFY_ENV_VARS.DEDICATED_CPUS,
];

describe('Configuration', () => {
    let savedEnv: Record<string, string | undefined>;

    beforeEach(() => {
        savedEnv = Object.fromEntries(ENV_VARS.map((name) => [name, process.env[name]]));
        for (const name of ENV_VARS) delete process.env[name];
    });

    afterEach(() => {
        for (const name of ENV_VARS) {
            if (savedEnv[name] === undefined) delete process.env[name];
            else process.env[name] = savedEnv[name];
        }
    });

    describe('run metadata fields', () => {
        test('are undefined when unset', () => {
            const config = new Configuration();
            expect(config.actorBuildId).toBeUndefined();
            expect(config.actorBuildNumber).toBeUndefined();
            expect(config.actorBuildTags).toBeUndefined();
            expect(config.actorFullName).toBeUndefined();
            expect(config.workflowKey).toBeUndefined();
            expect(config.startedAt).toBeUndefined();
            expect(config.timeoutAt).toBeUndefined();
            expect(config.maxPaidDatasetItems).toBeUndefined();
            expect(config.dedicatedCpus).toBeUndefined();
        });

        test('are parsed from environment variables', () => {
            process.env[ACTOR_ENV_VARS.BUILD_ID] = 'build-id';
            process.env[ACTOR_ENV_VARS.BUILD_NUMBER] = '0.1.23';
            process.env[ACTOR_ENV_VARS.BUILD_TAGS] = 'latest,beta';
            process.env[ACTOR_ENV_VARS.FULL_NAME] = 'user/actor';
            process.env[APIFY_ENV_VARS.WORKFLOW_KEY] = 'workflow-key';
            process.env[ACTOR_ENV_VARS.STARTED_AT] = '2017-01-01T00:00:00.000Z';
            process.env[ACTOR_ENV_VARS.TIMEOUT_AT] = '2017-01-01T01:00:00.000Z';
            process.env[ACTOR_ENV_VARS.MAX_PAID_DATASET_ITEMS] = '1000';
            process.env[APIFY_ENV_VARS.DEDICATED_CPUS] = '2.5';

            const config = new Configuration();
            expect(config.actorBuildId).toBe('build-id');
            expect(config.actorBuildNumber).toBe('0.1.23');
            expect(config.actorBuildTags).toEqual(['latest', 'beta']);
            expect(config.actorFullName).toBe('user/actor');
            expect(config.workflowKey).toBe('workflow-key');
            expect(config.startedAt).toEqual(new Date('2017-01-01T00:00:00.000Z'));
            expect(config.timeoutAt).toEqual(new Date('2017-01-01T01:00:00.000Z'));
            expect(config.maxPaidDatasetItems).toBe(1000);
            expect(config.dedicatedCpus).toBe(2.5);
        });

        test('accept constructor options', () => {
            const startedAt = new Date('2020-02-02T00:00:00.000Z');
            const config = new Configuration({ startedAt, actorBuildTags: ['one'], maxPaidDatasetItems: 5 });
            expect(config.startedAt).toBe(startedAt);
            expect(config.actorBuildTags).toEqual(['one']);
            expect(config.maxPaidDatasetItems).toBe(5);
        });

        test('prefer ACTOR_* over the APIFY_* alias', () => {
            process.env[ACTOR_ENV_VARS.BUILD_ID] = 'actor-build';
            process.env[APIFY_ENV_VARS.ACTOR_BUILD_ID] = 'apify-build';
            process.env[ACTOR_ENV_VARS.TIMEOUT_AT] = '2017-01-01T00:00:00.000Z';
            process.env[APIFY_ENV_VARS.TIMEOUT_AT] = '2018-01-01T00:00:00.000Z';

            const config = new Configuration();
            expect(config.actorBuildId).toBe('actor-build');
            expect(config.timeoutAt).toEqual(new Date('2017-01-01T00:00:00.000Z'));
        });

        test('fall back to the APIFY_* alias', () => {
            process.env[APIFY_ENV_VARS.ACTOR_BUILD_ID] = 'apify-build';
            process.env[APIFY_ENV_VARS.STARTED_AT] = '2018-01-01T00:00:00.000Z';

            const config = new Configuration();
            expect(config.actorBuildId).toBe('apify-build');
            expect(config.startedAt).toEqual(new Date('2018-01-01T00:00:00.000Z'));
        });

        test('throw on an invalid date', () => {
            process.env[ACTOR_ENV_VARS.TIMEOUT_AT] = 'not a date';
            expect(() => new Configuration()).toThrow();
        });

        test.each([
            ['latest', ['latest']],
            ['latest, beta ,rc', ['latest', 'beta', 'rc']],
            ['latest,,beta,', ['latest', 'beta']],
        ])('split ACTOR_BUILD_TAGS=%j into %j', (raw, expected) => {
            process.env[ACTOR_ENV_VARS.BUILD_TAGS] = raw;
            expect(new Configuration().actorBuildTags).toEqual(expected);
        });
    });
});
