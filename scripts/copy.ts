import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'node:child_process';
import { Dictionary } from '@crawlee/utils';

const options = process.argv.slice(2).reduce((args, arg) => {
    const [key, value] = arg.split('=');
    args[key.substring(2)] = value ?? true;

    return args;
}, {} as any);

function copy(filename: string, from: string, to: string): void {
    copyFileSync(resolve(from, filename), resolve(to, filename));
}

function rewrite(path: string, replacer: (from: string) => string): void {
    try {
        const file = readFileSync(path).toString();
        const replaced = replacer(file);
        writeFileSync(path, replaced);
    } catch {
        // not found
    }
}

const versionCache: Dictionary<string> = {};

/**
 * Checks next dev version number based on the `@crawlee/core` package via `npm show`.
 * We always use this package, so we ensure the version is the same for each package in the monorepo.
 */
function getNextVersion(name: string, version: string) {
    const cacheKey = `${name}@${version}`;

    if (versionCache[cacheKey]) {
        return versionCache[cacheKey];
    }

    const versions: string[] = [];

    try {
        const versionString = execSync(`npm show ${name} versions --json`, { encoding: 'utf8', stdio: 'pipe' });
        const parsed = JSON.parse(versionString) as string[];
        versions.push(...parsed);
    } catch {
        // the package might not have been published yet
    }

    if (versions.some((v) => v === version)) {
        // eslint-disable-next-line no-console
        console.error(`before-deploy: A release with version ${version} already exists. Please increment version accordingly.`);
        process.exit(1);
    }

    const preid = options.preid ?? 'alpha';
    const prereleaseNumbers = versions
        .filter((v) => v.startsWith(`${version}-${preid}.`))
        .map((v) => Number(v.match(/\.(\d+)$/)?.[1]));
    const lastPrereleaseNumber = Math.max(-1, ...prereleaseNumbers);

    versionCache[cacheKey] = `${version}-${preid}.${lastPrereleaseNumber + 1}`;

    return versionCache[cacheKey];
}

// as we publish only the dist folder, we need to copy some meta files inside (readme/license/package.json)
// also changes paths inside the copied `package.json` (`dist/index.js` -> `index.js`)
const root = resolve(__dirname, '..');
const target = resolve(process.cwd(), 'dist');
const pkgPath = resolve(process.cwd(), 'package.json');
const packages = ['apify', '@apify/scraper-tools'];

function bumpDependency(dependencies: Dictionary, dep: string, nextVersion: string) {
    const prefix = dependencies[dep].startsWith('^') ? '^' : '';
    dependencies[dep] = prefix + nextVersion;
}

if (options.canary) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-dynamic-require,global-require
    const pkgJson = require(pkgPath);
    const nextVersion = getNextVersion(pkgJson.name, pkgJson.version);
    pkgJson.version = nextVersion;

    for (const dep of Object.keys(pkgJson.dependencies)) {
        if (pkgJson.name === dep) {
            bumpDependency(pkgJson.dependencies, dep, nextVersion);
        }
    }

    for (const dep of Object.keys(pkgJson.peerDependencies ?? {})) {
        'wat'
        if (pkgJson.name === dep) {
            bumpDependency(pkgJson.peerDependencies, dep, nextVersion);
        }
    }

    // eslint-disable-next-line no-console
    console.info(`canary: setting version to ${nextVersion}`);

    writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 4)}\n`);
}

switch (options.readme) {
    case 'false': {
        break;
    }
    case 'local': {
        copy('README.md', resolve(process.cwd()), target);
        break;
    }
    default: {
        copy('README.md', root, target);
    }
}

copy('LICENSE.md', root, target);
copy('package.json', process.cwd(), target);
rewrite(resolve(target, 'package.json'), (pkg) => {
    return pkg.replace(/dist\//g, '').replace(/src\/(.*)\.ts/g, '$1.js');
});
rewrite(resolve(target, 'utils.js'), (pkg) => pkg.replace('../package.json', './package.json'));
