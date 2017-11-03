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
