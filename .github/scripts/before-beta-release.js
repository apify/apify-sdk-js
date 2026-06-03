/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PKG_JSON_PATH = path.join(import.meta.dirname, '..', '..', 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(PKG_JSON_PATH, 'utf8'));

const PACKAGE_NAME = pkgJson.name;

// The npm dist-tag we publish to is passed as the first CLI argument. A tag
// ending in `v<major>` (e.g. `next-v4`) marks a pre-major release line:
// package.json stays on the current major (3.x) and we publish betas of the
// *next* major (4.0.0-beta.N) under that tag. (The tag isn't a bare `v4`
// because npm refuses dist-tags that parse as a semver range.)
const distTag = process.argv[2];
const premajorMatch = /v(\d+)$/.exec(distTag ?? '');
const premajor = premajorMatch ? Number(premajorMatch[1]) : null;

const nextVersion = computeNextBetaVersion(pkgJson.version, premajor);
console.log(`before-deploy: Setting version to ${nextVersion}`);
pkgJson.version = nextVersion;

fs.writeFileSync(PKG_JSON_PATH, `${JSON.stringify(pkgJson, null, 2)}\n`);

function computeNextBetaVersion(version, premajorVersion) {
    const versionsString = execSync(`npm show ${PACKAGE_NAME} versions --json`, {
        encoding: 'utf8',
    });
    const versions = JSON.parse(versionsString);

    let base = version;

    if (premajorVersion !== null) {
        // Pre-major release line: keep package.json on the current major and
        // publish betas of the next major (e.g. 3.7.2 -> 4.0.0-beta.N). Only the
        // -beta.N suffix advances between publishes.
        base = `${premajorVersion}.0.0`;
    } else if (versions.includes(base)) {
        // The exact version is already published as a stable release, so bump the
        // patch to start a fresh pre-release series (e.g. 3.7.2 -> 3.7.3).
        const [major, minor, patch] = base.split('.').map(Number);
        base = `${major}.${minor}.${patch + 1}`;
        console.log(`before-deploy: Version ${version} already exists on npm, bumping to ${base}`);
    }

    const prereleaseNumbers = versions
        .filter((v) => v.startsWith(`${base}-`))
        .map((v) => Number(v.match(/\.(\d+)$/)?.[1]))
        .filter((n) => !Number.isNaN(n));
    const lastPrereleaseNumber = Math.max(-1, ...prereleaseNumbers);

    return `${base}-beta.${lastPrereleaseNumber + 1}`;
}
