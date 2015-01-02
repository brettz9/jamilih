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

module.exports = testCase({

    // ============================================================================
    'element with text content': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = divJamilih;
        var result = jml.toJML(divDOM);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'attribute node': function(test) {
    // ============================================================================
        test.expect(2);
        var xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        var expected = {$attribute: xlink};
        var att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        var result = jml.toJML(att);
        test.deepEqual(expected, result);
        
        xlink[0] = null;
        expected = {$attribute: xlink};
        att = document.createAttribute.apply(document, xlink.slice(1, -1));
        att.value = xlink.slice(-1);

        result = jml.toJML(att);
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
    },
    // ============================================================================
    'CDATA section': function(test) {
    // ============================================================================
        test.expect(1);
        var content = 'CDATA <>&\'" content';
        var expected = ['![', content];

        var result = jml.toJML(document.createCDATASection(content));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'entity reference': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['&', 'anEntity'];

        var result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'processing instruction': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['?', 'aTarget', 'a processing instruction'];

        var result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'comment': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['!', 'a comment'];

        var result = jml.toJML(document.createComment('a comment'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document fragment': function (test) {
    // ============================================================================
        var expected = {'#': [divJamilih]};
        var frag = document.createDocumentFragment();
        frag.appendChild(divDOM.cloneNode(true));
        var result = jml.toJML(frag);
        test.deepEqual(expected, result);
        test.done();
    }
});

}());
