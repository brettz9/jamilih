/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../'),
    testCase = require('nodeunit').testCase;

if (typeof GLOBAL !== 'undefined') {
    GLOBAL.jsdom = require('jsdom').jsdom;
    GLOBAL.document = jsdom('');
    GLOBAL.window = document.defaultView;
    GLOBAL.DOMParser = window.DOMParser;
}

var divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
var html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
var divDOM = html.documentElement.querySelector('.test');

var xml = document.implementation.createDocument('', 'xml', null);

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
    /*
    // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
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
    */
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
        var content = 'CDATA <>&\'" content';
        var expected = ['![', content];
        if (!xml.createCDATASection) { // https://github.com/tmpvar/jsdom/issues/1642
            test.done();
            return;
        }
        test.expect(1);
        var result = jml.toJML(xml.createCDATASection(content));
        test.deepEqual(expected, result);
        test.done();
    },
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    // ============================================================================
    'entity reference': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['&', 'anEntity'];

        var result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    */
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

        // As per the above, we need to simulate an entity
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
