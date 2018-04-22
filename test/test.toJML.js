/* globals jml */

const testCase = {
    setUp (callback) {
        this.divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
        const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
        this.divDOM = html.documentElement.querySelector('.test');
        callback();
    },
    'element with text content' (test) {
        test.expect(1);
        const expected = this.divJamilih;
        const result = jml.toJML(this.divDOM);
        test.deepEqual(
            expected,
            result,
            'Builds Jamilih array for single element with attribute, namespace declaration, and text content'
        );
        test.done();
    },
    /*
    // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
    'attribute node' (test) {
        test.expect(2);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        let expected = {$attribute: xlink};
        let att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        let result = jml.toJML(att);
        test.deepEqual(expected, result, 'Namespaced attribute node to Jamilih');

        xlink[0] = null;
        expected = {$attribute: xlink};
        att = document.createAttribute.apply(document, xlink.slice(1, -1));
        att.value = xlink.slice(-1);

        result = jml.toJML(att);
        test.deepEqual(expected, result, 'Non-namespaced attribute node to Jamilih');

        test.done();
    },
    */
    'text node' (test) {
        test.expect(1);
        const expected = 'text node content';

        const result = jml.toJML(document.createTextNode(expected));
        test.deepEqual(expected, result, 'Text node to Jamilih');
        test.done();
    },
    'CDATA section' (test) {
        const content = 'CDATA <>&\'" content';
        const expected = ['![', content];
        test.expect(1);
        const xml = document.implementation.createDocument('', 'xml', null);
        const result = jml.toJML(xml.createCDATASection(content));
        test.deepEqual(expected, result, 'CDATA to Jamilih');
        test.done();
    },
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    'entity reference' (test) {
        test.expect(1);
        const expected = ['&', 'anEntity'];

        const result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    */
    'entity' (test) {
        test.expect(1);
        const expected = {$ENTITY: {name: 'copy', childNodes: ['\u00a9']}};

        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        const doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        const result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need to simulate an entity
        const result = jml.toJML({nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00a9'}]});

        test.deepEqual(expected, result, '(Simulated) entity to Jamilih');
        test.done();
    },
    'processing instruction' (test) {
        test.expect(1);
        const expected = ['?', 'aTarget', 'a processing instruction'];

        const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        test.deepEqual(expected, result, 'Processing instruction to Jamilih');
        test.done();
    },
    'comment' (test) {
        test.expect(1);
        const expected = ['!', 'a comment'];

        const result = jml.toJML(document.createComment('a comment'));
        test.deepEqual(expected, result, 'Comment to Jamilih');
        test.done();
    },
    'document' (test) {
        test.expect(1);
        const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        const doc = document.implementation.createHTMLDocument('a title');
        const result = jml.toJML(doc);
        test.deepEqual(expected, result, 'Document node to Jamilih');
        test.done();
    },
    'document type' (test) {
        test.expect(1);
        const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        test.deepEqual(expected, result, 'Document type node to Jamilih');
        test.done();
    },
    'document fragment' (test) {
        test.expect(1);
        const expected = {'#': [this.divJamilih]};
        const frag = document.createDocumentFragment();
        frag.appendChild(this.divDOM.cloneNode(true));
        const result = jml.toJML(frag);
        test.deepEqual(expected, result, 'Document fragment node to Jamilih');
        test.done();
    }
};
export default testCase;
