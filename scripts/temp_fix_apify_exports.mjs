import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { globby } from 'globby';

const cwd = resolve(process.cwd(), 'dist');
const target = resolve(cwd, 'index.d.ts');
const file = readFileSync(target).toString();

writeFileSync(
    target,
    file.replace(
        `export * from './exports';`,
        `// @ts-ignore\nexport * from './exports';`,
    ),
);

const files = await globby(`${cwd}/**/*.(d.ts|js)`);

// convert `@apilink` to `@link`
for (const filepath of files) {
    const input = readFileSync(filepath, { encoding: 'utf8' }).split('\n');
    const output = [];
    let changed = false;

    for (const line of input) {
        if (line.includes('@apilink')) {
            output.push(line.replaceAll('@apilink', '@link'));
            changed = true;
        } else {
            output.push(line);
        }
    }

    if (changed === true) {
        console.log('Writing', filepath);
        writeFileSync(filepath, output.join('\n'));
    }
}
