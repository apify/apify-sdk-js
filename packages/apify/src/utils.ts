import { type } from 'node:os';
import { normalize } from 'node:path';

// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as crawleeVersion } from '@crawlee/core/package.json';
// @ts-ignore if we enable resolveJsonModule, we end up with `src` folder in `dist`
import { version as apifyClientVersion } from 'apify-client/package.json';
import { pathExistsSync, readJSONSync } from 'fs-extra';

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
