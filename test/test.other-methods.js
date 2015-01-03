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
        var expected = '<BR/>'; // Todo: Fix jsdom/xmldom's XMLSerializer to give '<br xmlns="http://www.w3.org/1999/xhtml" />'
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
