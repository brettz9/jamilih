/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../'),
    testCase = require('nodeunit').testCase;

if (typeof GLOBAL !== 'undefined') {
    GLOBAL.XMLSerializer = require('xmldom').XMLSerializer;
    GLOBAL.jsdom = require('jsdom').jsdom;
    GLOBAL.document = jsdom('');
    GLOBAL.window = document.defaultView;
    GLOBAL.DOMParser = window.DOMParser;
    GLOBAL.Node = window.Node;
}

var divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
var html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
var divDOM = html.documentElement.querySelector('.test');

module.exports = testCase({
    // Todo: Add more tests (and harmonize with browser tests)

    // ============================================================================
    'text node': function(test) {
    // ============================================================================
        test.expect(2);
        var expected = document.createTextNode('abc');
        var result = jml({$text: 'abc'});
        test.deepEqual(expected.nodeType, result.nodeType);
        test.deepEqual(expected.nodeValue, result.nodeValue);
        test.done();
    },
    // ============================================================================
    'attribute node': function(test) {
    // ============================================================================
        test.expect(3);
        var xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];
        var expected = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        expected.value = xlink[2];
        var result = jml({$attribute: xlink});
        test.deepEqual(expected.name, result.name);
        test.deepEqual(expected.value, result.value);
        test.deepEqual(expected.namespaceURI, result.namespaceURI);
        // test.strictEqual(result.nodeType, Node.ATTRIBUTE_NODE); // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
        test.done();
    }
});

}());
