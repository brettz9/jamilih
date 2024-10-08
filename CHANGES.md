# CHANGES for jamilih

## ?

- chore: update devDeps. and lint; change browser targets

## 0.60.0

- BREAKING: Require Node 18
- perf(build): target Node 18

## 0.59.2

- fix: revert making `list` attribute nullable (needs `setAttribute`)

## 0.59.1

- fix: make `list` attribute nullable

## 0.59.0

- fix: for common uses, return more accurate type for `jml()`

## 0.58.2

- fix(plugins): ensure passing root element

## 0.58.1

- fix(types): `Element` -> `HTMLElement`

## 0.58.0

- feat: Add type for `JamilihDocumentFragmentContent`

## 0.57.2

- fix: types for `jamilih/src/jml-jsdom.js`

## 0.57.1

- fix: Plugin types (add `PluginValue` and allow
   `Promise<void>` for plugins)

## 0.57.0

- fix: switch to `nodenext` `moduleResolution`

## 0.56.0

- feat: more `toHTML` support
- feat: TypeScript typings
- fix: Better error checking/reporting

## 0.55.2

- fix: expose `src/jml-jsdom.js` export

## 0.55.1

- fix: expose `jml-jsdom.js` export

## 0.55.0

**User-facing:**

- feat: switch to native ESM

**Dev-facing:**

- chore: update devDeps.
- chore: fix AMO bundle extension
- docs: update license dev. badge
- docs: dev instructions

## 0.54.0

**User-facing:**
- npm: Remove `core-js-bundle` from `peerDependencies`

**Dev-facing:**

- Build: Update per latest devDeps.
- Linting: As per latest ash-nazg
- npm: Switch from deprecated `rollup-plugin-commonjs` to
    `@rollup/plugin-commonjs`
- npm: Remove `remark-lint`
- npm: Add separate `nyc` testing script
- npm: Switch to stable `mocha-multi-reporters`
- npm: Switch to server without reported vulnerabilities
- npm: Switch to pnpm
- npm: Update devDeps.

## 0.53.2

- Fix: Missed adding updated build files

## 0.53.1

- Fix: Resume allowing no-op for `$on`

## 0.53.0

- Build: Change to Node 10 targets
- Build: Switch to babelrc with "json" extension
- Enhancement: More details in error messages
- Docs: Update badges per latest
- Linting: Check hidden files; update per latest ash-nazg
- npm: Switch from deprecated `rollup-plugin-babel` to
    `rollup/plugin-babel`; use `babelHelpers` explicitly
- npm: Update devDeps and peerDep

## 0.52.2

- Fix: Wrong mapping for `minlength`

## 0.52.1

- Fix: `minlength` and `maxlength` needed case-changing
- Docs: Update coverage badge per latest coveradge
- Docs: Remove redundant license badge
- npm: Update devDeps

## 0.52.0

- Breaking change: Require Node 10 (dev. env. relies upon)
- Enhancement: Add `minlength` and `maxlength` as nullables
- Build: Update build files
- Docs: Add license badges for devs/devDeps
- npm: Update devDeps

## 0.51.0

- Enhancement: Add `autocomplete` as nullable property
- npm: Update devDeps

## 0.50.0

- Enhancement: Add `integrity` as nullable property

## 0.49.2

- Fix: For `getInterpolator` plugin, export `uuid`

## 0.49.1

- Fix: Add UMD `dist` for new plugin
- Build: Update `dist` files

## 0.49.0

- Enhancement: Allow non-array Jamilih (e.g., object-based fragments) in
  `$document` head and body
- Enhancement: Expose state to plugins, adding new states
- Enhancement: Add interpolator plugin
- Optimization: Avoid checking for child name unless needed
- Refactoring: Prefer `replaceWith` to `replaceChild`
- npm: Update devDeps; use stable mocha-badge-generator

## 0.48.1

- Fix: Ensure all instances of `XMLSerializer` are on internal "window".

## 0.48.0

- Breaking change: Remove `setXMLSerializer`/`getXMLSerializer` and
  `setDocument`/`getDocument` and check on `window` (set by `setWindow`)
  instead (this will now also set `body`).
- Breaking change: Switch name of polyglot file to `dist/jml-jsdom.js`
  (pointed to in `main` so should not be breaking unless hard-coding the
  path).
- Breaking change: Drop ordered attribute array (object properties can
    be iterated now in order)
- Breaking update: Remove now removed `entities`, `notations`,
  `internalSubset` properties
- Breaking update: Remove now removed `xmlDeclaration` handling
- Breaking change: `toJML` will not get defaults with falsey value besides
  `undefined`
- Fix: Ensure that extra `childNodes` from the default HTML document are
  overwritten (and completely overwritten) before attempting to add the
  user's own `childNodes`.
- Fix: Allow previously undocumented fragment creation to accept children
- Fix: Ensure `stripWhitespace` on text node returns a text node (that is
  empty)
- Fix: Ensure can reset to null namespace for namespaced elements
- Fix: Underdocumented named `$map` had not been working properly
- Enhancement: Add config for `toJML` to `reportInvalidState`
- Enhancement: Check for `DOMParser` on `window` so can get automatically
  after setting `window`
- Enhancement: Allow wrapping a document and inserting nodes
- Enhancement: Allow wrapping of customized built-in elements
- Enhancement: With `$define` array allow absent 2nd (options) argument
- Enhancement (Errors):
  - Throw proper `TypeError` on undefined child content; throw
    also for `null`.
  - Throw if non-function added within `$on` array
  - Throw for all non-objects given as plugins
  - Report exact type if passing in bad type as Jamilih argument
  - Throw if passing in `null` in non-final position
  - Make `DOMException` polyfill inherit from `Error` and include
    message and `name`
- Docs: Add testing and coverage badges
- Docs: Begin commands docs
- Docs: Add jsdoc blocks on methods where missing
- Linting (ESLint): As per latest ash-nazg
- Travis: Adding builds 10, 12
- Testing: Coverage 100%
- Testing: Use builtin `body`, `$`, `$$`, `nbsp`
- npm: Update `package-lock.json`
- npm: Switch from deprecated `rollup-plugin-json` to replacement
- npm: Update devDeps, peerDep

## 0.47.0

- BREAKING CHANGE: Switch `jsdom` and `request` to `peerDependencies` so
  they do not need to be downloaded for browser-only use.
- Testing: Add code coverage
- Testing: Move code out of HTML to bootstrap file
- npm: Remove `rollup` from `test` script
- npm: Switch to non-deprecated `@rollup/plugin-node-resolve`
- npm: Update dep. jsom, peerDep core-js-bundle, and devDeps

## 0.46.0

- Linting (ESLint): Update code per linting updates; reenable
  `jsdoc/check-types`
- npm: Add Markdown and HTML files to JS linting routine
- npm: Update peerDeps, deps, devDeps

## 0.45.0

- Breaking change: Require polyfills for ChildNode/ParentNode
- Breaking change: Remove `XMLSerializer`: had become slightly buggy and now jsdom has own
- Breaking change: Remove `@babel/polyfill` dep but add `core-js-bundle` peer dep.;
    `@babel/polyfill` may continue to work, but should be more efficient and
    future-proof to use `core-js-bundle`
- Breaking change: Return `TypeError` if plugins not an array
- Enhancement: `glue` utility
- Linting: Switch to recommended rc file format; switch to
    eslint-config-ash-nazg; lint; safer `hasOwnProperty` calls
- Testing: Switch from end-of-lifed nodeunit to Mocha/Chai
- npm: Update deps, devDeps; remove `readmeFilename` property in `package.json`
- npm: Added `request` dep (peer dep now of jsdom)
- npm: Switch from `opn-cli` to `open-cli`
- npm: `open-docs`/`build-docs` scripts
- Docs: JSDoc config; headings; todos; refactoring

## 0.44.0

- Fix: Ensure pointing to dist files in `package.json`
- Enhancement: In case using `main` in bundlers for browser use,
    make Node version polyglot-capable

## 0.43.0

- Enhancement: Add `@babel/polyfill` dependency
- jsonchema: Add some attributes and other node types
- Linting (Markdown): Fix linting format
- npm: Update to Babel 7; update other devDeps and jsdom dep

## 0.42.0

- Fix: Properly escape processing instructions (LGTM-inspired)
- Refactoring: Remove unused function in demo, avoid passing extra arg (LGTM-inspired)
- Linting (LGTM): Add lgtm.yml exclusions of bundles

## 0.41.0

- Fix: Set charset attribute on `meta`
- Enhancement: Allow `$DOCTYPE` shorthand

## 0.40.2

- Fix: Call `createDocumentType` with empty strings for empty `systemId`
    or `publicId`
- Testing: Undo adding `XMLSerializer` to browser environment (ok if we
    create the document type correctly)

## 0.40.1

- Fix: Allow for falsey or string "undefined" `publicId`/`systemId`
- Refactoring: Use `includes` for strings and arrays in `XMLSerializer`
    polyfill
- Testing: Add document test; add `XMLSerializer` to browser environment
    for consistency for Firefox

## 0.40.0

- Fix: Undo logging
- Fix: `$document` to handle non-array arguments and properly set node
- Testing: Add `$document`/`$DOCTYPE` creation test

## 0.39.0

- Enhancement: Export `body` for `document.body` (frequently
    targeted for appending)
- Testing: Avoid Firefox-specific exception for password input
    attribute serialization order (now passing)

## 0.38.1

- Security fix: Bump versions as part of npm security audit
- Fix: Ensure `nbsp` exported in Node as well
- npm: Update devDeps

## 0.38.0

- Enhancement: Add `nbsp` as export (for another very frequently needed template item)

## 0.37.0

- Breaking change: Remove `yarn.lock`

## 0.36.0

- Deprecated: Default ES6 export deprecated over new named export
- Enhancement: Add `$` and `$$` utilities for `querySelector`/`querySelectorAll`.

## 0.35.0

- Enhancement: Support no-innerHTML ES6 Module dist file
- npm: Update devDeps

## 0.34.0

- npm: Update deps (jsdom), devDeps; fixes security vulnerability
- Testing: Add opn-cli

## 0.33.1

- Fix: Move `dir`, `lang`, and `title` to nullables

## 0.33.0

- Enhancement: Add global `HTMLElement` DOM-settable properties (for
    `undefined` to have no effect)
- Build: Add `nodeType` existence check (avoiding strict warnings)
- npm: Update devDeps
- Testing: Fix test to exclude attribute nodes (depends still on jsdom fixing)

## 0.32.0

- Fix: `browser` and `module` not pointing to updated file names
- Docs: Fix paths in docs
- Enhancement: Add "es" dist file
- npm: Fix browser-test script

## 0.31.0

- Breaking change (file locations): Move files to `dist` or `src`
    subdirectories accordingly (and move demo file to own directory)
- Breaking change (Bower): Remove `bower.json` (service is deprecated; use
    npm instead as is also usable for browser)
- Enhancement: Add "no innerHTML" distribution for sake of add-on validators
- Linting: ESLint
- Testing: Make conditional check for Firefox in test
- npm: Add chokidar watch script
- npm: Update deps and devDeps
- npm: Fix scripts to avoid building upon install

## 0.30.0

- Enhancement: Support plugins

## 0.29.1

- Fix: npmignore

## 0.29.0

- Build: Add yarn
- npm: Remove babel-env
- npm: Update dev deps

## 0.28.0

- Breaking change: Don't throw if encountering `Node.nodeType` as `undefined`;
    temporarily treat as `Node.ATTRIBUTE_NODE` for jsdom
- Breaking change: Remove an unused IE Shiv polyfill from `tests` directory
- npm: Add `browser` to `package.json` (and change `main` to point to
    Node-specific file)
- npm: Remove unused dependencies; add Rollup ones
- Build: Move Node code into separate entry file
- Build: Add Rollup code to potentially handle JSDOM as import (incomplete
    and may not work)
- Testing: Convert non-Nodeunit tests to Nodeunit and merge two test
    directories into one; simplify testing and leverage `setUp`; fix all broken
    tests; rename our assert code and have it accept a test object; make
    separate entry files for Node and browser; add test messages

## 0.27.0

- Fix: Actually add plugin apparently insisted on by Babel

## 0.26.0

- Fix: Add plugins apparently insisted on by Babel

## 0.25.0

- Fix: Add plugins apparently insisted on by babel-env

## 0.24.0

- Breaking change: Use `setAttribute` for `style` to ensure consistent
    serialization; could break if had been using to add styles to an
    existing element
- Breaking change (Browser): Remove most polyfills (no longer as concerned
    about old IE support, Babel or others can polyfill, and some are now
    better standardized, e.g., `XMLSerializer`)
- Breaking change (Node): Rather than always creating a new jsdom window,
    document (and XMLSerializer), look first for global ones (in case
    user wants to interact with same document object
- Breaking change (Node): Adjust and apply our own more browser-up-to-date
    `XMLSerializer` polyfill in place of `xmldom`.
- Enhancement: Allow for getting/setting of `window`, `document`, and
    `XMLSerializer` objects so we don't need to inject globals in Node.
- Fix: For Jamilih Maps, stop calling `super` on `this` (not needed
    and problematic in jsdom)
- Refactoring: Rollup and apply Babel to `jml-es6.js` to `jml.js`
    (ensuring older browsers and Node can support new features)
- Refactoring: Use new jsdom API
- npm: Add `module` property for sake of Rollup/Webpack
- npm: Update deps and devDeps
- npm: Add ESLint to test routines
- npm: Remove xmldom dep., add Rollup plugins for testing
- Testing: Add messages to tests, skipping some tests known to be not
    supported by jsdom
- Testing: Support one Node/browser polyglot testing, using Rollup
- Testing: Update tests to current browser expectations
- Docs: Document some newer features and other improvements

## 0.23.0

- For both files:
    - Breaking change: Support reasonable dynamic `template` creation
        (append to its `content` fragment instead of to `template` itself)
    - Allow document fragment to be appended as with elements

- For jml-es6.js file:
    - Breaking change: Change API for `jml.(Weak)Map.invoke` to pass element as first instead of last arg
    - Enhancement: Add `$shadow` for creating Shadow DOM
    - Enhancement: Add `$define` for Custom Element definitions
    - Enhancement: Add `$custom` for arbitrary addition of DOM properties/methods
    - Enhancement: Add `jml.command()` utility for invoking functions or
        methods attached to an element by symbol or map
    - Enhancement: Override `jml.Map` and `jml.WeakMap` `get` and `set` to accept selectors in
        place of elements; also allow in custom `invoke`

## 0.22.1

- Fix: For jml-es6.js file, avoid error if `opts.$map` doesn't exist!

## 0.22.0

- For jml-es6.js file, add `jml.sym` (and aliases `jml.symbol`
    and `jml.for`) utilities for retrieving a `Symbol` (or `Symbol.for`)
    instance on a particular element
- For jml-es6.js file, allow `$symbol` two-item array with the first
    item as a `Symbol` (or a string for `Symbol.for`) to be added as
    a key on the given element with the second item as the function
    or object to be its value. The object will have an `elem` property
    added to it to reference the current element, or, if a function
    is used, its `this` will be set to the element.
- For jml-es6.js file, allow `$data` attribute (and `$map` in config)
    (as yet undocumented)

## 0.21.0

- For jml-es6.js file, add `jml.weak`, `jml.strong`, `jml.Map`,
    and `jml.WeakMap` for easier association of elements to
    `Map` or `WeakMap` maps.

## 0.20.0

- For jml-es6.js file, `dataset` recursive objects fixed
    to always repeat prefix when other properties on same sub-object

## 0.19.0

- For jml-es6.js file, `dataset` recursive objects now support non-string
    primitive values (with null/undefined ignoring)

## 0.18.0

- For jml-es6.js file, support recursive objects under `dataset`.

## 0.17.0

- Refactoring: Add jml-es6.js file for ES6 module support
- Linting: ESLint ES6 module file and tests
- npm: Add ESLint script
- Testing: Serve proper content-types in test server
- Testing: Use ES6 modules in HTML tests and demo file
- Testing: Simplify suite running API

## 0.16.0

- Add `lang` to `NULLABLE` att group

## 0.15.0

- Add `pattern` to DOM properties
- Add new internal group `NON_NULL` for attributes that if set to `null`
    or `undefined`, they will not be set at all (useful for templates
    that can use the ternary operator to avoid setting)
- Add `max`, `min` to `NON_NULL` att group

## 0.14.0

- Avoid having nully dataset value set `dataset`, `class`/`className`,
    `style`, `for`/`htmlFor`, `innerHTML`, and `$on` handlers (as
    setting by DOM alone sets it to the string "undefined" or "null").

## 0.13.1

- Fix `readOnly` in map and bool check

## 0.13.0

- Add ATTR_MAP (inspired by JsonML): Only `readOnly`->`readonly` for now
- Add ATTR_DOM (inspired by JsonML): Attributes to be set in DOM along
    with booleans (Uses attributes in JsonML)
- Add 'disabled', 'readonly', 'indeterminate' to boolean attributes
- Refactoring: Define BOOL_ATTS (paralleling JsonML) for our boolean attributes
- Test refactoring (minor): Dummy favicon placeholders in test files for avoiding logs
- Test refactoring (minor): Switch from `GLOBAL` to `global` in tests
- npm: Update deps

## 0.12.0

- Add `defaultChecked` and `defaultSelected` support as properties

## 0.11.1

- npm: apply correct branch!

## 0.11.0

- npm: Upgrade jsdom version
- Demo: Fix
- Testing: Unskip `createCDATASection` test for `jsdom` now that implemented

## 0.10.5

- Bower: Shrink description as per npm

## 0.10.4

- npm: Shrink description to fit limit

## 0.10.3

- Rename MIT license file to LICENSE-MIT.txt

## 0.10.2

- Docs: Fix license text displayed
- Travis: Add dependencies status to README

## 0.10.1 (skipped 0.10.0)

- npm: Update dependencies
- Travis: Add support and display build status
- Testing: Workaround` nodeunit` in browser issue

## 0.9.0

- npm: Lint, add scripts for browser/Node testing
- npm: Rely on latest `jsdom` rather than my now outdated fork
- Refactoring: Avoid `DOMParser` from `xmldom` since `jsdom` supports (still need its `XMLSerializer` however)
- Testing/npm: Support `nodeunit` also in browser, via testing server
- Testing: All tests passing in Node, browser
- Testing: Upgrade tests per current DOM spec (no more `createEntityReference`) and `jsdom` behavior
- Testing: Temporarily avoid or provide workarounds for `jsdom` in testing (Needs attr. node added back and `createCDATASection`)
- Testing: Temporarily provide workaround for `xmldom` in testing (non-namespaced serialization)
- Schema: Provided tentative JSON Schema

## 0.8.0

- Actual Node support
- Add document, document type, notation, entity, attribute node support
- Add ordered attribute support
- New methods on jml: toJML(), toJMLString(), toHTML() (or toDOMString()), toXML() (or toXMLDOMString()), toDOM() (an alias for jml()).
- Added unit tests

## 0.7.0

- Support appending of attributes/properties and children to existing
DOM element
- Support style as object (with hyphenated or CamelCase keys)
- Append style string attributes rather than replacing

## 0.6.0

- Breaking change to allow `on`-prefixed event handlers to become
set as direct properties rather than through `addEventListener`. If
you need the latter, use the `$on` object syntax.
- Allow decimal character references to be supplied as numbers

## 0.5.0

- Number and boolean children converted to text nodes

## 0.4.0

- Better error reporting

## 0.3.0

- Support "defaultValue" property setting
