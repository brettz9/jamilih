/* globals require, module, global */
(function () {
'use strict';

const jml = require('../');
const testCase = require('nodeunit').testCase;

if (typeof global !== 'undefined') {
    const jsdom = global.jsdom = require('jsdom').jsdom;
    global.document = jsdom('');
    global.window = document.defaultView;
    global.DOMParser = window.DOMParser;
}

const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
const divDOM = html.documentElement.querySelector('.test');

const xml = document.implementation.createDocument('', 'xml', null);

module.exports = testCase({

    // ============================================================================
    'element with text content': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = divJamilih;
        const result = jml.toJML(divDOM);
        test.deepEqual(expected, result);
        test.done();
    },
    /*
    // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
    // ============================================================================
    'attribute node': function(test) {
    // ============================================================================
        test.expect(2);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        const expected = {$attribute: xlink};
        const att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        const result = jml.toJML(att);
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
    'text node': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = 'text node content';

        const result = jml.toJML(document.createTextNode(expected));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'CDATA section': function (test) {
    // ============================================================================
        const content = 'CDATA <>&\'" content';
        const expected = ['![', content];
        test.expect(1);
        const result = jml.toJML(xml.createCDATASection(content));
        test.deepEqual(expected, result);
        test.done();
    },
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    // ============================================================================
    'entity reference': function(test) {
    // ============================================================================
        test.expect(1);
        const expected = ['&', 'anEntity'];

        const result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    */
    // ============================================================================
    'entity': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$ENTITY: {name: 'copy', childNodes: ['\u00a9']}};

        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        const doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        const result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need to simulate an entity
        const result = jml.toJML({nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00a9'}]});

        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'processing instruction': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = ['?', 'aTarget', 'a processing instruction'];

        const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'comment': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = ['!', 'a comment'];

        const result = jml.toJML(document.createComment('a comment'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        const doc = document.implementation.createHTMLDocument('a title');
        const result = jml.toJML(doc);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document type': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document fragment': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {'#': [divJamilih]};
        const frag = document.createDocumentFragment();
        frag.appendChild(divDOM.cloneNode(true));
        const result = jml.toJML(frag);
        test.deepEqual(expected, result);
        test.done();
    }
});
}());
