import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { type } from 'node:os';
import { normalize } from 'node:path';

// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import crawleePkgJson from '@crawlee/core/package.json' with { type: 'json' };
// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import apifyClientPkgJson from 'apify-client/package.json' with { type: 'json' };
import semver from 'semver';

import { z } from 'zod';

import { APIFY_ENV_VARS } from '@apify/consts';
import log from '@apify/log';

// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import apifyPkgJson from '../package.json' with { type: 'json' };

const require = createRequire(import.meta.url);

/**
 * Returns `true` for a plain, non-empty object (not `null`, not an array).
 * Mirrors the `ow.object.nonEmpty` predicate the SDK used previously.
 * @internal
 */
export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}

/**
 * Validates `value` against a zod `schema`, returning the parsed value.
 *
 * On failure it throws an `Error` whose message is a human-readable, multi-line
 * sentence (via {@link https://zod.dev | zod}'s `prettifyError`) rather than a
 * raw JSON dump, while preserving the structured `ZodError` (including its
 * `issues`) as the error's `cause` for programmatic inspection.
 * @internal
 */
export function validate<Schema extends z.ZodType>(schema: Schema, value: unknown): z.infer<Schema> {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw new Error(z.prettifyError(result.error), { cause: result.error });
    }
    return result.data;
}

/**
 * Gets info about system, node version and apify package version.
 * @internal
 */
export function getSystemInfo() {
    return {
        apifyVersion: apifyPkgJson.version,
        apifyClientVersion: apifyClientPkgJson.version,
        crawleeVersion: crawleePkgJson.version,
        osType: type(),
        nodeVersion: process.version,
    };
}

/**
 * @internal
 */
export function checkCrawleeVersion() {
    const resolve = (name: string) => {
        try {
            return require.resolve(name);
        } catch {
            return name;
        }
    };

    const paths = [
        // when users install `crawlee` package, we need to check its core dependency
        normalize(`${process.cwd()}/node_modules/crawlee/node_modules/@crawlee/core/package.json`),
        // when users install `@crawlee/cheerio` or other crawler package, we need to check the dependency under basic crawler package
        normalize(`${process.cwd()}/node_modules/@crawlee/basic/node_modules/@crawlee/core/package.json`),
        // also check paths via `require.resolve` to support pnpm
        resolve('crawlee/package.json'),
        resolve('@crawlee/basic/package.json'),
    ];

    for (const path of paths) {
        // ignore unresolved paths or paths that are not in the project directory
        if (!existsSync(path) || !path.startsWith(process.cwd())) {
            continue;
        }

        let version;

        try {
            version = JSON.parse(readFileSync(path, 'utf8')).version;
        } catch {
            //
        }

        if (version != null && version !== crawleePkgJson.version) {
            const details = `User installed version (${version}) found in ${path}.\nSDK uses ${crawleePkgJson.version} from ${require.resolve('@crawlee/core')}`;

            throw new Error(
                `Detected incompatible Crawlee version used by the SDK. User installed ${version} but the SDK uses ${crawleePkgJson.version}.\n\n${details}`,
            );
        }
    }
}

/**
 * Prints a warning if this version of Apify SDK is outdated.
 * @ignore
 */
export function printOutdatedSdkWarning() {
    if (process.env[APIFY_ENV_VARS.DISABLE_OUTDATED_WARNING]) return;
    const latestApifyVersion = process.env[APIFY_ENV_VARS.SDK_LATEST_VERSION];
    if (!latestApifyVersion || !semver.lt(apifyPkgJson.version, latestApifyVersion)) return;

    log.warning(`You are using an outdated version (${apifyPkgJson.version}) of Apify SDK. We recommend you to update to the latest version (${latestApifyVersion}).
         Read more about Apify SDK versioning at: https://help.apify.com/en/articles/3184510-updates-and-versioning-of-apify-sdk`);
}
