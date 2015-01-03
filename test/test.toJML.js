/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../jml'),
    testCase = require('nodeunit').testCase,
    DOMParser = require('xmldom').DOMParser,
    // XMLSerializer = require('xmldom').XMLSerializer,
    jsdom = require('jsdom').jsdom;

var xml = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
var divDOM = xml.documentElement; // This polyfill apparently mistakenly avoids putting the document into a full HTML document (with body)

var divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];

var document = jsdom('');
// var window = document.parentWindow;

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
    'entity': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = {$ENTITY: {name: 'copy', childNodes: ['\u00a9']}};
        
        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        var doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        var result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need simulate an entity
        var result = jml.toJML({nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00a9'}]});
        
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
    'document': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        var doc = document.implementation.createHTMLDocument('a title');
        var result = jml.toJML(doc);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document type': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        var result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document fragment': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = {'#': [divJamilih]};
        var frag = document.createDocumentFragment();
        frag.appendChild(divDOM.cloneNode(true));
        var result = jml.toJML(frag);
        test.deepEqual(expected, result);
        test.done();
    }
});

}());
