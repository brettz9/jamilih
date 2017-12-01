/* globals require, global */

import jml from '../jml-es6.js';

if (typeof global !== 'undefined') {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
    global.document = window.document;
    global.Event = window.Event;
    global.window = document.defaultView;
    global.DOMParser = window.DOMParser;
    global.Node = window.Node;
    global.XMLSerializer = jml.getXMLSerializer();
}

// const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
// const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
// const divDOM = html.documentElement.querySelector('.test');

const testCase = {
    // ============================================================================
    'jml.toJMLString()': function (test) {
    // ============================================================================
        test.expect(1);
        const br = document.createElement('br');
        const expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
        const result = jml.toJMLString(br);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toHTML()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = '<br>';
        const result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toXML()': function (test) {
    // ============================================================================
        test.expect(1);
        // Todo: Fix xmldom's XMLSerializer (or wait for jsdom version) to give same result as browser
        const expected = '<br xmlns="http://www.w3.org/1999/xhtml" />';
        const result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOM()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml('br');
        const result = jml.toDOM('br');
        test.deepEqual(expected.nodeName, result.nodeName);
        test.done();
    },
    // ============================================================================
    'jml.toXMLDOMString()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml.toXMLDOMString('br');
        const result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOMString()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml.toDOMString('br');
        const result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    }
};
export default testCase;
