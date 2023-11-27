import { APIFY_PROXY_VALUE_REGEX, APIFY_ENV_VARS } from '@apify/consts';
import type {
    ProxyConfigurationOptions as CoreProxyConfigurationOptions,
    ProxyInfo as CoreProxyInfo,
} from '@crawlee/core';
import {
    ProxyConfiguration as CoreProxyConfiguration,
} from '@crawlee/core';
import { gotScraping } from '@crawlee/utils';
import ow from 'ow';

import { Actor } from './actor';
import { Configuration } from './configuration';

// https://docs.apify.com/proxy/datacenter-proxy#username-parameters
const MAX_SESSION_ID_LENGTH = 50;
const CHECK_ACCESS_REQUEST_TIMEOUT_MILLIS = 4_000;
const CHECK_ACCESS_MAX_ATTEMPTS = 2;
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

export interface ProxyConfigurationOptions extends CoreProxyConfigurationOptions {
    /**
     * User's password for the proxy. By default, it is taken from the `APIFY_PROXY_PASSWORD`
     * environment variable, which is automatically set by the system when running the actors.
     */
    password?: string;

    /**
     * An array of proxy groups to be used by the [Apify Proxy](https://docs.apify.com/proxy).
     * If not provided, the proxy will select the groups automatically.
     */
    groups?: string[];

    /**
     * If set and relevant proxies are available in your Apify account, all proxied requests will
     * use IP addresses that are geolocated to the specified country. For example `GB` for IPs
     * from Great Britain. Note that online services often have their own rules for handling
     * geolocation and thus the country selection is a best attempt at geolocation, rather than
     * a guaranteed hit. This parameter is optional, by default, each proxied request is assigned
     * an IP address from a random country. The country code needs to be a two letter ISO country code. See the
     * [full list of available country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements).
     * This parameter is optional, by default, the proxy uses all available proxy servers from all countries.
     * on the Apify cloud, or when using the [Apify CLI](https://github.com/apify/apify-cli).
     */
    countryCode?: string;

    /**
     * Same option as `groups` which can be used to
     * configurate the proxy by UI input schema. You should use the `groups` option in your crawler code.
     */
    apifyProxyGroups?: string[];

    /**
     * Same option as `countryCode` which can be used to
     * configurate the proxy by UI input schema. You should use the `countryCode` option in your crawler code.
     */
    apifyProxyCountry?: string;
}

/**
 * The main purpose of the ProxyInfo object is to provide information
 * about the current proxy connection used by the crawler for the request.
 * Outside of crawlers, you can get this object by calling {@apilink ProxyConfiguration.newProxyInfo}.
 *
 * **Example usage:**
 *
 * ```javascript
 *
 * const proxyConfiguration = await Actor.createProxyConfiguration({
 *   groups: ['GROUP1', 'GROUP2'] // List of Apify Proxy groups
 *   countryCode: 'US',
 * });
 *
 * // Getting proxyInfo object by calling class method directly
 * const proxyInfo = proxyConfiguration.newProxyInfo();
 *
 * // In crawler
 * const crawler = new CheerioCrawler({
 *   // ...
 *   proxyConfiguration,
 *   requestHandler({ proxyInfo }) {
 *       // Getting used proxy URL
 *       const proxyUrl = proxyInfo.url;
 *
 *       // Getting ID of used Session
 *       const sessionIdentifier = proxyInfo.sessionId;
 *   }
 * })
 *
 * ```
 */
export interface ProxyInfo extends CoreProxyInfo {
    /**
     * An array of proxy groups to be used by the [Apify Proxy](https://docs.apify.com/proxy).
     * If not provided, the proxy will select the groups automatically.
     */
    groups: string[];

    /**
     * If set and relevant proxies are available in your Apify account, all proxied requests will
     * use IP addresses that are geolocated to the specified country. For example `GB` for IPs
     * from Great Britain. Note that online services often have their own rules for handling
     * geolocation and thus the country selection is a best attempt at geolocation, rather than
     * a guaranteed hit. This parameter is optional, by default, each proxied request is assigned
     * an IP address from a random country. The country code needs to be a two letter ISO country code. See the
     * [full list of available country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements).
     * This parameter is optional, by default, the proxy uses all available proxy servers from all countries.
     */
    countryCode?: string;

    /**
     * User's password for the proxy. By default, it is taken from the `APIFY_PROXY_PASSWORD`
     * environment variable, which is automatically set by the system when running the actors
     * on the Apify cloud, or when using the [Apify CLI](https://github.com/apify/apify-cli).
     */
    password: string;
}

/**
 * Configures connection to a proxy server with the provided options. Proxy servers are used to prevent target websites from blocking
 * your crawlers based on IP address rate limits or blacklists. Setting proxy configuration in your crawlers automatically configures
 * them to use the selected proxies for all connections. You can get information about the currently used proxy by inspecting
 * the {@apilink ProxyInfo} property in your crawler's page function. There, you can inspect the proxy's URL and other attributes.
 *
 * The proxy servers are managed by [Apify Proxy](https://docs.apify.com/proxy). To be able to use Apify Proxy,
 * you need an Apify account and access to the selected proxies. If you provide no configuration option,
 * the proxies will be managed automatically using a smart algorithm.
 *
 * If you want to use your own proxies, use the {@apilink ProxyConfigurationOptions.proxyUrls} option. Your list of proxy URLs will
 * be rotated by the configuration if this option is provided.
 *
 * **Example usage:**
 *
 * ```javascript
 *
 * const proxyConfiguration = await Actor.createProxyConfiguration({
 *   groups: ['GROUP1', 'GROUP2'] // List of Apify Proxy groups
 *   countryCode: 'US',
 * });
 *
 * const crawler = new CheerioCrawler({
 *   // ...
 *   proxyConfiguration,
 *   requestHandler({ proxyInfo }) {
 *      const usedProxyUrl = proxyInfo.url; // Getting the proxy URL
 *   }
 * })
 *
 * ```
 * @category Scaling
 */
export class ProxyConfiguration extends CoreProxyConfiguration {
    private groups: string[];
    private countryCode?: string;
    private password?: string;
    private hostname: string;
    private port?: number;
    private usesApifyProxy?: boolean;

    /**
     * @internal
     */
    constructor(options: ProxyConfigurationOptions = {}, readonly config = Configuration.getGlobalConfig()) {
        const { proxyUrls, newUrlFunction, ...rest } = options;
        super({ proxyUrls, newUrlFunction, ['validateRequired' as string]: false });
        ow(rest, ow.object.exactShape({
            groups: ow.optional.array.ofType(ow.string.matches(APIFY_PROXY_VALUE_REGEX)),
            apifyProxyGroups: ow.optional.array.ofType(ow.string.matches(APIFY_PROXY_VALUE_REGEX)),
            countryCode: ow.optional.string.matches(COUNTRY_CODE_REGEX),
            apifyProxyCountry: ow.optional.string.matches(COUNTRY_CODE_REGEX),
            password: ow.optional.string,
        }));

        const {
            groups = [],
            apifyProxyGroups = [],
            countryCode,
            apifyProxyCountry,
            password = config.get('proxyPassword'),
        } = options;

        const groupsToUse = groups.length ? groups : apifyProxyGroups;
        const countryCodeToUse = countryCode || apifyProxyCountry;
        const hostname = config.get('proxyHostname');
        const port = config.get('proxyPort');

        // Validation
        if (((proxyUrls || newUrlFunction) && ((groupsToUse.length) || countryCodeToUse))) {
            this._throwCannotCombineCustomWithApify();
        }
        if (proxyUrls && newUrlFunction) this._throwCannotCombineCustomMethods();

        this.groups = groupsToUse;
        this.countryCode = countryCodeToUse;
        this.password = password;
        this.hostname = hostname!;
        this.port = port;
        this.usesApifyProxy = !this.proxyUrls && !this.newUrlFunction;

        if (proxyUrls && proxyUrls.some((url) => url.includes('apify.com'))) {
            this.log.warning(
                'Some Apify proxy features may work incorrectly. Please consider setting up Apify properties instead of `proxyUrls`.\n'
                + 'See https://sdk.apify.com/docs/guides/proxy-management#apify-proxy-configuration',
            );
        }
    }

    /**
     * Loads proxy password if token is provided and checks access to Apify Proxy and provided proxy groups
     * if Apify Proxy configuration is used.
     * Also checks if country has access to Apify Proxy groups if the country code is provided.
     *
     * You should use the {@apilink createProxyConfiguration} function to create a pre-initialized
     * `ProxyConfiguration` instance instead of calling this manually.
     */
    async initialize(): Promise<void> {
        if (this.usesApifyProxy) {
            await this._setPasswordIfToken();
            await this._checkAccess();
        }
    }

    /**
     * This function creates a new {@apilink ProxyInfo} info object.
     * It is used by CheerioCrawler and PuppeteerCrawler to generate proxy URLs and also to allow the user to inspect
     * the currently used proxy via the requestHandler parameter `proxyInfo`.
     * Use it if you want to work with a rich representation of a proxy URL.
     * If you need the URL string only, use {@apilink ProxyConfiguration.newUrl}.
     * @param [sessionId]
     *  Represents the identifier of user {@apilink Session} that can be managed by the {@apilink SessionPool} or
     *  you can use the Apify Proxy [Session](https://docs.apify.com/proxy#sessions) identifier.
     *  When the provided sessionId is a number, it's converted to a string. Property sessionId of
     *  {@apilink ProxyInfo} is always returned as a type string.
     *
     *  All the HTTP requests going through the proxy with the same session identifier
     *  will use the same target proxy server (i.e. the same IP address).
     *  The identifier must not be longer than 50 characters and include only the following: `0-9`, `a-z`, `A-Z`, `"."`, `"_"` and `"~"`.
     * @return Represents information about used proxy and its configuration.
     */
    override async newProxyInfo(sessionId?: string | number): Promise<ProxyInfo> {
        if (typeof sessionId === 'number') sessionId = `${sessionId}`;
        ow(sessionId, ow.optional.string.maxLength(MAX_SESSION_ID_LENGTH).matches(APIFY_PROXY_VALUE_REGEX));
        const url = await this.newUrl(sessionId);

        const { groups, countryCode, password, port, hostname } = (this.usesApifyProxy ? this : new URL(url)) as ProxyConfiguration;

        return {
            sessionId,
            url,
            groups,
            countryCode,
            password: password ?? '',
            hostname,
            port: port!,
        };
    }

    /**
     * Returns a new proxy URL based on provided configuration options and the `sessionId` parameter.
     * @param [sessionId]
     *  Represents the identifier of user {@apilink Session} that can be managed by the {@apilink SessionPool} or
     *  you can use the Apify Proxy [Session](https://docs.apify.com/proxy#sessions) identifier.
     *  When the provided sessionId is a number, it's converted to a string.
     *
     *  All the HTTP requests going through the proxy with the same session identifier
     *  will use the same target proxy server (i.e. the same IP address).
     *  The identifier must not be longer than 50 characters and include only the following: `0-9`, `a-z`, `A-Z`, `"."`, `"_"` and `"~"`.
     * @return A string with a proxy URL, including authentication credentials and port number.
     *  For example, `http://bob:password123@proxy.example.com:8000`
     */
    override async newUrl(sessionId?: string | number): Promise<string> {
        if (typeof sessionId === 'number') sessionId = `${sessionId}`;
        ow(sessionId, ow.optional.string.maxLength(MAX_SESSION_ID_LENGTH).matches(APIFY_PROXY_VALUE_REGEX));
        if (this.newUrlFunction) {
            return this._callNewUrlFunction(sessionId)!;
        }
        if (this.proxyUrls) {
            return this._handleCustomUrl(sessionId);
        }
        const username = this._getUsername(sessionId);
        const { password, hostname, port } = this;

        return `http://${username}:${password}@${hostname}:${port}`;
    }

    /**
     * Returns proxy username.
     */
    protected _getUsername(sessionId?: string): string {
        let username;
        const { groups, countryCode } = this;
        const parts: string[] = [];

        if (groups && groups.length) {
            parts.push(`groups-${groups.join('+')}`);
        }
        if (sessionId) {
            parts.push(`session-${sessionId}`);
        }
        if (countryCode) {
            parts.push(`country-${countryCode}`);
        }

        username = parts.join(',');

        if (parts.length === 0) username = 'auto';

        return username;
    }

    /**
     * Checks if Apify Token is provided in env and gets the password via API and sets it to env
     */
    protected async _setPasswordIfToken(): Promise<void> {
        const token = this.config.get('token');

        if (token) {
            const { proxy } = await Actor.apifyClient.user().get();
            const { password } = proxy!;

            if (this.password) {
                if (this.password !== password) {
                    this.log.warning('The Apify Proxy password you provided belongs to'
                    + ' a different user than the Apify token you are using. Are you sure this is correct?');
                }
            } else {
                this.password = password;
            }
        }

        if (!this.password) {
            throw new Error(`Apify Proxy password must be provided using options.password or the "${APIFY_ENV_VARS.PROXY_PASSWORD}" environment variable. `
                + `If you add the "${APIFY_ENV_VARS.TOKEN}" environment variable, the password will be automatically inferred.`);
        }
    }

    /**
     * Checks whether the user has access to the proxies specified in the provided ProxyConfigurationOptions.
     * If the check can not be made, it only prints a warning and allows the program to continue. This is to
     * prevent program crashes caused by short downtimes of Proxy.
     */
    protected async _checkAccess(): Promise<void> {
        const status = await this._fetchStatus();
        if (status) {
            const { connected, connectionError, isManInTheMiddle } = status;
            this.isManInTheMiddle = isManInTheMiddle;

            if (!connected) this._throwApifyProxyConnectionError(connectionError);
        } else {
            this.log.warning('Apify Proxy access check timed out. Watch out for errors with status code 407. '
                + 'If you see some, it most likely means you don\'t have access to either all or some of the proxies you\'re trying to use.');
        }
    }

    /**
     * Apify Proxy can be down for a second or a minute, but this should not crash processes.
     */
    protected async _fetchStatus(): Promise<{ connected: boolean; connectionError: string; isManInTheMiddle: boolean } | undefined> {
        const proxyStatusUrl = this.config.get('proxyStatusUrl', 'http://proxy.apify.com');
        const requestOpts = {
            url: `${proxyStatusUrl}/?format=json`,
            proxyUrl: await this.newUrl(),
            timeout: { request: CHECK_ACCESS_REQUEST_TIMEOUT_MILLIS },
            responseType: 'json',
        } as const;

        for (let attempt = 1; attempt <= CHECK_ACCESS_MAX_ATTEMPTS; attempt++) {
            try {
                const response = await gotScraping<{ connected: boolean; connectionError: string; isManInTheMiddle: boolean }>(requestOpts);
                return response.body;
            } catch {
                // retry connection errors
            }
        }

        return undefined;
    }

    /**
     * Throws Apify Proxy is not connected
     * @internal
     */
    protected _throwApifyProxyConnectionError(errorMessage: string) {
        throw new Error(errorMessage);
    }

    /**
     * Throws cannot combine custom proxies with Apify Proxy
     * @internal
     */
    protected _throwCannotCombineCustomWithApify() {
        throw new Error('Cannot combine custom proxies with Apify Proxy!'
            + 'It is not allowed to set "options.proxyUrls" or "options.newUrlFunction" combined with '
            + '"options.groups" or "options.apifyProxyGroups" and "options.countryCode" or "options.apifyProxyCountry".');
    }
}
