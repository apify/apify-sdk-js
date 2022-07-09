/**
 * Represents the key under which internal metadata
 * such as crawling depth are stored on the Request object.
 */
export const META_KEY = '__scraper-metadata__';

/**
 * The default resolution to be used by the browser instances.
 */
export const DEFAULT_VIEWPORT = {
    width: 1920,
    height: 1080,
} as const;

/**
 * Error message produced by Browser on failed resource load. This is used to
 * suppress logging of this message when blocking resources.
 */
export const RESOURCE_LOAD_ERROR_MESSAGE = 'Failed to load resource: net::ERR_FAILED';

/**
 * Name of file that holds Page Function in local development.
 */
export const PAGE_FUNCTION_FILENAME = 'page_function.js';

/**
 * Just a requestHandler timeout value for when DevTools are used
 * so the user has time to browse the DevTools console.
 */
export const DEVTOOLS_TIMEOUT_SECS = 3600;

/**
 * Represents the keys under which saveSnapshot() will
 * persist to key value store and the throttling timeout.
 */
export const SNAPSHOT = {
    KEYS: {
        BODY: 'SNAPSHOT-BODY',
        SCREENSHOT: 'SNAPSHOT-SCREENSHOT',
    },
    TIMEOUT_SECS: 2,
} as const;

/**
 * Enum values used in the Proxy Rotation (proxyRotation) input option.
 * Make sure those are always in sync!
 */
export const PROXY_ROTATION_NAMES = {
    UNTIL_FAILURE: 'UNTIL_FAILURE',
    PER_REQUEST: 'PER_REQUEST',
    RECOMMENDED: 'RECOMMENDED',
} as const;

/**
 * Max usage counts of a Session per different available proxy rotations.
 */
export const SESSION_MAX_USAGE_COUNTS = {
    [PROXY_ROTATION_NAMES.UNTIL_FAILURE]: 1000,
    [PROXY_ROTATION_NAMES.PER_REQUEST]: 1,
    [PROXY_ROTATION_NAMES.RECOMMENDED]: undefined as never,
} as const;
