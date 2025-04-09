import { readdir, readFile, writeFile } from 'node:fs/promises';

const packagesDir = new URL('../../packages/', import.meta.url);

const packages = await readdir(packagesDir);

for (const pkg of packages) {
    try {
        const pkgJsonPath = new URL(`${pkg}/package.json`, packagesDir);
        const pkgJson = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));

        delete pkgJson.private;

        await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 4));
    } catch {}
}
