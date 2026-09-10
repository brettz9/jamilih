declare global {
  /**
   * Registry of the `$`-prefixed properties a templating dialect layered on
   * Jamilih adds. Base Jamilih rejects, at the type level, any `$`-key it does
   * not itself define; a dialect (or a consuming project) makes its own keys
   * type-valid on a leading Jamilih object — and as a bare `$`-only child — by
   * augmenting this interface:
   *
   * ```ts
   * declare global {
   *   interface JamilihDialectProperties {
   *     $if?: unknown;
   *     $forEach?: unknown;
   *   }
   * }
   * ```
   *
   * The values are `unknown` here on purpose: base Jamilih never reads them, so
   * the dialect owns their shape.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation point
  interface JamilihDialectProperties {}
}

export {};
