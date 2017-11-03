/* globals jml, assert, XMLSerializer, Event */
/*
Todos:
0. Confirm working cross-browser (all browsers); fix IE8 with dataset; remove IE8 processing instruction hack?
0. Add test cases for properties: innerHTML, selected, checked, value, htmlFor, for
0. When CDATA XML-check added, add check for CDATA section in XML
0. Fix bug with IE 10 (but not IE 8) when testing $on events (race condition)
0. Harmonize with node unit tests (get Makefile of nodeunit to run so can run in browser)
*/
// Note: we always end styles in the tests with a semi-colon, as our standardizing Element.prototype.getAttribute() polyfill used internally will always add a semi-colon, but even modern browsers do not do this (nor are they required to do so) without the harmonizing polyfill (but to harmonize, such an approach is necessary since IE8 always drops the semi-colon with no apparent way to recover whether it was written with or without it); even though our polyfill could handle either case, by adding a semicolon at the end of even the last rule, we are at least ensuring the tests will remain valid in modern browsers regardless of whether the polyfill is present or not; we really should do the same in alphabetizing our properties as well, since our polyfill handles that (since IE has its own order not the same as document order or alphabetical), but modern browsers (at least Firefox) follow document order.

(function () {
'use strict';

// HELPERS
const $ = function (sel) {
    return document.querySelector(sel);
};
const isIE = window.navigator.appName === 'Microsoft Internet Explorer';

// BEGIN TESTS

const br = document.createElement('br');
br.className = 'a>bc';

assert.matchesXMLString(
    jml('input'),
    '<input xmlns="http://www.w3.org/1999/xhtml" />'
);
assert.matchesXMLString(
    jml('input', null),
    '<input xmlns="http://www.w3.org/1999/xhtml" />'
);

assert.matchesXMLString(
    jml('input', {type: 'password', id: 'my_pass'}),
    '<input xmlns="http://www.w3.org/1999/xhtml" id="my_pass" type="password" />'
);

assert.matchesXMLString(
    jml('div', [
        ['p', ['no attributes on the div']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><p>no attributes on the div</p></div>'
);

assert.matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        ['p', ['Some inner text']],
        ['p', ['another child paragraph']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass"><p>Some inner text</p><p>another child paragraph</p></div>'
);

assert.matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        'text1',
        ['p', ['Some inner text']],
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass">text1<p>Some inner text</p>text3</div>'
);

if (!document.body) {
    document.body = document.getElementsByTagName('body')[0];
}
/* const simpleAttachToParent = */
jml('hr', document.body);

assert.matchesXMLStringOnElement(
    document.getElementsByTagName('body')[0],
    '<hr xmlns="http://www.w3.org/1999/xhtml" />'
);

let table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body);
/* const firstTr = */
jml('tr', [
    ['td', ['row 1 cell 1']],
    ['td', ['row 1 cell 2']]
],
'tr', {className: 'anotherRowSibling'}, [
    ['td', ['row 2 cell 1']],
    ['td', ['row 2 cell 2']]
],
table);

assert.matchesXMLStringWithinElement(
    table,
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body); // Rebuild
const trsFragment = jml('tr', [
    ['td', ['row 1 cell 1']],
    ['td', ['row 1 cell 2']]
],
'tr', {className: 'anotherRowSibling'}, [
    ['td', ['row 2 cell 1']],
    ['td', ['row 2 cell 2']]
],
null);

const ser = new XMLSerializer();
ser.$overrideNative = true;

const parent = document.body;

assert.matches(parent, jml(parent));

const div = jml(
    'div', {style: 'position:absolute    !important; left:   -1000px;'}, [
        $('#DOMChildrenMustBeInArray')
    ],
    $('#anotherElementToAddToParent'),
    $('#yetAnotherSiblingToAddToParent'),
    parent
);

assert.matchesXMLString(
    div,
    '<div xmlns="http://www.w3.org/1999/xhtml" style="left: -1000px; position: absolute !important;"><div id="DOMChildrenMustBeInArray" style="display: none;">test1</div></div>'
    // '<div xmlns="http://www.w3.org/1999/xhtml" style="position: absolute; left: -1000px;"><div id="DOMChildrenMustBeInArray" style="display:none;">test1</div></div><div id="anotherElementToAddToParent" style="display:none;">test2</div><div id="yetAnotherSiblingToAddToParent" style="display:none;">test3</div>'
);
// throw '';

assert.matches(
    ser.serializeToString(trsFragment.childNodes[0]) +
    ser.serializeToString(trsFragment.childNodes[1]),
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

assert.matchesXMLString(
    jml('div', [
        'text0',
        {'#': ['text1', ['span', ['inner text']], 'text2']},
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>'
);

// Allow the following form (fragment INSTEAD of child array rather than the fragment as the only argument of a child array)? If so, add to README as well.
/*
assert.matchesXMLString(
    jml('div',
        {'#': ['text1', ['span', ['inner text']], 'text2']}
    ),
    '<div xmlns="http://www.w3.org/1999/xhtml">text1<span>inner text</span>text2</div>'
);
*/

assert.matchesXMLString(
    jml('div', {dataset: {'abcDefGh': 'fff', 'jkl-mno-pq': 'ggg'}}),
    '<div xmlns="http://www.w3.org/1999/xhtml" data-abc-def-gh="fff" data-jkl-mno-pq="ggg"></div>'
);

assert.matchesXMLString(
    jml('div', {style: {'float': 'left', 'border-color': 'red'}}, ['test']),
    '<div xmlns="http://www.w3.org/1999/xhtml" style="border-color: red; float: left;">test</div>'
);

let str;
const input = jml('input', {
    type: 'button',
    style: 'position:absolute; left: -1000px;',
    $on: {click: [function () {
        str = 'worked1';
    }, true]}
}, document.body);
input.click(); // IE won't activate unless the above element is appended to the DOM

assert.matches(str, 'worked1');

const input2 = jml('input', {
    style: 'position:absolute; left: -1000px;',
    $on: {
        click: function () {
            str = 'worked3';
        },
        change: [function () {
            str = 'worked2';
        }, true]
    }
}, document.body); // For focus (or select) event to work, we need to append to the document

if (input2.fireEvent) {
    input2.fireEvent('onchange');
} else {
    const event = new Event('change');
    input2.dispatchEvent(event);
}
assert.matches(str, 'worked2');

input2.click();
assert.matches(str, 'worked3');

assert.matchesXMLString(
    jml('div', [
        ['!', 'a comment'],
        ['?', 'customPI', 'a processing instruction'],
        ['&', 'copy'],
        ['#', '1234'],
        ['#x', 'ab3'],
        ['![', '&test <CDATA> content']
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><!--a comment--' +
    '><' +
    // Any way to overcome the IE problem with pseudo-processing instructions?
    (isIE ? '!--' : '') +
    '?customPI a processing instruction?' +
    (isIE ? '--' : '') +
    '>\u00A9\u04D2\u0AB3&amp;test &lt;CDATA&gt; content</div>'
);

assert.matches(
    jml('abc', {xmlns: 'def'}).namespaceURI,
    'def'
);

assert.matchesXMLString(
    jml('abc', {z: 3, xmlns: {'prefix3': 'zzz', 'prefix1': 'def', 'prefix2': 'ghi'}, b: 7, a: 6}),
    '<abc xmlns="http://www.w3.org/1999/xhtml" xmlns:prefix1="def" xmlns:prefix2="ghi" xmlns:prefix3="zzz" a="6" b="7" z="3" />'
);

assert.matchesXMLString(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}),
    '<abc xmlns="newdefault" xmlns:prefix1="def" xmlns:prefix2="ghi" />'
);

assert.matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}).namespaceURI,
    'newdefault'
);
/*
// lookupNamespaceURI(prefix) is not working in Mozilla, so we test this way
assert.matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}}, [
        {$: {prefix2: ['prefixedElement']}}
    ]).firstChild.namespaceURI,
    ''
);
*/

assert.matchesXMLString(
    jml('ul', [
        [
            'li', {'style': 'color:red;'}, ['First Item'],
            'li', {
                'title': 'Some hover text.',
                'style': 'color:green;'
            },
            ['Second Item'],
            'li', [
                ['span',
                    {
                        'class': 'Remove-Me',
                        'style': 'font-weight:bold;'
                    },
                    ['Not Filtered']
                ],
                ' Item'
            ],
            'li', [
                ['a',
                    {
                        'href': '#NewWindow'
                    },
                    ['Special Link']
                ]
            ],
            null
        ]
    ], document.body),
    '<ul xmlns="http://www.w3.org/1999/xhtml"><li style="color: red;">First Item</li><li style="color: green;" title="Some hover text.">Second Item</li><li><span class="Remove-Me" style="font-weight: bold;">Not Filtered</span> Item</li><li><a href="#NewWindow">Special Link</a></li></ul>'
);

assert.matchesXMLString(
    jml('style', {id: 'myStyle'}, ['p.test {color:red;}'], document.body),
    '<style xmlns="http://www.w3.org/1999/xhtml" id="myStyle">p.test {color:red;}</style>'
);

jml('p', {'class': 'test'}, ['test'], document.body);

assert.matchesXMLString(
    jml('div', {dataset: {'aCamel-case': {result: 'hello', result2: 'helloTwo'}, 'anotherResult': 'world', 'aNullishToIgnore': null, aNum: 8}}),
    '<div xmlns="http://www.w3.org/1999/xhtml" data-a-camel-case-result="hello" data-a-camel-case-result2="helloTwo" data-a-num="8" data-another-result="world"></div>'
);

assert.matchesXMLString(
    jml('script', {'class': 'test'}, ['console.log("hello!");'], document.body),
    '<script xmlns="http://www.w3.org/1999/xhtml" class="test">console.log("hello!");</script>'
);

const [myMap, elem] = jml.weak({
    localVar: 'localValue',
    myMethod (arg1, elem) {
        return arg1 + ' ' + this.localVar + ' ' + elem.querySelector('input').value;
    }
}, 'div', {id: 'mapTest'}, [
    ['input', {value: '100', $on: {
        input () {
            assert.matches(
                myMap.invoke(this.parentNode, 'myMethod', 'internal test'),
                'internal test localValue 1001'
            );
        }
    }}],
    ['div', {id: 'clickArea', $data: {
        localVariable: 8,
        test (arg1, el) {
            assert.matches(
                arg1 + ' ' + el.id + this.localVariable,
                'arg1 clickArea8'
            );
        }
    }, $on: {
        click () {
            myMap.invoke(this, 'test', 'arg1');
        }
    }}]
], document.body);
assert.matches(
    myMap.invoke(elem, 'myMethod', 'external test'),
    'external test localValue 100'
);
const mapInput = $('#mapTest').firstElementChild;
mapInput.value = '1001';
mapInput.dispatchEvent(
    new Event('input')
);
const mapDiv = $('#clickArea');
mapDiv.dispatchEvent(new Event('click'));

const weakMap1 = new WeakMap();
const weakMap2 = new WeakMap();
const testObj1 = {test: 5};
const testObj2 = {test: 7};
const el = jml({$map: [weakMap1, testObj1]}, 'div', {id: 'mapAttributeTest'}, [
    ['input', {id: 'input1', $data: true}, ['Test']],
    ['input', {id: 'input2', $data: [weakMap2, testObj2]}],
    ['input', {id: 'input3', $data: weakMap1}],
    ['input', {id: 'input4', $data: testObj2}],
    ['input', {id: 'input5', $data: [, testObj1]}], // eslint-disable-line no-sparse-arrays
    ['input', {id: 'input6', $data: [weakMap1]}]
], document.body);
assert.matches(
    weakMap1.get(el),
    testObj1
);
assert.matches(
    weakMap1.get($('#input1')),
    testObj1
);
assert.matches(
    weakMap2.get($('#input2')),
    testObj2
);
assert.matches(
    weakMap1.get($('#input3')),
    testObj1
);
assert.matches(
    weakMap1.get($('#input4')),
    testObj2
);
assert.matches(
    weakMap1.get($('#input5')),
    testObj1
);
assert.matches(
    weakMap1.get($('#input6')),
    testObj1
);

// Todo: Add tests for array of map strings

const privateSym = Symbol('Test symbol');
jml('div', [
    ['input', {id: 'symInput1', $symbol: ['publicForSym1', function (arg1) {
        assert.matches(
            this.id + ' ' + arg1,
            'symInput1 arg1'
        );
    }]}],
    ['div', {id: 'divSymbolTest', $on: {
        click () {
            // Can supply element or selector
            jml.sym(this.previousElementSibling, 'publicForSym1')('arg1');
            jml.sym($('#symInput2'), privateSym)('arg2');
            jml.sym('#symInput3', privateSym).test('arg3');
        }
    }}],
    ['input', {id: 'symInput2', $symbol: [privateSym, (arg1) => {
        // No `this` available as using arrow function, but would give element
        assert.matches(
            arg1,
            'arg2'
        );
    }]}],
    ['input', {id: 'symInput3', $symbol: [privateSym, {
        localValue: 5,
        test (arg1) {
            assert.matches(
                this.localValue,
                5
            );
            assert.matches(
                this.elem.id + ' ' + arg1,
                'symInput3 arg3'
            );
        }
    }]}]
], document.body);

$('#symInput1')[Symbol.for('publicForSym1')]('arg1');
jml.sym($('#symInput1'), 'publicForSym1')('arg1');
jml.sym('#symInput1', 'publicForSym1')('arg1');

$('#symInput2')[privateSym]('arg2');

$('#symInput3')[privateSym].test('arg3');
jml.sym('#symInput3', privateSym).test('arg3');
$('#divSymbolTest').dispatchEvent(new Event('click'));
//
}());
