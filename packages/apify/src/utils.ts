import { type } from 'node:os';
import { normalize } from 'node:path';

import { APIFY_ENV_VARS } from '@apify/consts';
import log from '@apify/log';
// @ts-expect-error if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as crawleeVersion } from '@crawlee/core/package.json';
// @ts-expect-error if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as apifyClientVersion } from 'apify-client/package.json';
import { pathExistsSync, readJSONSync } from 'fs-extra';
import semver from 'semver';

// @ts-expect-error if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as apifyVersion } from '../package.json';

/**
 * Logs info about system, node version and apify package version.
 * @internal
 */
export function logSystemInfo() {
    log.info('System info', {
        apifyVersion,
        apifyClientVersion,
        crawleeVersion,
        osType: type(),
        nodeVersion: process.version,
    });
}

/**
 * Logs info about system, node version and apify package version.
 * @internal
 */
export function checkCrawleeVersion() {
    const paths = [
        // when users install `crawlee` package, we need to check its core dependency
        normalize(`${process.cwd()}/node_modules/crawlee/node_modules/@crawlee/core/package.json`),
        // when users install `@crawlee/cheerio` or other crawler package, we need to check the dependency under basic crawler package
        normalize(`${process.cwd()}/node_modules/@crawlee/basic/node_modules/@crawlee/core/package.json`),
        // also check paths via `require.resolve` to support pnpm
        require.resolve('crawlee/package.json'),
        require.resolve('@crawlee/basic/package.json'),
    ];

    for (const path of paths) {
        if (!pathExistsSync(path)) {
            continue;
        }

        let version;

        try {
            version = readJSONSync(path).version;
        } catch {
            //
        }

        if (version != null && version !== crawleeVersion) {
            const details = `User installed version (${version}) found in ${path}.\nSDK uses ${crawleeVersion} from ${require.resolve('@crawlee/core')}`;
            // eslint-disable-next-line max-len
            throw new Error(`Detected incompatible Crawlee version used by the SDK. User installed ${version} but the SDK uses ${crawleeVersion}.\n\n${details}`);
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
    if (!latestApifyVersion || !semver.lt(apifyVersion, latestApifyVersion)) return;

    log.warning(`You are using an outdated version (${apifyVersion}) of Apify SDK. We recommend you to update to the latest version (${latestApifyVersion}).
         Read more about Apify SDK versioning at: https://help.apify.com/en/articles/3184510-updates-and-versioning-of-apify-sdk`);
}
