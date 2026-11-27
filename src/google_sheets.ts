import type { Dictionary } from '@crawlee/types';

// Links published to the web (`/spreadsheets/d/e/<id>/pub?output=csv`) and links that already point at an export
// (`/gviz/...`, `/export...`) are downloadable as they are, so they're left alone.
const GOOGLE_SHEETS_URL_REGEX =
    /^(https:\/\/docs\.google\.com\/spreadsheets\/d\/(?!e\/)(?:\w|-)+)(\/(?:gviz|export)\b)?/;

/**
 * Turns a Google Sheets sharing link into the link of its CSV export, other URLs are returned unchanged.
 * @internal
 */
export function toGoogleSheetsCsvUrl(url: string): string {
    const match = GOOGLE_SHEETS_URL_REGEX.exec(url);

    return match && !match[2] ? `${match[1]}/gviz/tq?tqx=out:csv` : url;
}

/**
 * Replaces Google Sheets sharing links in the `requestsFromUrl` entries of the input's array fields (as produced by
 * the "Link remote text file" option of the `requestListSources` editor) with the links of their CSV exports.
 * @internal
 */
export function fixGoogleSheetsUrls<T extends Dictionary>(input: T): T {
    return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
            key,
            Array.isArray(value)
                ? value.map((item) =>
                      typeof item?.requestsFromUrl === 'string'
                          ? { ...item, requestsFromUrl: toGoogleSheetsCsvUrl(item.requestsFromUrl) }
                          : item,
                  )
                : value,
        ]),
    ) as T;
}
