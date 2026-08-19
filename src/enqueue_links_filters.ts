import type { RequestOptions, RequestTransform } from '@crawlee/core';
import { Minimatch } from 'minimatch';

import { purlToRegExp } from '@apify/pseudo_url';

/** Request options that the `globs` and `pseudoUrls` input editors can attach to a single URL pattern. */
export interface UrlPatternRequestOptions extends Pick<
    RequestOptions,
    'method' | 'payload' | 'label' | 'userData' | 'headers'
> {}

/** A single item of an input schema array field using the `globs` editor. */
export interface GlobInput extends UrlPatternRequestOptions {
    glob: string;
}

/** A single item of an input schema array field using the `pseudoUrls` editor. */
export interface PseudoUrlInput extends UrlPatternRequestOptions {
    purl: string;
}

export interface UrlPatternFilters {
    /** Value of an input schema field using the `globs` editor. */
    globs?: readonly (string | GlobInput)[];
    /** Value of an input schema field using the `pseudoUrls` editor. */
    pseudoUrls?: readonly (string | PseudoUrlInput)[];
}

/**
 * Turns the `globs` and `pseudoUrls` input editor values into a `transformRequestFunction` that skips requests
 * matching no pattern (all requests pass when no pattern is given) and applies the options of the matched pattern.
 * When a URL matches multiple patterns, the first one wins, with globs checked before pseudo-URLs. The matched
 * pattern's options shallowly override the request's fields, including `userData` (no deep merge, like in v3).
 *
 * ```ts
 * await enqueueLinks({ transformRequestFunction: createTransformRequestFunction({ globs: input.globs }) });
 * ```
 */
export function createTransformRequestFunction({ globs = [], pseudoUrls = [] }: UrlPatternFilters): RequestTransform {
    const patterns = [
        ...globs.flatMap((item) => {
            if (item == null) {
                return [];
            }

            const { glob, ...options } = typeof item === 'string' ? { glob: item } : item;
            const trimmedGlob = typeof glob === 'string' ? glob.trim() : '';

            if (trimmedGlob.length === 0) {
                return [];
            }

            const minimatch = new Minimatch(trimmedGlob, { nocase: true });

            return [{ matches: (url: string) => minimatch.match(url), options }];
        }),
        ...pseudoUrls.flatMap((item) => {
            if (item == null) {
                return [];
            }

            const { purl, ...options } = typeof item === 'string' ? { purl: item } : item;

            if (typeof purl !== 'string' || purl.trim().length === 0) {
                return [];
            }

            let regexp: RegExp;

            try {
                regexp = purlToRegExp(purl);
            } catch (cause) {
                throw new Error(`Invalid pseudoUrl pattern '${purl}': ${(cause as Error).message}`, { cause });
            }

            return [{ matches: (url: string) => regexp.test(url), options }];
        }),
    ];

    if (patterns.length === 0) {
        return () => 'unchanged';
    }

    return (request) => {
        const matched = patterns.find(({ matches }) => matches(request.url));

        return matched ? { ...request, ...matched.options } : false;
    };
}
