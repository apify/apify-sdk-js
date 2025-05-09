import { type } from 'node:os';
import { normalize } from 'node:path';

// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as crawleeVersion } from '@crawlee/core/package.json';
// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as apifyClientVersion } from 'apify-client/package.json';
import { pathExistsSync, readJSONSync } from 'fs-extra';
import semver from 'semver';

import { APIFY_ENV_VARS } from '@apify/consts';
import log from '@apify/log';

// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as apifyVersion } from '../package.json';

/**
 * Gets info about system, node version and apify package version.
 * @internal
 */
export function getSystemInfo() {
    return {
        apifyVersion,
        apifyClientVersion,
        crawleeVersion,
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
        normalize(
            `${process.cwd()}/node_modules/crawlee/node_modules/@crawlee/core/package.json`,
        ),
        // when users install `@crawlee/cheerio` or other crawler package, we need to check the dependency under basic crawler package
        normalize(
            `${process.cwd()}/node_modules/@crawlee/basic/node_modules/@crawlee/core/package.json`,
        ),
        // also check paths via `require.resolve` to support pnpm
        resolve('crawlee/package.json'),
        resolve('@crawlee/basic/package.json'),
    ];

    for (const path of paths) {
        // ignore unresolved paths or paths that are not in the project directory
        if (!pathExistsSync(path) || !path.startsWith(process.cwd())) {
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

            throw new Error(
                `Detected incompatible Crawlee version used by the SDK. User installed ${version} but the SDK uses ${crawleeVersion}.\n\n${details}`,
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
    if (!latestApifyVersion || !semver.lt(apifyVersion, latestApifyVersion))
        return;

    log.warning(`You are using an outdated version (${apifyVersion}) of Apify SDK. We recommend you to update to the latest version (${latestApifyVersion}).
         Read more about Apify SDK versioning at: https://help.apify.com/en/articles/3184510-updates-and-versioning-of-apify-sdk`);
}
