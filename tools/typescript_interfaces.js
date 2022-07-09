const { readdirSync, readFileSync, writeFileSync, realpathSync, statSync } = require('fs');
const path = require('path');

const debug = (namespace, ...args) => {
    const debugTypefixes = process.env.DEBUG_TYPEFIXES;

    if (debugTypefixes && (debugTypefixes === '*' || debugTypefixes.includes(namespace))) {
        console.log(...args);
    }
};

console.log('Currect directory:', realpathSync('./'));
const typesPath = './build';
const paths = {
    main: path.join(typesPath, 'main.d.ts'),
    session_pool: path.join(typesPath, 'session_pool', 'session_pool.d.ts'),
    utils_log: path.join(typesPath, 'utils_log.d.ts'),
};

console.log('Processing', paths.main);

/**
 * Traverses directory recursively, applies `filter()` on it's relative path path and if `true` is returned,
 * applies `handleFile()` on the file collecting the return values into a dictionary object.
 * @param {String} dir Starting directory.
 * @param {FilenameFilter} filter Pathname filter function.
 * @param {FileHandler} handleFile File processing function.
 * @returns {Promise<{ [index: string]: object|array }>} Hierarchical collection of `handleFile`'s return values.
 */
const traverseDirs = async (dir, filter, handleFile) => {
    console.log('Reading directory', dir);
    const types = {};

    const dirContent = readdirSync(dir);
    for (const entry of dirContent) {
        const entryPath = path.join(dir, entry);
        const entryStat = statSync(entryPath);

        if (entryStat.isFile()) {
            if (filter(entry)) {
                types[entry.replace(/\.d\.ts$/, '')] = handleFile(entryPath);
            }
        } else if (entryStat.isDirectory()) {
            types[entry] = await traverseDirs(entryPath, filter, handleFile);
        }
    }
    return types;
};

const processIndexEsm = async () => {
    const types = await traverseDirs(
        typesPath,
        (filename) => {
            return filename.endsWith('.d.ts');
        },
        readTypes,
    );
    const input = readFileSync(paths.main, { encoding: 'utf8' })
        .split('\n');
    console.log('Fixing type exports', paths.main);
    const fixedTypes = fixTypes(input, types);
    console.log('Writing', paths.main);
    writeFileSync(paths.main, fixedTypes.join('\n'));
};

const fixTypesReferences = async () => {
    await traverseDirs(typesPath, (filename) => filename.endsWith('.d.ts'), (filepath) => {
        const input = readFileSync(filepath, { encoding: 'utf8' }).split('\n');
        const output = [];
        let changed = false;
        let match;
        for (const line of input) {
            /* eslint-disable no-cond-assign */
            if (match = line.match(/^([^"]+)"node\/([^$]+)/)) {
                debug('fixTypesReferences', 'fixing "node/" from file', filepath);
                output.push(`${match[1]} "${match[2]}`);
                changed = true;
            } else if (match = line.match(/^([^"]+)"puppeteer"/)) {
                debug('fixTypesReferences', 'fixing "puppeteer" from file', filepath);
                output.push('// @ts-ignore optional peer dependency');
                output.push(line);
                changed = true;
            } else if (match = line.match(/^([^"]+)"playwright[/"]/)) {
                debug('fixTypesReferences', 'fixing "playwright" from file', filepath);
                output.push('// @ts-ignore optional peer dependency');
                output.push(line);
                changed = true;
            } else {
                output.push(line);
            }
            /* eslint-enable no-cond-assign */
        }

        if (changed === true) {
            console.log('Writing', filepath);
            writeFileSync(filepath, output.join('\n'));
        }
    });
};

(async () => {
    await processIndexEsm();
    await fixTypesReferences();
    await fixSessionPool();
    await fixUtilsLog();
})();
