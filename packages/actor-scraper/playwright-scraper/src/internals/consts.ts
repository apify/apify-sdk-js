import { Session, ProxyConfigurationOptions, GlobInput, RegExpInput, PseudoUrlInput, RequestOptions } from '@crawlee/core';
import { Dictionary } from '@crawlee/utils';

/**
 * Replicates the INPUT_SCHEMA with TypeScript types for quick reference
 * and IDE type check integration.
 */
export interface Input {
    startUrls: RequestOptions[];
    globs: GlobInput[];
    regexps: RegExpInput[];
    pseudoUrls: PseudoUrlInput[];
    excludes: GlobInput[];
    linkSelector?: string;
    keepUrlFragments: boolean;
    pageFunction: string;
    preNavigationHooks?: string;
    postNavigationHooks?: string;
    proxyConfiguration: ProxyConfigurationOptions;
    proxyRotation: ProxyRotation;
    sessionPoolName?: string;
    initialCookies: Parameters<Session['setCookies']>[0];
    launcher: 'chromium' | 'firefox' | 'webkit';
    useChrome: boolean;
    maxScrollHeightPixels: number;
    ignoreSslErrors: boolean;
    ignoreCorsAndCsp: boolean;
    closeCookieModals: boolean;
    downloadMedia: boolean;
    downloadCss: boolean;
    maxRequestRetries: number;
    maxPagesPerCrawl: number;
    maxResultsPerCrawl: number;
    maxCrawlingDepth: number;
    maxConcurrency: number;
    pageLoadTimeoutSecs: number;
    pageFunctionTimeoutSecs: number;
    waitUntil: 'networkidle' | 'load' | 'domcontentloaded';
    debugLog: boolean;
    browserLog: boolean;
    customData: Dictionary;
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;
    headless: boolean;
}

export const enum ProxyRotation {
    Recommended = 'RECOMMENDED',
    PerRequest = 'PER_REQUEST',
    UntilFailure = 'UNTIL_FAILURE',
}
