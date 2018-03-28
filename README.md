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

Note that it is our intent to move the XML-specific features into a new file.

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
- `jml.toJMLString(objOrString, config)` - Works like `jml.toJML` but
    stringifies the resulting Jamilih object.
- `jml.toHTML()` - Works like `jml()` except that the resulting DOM
    object is converted into an HTML string.
- `jml.toXML()` - Works like `jml()` except that the resulting DOM object
    is converted into an XML-serialized string.
- `jml.toDOM()` - An alias for `jml()`.
- `jml.toDOMString()` - An alias for `jml.toHTML()` (for parity with `toJMLString`).
- `jml.toXMLDOMString()` - An alias for `jml.toXML()` (for parity with `toJMLString`).
- `jml.weak(obj, ...args)` - Returns a two-item array with the first item as a new `jml.WeakMap` object
    on which an association is made between `obj` and a Jamilih element created out of passing
    `args` to `jml()` and the second item is the new Jamilih elemnet  
- `jml.strong(obj, ...args)` - Same as `jml.weak` but creates a new `jml.Map` object instead of a `jml.WeakMap`.
- `jml.WeakMap()` - a `WeakMap` subclass with an `invoke` method that should be passed a DOM element
    (such as one created by `jml` or `jml.weak()`), the name of a method to invoke (on an object
    previously associated with the supplied element (e.g., via `jml.weak()`)), and any number of
    optional arguments to be supplied to that method. The user method will have its `this` value
    set to that of the previously associated object and in addition to accepting the arguments
    supplied to `invoke`, it will have the element itself supplied as the first argument. This
    class also has its `get` and `set` methods enhanced to accept a string selector to represent the
    element used to find the associated object.
- `jml.Map()` - Same as `jml.WeakMap` but is a subclass of `Map` instead.

# Browser setup (Global)

```html
<script src="node_modules/jamilih/jml.js"></script>
```

```js
jml(...);
```

# Browser setup (ES6 Modules)

```js
import jml from './node_modules/jamilih/jml-es6.js';
```

# Node installation and usage

```
npm install jamilih
```

```
const jml = require('jamilih');
```

Note that while we check for preexisting globals (`window`, `document`, and `XMLSerializer`),
we attempt to maintain modularity by not injecting our own global. If you want to
import Jamilih and then operate on the same `window`, etc. that we create, use the methods,
`getWindow`, `getDocument`, and `getXMLSerizlier`. There are also corresponding setters.

# Examples

Simple element...

```js
const input = jml('input');
```

Simple element with attributes...

```js
const input = jml('input', {type:'password', id:'my_pass'});
```

Simple element with just child elements...

```js
const div = jml('div', [
    ['p', ['no attributes on the div']]
]);
```

Simple element with attributes and child elements...

```js
const div = jml('div', {'class': 'myClass'}, [
    ['p', ['Some inner text']],
    ['p', ['another child paragraph']]
]);
```

Simple element with attributes, child elements, and text nodes...

```js
const div = jml('div', {'class': 'myClass'}, [
    'text1',
    ['p', ['Some inner text']],
    'text3'
]);
```

DOM attachment...

```js
const simpleAttachToParent = jml('hr', document.body);
```

Returning first element among siblings when appending them to a
DOM element (API unstable)...

```js
const firstTr = jml('tr', [
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

```js
const trsFragment = jml('tr', [
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

```js
const div = jml(
    'div', [
        $('#DOMChildrenMustBeInArray')[0]
    ],
    $('#anotherElementToAddToParent')[0],
    $('#yetAnotherSiblingToAddToParent')[0],
    parent
);
```

Document fragments addable anywhere within child elements...

```js
jml('div', [
    'text0',
    {'#': ['text1', ['span', ['inner text']], 'text2']},
    'text3'
])
```

Event attachment...

```js
const input = jml('input', {
    // Contains events to be added via addEventListener or
    //   attachEvent where available
    $on: {
        click: [function () {
            alert('worked1');
        }
    }, true] // Capturing
}});
```

```js
const input2 = jml('input', {
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

The events attached via `$on` are added through `addEventListener`.

Comments, processing instructions, entities, decimal and hexadecimal
character references, CDATA sections...

Note that the last three types, relying as they do on `innerHTML`,
will not work properly in the `innerHTML` build (they will use
`textContent` instead).

```js
const div = jml('div', [
    ['!', 'a comment'],
    ['?', 'customPI', 'a processing instruction'],
    ['![', '&test <CDATA> content'],
    ['&', 'copy'],
    ['#', '1234'],
    ['#x', 'ab3']
]);
```

Namespace definitions (default or prefixed)...

```js
jml('abc', {xmlns:'def'})
```

```js
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}})
```

```js
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}})
```

## Shadow DOM

The `$shadow` property can be added to an element to attach Shadow DOM content.
(Note: This is not currently supported in jsdom or
[certain browsers](https://caniuse.com/#feat=shadowdomv1).)

Its allowable properties include:

- *open* - Optional boolean on whether the attachment is open or not. Defaults to `true`. May also be set in place of `content` (with the same allowable values) to serve as the shadow DOM contents.
- *closed* - Optional boolean alternative to `open`. Defaults to `false`. May also be used (as with `open`) to directly build the contents (see `open`).
- *content* - If `template` is not present, this optional array of arguments will be passed as fragment contents to `jml()` for direct attachment to the shadow root of this element. May also be set to a string or DOM element in which case, it is passed to `jml()` as the first argument (the element or element name).
- *template* - `template` may optionally be present to indicate a template for cloning. If `template` is a string selector or a DOM `<template>` element, the indicated element will be cloned and added as the shadow root contents. If `template` is an array, its contents will be passed to `jml()` for first creating a `<template>` element, and then it will be appended to the document body, and then it will be cloned for use with the shadow DOM. If the first (or only) item in the array is a regular object, these will become the attributes of the `<template>` element while the subsequent item in the array will be passed as the template children. If the first item is not a regular object, the whole array will be assumed to represent the `<template>` children (without attributes).

```js
jml('div', {
    id: 'myElem',
    $shadow: {
        open: true, // Default (can also use `closed`)
        template: [
            {id: 'myTemplate'},
            [
                ['style', [`
                    :host {color: red;}
                    ::slotted(p) {color: blue;}
                `]],
                ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
                ['h2', ['Heading level 2']],
                ['slot', ['DEFAULT CONTENT HERE']]
            ]
        ]
    }
}, [
    ['h1', {slot: 'h'}, ['Heading level 1']],
    ['p', ['Other content']]
], document.body);

jml('div', {
    id: 'myElem',
    $shadow: {
        content: [ // Could also define as `open: []`
            ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
            `]],
            ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
            ['h2', ['Heading level 2']],
            ['slot', ['DEFAULT CONTENT HERE']]
        ]
    }
}, [
    ['h1', {slot: 'h'}, ['Heading level 1']],
    ['p', ['Other content']]
], document.body);
```

## Symbols

One may attach functions or objects to elements via a `$symbol` attribute
which accepts a two-item array, with the first item either being a string
to be used with `Symbol.for()` or a `Symbol` instance, and the second
item being the function or object. If a function is supplied, its `this`
will be set to the element on which the symbol was added, while if an
object is supplied, its `this` will remain as the object itself, but an
`elem` property will be added to the object which can be used to get the
element on which the symbol was added. If you do not wish to add such a
reference, consider using a symbol with `$custom`.

```js
jml('input', {
    id: 'symInput1',
    $symbol: ['publicForSym1', function (arg1) {
        console.log(
            (this.id + ' ' + arg1) === 'symInput1 arg1'
        );
    }]
}, document.body)

// Then elsewhere get and use the symbol function for the DOM object
$('#symInput1')[Symbol.for('publicForSym1')]('arg1');

// Or using the `jml.sym` utility (accepting selector or
//    DOM element as first argument):
jml.sym($('#symInput1'), 'publicForSym1')('arg1');
jml.sym('#symInput1', 'publicForSym1')('arg1');
```

Or using an example with a (private) `Symbol` instance and
an object instead of a function:

```js
const privateSym = Symbol('a private symbol');
jml('input', {id: 'symInput3', $symbol: [privateSym, {
    localValue: 5,
    test (arg1) {
        console.log(this.localValue === 5);
        console.log(
            (this.elem.id + ' ' + arg1) === 'symInput3 arg3'
        );
    }
}]}, document.body);

// Obtaining the element with symbol or using the utility:
$('#symInput3')[privateSym].test('arg3');
jml.sym('#symInput3', privateSym).test('arg3');
```

Symbol attachment is particularly convenient for templates where you
wish to keep a lot of inline children (avoiding defining the children
separately, adding the symbol to the variables, and then reassembling them
together) and without the overhead of defining a custom element.

```js
jml('div', [
    ['input', {id: 'symInput1', $symbol: ['publicForSym1', function (arg1) {
        console.log(
            (this.id + ' ' + arg1) === 'symInput1 arg1'
        );
    }]}],
    ['div', {id: 'divSymbolTest', $on: {
        click () {
            // Can supply element or selector
            jml.sym(this.previousElementSibling, 'publicForSym1')('arg1');
            jml.sym('#symInput3', privateSym).test('arg3');

            // Or use symbols directly:
            this.previousElementSibling[Symbol.for('publicForSym1')]('arg1');
        }
    }}],
    ['input', {id: 'symInput3', $symbol: [privateSym, {
        localValue: 5,
        test (arg1) {
            console.log(this.localValue === 5);
            console.log(
                (this.elem.id + ' ' + arg1) === 'symInput3 arg3'
            );
        }
    }]}]
], document.body);
```

## Custom addition of DOM properties

For attachment of custom properties (or setting of standard properties) to an element, supply
an object with the desired properties (including symbols) to `$custom`.

The advantage of this approach is that one doesn't need to manage symbols, maps, or define elements,
and the `this` works as expected to refer to the element (including the other properties on the
object which will also be added to the element instance), but one disadvantage is that the
properties (like methods) will be added to each instance of the element rather than to a prototype.
(In such a case, you can extend, the relevant `HTMLElement` interface like `HTMLAnchorElement`.)

```js
const mySelect = jml('select', {
    id: 'mySelect',
    $custom: {
        test () {
            return this.id;
        },
        test2 () {
            return this.test();
        }
    }
}, document.body);
console.log(mySelect.test() === 'mySelect');
console.log(mySelect.test2() === 'mySelect');
```

Another disadvantage of the above is that the methods/object properties
could also conflict with future standard ones of the same name added
to the built-in element. While our example does not do so, you might
therefore wish to protect consumers of your methods from naming that
could conflict with future standard names. Per [this comment](https://github.com/w3c/webcomponents/issues/700#issuecomment-342973055),
a safe option would be to merely add `$` in front of the custom method
names or properties (e.g., it would become `$test` and `$test2` in
the example). Another advantage of doing so is that consumers can easily
discern which methods are standard (and thus can be queried online) and
which are specific to your API.

## Maps

While symbols are somewhat more convenient to use, you may wish to
associate elements with any number of `Map` or `WeakMap` instances
and take advantage of those objects' methods (or our enhanced
version of these methods `jml.Map` and `jml.WeakMap`).

(TODO: Adapt examples from [tests](tests/jml-test.js))

## Custom elements

(Note: This is not currently supported in jsdom or
[certain browsers](https://caniuse.com/#feat=custom-elementsv1).)

While there is some extra overhead to creating a custom element (in
terms of performance at registering an element and for the need to
give a unique name), among other benefits, custom elements allow
its methods to have `this` not only reference the element, but also
to call other custom methods on the element in the same manner (unlike
the approach we use with maps and symbols).

You have a number of options.

You may supply an object to have its prototype copied (onto
an empty `HTMLElement`-extending constructor):

```js
const myEl = jml('my-el', {
    id: 'myEl',
    $define: {
        test () {
            return this.id;
        }
    }
}, document.body);
console.log(myEl.test() === 'myEl');
```

You may supply a (plain) function to be used within a `HTMLElement`-extending
constructor (it will be executed after a call to the dynamically-created class'
`super`):

```js
let constructorSetVar2;
jml('my-el2', {
    id: 'myEl2',
    $define: function () {
        constructorSetVar2 = this.id;
    }
}, document.body);
console.log(constructorSetVar2 === 'myEl2');
```

You may supply a class (though it must extend `HTMLElement` and invoke `super()` as
per [(autonomous) custom element requirements](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)).
It may be an inline class expression or a reference to a class declaration.

```js
let constructorSetVar3;
jml('my-el3', {
    id: 'myEl3',
    $define: class extends HTMLElement {
        constructor () {
            super();
            constructorSetVar3 = this.id;
        }
    }
}, document.body);
console.log(constructorSetVar3 === 'myEl3');
```

You may supply a two-element array with the function (or class) and prototype methods.

```js
let constructorSetVar4;
const myel4 = jml('my-el4', {
    id: 'myEl4',
    $define: [function () {
        constructorSetVar4 = this.id;
    }, {
        test () {
            console.log(this.id === 'myEl4');
        },
        test2 () {
            this.test();
        }
    }]
}, document.body);
console.log(constructorSetVar4 === 'myEl4');
myel4.test();
myel4.test2();
```

## Plugins

Plugins may be supplied within an array passed on an object as the first
argument to Jamilih. Plugins must contain both a `name` and `set` property
and the name must begin with `$_`. When used within jamilih, the value
for the plugin property can be set to a string, an object, or whatever
you prefer.

```js
const options = {$plugins: [
    {
        name: '$_myplugin',
        set ({element, attribute: {name, value}}) {
            // Add code here to modify the element
            // element.setAttribute(name, value);
            if (value.blueAndRed) {
                element.style.color = 'blue';
                element.style.backgroundColor = 'red';
            }
        }
    }
]};
jml(options, 'div', {id: 'myDiv', $_myplugin: {
    blueAndRed: true
}}, document.body);

// If reusing, you may wish to bind the options
const j = jml.bind(null, options);

// Then you can reuse without needing to resupply the
//    options (including its plugins)
j('div', {id: 'myDiv', $_myplugin: {
    blueAndRed: true
}}, document.body);
```

For a list of plugins, see [docs/PLUGINS.md](./docs/PLUGINS.md).

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
        1. A property `#` indicating a document fragment; see array children below for allowable
            contents of this array.
        1. A property `$text` set to a string to create a bare text node (this is only necessary if
            one wishes jml()
            to return a sole text node; otherwise, text nodes are created with simple strings belonging to an element's
            children array).
        1. A property beginning with `$` has a special purpose and if it begins with `$_`,
            it is a plugin.
        1. A property `$a` set to an array of attribute name-value arrays (this is only necessary if
            one requires
            and the environment allows a fixed attribute order but may not support
            first-declared-first-iterated
            for-in object iteration).
        1. A property `$document` set to an object with properties `childNodes` and, where present, a
            child object `xmlDeclaration` with properties `version`, `encoding`, and `standAlone`. In place of `childNodes`, one may
            instead add to any of the array properties, `head` and `body`. One may also add a string `title` property in which case, a `<head>` will be automatically created, with a `<meta charset="utf-8"/>` element (as expected by HTML5) and a `<title>` element, and any additionally supplied `head` array items appended to that `<head>`. If `head`,
            `body`, or `title` are supplied, an empty "html" DOCTYPE will be auto-created (as expected by HTML5) as well as an
            `<html>` element with the XHTML namespace. If `head` is supplied, a `<meta charset="utf-8">` will also be added as
            the first child of `<head>`.
        1. A property `$DOCTYPE` object with properties `name`, and, where present, `entities` and
            `notations` arrays and `publicId` and `systemId` (`internalSubset` is not currently supported in `jml()`).
        1. The following items which produce nodes deprecated by the latest DOM spec:
            1. A property `$attribute` set to an array of a namespace, name, and value (for a
                namespaced attribute node) or a two-item name-value array for a non-namespaced attribute node.
            1. A property `$NOTATION` set to an object with properties `name`, `publicId`, and
                `systemId`.
            1. A property `$ENTITY` set to an object with the properties `name` (or `version` and
                `encoding` for an external parsed entity with a declaration present) and `publicId`, `systemId`, or `childNodes` where present.
1. Subsequent strings at the top level create elements siblings (note,
    however that this is less flexible for templating).
1. Non-DOM-element objects (if present, to immediately follow
    element names) optionally follow and indicate attribute-value pairs
    1. "Magic" keys in this object alter the default behavior of simply setting an attribute:
        1. `$on` expects a subject of event types mapped to a function or to an array
            with the first element as a function and the second element as a boolean
            indicating whether to capture or not.
        1. The following booleans are set as properties (`selected`, `checked`, `defaultSelected`,
            `defaultChecked`, `readonly`, `disabled`, `indeterminate`), making them useful in
            templates as they can be set with a variable, and if falsey (including `undefined`),
            they will be unset (rather than would be the case with `setAttribute` which would
            always set them if present).
         1. The following are also set as properties: `class`, `for`, `innerHTML`, `value`,
            `defaultValue`, `style` (Note that `innerHTML` won't work on the
            "no innerHTML" build.)
        1. `className` and `htmlFor` are also provided to avoid the need for quoting the reserved   
            keywords `class` and `for`.
        1. `on` followed by any string will be set as a property (for events).
        1. `xmlns` for namespace declarations (not needed in HTML)
            1. `dataset` is a (nestable) object whose keys are hyphenated or camel-cased properties used to set the dataset property (note that no polyfill for older browsers is provided out of the box)
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

# To-dos

1. Add `jml.join(jmlStringArrayOrElement, glue)` (e.g., to intersperse with nbsp)
1. Document binding DOM to `Map`/`WeakMap` Templates to define and invoke
    functions/objects tied to an element
1. Allow `$symbol` to accept array of arrays for attaching multiple symbols
    to an element
1. JSON Schema todos
    1. Specify types of allowable properties on attributes object in JSON Schema.
    1. Allow for fragments and other out-of-place objects
    1. Get working with JSONEditor
1. See "todo"'s within code.
1. Ensure setting of `select` `value` can take place *after* the options are added
1. Plugins: Move any current functionality out into default-included plugins and
    make this repository a collection of plugins and a separate core to be moved
    elsewhere?
1. Try to append children to their parent immediately (before attribute/property
    processing code is run) so plug-ins (like `i18nizeElement`) can rely on the
    immediate ancestor context.

# Possible todos

1. Namespaced elements and attributes and XML options (but move to own file
    along with other XML-specific features)
1. Implement a method building JML by string rather than DOM but create
    DOM (including [XPath](https://github.com/goto100/xpath/blob/master/xpath.js))
    interfaces for direct manipulation.
1. Allow configuration
    1. Allow auto-namespacing of class and/or dataset keys
1. Allow DOM element as first item (for cloning or allowing style of
    appending (as in jQuery) that does not place the parent as the
    last item?); probably best as latter with method to clone.
