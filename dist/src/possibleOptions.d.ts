/**
 * The recognized keys on the optional leading options object passed to `jml()`.
 *
 * An object in first-argument position is only treated as an options object
 * when it carries at least one of these keys.
 *
 * `$mode` (reserved for a future SVG/XML mode) and `$state` (the internal
 * traversal marker) are deliberately absent: they are reserved names that
 * `jml()` rejects when author-supplied. Templating dialects layered on Jamilih
 * may use any other `$`-prefixed key freely; `validateJamilih`'s
 * `allowableOptions` governs validation of those.
 * @type {string[]}
 */
export declare const possibleOptions: string[];
//# sourceMappingURL=possibleOptions.d.ts.map