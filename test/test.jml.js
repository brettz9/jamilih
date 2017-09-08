/* globals require, module, global */
(function () {
'use strict';

const jml = require('../');
const testCase = require('nodeunit').testCase;

if (typeof global !== 'undefined') {
    global.XMLSerializer = require('xmldom').XMLSerializer;
    const jsdom = global.jsdom = require('jsdom').jsdom;
    global.document = jsdom('');
    global.window = document.defaultView;
    global.DOMParser = window.DOMParser;
    global.Node = window.Node;
}

// const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
// const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
// const divDOM = html.documentElement.querySelector('.test');

module.exports = testCase({
    // Todo: Add more tests (and harmonize with browser tests)

    // ============================================================================
    'text node': function (test) {
    // ============================================================================
        test.expect(2);
        const expected = document.createTextNode('abc');
        const result = jml({$text: 'abc'});
        test.deepEqual(expected.nodeType, result.nodeType);
        test.deepEqual(expected.nodeValue, result.nodeValue);
        test.done();
    },
    // ============================================================================
    'attribute node': function (test) {
    // ============================================================================
        test.expect(3);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];
        const expected = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        expected.value = xlink[2];
        const result = jml({$attribute: xlink});
        test.deepEqual(expected.name, result.name);
        test.deepEqual(expected.value, result.value);
        test.deepEqual(expected.namespaceURI, result.namespaceURI);
        // test.strictEqual(result.nodeType, Node.ATTRIBUTE_NODE); // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
        test.done();
    }
});
}());
