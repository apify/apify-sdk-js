import type { ProxyConfigurationOptions as CoreProxyConfigurationOptions } from '@crawlee/core';
import { ProxyConfiguration as CoreProxyConfiguration } from '@crawlee/core';
import type { ProxyInfo as CoreProxyInfo } from '@crawlee/types';
import { gotScraping } from 'got-scraping';
import ow from 'ow';

import { APIFY_ENV_VARS, APIFY_PROXY_VALUE_REGEX } from '@apify/consts';
import { cryptoRandomObjectId } from '@apify/utilities';

import { Actor } from './actor.js';
import { Configuration } from './configuration.js';

const CHECK_ACCESS_REQUEST_TIMEOUT_MILLIS = 4_000;
const CHECK_ACCESS_MAX_ATTEMPTS = 2;
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

// Apify Proxy session identifier embedded in the proxy username — opaque to
// users; a fresh one is minted for every URL the SDK hands out so that the
// returned proxy URLs are independent.
const SESSION_ID_LENGTH = 12;

type NewUrlOptions = Parameters<CoreProxyConfiguration['newProxyInfo']>[0];

export interface ProxyConfigurationOptions
    extends CoreProxyConfigurationOptions {
    /**
     * User's password for the proxy. By default, it is taken from the `APIFY_PROXY_PASSWORD`
     * environment variable, which is automatically set by the system when running the Actors.
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
     */
    countryCode?: string;

    /**
     * User's password for the proxy. By default, it is taken from the `APIFY_PROXY_PASSWORD`
     * environment variable, which is automatically set by the system when running the Actors
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
    constructor(
        options: ProxyConfigurationOptions = {},
        readonly config = Configuration.getGlobalConfig(),
    ) {
        const { proxyUrls, newUrlFunction, ...rest } = options;
        super({
            proxyUrls,
            newUrlFunction,
            ['validateRequired' as string]: false,
        });
        ow(
            rest,
            ow.object.exactShape({
                groups: ow.optional.array.ofType(
                    ow.string.matches(APIFY_PROXY_VALUE_REGEX),
                ),
                apifyProxyGroups: ow.optional.array.ofType(
                    ow.string.matches(APIFY_PROXY_VALUE_REGEX),
                ),
                countryCode: ow.optional.string.matches(COUNTRY_CODE_REGEX),
                apifyProxyCountry:
                    ow.optional.string.matches(COUNTRY_CODE_REGEX),
                password: ow.optional.string,
            }),
        );

        const {
            groups = [],
            apifyProxyGroups = [],
            countryCode,
            apifyProxyCountry,
            password = config.proxyPassword,
        } = options;

        const groupsToUse = groups.length ? groups : apifyProxyGroups;
        const countryCodeToUse = countryCode || apifyProxyCountry;
        const hostname = config.proxyHostname;
        const port = config.proxyPort;

        // Validation
        if (
            (proxyUrls || newUrlFunction) &&
            (groupsToUse.length || countryCodeToUse)
        ) {
            this._throwCannotCombineCustomWithApify();
        }
        if (proxyUrls && newUrlFunction)
            this._throwCannotCombineCustomMethods();

        this.groups = groupsToUse;
        this.countryCode = countryCodeToUse;
        this.password = password;
        this.hostname = hostname!;
        this.port = port;
        this.usesApifyProxy = !this.proxyUrls && !this.newUrlFunction;

        if (proxyUrls && proxyUrls.some((url) => url?.includes('apify.com'))) {
            this.log.warning(
                'Some Apify proxy features may work incorrectly. Please consider setting up Apify properties instead of `proxyUrls`.\n' +
                    'See https://sdk.apify.com/docs/guides/proxy-management#apify-proxy-configuration',
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
    async initialize(): Promise<boolean> {
        if (this.usesApifyProxy) {
            if (!this.password) {
                await this._setPasswordIfToken();
            }

            if (!this.password) {
                if (Actor.isAtHome()) {
                    throw new Error(
                        `Apify Proxy password must be provided using options.password or the "${APIFY_ENV_VARS.PROXY_PASSWORD}" environment variable. ` +
                            `You can also provide your Apify token via the "${APIFY_ENV_VARS.TOKEN}" environment variable, ` +
                            `so that the SDK can fetch the proxy password from Apify API, when ${APIFY_ENV_VARS.PROXY_PASSWORD} is not defined`,
                    );
                } else {
                    this.log.warning(
                        `No proxy password or token detected, running without proxy. To use Apify Proxy locally, ` +
                            `provide options.password or "${APIFY_ENV_VARS.PROXY_PASSWORD}" environment variable. ` +
                            `You can also provide your Apify token via the "${APIFY_ENV_VARS.TOKEN}" environment variable, ` +
                            `so that the SDK can fetch the proxy password from Apify API, when ${APIFY_ENV_VARS.PROXY_PASSWORD} is not defined`,
                    );
                }
            }

            return this._checkAccess();
        }

        return true;
    }

    /**
     * Returns a new {@apilink ProxyInfo} object with a fresh proxy URL. Each call mints an
     * independent URL; for Apify Proxy a random session id is embedded so consecutive
     * calls resolve to different IPs.
     */
    override async newProxyInfo(
        options?: NewUrlOptions,
    ): Promise<ProxyInfo | undefined> {
        const url = await this.newUrl(options);
        if (!url) return undefined;

        const parsed = new URL(url);
        const result: ProxyInfo = {
            url,
            username: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            hostname: parsed.hostname,
            port: parsed.port,
        };
        if (this.usesApifyProxy) {
            result.groups = this.groups;
            if (this.countryCode !== undefined)
                result.countryCode = this.countryCode;
        }
        return result;
    }

    /**
     * Returns a new proxy URL. For Apify Proxy, each call generates a URL with a fresh
     * random session id, so consecutive calls return independent URLs. For custom
     * `proxyUrls`, the URLs are rotated round-robin.
     */
    override async newUrl(
        options?: NewUrlOptions,
    ): Promise<string | undefined> {
        if (this.newUrlFunction || this.proxyUrls) {
            return super.newUrl(options);
        }
        return this.composeDefaultUrl(cryptoRandomObjectId(SESSION_ID_LENGTH));
    }

    /**
     * Returns proxy username.
     */
    protected _getUsername(sessionId: string): string {
        const { groups, countryCode } = this;
        const parts: string[] = [];

        if (groups && groups.length) {
            parts.push(`groups-${groups.join('+')}`);
        }
        parts.push(`session-${sessionId}`);
        if (countryCode) {
            parts.push(`country-${countryCode}`);
        }

        return parts.join(',');
    }

    protected composeDefaultUrl(sessionId: string): string {
        const username = this._getUsername(sessionId);
        const url = new URL(`http://${this.hostname}:${this.port}`);
        url.username = `${username}`;
        url.password = `${this.password}`;
        const urlString = url.toString();

        return urlString.substring(0, urlString.length - 1);
    }

    /**
     * Fetch & set the proxy password from Apify API if an Apify token is provided.
     */
    // TODO: Make this private
    protected async _setPasswordIfToken(): Promise<void> {
        const { token } = this.config;

        if (!token) return;
        try {
            const user = await Actor.apifyClient.user().get();
            this.password = user.proxy?.password;
        } catch (error) {
            if (Actor.isAtHome()) {
                throw error;
            } else {
                this.log.warning(`Failed to fetch user data using token`, {
                    error,
                });
            }
        }
    }

    /**
     * Checks whether the user has access to the proxies specified in the provided ProxyConfigurationOptions.
     * If the check can not be made, it only prints a warning and allows the program to continue. This is to
     * prevent program crashes caused by short downtimes of Proxy.
     */
    protected async _checkAccess(): Promise<boolean> {
        const status = await this._fetchStatus();

        if (!status) {
            this.log.warning(
                'Apify Proxy access check timed out. Watch out for errors with status code 407. ' +
                    "If you see some, it most likely means you don't have access to either all or some of the proxies you're trying to use.",
            );
            return true;
        }

        const { connected, connectionError, isManInTheMiddle } = status;
        this.isManInTheMiddle = isManInTheMiddle;

        if (connected) {
            return true;
        }

        // Throw only on the platform, locally we just print a warning and run requests without the proxy.
        // This is because the user might not have set up things correctly yet.
        // It still fails on the platform, where we don't want to allow this behavior.
        if (Actor.isAtHome()) {
            throw new Error(connectionError);
        }

        this.log.warning(connectionError);
        return false;
    }

    /**
     * Apify Proxy can be down for a second or a minute, but this should not crash processes.
     */
    protected async _fetchStatus(): Promise<
        | {
              connected: boolean;
              connectionError: string;
              isManInTheMiddle: boolean;
          }
        | undefined
    > {
        const { proxyStatusUrl } = this.config;
        const requestOpts = {
            url: `${proxyStatusUrl}/?format=json`,
            proxyUrl: await this.newUrl(),
            timeout: { request: CHECK_ACCESS_REQUEST_TIMEOUT_MILLIS },
            responseType: 'json',
        } as const;

        for (let attempt = 1; attempt <= CHECK_ACCESS_MAX_ATTEMPTS; attempt++) {
            try {
                const response = await gotScraping<{
                    connected: boolean;
                    connectionError: string;
                    isManInTheMiddle: boolean;
                }>(requestOpts);
                return response.body;
            } catch {
                // retry connection errors
            }
        }

        return undefined;
    }

    /**
     * Throws cannot combine custom proxies with Apify Proxy
     * @internal
     */
    protected _throwCannotCombineCustomWithApify() {
        throw new Error(
            'Cannot combine custom proxies with Apify Proxy! ' +
                'It is not allowed to set "options.proxyUrls" or "options.newUrlFunction" combined with ' +
                '"options.groups" or "options.apifyProxyGroups" and "options.countryCode" or "options.apifyProxyCountry".',
        );
    }
}
