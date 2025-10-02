// TODO: https://github.com/apify/apify-shared-js/issues/547

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import type { Dictionary } from '@crawlee/utils';

// These paths are used *if* there is no `input` field in the actor.json configuration file!
const DEFAULT_INPUT_SCHEMA_PATHS = [
    ['.actor', 'INPUT_SCHEMA.json'],
    ['INPUT_SCHEMA.json'],
    ['.actor', 'input_schema.json'],
    ['input_schema.json'],
];

const ACTOR_SPECIFICATION_FOLDER = '.actor';

const LOCAL_CONFIG_NAME = 'actor.json';

const readJSONIfExists = (path: string): Dictionary | null => {
    if (existsSync(path)) {
        const content = readFileSync(path, 'utf8');
        return JSON.parse(content);
    }

    return null;
};

export const readInputSchema = (): Dictionary | null => {
    const localConfig = readJSONIfExists(
        join(process.cwd(), ACTOR_SPECIFICATION_FOLDER, LOCAL_CONFIG_NAME),
    );

    // Input schema nested in the actor config
    if (typeof localConfig?.input === 'object') {
        return localConfig.input;
    }

    // Input schema path from the actor config
    if (typeof localConfig?.input === 'string') {
        const fullPath = join(
            process.cwd(),
            ACTOR_SPECIFICATION_FOLDER,
            localConfig.input,
        );

        return readJSONIfExists(fullPath);
    }

    // Try to find it from possible default paths
    for (const path of DEFAULT_INPUT_SCHEMA_PATHS) {
        const fullPath = join(process.cwd(), ...path);

        const result = readJSONIfExists(fullPath);

        if (result) {
            return result;
        }
    }

    return null;
};

export const getDefaultsFromInputSchema = (inputSchema: any) => {
    const defaults: Record<string, unknown> = {};

    for (const [key, fieldSchema] of Object.entries<any>(
        inputSchema.properties,
    )) {
        if (fieldSchema.default !== undefined) {
            defaults[key] = fieldSchema.default;
        }
    }

    return defaults;
};
