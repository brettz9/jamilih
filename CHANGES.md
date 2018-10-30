# 0.43.0

- Enhancement: Add `@babel/polyfill` dependency
- jsonchema: Add some attributes and other node types
- Linting (Markdown): Fix linting format
- npm: Update to Babel 7; update other devDeps and jsdom dep

# 0.42.0

- Fix: Properly escape processing instructions (LGTM-inspired)
- Refactoring: Remove unused function in demo, avoid passing extra arg (LGTM-inspired)
- Linting (LGTM): Add lgtm.yml exclusions of bundles

# 0.41.0

- Fix: Set charset attribute on `meta`
- Enhancement: Allow `$DOCTYPE` shorthand

# 0.40.2

- Fix: Call `createDocumentType` with empty strings for empty `systemId`
    or `publicId`
- Testing: Undo adding `XMLSerializer` to browser environment (ok if we
    create the document type correctly)

# 0.40.1

- Fix: Allow for falsey or string "undefined" `publicId`/`systemId`
- Refactoring: Use `includes` for strings and arrays in `XMLSerializer`
    polyfill
- Testing: Add document test; add `XMLSerializer` to browser environment
    for consistency for Firefox

# 0.40.0

- Fix: Undo logging
- Fix: `$document` to handle non-array arguments and properly set node
- Testing: Add `$document`/`$DOCTYPE` creation test

# 0.39.0

- Enhancement: Export `body` for `document.body` (frequently
    targeted for appending)
- Testing: Avoid Firefox-specific exception for password input
    attribute serialization order (now passing)

# 0.38.1

- Security fix: Bump versions as part of npm security audit
- Fix: Ensure `nbsp` exported in Node as well
- npm: Update devDeps

# 0.38.0

- Enhancement: Add `nbsp` as export (for another very frequently needed template item)

# 0.37.0

- Breaking change: Remove `yarn.lock`

# 0.36.0

- Deprecated: Default ES6 export deprecated over new named export
- Enhancement: Add `$` and `$$` utilities for `querySelector`/`querySelectorAll`.

# 0.35.0

- Enhancement: Support no-innerHTML ES6 Module dist file
- npm: Update devDeps

# 0.34.0

- npm: Update deps (jsdom), devDeps; fixes security vulnerability
- Testing: Add opn-cli

# 0.33.1

- Fix: Move `dir`, `lang`, and `title` to nullables

# 0.33.0

- Enhancement: Add global `HTMLElement` DOM-settable properties (for
    `undefined` to have no effect)
- Build: Add `nodeType` existence check (avoiding strict warnings)
- npm: Update devDeps
- Testing: Fix test to exclude attribute nodes (depends still on jsdom fixing)

# 0.32.0

- Fix: `browser` and `module` not pointing to updated file names
- Docs: Fix paths in docs
- Enhancement: Add "es" dist file
- npm: Fix browser-test script

# 0.31.0

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

# 0.30.0

- Enhancement: Support plugins

# 0.29.1

- Fix: npmignore

# 0.29.0

- Build: Add yarn
- npm: Remove babel-env
- npm: Update dev deps

# 0.28.0

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

# 0.27.0

- Fix: Actually add plugin apparently insisted on by Babel

# 0.26.0

- Fix: Add plugins apparently insisted on by Babel

# 0.25.0

- Fix: Add plugins apparently insisted on by babel-env

# 0.24.0

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

# 0.23.0

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

# 0.22.1

- Fix: For jml-es6.js file, avoid error if `opts.$map` doesn't exist!

# 0.22.0

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

# 0.21.0

- For jml-es6.js file, add `jml.weak`, `jml.strong`, `jml.Map`,
    and `jml.WeakMap` for easier association of elements to
    `Map` or `WeakMap` maps.

# 0.20.0

- For jml-es6.js file, `dataset` recursive objects fixed
    to always repeat prefix when other properties on same sub-object

# 0.19.0

- For jml-es6.js file, `dataset` recursive objects now support non-string
    primitive values (with null/undefined ignoring)

# 0.18.0

- For jml-es6.js file, support recursive objects under `dataset`.

# 0.17.0

- Refactoring: Add jml-es6.js file for ES6 module support
- Linting: ESLint ES6 module file and tests
- npm: Add ESLint script
- Testing: Serve proper content-types in test server
- Testing: Use ES6 modules in HTML tests and demo file
- Testing: Simplify suite running API

# 0.16.0

- Add `lang` to `NULLABLE` att group

# 0.15.0

- Add `pattern` to DOM properties
- Add new internal group `NON_NULL` for attributes that if set to `null`
    or `undefined`, they will not be set at all (useful for templates
    that can use the ternary operator to avoid setting)
- Add `max`, `min` to `NON_NULL` att group

# 0.14.0

- Avoid having nully dataset value set `dataset`, `class`/`className`,
    `style`, `for`/`htmlFor`, `innerHTML`, and `$on` handlers (as
    setting by DOM alone sets it to the string "undefined" or "null").

# 0.13.1

- Fix `readOnly` in map and bool check

# 0.13.0

- Add ATTR_MAP (inspired by JsonML): Only `readOnly`->`readonly` for now
- Add ATTR_DOM (inspired by JsonML): Attributes to be set in DOM along
    with booleans (Uses attributes in JsonML)
- Add 'disabled', 'readonly', 'indeterminate' to boolean attributes
- Refactoring: Define BOOL_ATTS (paralleling JsonML) for our boolean attributes
- Test refactoring (minor): Dummy favicon placeholders in test files for avoiding logs
- Test refactoring (minor): Switch from `GLOBAL` to `global` in tests
- npm: Update deps

# 0.12.0
- Add `defaultChecked` and `defaultSelected` support as properties

# 0.11.1
- npm: apply correct branch!

# 0.11.0
- npm: Upgrade jsdom version
- Demo: Fix
- Testing: Unskip `createCDATASection` test for `jsdom` now that implemented

# 0.10.5
- Bower: Shrink description as per npm

# 0.10.4
- npm: Shrink description to fit limit

# 0.10.3
- Rename MIT license file to LICENSE-MIT.txt

# 0.10.2
- Docs: Fix license text displayed
- Travis: Add dependencies status to README

# 0.10.1 (skipped 0.10.0)
- npm: Update dependencies
- Travis: Add support and display build status
- Testing: Workaround` nodeunit` in browser issue

# 0.9.0
- npm: Lint, add scripts for browser/Node testing
- npm: Rely on latest `jsdom` rather than my now outdated fork
- Refactoring: Avoid `DOMParser` from `xmldom` since `jsdom` supports (still need its `XMLSerializer` however)
- Testing/npm: Support `nodeunit` also in browser, via testing server
- Testing: All tests passing in Node, browser
- Testing: Upgrade tests per current DOM spec (no more `createEntityReference`) and `jsdom` behavior
- Testing: Temporarily avoid or provide workarounds for `jsdom` in testing (Needs attr. node added back and `createCDATASection`)
- Testing: Temporarily provide workaround for `xmldom` in testing (non-namespaced serialization)
- Schema: Provided tentative JSON Schema

# 0.8.0
- Actual Node support
- Add document, document type, notation, entity, attribute node support
- Add ordered attribute support
- New methods on jml: toJML(), toJMLString(), toHTML() (or toDOMString()), toXML() (or toXMLDOMString()), toDOM() (an alias for jml()).
- Added unit tests

# 0.7.0
- Support appending of attributes/properties and children to existing
DOM element
- Support style as object (with hyphenated or CamelCase keys)
- Append style string attributes rather than replacing

# 0.6.0
- Breaking change to allow `on`-prefixed event handlers to become
set as direct properties rather than through `addEventListener`. If
you need the latter, use the `$on` object syntax.
- Allow decimal character references to be supplied as numbers

# 0.5.0
- Number and boolean children converted to text nodes

# 0.4.0
- Better error reporting

# 0.3.0
- Support "defaultValue" property setting
