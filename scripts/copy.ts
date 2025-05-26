import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

// as we publish only the dist folder, we need to copy some meta files inside (readme/license/package.json)
// also changes paths inside the copied `package.json` (`dist/index.js` -> `index.js`)
const root = resolve(import.meta.dirname, '..');
const target = resolve(process.cwd(), 'dist');

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
rewrite(resolve(target, 'utils.js'), (pkg) =>
    pkg.replace('../package.json', './package.json'),
);
