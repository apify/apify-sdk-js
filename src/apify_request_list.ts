import { RequestList } from '@crawlee/core';
import type { Dictionary } from '@crawlee/types';
import { downloadListOfUrls, type DownloadListOfUrlsOptions } from '@crawlee/utils';
import { z } from 'zod';

import { parseArgument } from '@apify/validations';

const requestDetailsSchema = z.object({
    method: z.enum(['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']).optional(),
    payload: z.string().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    userData: z.record(z.string(), z.unknown()).optional(),
});

const requestListSourcesInputSchema = z.array(
    z.union([
        requestDetailsSchema.extend({ requestsFromUrl: z.string() }),
        requestDetailsSchema.extend({ url: z.string() }),
    ]),
);

export interface ApifyRequestListOpenOptions {
    /** An optional name for the request list, used for state persistence. */
    name?: string;
    /**
     * A list of request sources in the standard Apify format. Each entry must contain either a `url` key or
     * a `requestsFromUrl` key. If not provided or empty, an empty request list is returned.
     */
    requestListSourcesInput?: readonly Dictionary[] | null;
    /** HTTP client used to fetch remote URL lists (entries with `requestsFromUrl`). */
    httpClient?: DownloadListOfUrlsOptions['httpClient'];
}

/**
 * A request list that can be constructed from the standard Apify `requestListSources` Actor input format.
 *
 * It supports two kinds of entries:
 *
 * - **Direct URLs** - entries with a `url` key are converted to requests directly.
 * - **Remote URL lists** - entries with a `requestsFromUrl` key point to a remote resource (e.g. a plain-text
 *   file). The resource is fetched and all URLs found in the response body are extracted and converted to requests.
 *
 * Both kinds of entries can optionally specify `method`, `payload`, `headers`, and `userData` fields that will be
 * applied to every request created from that entry.
 *
 * Crawlee's `RequestList` cannot be subclassed, so unlike in the Python SDK, {@link ApifyRequestList.open} returns
 * a plain `RequestList`.
 *
 * ```ts
 * const input = await Actor.getInput<{ startUrls: Dictionary[] }>();
 * const requestList = await ApifyRequestList.open({ requestListSourcesInput: input.startUrls });
 * const crawler = new CheerioCrawler({ requestList, requestHandler });
 * ```
 */
export class ApifyRequestList {
    private constructor() {}

    /**
     * Creates a new `RequestList` from the standard Apify request list sources input. Remote URL lists are fetched
     * concurrently and the resulting requests keep the order of the input entries.
     */
    static async open({
        name,
        requestListSourcesInput,
        httpClient,
    }: ApifyRequestListOpenOptions = {}): Promise<RequestList> {
        const sources = parseArgument(
            requestListSourcesInput ?? [],
            requestListSourcesInputSchema,
            'requestListSourcesInput',
        );

        return RequestList.open(name ?? null, [], {
            // Only called when no requests were persisted under `name`, so a migrated run doesn't fetch the lists again.
            sourcesFunction: async () => {
                const requests = await Promise.all(
                    sources.map(async (source) => {
                        if (!('requestsFromUrl' in source)) {
                            return [source];
                        }

                        const { requestsFromUrl, userData, ...requestDetails } = source;
                        const urls = await downloadListOfUrls({ url: requestsFromUrl, httpClient });

                        // `Request` stores its internal state in the `userData` object it gets, so each one needs a copy.
                        return urls.map((url) => ({ ...requestDetails, url, userData: structuredClone(userData) }));
                    }),
                );

                return requests.flat();
            },
        });
    }
}
