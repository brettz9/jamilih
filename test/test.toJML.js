describe('Jamilih - toJML', function () {
    beforeEach(() => {
        this.divJamilih = ['div', {
            class: 'test',
            xmlns: 'http://www.w3.org/1999/xhtml'
        }, ['someContent']];
        const html = new DOMParser().parseFromString(
            '<div class="test">someContent</div>', 'text/html'
        );
        this.divDOM = html.documentElement.querySelector('.test');
    });
    it('element with text content', () => {
        const expected = this.divJamilih;
        const result = jml.toJML(this.divDOM);
        assert.deepEqual(
            expected,
            result,
            'Builds Jamilih array for single element with attribute, ' +
                'namespace declaration, and text content'
        );
    });
    /*
    // Todo: Commenting out until https://github.com/jsdom/jsdom/issues/1641
    it('attribute node', () => {
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        let expected = {$attribute: xlink};
        let att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        let result = jml.toJML(att);
        assert.deepEqual(expected, result, 'Namespaced attribute node to Jamilih');

        xlink[0] = null;
        expected = {$attribute: xlink};
        att = document.createAttribute.apply(document, xlink.slice(1, -1));
        att.value = xlink.slice(-1);

        result = jml.toJML(att);
        assert.deepEqual(expected, result, 'Non-namespaced attribute node to Jamilih');
    });
    */
    it('text node', () => {
        const expected = 'text node content';

        const result = jml.toJML(document.createTextNode(expected));
        assert.deepEqual(expected, result, 'Text node to Jamilih');
    });
    it('CDATA section', () => {
        const content = 'CDATA <>&\'" content';
        const expected = ['![', content];
        const xml = document.implementation.createDocument('', 'xml', null);
        const result = jml.toJML(xml.createCDATASection(content));
        assert.deepEqual(expected, result, 'CDATA to Jamilih');
    });
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    it('entity reference', () => {
        const expected = ['&', 'anEntity'];

        const result = jml.toJML(document.createEntityReference('anEntity'));
        assert.deepEqual(expected, result);
    });
    */
    it('entity', () => {
        const expected = {$ENTITY: {name: 'copy', childNodes: ['\u00A9']}};

        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        const doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        const result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need to simulate an entity
        const result = jml.toJML({
            nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00A9'}]
        });

        assert.deepEqual(expected, result, '(Simulated) entity to Jamilih');
    });
    it('processing instruction', () => {
        const expected = ['?', 'aTarget', 'a processing instruction'];

        const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        assert.deepEqual(expected, result, 'Processing instruction to Jamilih');
    });
    it('comment', () => {
        const expected = ['!', 'a comment'];

        const result = jml.toJML(document.createComment('a comment'));
        assert.deepEqual(expected, result, 'Comment to Jamilih');
    });
    it('document', () => {
        const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        const doc = document.implementation.createHTMLDocument('a title');
        const result = jml.toJML(doc);
        assert.deepEqual(expected, result, 'Document node to Jamilih');
    });
    it('document type', () => {
        const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        assert.deepEqual(expected, result, 'Document type node to Jamilih');
    });
    it('document fragment', () => {
        const expected = {'#': [this.divJamilih]};
        const frag = document.createDocumentFragment();
        frag.append(this.divDOM.cloneNode(true));
        const result = jml.toJML(frag);
        assert.deepEqual(expected, result, 'Document fragment node to Jamilih');
    });
});
