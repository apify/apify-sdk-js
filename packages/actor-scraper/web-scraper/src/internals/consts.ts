import type { Dictionary, GlobInput, ProxyConfigurationOptions, PseudoUrlInput, RegExpInput, RequestOptions, Session } from '@crawlee/puppeteer';
import type { PuppeteerLifeCycleEvent } from 'puppeteer';

/**
 * Port where the remote debugging interface in Chrome
 * should be started.
 */
export const CHROME_DEBUGGER_PORT = 9222;

export const enum RunMode {
    Production = 'PRODUCTION',
    Development = 'DEVELOPMENT',
}

export const enum ProxyRotation {
    Recommended = 'RECOMMENDED',
    PerRequest = 'PER_REQUEST',
    UntilFailure = 'UNTIL_FAILURE',
}

export const enum BreakpointLocation {
    None = 'NONE',
    BeforeGoto = 'BEFORE_GOTO',
    BeforePageFunction = 'BEFORE_PAGE_FUNCTION',
    AfterPageFunction = 'AFTER_PAGE_FUNCTION',
}

declare global {
    interface Window {
        [K: string]: any;
    }
    // eslint-disable-next-line vars-on-top, no-var
    var window: Window & typeof globalThis;
    // eslint-disable-next-line vars-on-top, no-var
    var document: Document;

}

/**
 * Replicates the INPUT_SCHEMA with TypeScript types for quick reference
 * and IDE type check integration.
 */
export interface Input {
    startUrls: RequestOptions[];
    pageFunction: string;
    runMode: RunMode;
    keepUrlFragments: boolean;
    linkSelector?: string;
    globs: GlobInput[];
    regexps: RegExpInput[];
    pseudoUrls: PseudoUrlInput[];
    excludes: GlobInput[];
    preNavigationHooks?: string;
    postNavigationHooks?: string;
    injectJQuery: boolean;
    proxyConfiguration: ProxyConfigurationOptions;
    proxyRotation: ProxyRotation;
    sessionPoolName?: string;
    initialCookies: Parameters<Session['setCookies']>[0];
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
    waitUntil: PuppeteerLifeCycleEvent[];
    breakpointLocation: BreakpointLocation;
    debugLog: boolean;
    browserLog: boolean;
    customData: Dictionary;
    datasetName?: string;
    keyValueStoreName?: string;
    requestQueueName?: string;
    headless: boolean;
}
