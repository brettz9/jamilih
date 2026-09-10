// Demonstrates (and exercises) the `JamilihDialectProperties` augmentation
// point: registering a templating dialect's `$`-prefixed properties so they
// type-check on a leading Jamilih object and as bare `$`-only children.
// An unregistered `$`-key stays a type error.
declare global {
  interface JamilihDialectProperties {
    $if?: unknown;
    $forEach?: unknown;
  }
}

export {};
