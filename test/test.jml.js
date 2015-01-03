/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../jml'),
    testCase = require('nodeunit').testCase,
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer,
    jsdom = require('jsdom').jsdom;

var xml = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
var divDOM = xml.documentElement; // This polyfill apparently mistakenly avoids putting the document into a full HTML document (with body)

var divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];

var document = jsdom('');
var window = document.parentWindow;
var Node = window.Node;

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
        test.expect(4);
        var xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];
        var expected = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        expected.value = xlink[2];
        var result = jml({$attribute: xlink});
        test.deepEqual(expected.name, result.name);
        test.deepEqual(expected.value, result.value);
        test.deepEqual(expected.namespaceURI, result.namespaceURI);
        test.strictEqual(result.nodeType, Node.ATTRIBUTE_NODE);
        test.done();
    }
});

}());
