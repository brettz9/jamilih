/* globals jml */

import * as xmlTesting from './xmlTesting.js';
const $ = (sel) => { return document.querySelector(sel); };

const testCase = {
    'jml.toJMLString()' (test) {
        test.expect(1);
        const br = document.createElement('br');
        const expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
        const result = jml.toJMLString(br);
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toHTML()' (test) {
        test.expect(1);
        const expected = '<br>';
        const result = jml.toHTML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toXML()' (test) {
        test.expect(1);
        const expected = '<br xmlns="http://www.w3.org/1999/xhtml" />';
        const result = jml.toXML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toDOM()' (test) {
        test.expect(1);
        const expected = jml('br');
        const result = jml.toDOM('br');
        test.deepEqual(expected.nodeName, result.nodeName, '`nodeName` equal');
        test.done();
    },
    'jml.toXMLDOMString()' (test) {
        test.expect(1);
        const expected = jml.toXMLDOMString('br');
        const result = jml.toXML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toDOMString()' (test) {
        test.expect(1);
        const expected = jml.toDOMString('br');
        const result = jml.toHTML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.weak()' (test) {
        xmlTesting.init(test, 0);

        const [myMap, elem] = jml.weak({
            localVar: 'localValue',
            myMethod (elem, arg1) {
                return arg1 + ' ' + this.localVar + ' ' + elem.querySelector('input').value;
            }
        }, 'div', {id: 'mapTest'}, [
            ['input', {value: '100', $on: {
                input () {
                    xmlTesting.matches(
                        myMap.invoke(this.parentNode, 'myMethod', 'internal test'),
                        'internal test localValue 1001',
                        'JamilihWeakMap `invoke` method with arguments and `this`'
                    );
                }
            }}],
            ['div', {id: 'clickArea', $data: {
                localVariable: 8,
                test (el, arg1) {
                    xmlTesting.matches(
                        arg1 + ' ' + el.id + this.localVariable,
                        'arg1 clickArea8',
                        'Attached JamilihWeakMap $data method invoked by click listener with arguments and `this`'
                    );
                }
            }, $on: {
                click () {
                    myMap.invoke(this, 'test', 'arg1');
                }
            }}]
        ], $('body'));
        xmlTesting.matches(
            myMap.invoke(elem, 'myMethod', 'external test'),
            'external test localValue 100',
            'Externally invoke JamilihWeakMap `invoke` method with arguments and `this`'
        );
        xmlTesting.matches(
            myMap.get('#mapTest').localVar, // Test overridden `get` accepting selectors also
            'localValue',
            'Externally retrieve JamilihWeakMap-associated element by selector'
        );

        const mapInput = $('#mapTest').firstElementChild;
        mapInput.value = '1001';
        mapInput.dispatchEvent(
            new Event('input')
        );
        const mapDiv = $('#clickArea');
        mapDiv.dispatchEvent(new Event('click'));
        test.done();
    }
};
export default testCase;
