/**
 * Structural + policy validator for Jamilih input.
 *
 * Window-free and dependency-free: it re-implements the `jml()` argument
 * grammar as a non-mutating recursive checker and never calls `jml()` or
 * touches a DOM. Its only import is the shared {@link possibleOptions} list.
 */
export type ValidateJamilihFormat = "javascript" | "json";
export type ValidateJamilihOptions = {
    /**
     * Default `"javascript"`. `"json"`
     * additionally requires every value to be losslessly JSON round-trippable.
     */
    format?: ValidateJamilihFormat;
    /**
     * Default `true`. When `false`, an
     * `innerHTML` attribute key is rejected.
     */
    allowInnerHTML?: boolean;
    /**
     * Default `true`; forced `false` when
     * `format` is `"json"`. When effectively `false`, raw DOM nodes are rejected.
     */
    allowDOM?: boolean;
    /**
     * Whitelist of extensible
     * `$`-prefixed properties accepted wherever `$` magic is read. Sentinels:
     * `"default"` expands to the builtin option keys, `"any"` / `"*"` permits
     * any unknown `$`-key. Omitting the option is equivalent to `["default"]`.
     */
    allowableOptions?: string[];
    /**
     * Default `false`. When `true`, stop at the
     * first error.
     */
    failFast?: boolean;
};
export type JamilihValidationError = {
    /**
     * Stable enum, e.g. `"BAD_CHILD"`.
     */
    code: string;
    /**
     * Human-readable description.
     */
    message: string;
    /**
     * JSON-pointer-ish location, e.g. `"/2/0/1"`.
     */
    path: string;
};
export type JamilihValidationResult = {
    valid: boolean;
    errors: JamilihValidationError[];
};
/**
 * Validate a single-array Jamilih structure against structural and policy
 * rules.
 * @param {unknown} structure The JSON-serializable Jamilih array form.
 * @param {ValidateJamilihOptions} [options]
 * @throws {TypeError} If `format` or `allowableOptions` is invalid.
 * @returns {JamilihValidationResult}
 */
export declare const validateJamilih: (structure: unknown, options?: ValidateJamilihOptions) => JamilihValidationResult;
/**
 * Boolean predicate wrapper around {@link validateJamilih}.
 * @param {unknown} structure
 * @param {ValidateJamilihOptions} [options]
 * @returns {boolean}
 */
export declare const isValidJamilih: (structure: unknown, options?: ValidateJamilihOptions) => boolean;
//# sourceMappingURL=validateJamilih.d.ts.map