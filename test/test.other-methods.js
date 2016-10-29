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
    // ============================================================================
    'jml.toJMLString()': function(test) {
    // ============================================================================
        test.expect(1);
        var br = document.createElement('br');
        var expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
        var result = jml.toJMLString(br);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toHTML()': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = '<br>';
        var result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toXML()': function(test) {
    // ============================================================================
        test.expect(1);
        // Todo: Fix xmldom's XMLSerializer (or wait for jsdom version) to give same result as browser
        var expected = typeof process !== 'undefined' ? '<BR/>' : '<br xmlns="http://www.w3.org/1999/xhtml" />';
        var result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOM()': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = jml('br');
        var result = jml.toDOM('br');
        test.deepEqual(expected.nodeName, result.nodeName);
        test.done();
    },
    // ============================================================================
    'jml.toXMLDOMString()': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = jml.toXMLDOMString('br');
        var result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOMString()': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = jml.toDOMString('br');
        var result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    }
});

}());
