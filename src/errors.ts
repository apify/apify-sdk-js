/** Why {@apilink Actor.getInput} could not produce the input. */
export type ActorInputErrorCode =
    /** No input record in the default key-value store, and locally no input file in the working directory either. */
    | 'NOT_FOUND'
    /** Both `<inputKey>` and `<inputKey>.json` exist in the working directory, so neither is picked. */
    | 'MULTIPLE_FILES'
    /** The secret fields of the input could not be decrypted; `cause` holds the underlying error. */
    | 'DECRYPTION_FAILED'
    /** A JSON input record or file does not parse; `cause` holds the parser error. */
    | 'PARSE_FAILED';

/**
 * Thrown by {@apilink Actor.getInput} when the Actor input cannot be produced. `code` says why, and
 * `cause` carries the underlying error where there is one. Anything else thrown by `getInput()`, such as
 * an Apify API error, is not an input problem and is passed through as is.
 *
 * ```js
 * try {
 *     input = await Actor.getInput();
 * } catch (error) {
 *     if (!(error instanceof ActorInputError) || error.code !== 'NOT_FOUND') throw error;
 *     input = {};
 * }
 * ```
 */
export class ActorInputError extends Error {
    override readonly name = 'ActorInputError';
    readonly code: ActorInputErrorCode;

    constructor(code: ActorInputErrorCode, message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.code = code;
    }
}
