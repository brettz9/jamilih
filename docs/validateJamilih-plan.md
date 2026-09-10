# Plan: `validateJamilih(structure, options)`

## 1. Summary

A new **non-mutating, DOM-free structural validator** for Jamilih input. It
re-implements the `jml()` argument grammar as a recursive checker that never
calls `jml()` and never needs a `window`/`document`.

```js
validateJamilih(
  jamilihArray,                // single JSON-serializable array, e.g. ['div', {}, [ ['span'] ]]
  {
    format: 'javascript',      // 'javascript' | 'json'
    allowInnerHTML: true,      // allow `innerHTML` attribute key
    allowDOM: true,            // allow raw DOM node as parent or child (forced false when format==='json')
    allowableOptions: ['$plugins', '$Map'], // whitelist of extensible `$`-props at EVERY magic position (leading opts object, attributes objects, object-headed child arrays); accepts 'default' (= the builtins only) and 'any' (wildcard) sentinels
    failFast: false           // stop at the first error instead of collecting all
  }
) => { valid: boolean, errors: JamilihValidationError[] }
```

```
JamilihValidationError = {
  code: string,     // stable enum, see §4
  message: string,  // human-readable
  path: string      // JSON-pointer-ish, e.g. "/2/0/1" or "/0/$Map"
}
```

Design decisions already settled:

- Name is `validateJamilih` (not `isValidJamilih`).
- Returns `{ valid, errors }`.
- Takes the **single-array** form of the structure plus an options object.
- Lives in its **own module with its own dist entry point**
  (`dist/validateJamilih.js` / `.mjs`), so it can be imported without pulling
  in `jml.js` or the `jml-jsdom` entry's load-time `new JSDOM('')` /
  `setWindow` side effect &mdash; the validator is window-free. Also
  re-exported from the barrels for discoverability.

### `$`-property namespace (shared)

The `$`-prefixed namespace stays **shared** between Jamilih and any templating
dialect built on it &mdash; base Jamilih just ignores `$`-keys it does not
recognize (see §6). The **one** targeted rename in this change: the leading
**options** key `$map` becomes **`$Map`** (breaking), because `$map` is too
useful a name to leave occupied for a dialect-level iteration/template helper.
Nothing else is renamed, and there is no case-based reservation &mdash; a
dialect may use `$if`, `$forEach`, `$Foo`, etc. freely. `$_`-prefixed keys
remain plugins.

## 2. Two validation layers

### Layer 1 — structural well-formedness (always on, independent of options)

The structure is something `jml()` could consume without throwing. Mirrors
`jml()`'s arg loop, `_checkAtts`, and the children (`case 'array'`) block:

- Root must be a non-empty `Array`.
- Optional leading options object, detected exactly as `jml()` does:
  `typeof === 'object'`, not array/DOM, and
  `Object.keys(obj).some((k) => possibleOptions.includes(k))`.
- First real arg: element-name string, first-arg special string
  (`!`, `&`, `#`, `#x`, `?`, `![`, `''`), first-arg special object
  (`{'#'}`, `{$text}`, `{$document}`, `{$DOCTYPE}`, `{$attribute}`,
  `$_`-plugin), or DOM node.
- Special strings consume the right number of following string args
  (`&` / `#` / `#x` / `!` &rarr; 1; `?` &rarr; 2).
- Element name &rarr; optional attributes object &rarr; optional child arrays
  &rarr; optional trailing sibling strings/arrays &rarr; optional final `null`
  (only valid as the last element; `null` anywhere else &rarr; `MISPLACED_NULL`).
- Children arrays: each entry is string/number/boolean (text), nested Jamilih
  array (non-empty, head is string or object), `{'#': [...]}` fragment, DOM
  node, or `$_`-plugin object. `null` / `undefined` / function / symbol /
  bigint &rarr; `BAD_CHILD`.
- Recurse into: element children, `{'#'}` fragments, `$document`
  (`childNodes` / `head` / `body`), `$shadow` `template` / `content` when they
  are Jamilih arrays.
- **Unknown `$`-prefixed properties are structurally well-formed**, whether as
  a key on an attributes object or as the sole/only keys of an object-headed
  child array (e.g. `[{$if: [...]}]`). Base Jamilih treats them as no-ops (see
  §6), so Layer 1 must not raise `BAD_*` for them; whether they are *accepted*
  is a Layer 2 decision driven by `allowableOptions`. A `$`-only child-head
  object is not recursed as a Jamilih array by Layer 1 (its value shape is
  owned by whatever templating dialect defined the key).
- A nested array whose head object contains a *builtin option* key
  (`$plugins` / `$Map` / `$state`) is misplaced &mdash; options are a
  root-only concept (`jml()` auto-propagates the root `opts` into every child
  call, [src/jml.js:1847](../src/jml.js#L1847)) &mdash; flag
  `MISPLACED_OPTIONS_OBJECT`.

### Layer 2 — policy (driven by the four options)

Applied to every leaf value and magic key as the traversal visits it.

## 3. Option semantics

### `format: 'json' | 'javascript'` (default `'javascript'`)

`'json'` requires the whole structure to be losslessly JSON round-trippable.
Every leaf value must be string / finite number / boolean / `null` / plain
object / array. Rejected in JSON mode:

| Construct | Reason |
|---|---|
| `undefined` anywhere | not JSON |
| functions | as attribute / magic-key values: `$on` handlers, `on*` props, `$symbol`, `$define` (constructor + mixin methods), `$data` values, `$custom` values (or `$custom` itself), plugin `set` / `$_…` values; also functions nested inside a whitelisted dialect `$`-key value (e.g. an `$if` branch thunk). A bare function as a direct children-array entry is already a Layer 1 `BAD_CHILD` (see §2), independent of `format`. |
| `Symbol` (and `$symbol` in general) | not serializable; runtime also mutates the passed object (`obj.elem = ...`) |
| `Map` / `WeakMap` | `$Map`, `$data` map forms |
| `bigint` | not JSON |
| `NaN` / `Infinity` | not JSON |
| DOM nodes | also blocked by the forced `allowDOM=false` (see below) |
| non-plain objects | `Date`, `RegExp`, class instances as attribute values (prototype is not `Object.prototype` / `null`) |
| `$define`, `$data`, non-empty `$on` | inherently require live JS / an options `Map` |

JSON-compatible magic keys stay allowed in `'json'` mode: `$text`,
`$document`, `$DOCTYPE`, `$attribute`, `#`, `class` / `className` / `for` /
`htmlFor`, `is`, `xmlns`, `style` (string or string-valued object), `dataset`
(JSON values only), `$custom` (JSON values only, no `__proto__`), `$shadow`
with `open` / `closed` booleans and `template` / `content` given as Jamilih
arrays. Empty `$on: {}` is a documented no-op and stays valid.

### `allowInnerHTML: boolean` (default `true`)

When `false`, an `innerHTML` key in any attributes object &rarr;
`INNERHTML_NOT_ALLOWED` (mirrors the `jml-noinnerh` build). Orthogonal to
`format` (an `innerHTML` string is valid JSON, so `format:'json'` alone does
not block it). Scope is the `innerHTML` key exactly; revisit
`outerHTML` / `insertAdjacentHTML`-style keys only if they ever become
supported.

### `allowDOM: boolean` (default `true`, forced `false` when `format === 'json'`)

When effectively `false`, any raw DOM node &rarr; `DOM_NODE_NOT_ALLOWED`. DOM
nodes are duck-typed as
`v && typeof v === 'object' && typeof v.nodeType === 'number'` (no
`instanceof`, no `window`). Positions to check:

- first arg (element / fragment / document wrap),
- any sibling position,
- final parent arg,
- children-array entries,
- `$shadow.template` (`HTMLTemplateElement`) / `$shadow.content`
  (`DocumentFragment`),
- `$define` `extends` targets that are constructors,
- `Map` / `WeakMap` instances passed to `$data` / `$Map` (treated as
  DOM-adjacent live objects; also covered by `format:'json'`).

If `allowDOM: true` is passed explicitly together with `format: 'json'`, emit
one `OPTION_CONFLICT` error and let `json` win (DOM stays rejected).

### `allowableOptions: string[]` (default `['$plugins', '$Map']` = runtime `possibleOptions`)

Whitelist of **extensible `$`-prefixed properties**, applied at *every* place
`$` magic is read, not only the leading options object:

1. the leading options object (`args[0]` &rarr; path `/0`),
2. any attributes object,
3. any object-headed child array / first-arg special object.

This is what lets a templating dialect layered on Jamilih (jtlt-style: `$if`,
`$forEach`, `$switch`, ...) validate cleanly &mdash;
`validateJamilih(tpl, {allowableOptions: ['$if', '$forEach']})`.

**Builtins are always allowed in their valid position** and are *not* required
in `allowableOptions`:

- options position: `$plugins`, `$Map`;
- attributes / first-arg / child-head: `$on`, `$symbol`, `$define`, `$data`,
  `$custom`, `$shadow`, `$attribute`, `$text`, `$document`, `$DOCTYPE`, `#`,
  and `$_`-prefixed plugin keys.

Rules:

- An **unknown `$`-prefixed key** (anywhere in 1&ndash;3) that is not a
  builtin and not in `allowableOptions` &rarr; `UNKNOWN_MAGIC_PROPERTY` (one
  error per offending key; path points at the key). No case distinction &mdash;
  the `$` namespace is shared. Non-`$` unknown keys on an attributes object are
  ordinary attribute names and are *not* flagged by this option (they go
  through the plain-attribute path / `format` leaf check).
- Two sentinel entries expand in place:
  - `'default'` &mdash; the built-in option allowlist (`$plugins`, `$Map` =
    runtime `possibleOptions`). Passing `allowableOptions` otherwise
    *replaces* the defaults, so `['default', '$if']` means "the builtins plus
    `$if`" without retyping them; `['default']` alone is equivalent to
    omitting the option; `['$if']` alone drops `$plugins` / `$Map` from the
    leading options object (they then trigger `DISALLOWED_OPTION` there,
    though they remain valid as inherited/propagated opts).
  - `'any'` (or `'*'`) &mdash; wildcard: permit every unknown `$`-prefixed
    key.
- `[]` &mdash; permit none; additionally, a leading object *detected as
  options* by the runtime rule &rarr; `OPTIONS_OBJECT_NOT_ALLOWED`.
- Whitelisted unknown keys have **opaque values**: the validator does not know
  their shape, so it does not recurse into them as Jamilih, but it *does* run
  the `format` leaf check over their contents (so `format:'json'` still
  rejects a function inside `$if`). A future extension (see §7 Q1) could let
  callers register a per-key sub-validator.
- `$state` / `$mode` are Jamilih-reserved and not author-supplied &mdash; if
  present on the leading object, flag `RESERVED_OPTION`; if `$state` (or
  `$plugins` / `$Map`) appears on a *nested* array head, flag
  `MISPLACED_OPTIONS_OBJECT` (see §2 / §6).
- When `$Map` / `$plugins` are present and permitted, still validate their
  shape (`$plugins` = array of `{name: /^\$_/, set: fn}`; `$Map` =
  `[Map|WeakMap, val]` or `{root, ...}`) and still subject their values to
  `format` (both fail `format:'json'`).

### `failFast: boolean` (default `false`)

`false` (default) &mdash; the traversal visits the whole structure and
`errors` contains every problem found. `true` &mdash; the walker returns as
soon as the first error is pushed, so `errors` has at most one entry; useful
as a cheap predicate on large trees.

## 4. Traversal design (internal, in the new module)

Single recursive walker carrying `{ opts (normalized), errors, path: string[] }`;
push/pop path segments; every check appends to `errors` instead of throwing.
When `opts.failFast` is set, the "append error" helper throws a private
sentinel that the top-level `validateJamilih` catches, so the first error
unwinds the whole walk. Helper functions, each a direct mirror of a `jml.js`
region:

| Helper | Mirrors |
|---|---|
| `validateStructure(arr)` | root detection of options object + `argStart` |
| `validateArgSequence(args, atStart)` | the `for (i...) switch (_getType(arg))` loop |
| `validateSpecialString(args, i)` | the `case 'string'` inner switch (`!`, `&`, `#`, `#x`, `?`, `![`, `''`) |
| `validateFirstArgObject(obj)` | `{'#'}`, `$text`, `$document`, `$DOCTYPE`, `$attribute`, `$_` plugin |
| `validateAttributes(obj, elName)` | `_checkAtts` &mdash; the large `switch (att)` |
| `validateChildren(arr)` | `case 'array'` block + `getBadChildrenError` |
| `validateJSONValue(v)` | `format:'json'` leaf check |
| `isDOMNode(v)` / `isMapLike(v)` | duck-typed guards |

`_getType` can be lifted/duplicated (it is small and pure) or exported from
`jml.js` for reuse &mdash; prefer duplicating a trimmed copy in the new module
to keep it dependency-free.

### Error codes (initial set)

`NOT_ARRAY`, `EMPTY_ARRAY`, `BAD_ELEMENT_NAME`, `BAD_FIRST_ARG`,
`BAD_SPECIAL_ARG`, `MISPLACED_NULL`, `BAD_ATTRIBUTES_OBJECT`, `BAD_CHILD`,
`BAD_DOCTYPE`, `BAD_ATTRIBUTE_NODE`, `BAD_PROCESSING_INSTRUCTION`,
`BAD_ON_HANDLER`, `BAD_SYMBOL`, `BAD_DEFINE`, `BAD_DATA`, `BAD_SHADOW`,
`BAD_CUSTOM_PROTO`, `NON_JSON_VALUE`, `NON_JSON_CONSTRUCT`,
`DOM_NODE_NOT_ALLOWED`, `INNERHTML_NOT_ALLOWED`, `OPTIONS_OBJECT_NOT_ALLOWED`,
`DISALLOWED_OPTION`, `UNKNOWN_MAGIC_PROPERTY`, `MISPLACED_OPTIONS_OBJECT`,
`RESERVED_OPTION`, `OPTION_CONFLICT`, `UNKNOWN_TYPE`.

`DISALLOWED_OPTION` vs `UNKNOWN_MAGIC_PROPERTY` &mdash; the discriminator is
*whether the key is a Jamilih builtin*, not its position:

- `DISALLOWED_OPTION` &mdash; the key **is** a builtin options-position key
  (`$plugins` / `$Map`) and appears on the leading options object, but the
  effective `allowableOptions` does not include it (e.g.
  `allowableOptions: ['$if']`, no `'default'`).
- `UNKNOWN_MAGIC_PROPERTY` &mdash; the key is **not** a builtin and is not
  whitelisted, wherever it sits: on the leading options object, an attributes
  object, or an object-headed child-array head. A *custom* `$`-key at the root
  (e.g. `[{$plugins: [...], $foo: 1}, 'div']`, or `[{$foo: 1}, 'div']` where
  the object is not even detected as options) is therefore
  `UNKNOWN_MAGIC_PROPERTY`, not `DISALLOWED_OPTION`.
- `RESERVED_OPTION` &mdash; a name Jamilih reserves for its own use on the
  leading object: `$state` (internal traversal marker) or `$mode` (reserved
  for a future SVG/XML mode, currently the commented-out entry in
  `possibleOptions`). Takes precedence over the two above. Neither name puts
  the object into options-detection on its own, so the validator matches them
  by name. Post-§6c these also make `jml()` itself throw, so `RESERVED_OPTION`
  predicts a hard runtime failure, not a silent quirk.

## 5. Files to add / change

### Add `src/possibleOptions.js`

Extract the `possibleOptions` array into its own tiny side-effect-free module
so both `src/jml.js` and `src/validateJamilih.js` import the same list with no
circular dependency and no risk of drift. (Importing it *from* `jml.js` would
either create a `jml.js` &harr; `validateJamilih.js` cycle or force the
standalone entry to bundle all of `jml.js`, which has load-time side effects
Rollup will not shake.)

### Add `src/validateJamilih.js`

- `import {possibleOptions} from './possibleOptions.js';` &mdash; the only
  cross-module import; no `jml.js` import.
- JSDoc typedefs: `ValidateJamilihFormat`, `ValidateJamilihOptions`
  (`format`, `allowInnerHTML`, `allowDOM`, `allowableOptions`, `failFast`),
  `JamilihValidationError`, `JamilihValidationResult`.
- `export const validateJamilih = (structure, options = {}) => ({valid, errors})`.
- Optional one-liner
  `export const isValidJamilih = (s, o) => validateJamilih(s, o).valid`
  &mdash; include only if the boolean predicate is also wanted.
- Free of top-level side effects (only `const` / function declarations). This
  plus the `possibleOptions.js`-only import is what keeps the standalone
  `dist/validateJamilih.js` entry lean (no `jml`, no jsdom).

### `src/jml.js`

- Replace the inline `possibleOptions` array with
  `import {possibleOptions} from './possibleOptions.js';` (re-export it too if
  it was part of the public surface &mdash; it currently is not).
- Re-export for discoverability: `export {validateJamilih} from
  './validateJamilih.js';` and attach `jml.validateJamilih = validateJamilih`
  &mdash; consistent with the `jml.toJML` / `jml.toHTML` pattern. (Tree-shaking
  is no longer the constraint now that there is a dedicated dist entry; a
  validator-only consumer imports `jamilih/dist/validateJamilih.js` and never
  touches `jml.js`.)

### `src/jml-jsdom.js`

Already `export * from './jml.js'`, so it is covered; add an explicit
`export {validateJamilih} from './jml.js';` for namespace-type parity (same
pattern already used for `jml`).

### `rollup.config.js`

Add a standalone build pair for the validator, mirroring the
`getInterpolator` entries at the bottom of the config:

- `input: 'src/validateJamilih.js'`, `output: dist/validateJamilih.js`
  (`format: 'umd'`, `name: 'validateJamilih'`, `exports: 'named'`) + a matching
  `dist/validateJamilih.mjs` (`format: 'esm'`).
- `babel` plugin only; no `jsdom` / node-builtin externals needed (window-free).

### `package.json`

- `exports`: add
  `"./dist/validateJamilih.js": { "import": { "types": "./dist/src/validateJamilih.d.mts", "default": "./dist/validateJamilih.mjs" }, "require": { "types": "./dist/src/validateJamilih.d.ts", "default": "./dist/validateJamilih.js" } }`
  (same shape as the `./dist/getInterpolator.js` entry).
- `typesVersions."*"`: add
  `"dist/validateJamilih.js": ["dist/src/validateJamilih.d.ts"]`.
- `copy-dts` script: add
  `cp dist/src/validateJamilih.d.ts dist/src/validateJamilih.d.mts`.

### `tsconfig-build.json`

No change if it globs `src/**`; verify the new file is picked up so
`dist/src/validateJamilih.d.ts` (and the copied `.d.mts`) is emitted, for both
the standalone entry and the barrel re-export.

### Tests &mdash; add `test/test.validateJamilih.js`

Auto-picked by the `test/test.*.js` mocha glob.

- Valid fixtures per format (elements, attrs, children, fragments,
  `$document`, `$DOCTYPE`, `$attribute`, comments / PI / entities, empty
  `$on`).
- Invalid structural fixtures (empty array, misplaced `null`, `&` without
  string, bad child `null` / function, non-string element head).
- Policy fixtures: `format:'json'` rejecting `$on` / `$symbol` / `$define` /
  `$data` / functions / `undefined` / `Map` / DOM / non-plain objects;
  `allowInnerHTML:false` rejecting `innerHTML`; `allowDOM:false` rejecting a
  fake `{nodeType:1}` in each position; `allowableOptions:[]` rejecting
  `{$Map:...}` leading object; `allowableOptions:['$plugins']` accepting
  `$plugins` but rejecting `$Map`.
- Sentinel fixtures: `['default','$if']` accepts both `{$Map:...}` and a
  `$if` key; `['default']` behaves like the omitted option; `['any']` accepts
  an arbitrary `$whatever`.
- Templating fixtures: the `$if` / `$forEach` examples validate clean with
  `allowableOptions: ['$if','$forEach']` and with `['any']`; without the
  whitelist they yield `UNKNOWN_MAGIC_PROPERTY` at the expected paths (attr
  position and object-headed child-array head). `format:'json'` still
  rejects a function nested inside a whitelisted `$if` value.
- `MISPLACED_OPTIONS_OBJECT`: `['div', [ [{$Map: [...]}, 'span'] ]]` is
  flagged, not treated as options.
- Assert exact `errors[].code` and `errors[].path` for a few representative
  cases.
- `failFast`: a fixture with several independent problems yields all of them
  by default, and exactly one with `failFast: true`.
- Cross-check test: for a set of "should be structurally valid" fixtures,
  also confirm `jml(...fixture)` (with jsdom) does not throw &mdash; keeps
  Layer 1 honest against the real parser.

### Docs

- `README.md`: new `## Validation` section after `## Schema`; document
  signature, options, defaults, error shape, and the three access paths
  (`import {validateJamilih} from 'jamilih'`, `jml.validateJamilih`, or the
  lean standalone `jamilih/dist/validateJamilih.js` that skips jsdom); note
  the relationship to the `jml-noinnerh` build and the JSON Schema.
- `README.md`: update "Rules (detailed)" line ~730 (`A property beginning
  with \`$\` has a special purpose...`) to state that the `$` namespace is
  shared &mdash; base Jamilih ignores `$`-keys it does not recognize, so
  templating dialects may define their own (`$if`, `$forEach`, ...); `$_` is
  plugins. Include the list of names Jamilih already reserves so dialect
  authors can avoid collisions (spelled out in §6). Rename `$map` &rarr;
  `$Map` wherever the option is documented.
- `CHANGES.md`: `## 0.70.0` &rarr;
  `- feat: add \`validateJamilih\` structural/policy validator` and
  `- **BREAKING**: rename the \`$map\` option to \`$Map\`; ignore unrecognized
  \`$\`-prefixed properties instead of throwing (templating-dialect
  composability); throw on author-supplied \`$state\` / \`$mode\``.
- Bump `package.json` version to `0.70.0` (pre-1.0 minor covers the breaking
  change; the `BREAKING` label in `CHANGES.md` carries the signal).
- Update the `possibleOptions` TODO comment in `jml.js` (around line 88) to
  reference `allowableOptions`.
- The standing security TODO in `jml.js` (`// Todo: Disable this by default
  unless configuration explicitly allows (for security)`, currently sitting
  by the `dataset` case around line 1472) is really about the `innerHTML`
  sink; `allowInnerHTML` is its realization. Move / reword that comment so it
  is attached to the `innerHTML` case, and drop the idea of a separate
  `allowDataset` knob &mdash; `dataset` only needs value validation here.

## 6. Companion **breaking** change to Jamilih core (prerequisite)

Three changes to `src/jml.js`, shipping together in 0.70.0.

### 6a. Rename the `$map` option to `$Map`

`$map` is too useful a name to leave occupied, so the leading **options** key
becomes **`$Map`**. This is the only rename; the `$` namespace stays shared
and nothing else moves. `$map` is purely an option (there is no `case '$map'`
in `_checkAtts`), so the change is localized.

Sites in `src/jml.js` (from `grep -n '\$map'`):

- `possibleOptions` array (line ~88): `'$map'` &rarr; `'$Map'`.
- `JamilihOptions` typedef (line ~808): `[$map]` &rarr; `[$Map]`.
- `opts.$map` normalization + reads (~1580&ndash;1582, 1608, 1624, 1873):
  &rarr; `opts.$Map`.
- `jml.weak` / `jml.strong` (~2516, 2528): `jml({$map: [map, obj]}, ...)`
  &rarr; `{$Map: [...]}`.
- Tests: `test/test.jml.js` ~885, ~970 (`$map:` usages) and the `$map`
  comments at ~868, ~940.

`$state` stays `$state` (internal-only traversal marker) &mdash; but see §6c,
which makes author-supplied `$state` an error instead of a silent perturbation.

### 6b. Tolerate unrecognized `$`-prefixed magic instead of throwing

Current behavior: `_checkAtts` has an explicit case for every known `$key`; an
unknown one falls to `default`, which calls
`elem.setAttribute('$if', String(value))` &mdash; on a `createElementNS`
element `$` is not a valid XML Name start char &rarr; `InvalidCharacterError`;
on the `DocumentFragment` of the object-headed child-array path (object lands
*before* any element name) `setAttribute` does not exist &rarr; `TypeError`.

Change:

- In `_checkAtts`, before the `default` branch's `setAttribute`: if `att`
  starts with `$`, is not a recognized key, and no plugin matches &rarr;
  **skip silently** (no-op). `$_`-prefixed keys keep going through the
  existing plugin lookup.
- In the `case 'array'` children handler, an object-headed child whose keys
  are all unrecognized `$` props currently recurses to `jml(opts, {...})` and
  hits the fragment `setAttribute` throw. Make that path append nothing (or,
  when a templating plugin is registered, let the plugin claim it).
- Net effect: `jml('div', [ [{$if: [...]}] ])` returns `<div>` with the `$if`
  branch simply omitted; a templating superset that pre-processes `$if`
  produces the real content. This is the composability guarantee the
  `allowableOptions` whitelist depends on.

Tests for the core change (`test/test.jml.js`):

- an unknown `$foo` attribute key is ignored (no throw, no attribute set);
  `[{$foo: ...}]` child is a no-op.
- existing `$Map` / `$data` map behavior still passes after the rename.

Docs for the core change &mdash; `README.md` "Rules (detailed)": a template
engine built on Jamilih may define its own `$`-prefixed keys, **but not any
name Jamilih already claims**. Publish the reserved set so dialect authors can
avoid it:

- options (leading object): `$plugins`, `$Map` (and `$state`, internal-only);
  `$mode` is reserved for future use.
- pseudo-attributes / first-arg object keys: `$on`, `$symbol`, `$custom`,
  `$define`, `$data`, `$shadow`, `$attribute`, `$text`, `$document`,
  `$DOCTYPE`;
- the `$_` prefix (plugins) and the non-`$` key `#` (fragment).

Everything else `$`-prefixed is free and ignored by base Jamilih. Keep this
list in sync with `_checkAtts` / `possibleOptions` if new builtins are added.

### 6c. Throw on author-supplied `$state` / `$mode`

Today an author-supplied `$state` on the leading options object silently
defeats the `opts.$state === undefined` root check ([src/jml.js:1576](../src/jml.js#L1576))
&mdash; `isRoot` goes false, root-map auto-registration is skipped, plugins
see the wrong position (see Q5). `$mode` is reserved for a future SVG/XML mode
and currently does nothing. Both should **throw** rather than misbehave or
no-op, so no one builds a dependency on the current accidental behavior before
`$mode` is defined.

Change:

- `$mode` is the easy case &mdash; `jml()` never sets it internally, so any
  own-enumerable `$mode` key on an object processed as options or attributes
  &rarr; `throw new TypeError('`$mode` is reserved and not yet implemented')`.
- `$state` needs to distinguish "author put it there" from "`jml()` passed its
  own `opts` down on recursion" (which is exactly what the `=== undefined`
  check keys off). Brand the internal `opts` &mdash; e.g. a `WeakSet` of
  opts objects `jml()` created, or a non-enumerable `Symbol` marker &mdash;
  and at the top-level options/first-arg detection, if `args[0]` has an own
  `$state` key but is **not** branded &rarr;
  `throw new TypeError('`$state` is set internally and may not be supplied')`.
  Recursive calls pass the branded object and are unaffected.
- Keep it out of the `_checkAtts` `$state` no-op path only for branded opts;
  an unbranded object carrying `$state` as an "attribute" also throws.

Breaking, but negligible real-world risk: author `$state` / `$mode` have no
legitimate use. Ship with 0.70.0.

Tests: `jml({$state: 'children'}, 'div')` and `jml('div', {$mode: 'svg'})`
throw `TypeError`; normal nested traversal (internal `$state` propagation)
still works; `getInterpolator` plugin still sees correct `opts.$state`.

## 7. Resolved decisions

Answers are recorded inline (*italic*); the body of this plan (§1&ndash;§6)
has been updated to match, so these need no further action beyond
implementation.

1. **Defaults**: proposed `format:'javascript'`, `allowInnerHTML:true`,
   `allowDOM:true`, `allowableOptions:['$plugins','$Map']` so a no-option call
   is roughly "would standard `jml()` accept this structurally". Confirm
   `'json'` is not wanted as the safer default. *Right*
2. **`dataset` security TODO**: `jml.js` has a standing "disable `dataset` by
   default unless config allows" note. Out of scope here, or add a 5th knob
   later (`allowDataset`)? Plan currently only validates its values. *Comment was intended for innerHTML instead*
3. **`format:'json'` and finite numbers**: reject `NaN` / `Infinity`
   (JSON-invalid) &mdash; assumed yes. *Yes*
4. **Multiple errors vs fail-fast**: plan collects all errors. Confirm that is
   wanted (vs first-error-only for speed). *Include both as options, with all errors being the default.*
5. **Dist entry point**: include the standalone `dist/validateJamilih.js`
   build or keep it bundled into the existing entries only? *~~Don't include as standalone. Tree-shaking on the main file should be sufficient.~~ **Reversed (Q8):** ship a standalone `dist/validateJamilih.js` / `.mjs` entry after all &mdash; the `jml-jsdom` entry always carries the load-time `new JSDOM('')` / `setWindow` side effect, so a validator-only consumer needs a path that skips it. `possibleOptions` moves to its own `src/possibleOptions.js` module to make the lean entry possible. Still re-exported from the barrels.*

## Questions

1. In our separate plan to make a templating dialect around jamilih, should options be made extensible within jamilih (e.g., accept callbacks which are invoked with any parent or descendant usage of custom option properties)

2. Where can there be "inline function children" in Jamilih? For `$custom`? *&mdash; Nowhere as an actual child: a bare function as a direct children-array entry throws `BadChildrenError` ([src/jml.js:1834](../src/jml.js#L1834)) &rarr; validator Layer 1 `BAD_CHILD`. Functions only appear as attribute / magic-key values (`$on`, `on*`, `$symbol`, `$define`, `$data`, `$custom`, plugin values) or nested inside a whitelisted dialect `$`-key's opaque value. `$custom` is an attributes-object key, not a child &mdash; its value is `Object.assign`ed onto the element. §3 `format` table reworded to match.*

3. Add support for `lite-json` or `lite-javascript` formats (see <https://gist.github.com/brettz9/ac4c18f51c0af8003a41> and <https://gist.github.com/brettz9/72bb6a460212d9350f67>). May add in the future as its own npm package(s). *&mdash; Deferred; not in the initial `validateJamilih`. The linked gists are minimal reimplementations of `jml()` ("Jamilih Lite" &mdash; a DOM builder and a string builder) that accept only a narrow slice of the grammar: `[tagName, attrs?, children?]`, `attrs` limited to plain attributes plus `dataset` / `style` (camelCase objects) and `$on`, `children` limited to text primitives and nested element arrays. So the two formats would be `format` values stricter than `json` / `javascript`:*
   - *`lite-javascript` &mdash; the Lite grammar only: no leading options object, no sibling sequences, no trailing-`null`, no first-arg specials (`!` `&` `#` `#x` `?` `![` `''`), no first-arg objects (`$text` / `$document` / `$DOCTYPE` / `$attribute` / `#`), no `$symbol` / `$custom` / `$define` / `$data` / `$shadow` / `xmlns` / `is`, no plugins, no DOM nodes, no unknown `$`-keys. Allowed: `$on`, `dataset`, `style`, `class` / `className`, `for` / `htmlFor` (and `innerHTML` per `allowInnerHTML`).*
   - *`lite-json` &mdash; `lite-javascript` plus the `json` leaf rules, which also drops `$on` (it needs functions). Pure `[tag, {plainAttrs | dataset | style}, [text | nested]…]`.*
   - *Implementation: make `format` a small registry (name &rarr; predicate/feature set) so a future `jamilih-lite` package can register `lite-*` without touching `validateJamilih` core &mdash; same table-driven seam as Q6. New error code `NON_LITE_CONSTRUCT` (path + the disallowed feature). `allowableOptions` / `allowInnerHTML` / `allowDOM` still compose on top.*

4. Add `"any"` as option to `allowableOptions` *&mdash; folded into §3: `['any']` (or `'*'`) is the wildcard.*

5. Can `$state` be useful if allowed (e.g., to create an attributes object) or would it break things? *&mdash; Not useful, mildly hazardous; keep it `RESERVED_OPTION`. As an attribute / child-head key it is a silent no-op ([src/jml.js:1161](../src/jml.js#L1161)) &mdash; it does nothing toward building an attributes object. On the leading options object a preset value defeats the `opts.$state === undefined` root check ([src/jml.js:1576](../src/jml.js#L1576)): `isRoot` goes false, so root-map auto-registration (`jml.strong` / `jml.weak`) is silently skipped and position-sensitive plugins see the wrong state. No capability is gained, only a way to lie to `jml()` about traversal position.*

6. Would it be more performant to make a validating parser which was familiar with jtlt and also jamilih, rather than doing validation + jamilih in separate steps? *&mdash; Not worth fusing. Validation is a boundary concern (validate an authored template once; run the trusted template many times), and the expensive pass is DOM construction, not the array walk &mdash; shaving the cheap pass buys little. Fusing also recouples the jsdom dependency the standalone entry just removed, and binds jtlt + jamilih + DOM-building into one release unit. Instead: (a) export `validateJamilih`'s traversal helpers (`_getType`, arg-sequence walker, `_checkAtts` mirror) so jtlt's compile/lower pass &mdash; which already walks the tree and knows both grammars &mdash; can fold structural checks into that single pass (this is the per-key sub-validator seam in §3 / Q1); (b) if per-render validation of untrusted input is ever needed, add `jml(structure, {validate: true})` reusing `jml()`'s existing traversal, still not a separate parser.*

7. Are options objects technically allowed today on arrays within a Jamilih child array? *&mdash; No. Options are detected only at `args[0]` of a `jml()` call; `jml()` auto-propagates the root `opts` into child calls ([src/jml.js:1847](../src/jml.js#L1847)), so a hand-written `{$Map|$plugins}` at a child-array head lands in attribute position and today throws. See §2 (`MISPLACED_OPTIONS_OBJECT`) and §6.*

8. Change back to a separate module. *&mdash; Done: standalone `dist/validateJamilih.js` / `.mjs` entry restored (§1, §5, §7.5), since consumers using `jml()` will always load `setWindow` / jsdom and a validator-only consumer should not have to. `possibleOptions` extracted to `src/possibleOptions.js`.*

9. Examples for above:

jamilih should not err upon encountering a Jamilih array with first argument object which is a no-op. This keeps jamilih compatible with subsets which add templating, e.g.:

```js
jml(
  'div', [
    ['h1', ['Our site']],
    [{$if: [
      '$param == "loggedIn"',
      ['span', ['Welcome back!']],
      ['a', {href: '/signin'}, ['Please sign in']]
    ]}]
  ]
);
```

Or function-based where allowed:

```js
jml(
  'div', [
    ['h1', ['Our site']],
    [{$if: [
      '$param == "loggedIn"',
      () => {
        return ['span', ['Welcome back!']];
      },
      () => {
        return ['a', {href: '/signin'}, ['Please sign in']];
      }
    ]}]
  ]
);
```

A validation of the above could whitelist "$if".

We also want the option-checking to check for unknown (but allowably extensible) `$` properties on an "attributes" object. The following might call for "$forEach" as an allowed option:

```js
jml(
  'select', {
    $forEach: [
      '$..car',
      ['option', ['$']]
    ]
  }
);
```

## Appendix A. `lite-json` / `lite-javascript`: what is *not* allowed (future work)

Deferred (Q3). The "lite" formats describe the subset that the minimal
Jamilih-Lite builders accept &mdash; roughly `[tagName, attrs?, childrenArray?]`
and nothing else. This appendix is the exclusion list a future `NON_LITE_CONSTRUCT`
check would enforce; it is written against the full `jml()` grammar in
[src/jml.js](../src/jml.js).

### A.1 Allowed in lite (the whole surface)

- A **single root** `[tagName, attrs?, children?]`. `tagName` is a plain
  lower-case element-name string.
- `attrs` (optional, position 2): an object whose values are strings, numbers,
  or booleans, plus these keys &mdash;
  - `class` / `className`, `for` / `htmlFor`;
  - `dataset`: a (nestable) camelCase/hyphenated object of string/number values;
  - `style`: a camelCase object of string values, or a plain string;
  - `innerHTML`: only when `allowInnerHTML` is not `false`;
  - `$on` (**`lite-javascript` only**): event-name &rarr; handler function, or
    `[handler, capturing]`.
- `children` (optional, last): an array of text primitives (string / number /
  boolean) and nested `[tagName, …]` element arrays.

Everything below is rejected.

### A.2 Rejected in **both** lite formats

**Call / argument shape**

- A leading **options object** of any kind (`{$plugins…}`, `{$Map…}`,
  `{$_plugin…}`, or an unknown `$`-key object) &mdash; lite has no options.
- **Sibling arguments** at the top level (`jml('div', 'span', …)`): one root
  element only.
- A trailing **`null`** (array-return sentinel).
- A trailing **parent node** (auto-append target): lite builders return, they
  do not append.
- Passing an existing **DOM element / fragment / document** as the first
  argument to wrap it.
- More than three positional items in an element array (`[tag, attrs, children]`
  is the maximum).

**First-argument special strings**

- `!` (comment), `&` (entity ref), `#` / `#x` (numeric char refs), `?`
  (processing instruction), `![` (CDATA), `''` (fragment). Entities must be
  written as literal characters; there is no way to emit a comment node.

**Special / magic object keys** (as first-arg object *or* attribute key)

- Node-producing: `#` (fragment), `$text`, `$document`, `$DOCTYPE`,
  `$attribute`.
- Behavior: `$symbol`, `$custom`, `$define`, `$data`, `$shadow`.
- Options that leaked into attribute position: `$plugins`, `$Map`, `$state`,
  `$mode`.
- Plugins: any `$_`-prefixed key.
- **Any other `$`-prefixed key** (templating-dialect magic such as `$if` /
  `$forEach`): lite is *not* extensible &mdash; `allowableOptions` has no
  effect in a lite format.
- `xmlns` namespace declarations; `is` (customized built-in).

**Children**

- Raw **DOM nodes** as children (regardless of `allowDOM`).
- `{'#': […]}` fragment children and `['', […]]` empty-string fragment
  children.
- `$_`-plugin / unknown-`$`-key objects as children.
- A nested array whose head is an object (only a string tag name may lead a
  child element array).

**Values**

- `Symbol`, `bigint`, `Map` / `WeakMap` anywhere.
- Functions anywhere **except** `$on` in `lite-javascript`.

### A.3 Rejected additionally in **`lite-json`** (on top of A.2)

- `$on` and its handler functions &mdash; no events at all.
- Function values inside `dataset` or `style` (full Jamilih tolerates a
  function `dataset` value).
- `undefined` anywhere (full / `lite-javascript` tolerate it for nullable and
  boolean attributes).
- `NaN` / `Infinity`; non-plain objects (`Date`, `RegExp`, class instances) as
  attribute values.
- In short: `lite-json` is exactly `[tag, {plain | dataset | style}, [text | nested]…]`
  and must round-trip through `JSON.stringify` unchanged.

### A.4 Notes

- `lite-javascript` &sub; `javascript` and `lite-json` &sub; `json`: anything a
  lite format rejects, its parent may still allow. The lite check runs *first*;
  `allowInnerHTML` / `allowDOM` (where still meaningful) and `format` leaf
  rules compose on top.
- One error code, `NON_LITE_CONSTRUCT`, with `path` and a message naming the
  disallowed feature (e.g. `` `$shadow` is not allowed in lite-json ``).
- Keep A.1/A.2 in sync with the Jamilih-Lite gists if their surface changes.
