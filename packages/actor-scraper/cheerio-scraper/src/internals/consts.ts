import type {
    Dictionary,
    GlobInput,
    ProxyConfigurationOptions,
    PseudoUrlInput,
    RegExpInput,
    RequestOptions,
    Session,
} from '@crawlee/cheerio';

export const enum ProxyRotation {
    Recommended = 'RECOMMENDED',
    PerRequest = 'PER_REQUEST',
    UntilFailure = 'UNTIL_FAILURE',
}

/**
 * Replicates the INPUT_SCHEMA with JavaScript types for quick reference
 * and IDE type check integration.
 */
export interface Input {
    startUrls: RequestOptions[];
    globs: GlobInput[];
    regexps: RegExpInput[];
    excludes: GlobInput[];
    pseudoUrls: PseudoUrlInput[];
    keepUrlFragments: boolean;
    linkSelector?: string;
    pageFunction: string;
    preNavigationHooks?: string;
    postNavigationHooks?: string;
    proxyConfiguration: ProxyConfigurationOptions;
    proxyRotation: ProxyRotation;
    sessionPoolName?: string;
    initialCookies: Parameters<Session['setCookies']>[0];
    additionalMimeTypes: string[];
    suggestResponseEncoding?: string;
    forceResponseEncoding: boolean;
    ignoreSslErrors: boolean;
    maxRequestRetries: number;
    maxPagesPerCrawl: number;
    maxResultsPerCrawl: number;
    maxCrawlingDepth: number;
    maxConcurrency: number;
    pageLoadTimeoutSecs: number;
    pageFunctionTimeoutSecs: number;
    debugLog: boolean;
    customData: Dictionary;
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;
}
