import { randomBytes as callbackRandomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runInThisContext } from 'node:vm';

import log from '@apify/log';
import type { Request, Session } from '@crawlee/core';
import type { Cookie } from '@crawlee/types';
import { createRequestDebugInfo } from '@crawlee/utils';
import type { Dictionary } from '@crawlee/utils';
import Ajv from 'ajv';

import { META_KEY, PAGE_FUNCTION_FILENAME } from './consts';

const randomBytes = promisify(callbackRandomBytes);

/**
 * Transforms a page function string into a Function object.
 * @param funcString
 */
export function evalFunctionOrThrow(funcString: string): (...args: unknown[]) => unknown {
    let func;

    try {
        func = runInThisContext(`(${funcString})`);
    } catch (err) {
        const e = err as Error;
        throw new Error(`Compilation of pageFunction failed.\n${e.message}\n${e.stack!.substr(e.stack!.indexOf('\n'))}`);
    }

    if (typeof func !== 'function') {
        throw new Error('Input parameter "pageFunction" is not a function!');
    }

    return func;
}

/**
 * Transforms a pre/post navigation hooks string into array of Functions.
 * @param hooksString
 * @param paramName
 */
export function evalFunctionArrayOrThrow(hooksString: string, paramName: string): ((...args: unknown[]) => any)[] {
    let arr;

    try {
        arr = runInThisContext(`(${hooksString})`);
    } catch (err) {
        const e = err as Error;
        throw new Error(`Compilation of ${paramName} failed.\n${e.message}\n${e.stack!.substr(e.stack!.indexOf('\n'))}`);
    }

    if (!Array.isArray(arr)) {
        throw new Error(`Input parameter "${paramName}" is not an array!`);
    }

    if (arr.some((func) => typeof func !== 'function')) {
        throw new Error(`Input parameter "${paramName}" is not an array of functions!`);
    }

    return arr;
}

/**
 * Validates the INPUT using the AJV library against the schema.
 */
export function checkInputOrThrow(input: unknown, schema: Dictionary) {
    const ajv = new Ajv({ allErrors: true, useDefaults: true, strict: false });
    const valid = ajv.validate(schema, input);
    if (!valid) throw new Error(`Invalid input:\n${JSON.stringify(ajv.errors, null, 2)}`);
}

export interface RequestMetadata {
    depth: number;
    parentRequestId: string | null;
}

/**
 * MODIFIES the provided Request by attaching necessary metadata.
 * Currently it only adds depth metadata, but it may be extended
 * as needed.
 */
export function ensureMetaData(request: Request) {
    request.userData ??= {};

    const metadata = request.userData[META_KEY];
    if (!metadata) {
        request.userData[META_KEY] = {
            depth: 0,
            parentRequestId: null,
        };
        return;
    }

    if (typeof metadata !== 'object') {
        throw new Error(`Request ${request.id} contains invalid metadata value.`);
    }
}

/**
 * Merges the result of the page function, that may be a single object
 * or an array objects, with request metadata and a flag, whether
 * an error occured. This would typically be used after the page
 * had been retried and the failedRequestHandler was called.
 *
 * If an Object[] is returned from the page function, each of the objects
 * will have the metadata appended for consistency, since the dataset
 * will flatten the results.
 */
export function createDatasetPayload(
    request: Request,
    response: Parameters<typeof createRequestDebugInfo>[1],
    pageFunctionResult?: Dictionary | Dictionary[],
    isError = false,
) {
    // Null and undefined do not prevent the payload
    // from being saved to dataset. It will just contain
    // the relevant metadata.
    let result = pageFunctionResult || {};

    // Validate the result.
    const type = typeof result;
    if (type !== 'object') {
        throw new Error(`Page function must return Object | Object[], but it returned ${type}.`);
    }

    // Metadata need to be appended to each item
    // to match results with dataset "lines".
    if (!Array.isArray(result)) result = [result];

    const meta = {
        '#error': isError,
        '#debug': createRequestDebugInfo(request, response),
    };

    return (result as Dictionary[]).map((item) => ({ ...item, ...meta }));
}

/**
 * Creates a 12 byte random hash encoded as base64
 * to be used as identifier.
 */
export async function createRandomHash() {
    return (await randomBytes(12))
        .toString('base64')
        .replace(/[+/=]/g, 'x') // Remove invalid chars.
        .replace(/^\d/, 'a'); // Ensure first char is not a digit.
}

/**
 * Checks whether an item is a plain object,
 * i.e. not a function or array as _.isObject()
 * would check for.
 */
export function isPlainObject(item: unknown): item is Record<string, unknown> {
    return (item && typeof item === 'object' && !Array.isArray(item)) as boolean;
}

/**
 * Attempts to load Page Function from disk if it's not available
 * on INPUT.
 */
export function maybeLoadPageFunctionFromDisk(input: Dictionary, root: string) {
    if (input.pageFunction) return;

    const pageFunctionPath = join(root, PAGE_FUNCTION_FILENAME);
    log.debug(`Loading Page Function from disk: ${pageFunctionPath}`);
    try {
        input.pageFunction = readFileSync(pageFunctionPath, 'utf8');
    } catch (err) {
        log.exception(err as Error, 'Page Function load from disk failed.');
    }
}

export interface ErrorLike {
    message?: string;
    stack?: string;
}

/**
 * Creates an error constructed using props
 * from the provided object.
 */
export function createError(obj: ErrorLike = {}) {
    const error = new Error(obj.message);
    error.stack = obj.stack;
    return error;
}

export function logPerformance(request: Request, title: string, hrtime: [number, number]) {
    if (log.getLevel() !== log.LEVELS.PERF) return;

    const runtime = process.hrtime(hrtime);
    const nanos = runtime[0] * 1_000_000_000 + runtime[1];
    const micros = nanos / 1000;
    const millis = micros / 1000;

    log.perf(`${request.id} ${title} took ${Math.round(millis)} ms.`);
}

/**
 * Accepts an array of cookies in a { name, value }
 * format and finds if any of them are missing from
 * the session cookies for a given URL.
 */
export function getMissingCookiesFromSession(session: Session, cookies: Cookie[], url: string) {
    const sessionCookies = session.getCookies(url);
    return cookies.filter((c) => {
        const sessionHasCookie = sessionCookies.some((sc) => sc.name === c.name);
        return !sessionHasCookie;
    });
}
