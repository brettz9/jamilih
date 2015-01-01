/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../jml'),
    testCase = require('nodeunit').testCase,
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer,
    jsdom = require('jsdom').jsdom;

var xml = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');

var document = jsdom('');
var window = document.parentWindow;

module.exports = testCase({

    // ============================================================================
    'element with text content': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
        var result = jml.toJML(xml.documentElement);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'text node': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = 'text node content';

        var result = jml.toJML(document.createTextNode(expected));
        test.deepEqual(expected, result);
        test.done();
    }
});

}());
