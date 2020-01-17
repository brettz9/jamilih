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

  it('bad types', () => {
    expect(() => {
      jml.toJML({});
    }).to.throw(TypeError, 'Not an XML type', 'Not a node type');
    expect(() => {
      jml.toJML({nodeType: 100});
    }).to.throw(TypeError, 'Not an XML type', 'Not a valid node type');
    expect(() => {
      jml.toJML({nodeType: 6});
    }).to.throw(TypeError, 'Not an XML type', 'Entities no longer part of DOM');
    expect(() => {
      jml.toJML({nodeType: 12});
    }).to.throw(TypeError, 'Not an XML type', 'Notations no longer part of DOM');
  });

  it('Bad text node', () => {
    const badElement = {
      nodeValue: '\u0000',
      nodeType: 3
    };
    try {
      jml.toJML(badElement);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }
  });

  it('bad document type', () => {
    let badDoctype = {
      publicId: '\u0000',
      nodeType: 10
    };
    try {
      jml.toJML(badDoctype);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }

    badDoctype = {
      systemId: `ab'"`,
      nodeType: 10
    };
    try {
      jml.toJML(badDoctype);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }
  });
});
