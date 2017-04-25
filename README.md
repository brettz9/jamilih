[![Build Status](https://img.shields.io/travis/brettz9/jamilih.svg)](https://travis-ci.org/brettz9/jamilih)
[![Dependencies](https://img.shields.io/david/brettz9/jamilih.svg)](https://david-dm.org/brettz9/jamilih)
[![devDependencies](https://img.shields.io/david/dev/brettz9/jamilih.svg)](https://david-dm.org/brettz9/jamilih?type=dev)
[![npm](http://img.shields.io/npm/v/jamilih.svg)](https://www.npmjs.com/package/jamilih)
[![Bower](http://img.shields.io/bower/v/jamilih.svg)](http://bower.io/search/?q=jamilih)
[![License](https://img.shields.io/npm/l/jamilih.svg)](LICENSE-MIT.txt)

# Jamilih

If you are seeking an even lighter version (e.g., for inclusion in a
stand-alone library) while still getting some benefits of the
syntax-highlighter-friendly pure JS approach for DOM construction,
see [Jamilih Lite](https://gist.github.com/brettz9/ac4c18f51c0af8003a41).

# Separation of concerns

For templating,
`separation_of_concerns !== separation_of_syntaxes`!
One can very legitimately build HTML DOM using Jamilih as with any other
JavaScript function and maintain separation of concerns. Just because
the syntax is JavaScript does not mean it
isn't suitable for building structural and styling design logic. On
the contrary, it provides flexibility for designers to utilize their
own JavaScript (and/or your own custom template functions) as long as
the designer can maintain the discipline to avoid adding business
logic. (A future "JSON mode" should allow more security but less control.)

# Some advantages/Uses

- Templates with the full expressive power of JavaScript (Why start in
HTML when you will probably need JavaScript anyways and why use a
template language with significant additional learning time overhead
for those already familiar with HTML and JavaScript?)
- Syntax highlighting out of the box (unlike embedded string-based templates)
- Could restrict to JSON for declarative but easily parseable templates

# Overview

The following functions are available:

- `jml()` - For building DOM objects (and optionally appending into
an existing DOM node). Arguments demoed and explained below.
- `jml.toJML(objOrString, config)` - For converting HTML in DOM or string form into
a JML JavaScript/JSON object. Its first argument is the DOM object or string to
convert into JML. `config` is an object and which supports a `stringOutput` property
which can be set to `true` in order to JSON-stringify the converted
Jamilih JSON object. Note that element results will be in array form.
- `jml.toJMLString(objOrString, config)` - Works like `jml.toJML` but stringifies the resulting Jamilih object.
- `jml.toHTML()` - Works like jml() except that the resulting DOM object is converted into an HTML string.
- `jml.toXML()` - Works like jml() except that the resulting DOM object is converted into an XML-serialized string.
- `jml.toDOM()` - An alias for jml().
- `jml.toDOMString()` - An alias for `jml.toHTML()` (for parity with `toJMLString`).
- `jml.toXMLDOMString()` - An alias for `jml.toXML()` (for parity with `toJMLString`).

# Browser usage

Simply access the above methods via the global `jml` function.

# Node installation and usage

```
npm install jamilih
```

```
var jml = require('jamilih');
```

# Examples

Simple element...

```javascript
var input = jml('input');
```

Simple element with attributes...

```javascript
var input = jml('input', {type:'password', id:'my_pass'});
```

Simple element with just child elements...

```javascript
var div = jml('div', [
    ['p', ['no attributes on the div']]
]);
```

Simple element with attributes and child elements...

```javascript
var div = jml('div', {'class': 'myClass'}, [
    ['p', ['Some inner text']],
    ['p', ['another child paragraph']]
]);
```

Simple element with attributes, child elements, and text nodes...

```javascript
var div = jml('div', {'class': 'myClass'}, [
    'text1',
    ['p', ['Some inner text']],
    'text3'
]);
```

DOM attachment...

```javascript
var simpleAttachToParent = jml('hr', document.body);
```

Returning first element among siblings when appending them to a
DOM element (API unstable)...

```javascript
var firstTr = jml('tr', [
        ['td', ['row 1 cell 1']],
        ['td', ['row 1 cell 2']]
    ],
    'tr', {className: 'anotherRowSibling'}, [
        ['td', ['row 2 cell 1']],
        ['td', ['row 2 cell 2']]
    ],
    table
);
```

Returning element siblings as an array (API unstable)...

```javascript
var trsFragment = jml('tr', [
        ['td', ['row 1 cell 1']],
        ['td', ['row 1 cell 2']]
    ],
    'tr', {className: 'anotherRowSibling'}, [
        ['td', ['row 2 cell 1']],
        ['td', ['row 2 cell 2']]
    ],
    null
);
```

Inclusion of regular DOM elements...

```javascript
var div = jml(
    'div', [
        $('#DOMChildrenMustBeInArray')[0]
    ],
    $('#anotherElementToAddToParent')[0],
    $('#yetAnotherSiblingToAddToParent')[0],
    parent
);
```

Document fragments addable anywhere within child elements...

```javascript
jml('div', [
    'text0',
    {'#': ['text1', ['span', ['inner text']], 'text2']},
    'text3'
])
```

Event attachment...

```javascript
var input = jml('input', {
    // Contains events to be added via addEventListener or
    //   attachEvent where available
    $on: {
        click: [function () {
            alert('worked1');
        }
    }, true] // Capturing
}});
```

```javascript
var input2 = jml('input', {
    style: 'position:absolute; left: -1000px;',
    $on: {
        click: function () {
            alert('worked2');
        },
        focus: [function () {
            alert('worked3');
        }, true]
    }
}, document.body);
```

Comments, processing instructions, entities, decimal and hexadecimal
character references, CDATA sections...

```javascript
var div = jml('div', [
    ['!', 'a comment'],
    ['?', 'customPI', 'a processing instruction'],
    ['&', 'copy'],
    ['#', '1234'],
    ['#x', 'ab3'],
    ['![', '&test <CDATA> content']
]);
```

Namespace definitions (default or prefixed)...

```javascript
jml('abc', {xmlns:'def'})
```

```javascript
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}})
```

```javascript
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}})
```

# Rules (summary)

1. String element name (or array of 1-4)
2. Optional object with attributes
3. Optional array of DOM nodes, strings/numbers/booleans for
text nodes, and arrays encapsulating elements (repeat step no. 1)
4. Optionally repeat for siblings

# Rules (detailed)

1. Currently, the first item supplied to `jml()` must be either:
    1. An element name as a string (to create an element
    structure). (Top-level fragments are not currently supported
    without using `null` as the last argument.)
    1. Any of the following special characters:
        1. `!` followed by a string to create a comment
        1. `&` followed by an HTML entity reference (e.g., `copy`)
        1. `#` followed by a decimal character reference as a string or number, e.g., `1234`
        1. `#x` followed by a hexadecimal character reference as a string, e.g., `ab3`
        1. `?` followed by a processing instruction target string and string value (XML)
        1. `'![` followed by CDATA content as a string (XML), e.g., `&test <CDATA> content`
    1. An object with:
        1. A property `#` indicating a document fragment; see array children below for allowable contents of this array.
        1. A property `$text` set to a string to create a bare text node (this is only necessary if one wishes jml()
        to return a sole text node; otherwise, text nodes are created with simple strings belonging to an element's
        children array).
        1. A property `$a` set to an array of attribute name-value arrays (this is only necessary if one requires
        and the environment allows a fixed attribute order but may not support first-declared-first-iterated
        for-in object iteration).
        1. A property `$document` set to an object with properties `childNodes` and, where present, a child object `xmlDeclaration` with properties `version`, `encoding`, and `standAlone`. In place of `childNodes`, one may
        instead add to any of the array properties, `head` and `body`. One may also add a string `title` property in which case, a `<head>` will be automatically created, with a `<meta charset="utf-8"/>` element (as expected by HTML5) and a `<title>` element, and any additionally supplied `head` array items appended to that `<head>`. If `head`,
        `body`, or `title` are supplied, an empty "html" DOCTYPE will be auto-created (as expected by HTML5) as well as an
        `<html>` element with the XHTML namespace. If `head` is supplied, a `<meta charset="utf-8">` will also be added as
        the first child of `<head>`.
        1. A property `$DOCTYPE` object with properties `name`, and, where present, `entities` and `notations` arrays and `publicId` and `systemId` (`internalSubset` is not currently supported in `jml()`).
        1. The following items which produce nodes deprecated by the latest DOM spec:
            1. A property `$attribute` set to an array of a namespace, name, and value (for a namespaced attribute node) or a two-item name-value array for a non-namespaced attribute node.
            1. A property `$NOTATION` set to an object with properties `name`, `publicId`, and `systemId`.
            1. A property `$ENTITY` set to an object with the properties `name` (or `version` and `encoding` for an external parsed entity with a declaration present) and `publicId`, `systemId`, or `childNodes` where present.
1. Subsequent strings at the top level create elements siblings (note,
however that this is less flexible for templating).
1. Non-DOM-element objects (if present, to immediately follow
element names) optionally follow and indicate attribute-value pairs
    1. "Magic" keys in this object alter the default behavior of simply setting an attribute:
        1. `$on` expects a subject of event types mapped to a function or to an array
        with the first element as a function and the second element as a boolean
        indicating whether to capture or not.
        1. The following booleans are set as properties (`selected`, `checked`, `defaultSelected`, `defaultChecked`, `readonly`, `disabled`, `indeterminate`), making them useful in templates
            as they can be set with a variable, and if falsey (including `undefined`), they will be unset (rather than
             would be the case with `setAttribute` which would always set them if present).
         1. The following are also set as properties: `class`, `for`, `innerHTML`, `value`, `defaultValue`, `style`
        1. `className` and `htmlFor` are also provided to avoid the need for quoting the reserved keywords `class` and `for`.
        1. `on` followed by any string will be set as a property (for events).
        1. `xmlns` for namespace declarations (not needed in HTML)
        1. `dataset` is an object whose keys are hyphenated or camel-cased properties used to set the dataset property (note that no polyfill for older browsers is provided out of the box)
1. Arrays indicate children.
    1. They can be:
        1. DOM Nodes
        1. Strings, numbers, or booleans (to become text nodes)
        1. Arrays encapsulating another Jamilih structure (start rule
        processing over at no. 1)
        1. An object with the key `#` with an array of children (following
        these same rules) as its value to represent a fragment. (Useful
        if embedding the return result of a function amidst other children.)
        1. Note: Adding a function inline (without being part of an attribute
        object) or `null` is currently undefined behavior and should not be used;
        these may be allowed for some other purpose in the future, however.
    1. Individual elements (DOM elements or sequences of
    string/number/boolean[/object/array]) get added to parent first-in, first-added
1. The last item supplied to `jml()` is usually the parent node to which to
append the contents, with the following exceptions:
    1. If there are no other elements (i.e., only an element name with
    optional attributes and children), the element is returned.
    1. `null` (at the end) will cause an element or fragment to be returned
1. The first created element will be returned unless `null` is the last
argument, in which case, it returns a fragment of all added elements or,
if only one element was present, the element itself.

# Schema

A tentative [JSON Schema](http://json-schema.org/) is available [here](jamilih.jsonschema).

# Design Rationale

Provide round-trippable JSON/JavaScript serialization as with JsonML,
but with all items at a given array level being the same type of item
(unless marked with a deeper level of nesting) and with a slightly more
template-friendly capacity to inline insert fragments or child nodes
(e.g., as by function return).

# Naming

I originally named the project JML (for JavaScript or Json Markup
Language) and have still kept the abbreviation when used as a global
in a browser (and in the filename and examples), but as other projects
have used the name or similar ones, I am renaming the project to
"Jamilih" for the Arabic word meaning "Beauty". It is named in honor
of the Arabic name of my family's newly-born daughter.

# Design goals

1. Be as succinct as possible while being sufficiently functional; avoid
null place-holders, etc.
2. Allow reliable iteration order (i.e., use arrays over objects except
where order is not needed).
3. Allow for use as a template language, with the opportunity for
function calls to easily add elements, attributes, child content, or
fragments without needing to retool the entire structure or write
complex functions to handle the merging.
4. Use a syntax with a minimum of constructs not familiar to XML/HTML
users (if any), allowing for near immediate adoption by any web developer.
5. Work with XML or HTML and optionally support faithful rebuilding of an
entire XML document
6. Ability to write libraries which support regular XML needs like XPath
expressions (which are more appropriate for HTML than those targeted
for open-ended JSON, such as JSONPath). Avoid need to convert to
DOM where possible (and even implement DOM interfaces for it in a
modular fashion).
7. Work with JSON, but also allow flexible usage within full JavaScript,
such as to allow dropping in DOM nodes or optional DOM mode for
attachment of events (but with a preference or option toward internal
string concatenation for speed).
8. Be intuitive so that one is not likely to be confused about whether
one is looking at element siblings, children, text, etc.

# Related work

The only work which comes close to meeting these goals as far as I
have been able to find is JsonML. JsonML even does a better job of
goal #1 in terms of succinctness than my proposal for Jamilih
(except that Jamilih can represent empty elements more succinctly). However,
for goal #3, I believe Jamilih is slightly more flexible for regular usage
in templates, and to my personal sensibilities, more clear in goal #8
(and with a plan for goal #5 and #7?).

# Todos

1. Namespaced elements and attributes and XML options
1. JSON Schema todos
    1. Specify types of allowable properties on attributes object in JSON Schema.
    1. Allow for fragments and other out-of-place objects
    1. Get working with JSONEditor
1. See todos within code.
1. Migrate `tests` folder into nodeunit `test` folder
1. Ensure setting of `select` `value` can take place *after* the options are added

# Possible todos

1. Implement a method building JML by string rather than DOM but create
DOM (including [XPath](https://github.com/goto100/xpath/blob/master/xpath.js))
interfaces for direct manipulation.
1. Allow configuration
    1. Allow auto-namespacing of class and/or dataset keys
1. Allow DOM element as first item (for cloning or allowing style of
appending (as in jQuery) that does not place the parent as the
last item?); probably best as latter with method to clone.
