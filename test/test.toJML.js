describe('Jamilih - toJML', function () {
  beforeEach(() => {
    this.divJamilih = ['div', {
      class: 'test',
      xmlns: 'http://www.w3.org/1999/xhtml'
    }, ['someContent']];
    const html = new window.DOMParser().parseFromString(
      '<div class="test">someContent</div>', 'text/html'
    );
    this.divDOM = html.documentElement.querySelector('.test');

    this.divJamilihEmpty = ['div', {
      class: 'test',
      xmlns: 'http://www.w3.org/1999/xhtml'
    }];
    this.divDOMEmpty = this.divDOM.cloneNode(true);
    this.divDOMEmpty.textContent = '';
  });
  it('element with text content', () => {
    const expected = this.divJamilih;
    const result = jml.toJML(this.divDOM);
    assert.deepEqual(
      result,
      expected,
      'Builds Jamilih array for single element with attribute, ' +
        'namespace declaration, and text content'
    );
  });
  it('element with text content (as string)', () => {
    const expected = this.divJamilih;
    const result = jml.toJML('<div xmlns="http://www.w3.org/1999/xhtml" class="test">someContent</div>');
    assert.deepEqual(
      result,
      {$document: {
        childNodes: [
          ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [
            ['head'],
            ['body', [
              expected
            ]]
          ]]
        ]
      }},
      'Builds Jamilih array for single element with attribute, ' +
        'namespace declaration, and text content'
    );
  });
  it('attribute node (simulated)', () => {
    const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

    let expected = {$attribute: xlink};

    let result = jml.toJML({
      namespaceURI: 'http://www.w3.org/1999/xlink',
      name: 'href',
      value: 'http://example.com',
      nodeType: 2
    });
    assert.deepEqual(result, expected, 'Namespaced attribute node to Jamilih');

    expected = {$attribute: [
      null, 'href', 'http://example.com'
    ]};

    result = jml.toJML({
      namespaceURI: null,
      name: 'href',
      value: 'http://example.com',
      nodeType: 2
    });
    assert.deepEqual(result, expected, 'Non-namespaced attribute node to Jamilih');

    result = jml.toJML({
      namespaceURI: null,
      name: 'href',
      value: 'http://example.com',
      nodeType: undefined
    });
    assert.deepEqual(result, expected, 'Non-namespaced attribute node to Jamilih');
  });
  /*
  // Todo: Commenting out until https://github.com/jsdom/jsdom/issues/1641
  it('attribute node', () => {
    const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

    let expected = {$attribute: xlink};
    let att = document.createAttributeNS(...xlink.slice(0, -1));
    att.value = xlink.slice(-1);

    let result = jml.toJML(att);
    assert.deepEqual(result, expected, 'Namespaced attribute node to Jamilih');

    xlink[0] = null;
    expected = {$attribute: xlink};
    // eslint-disable-next-line compat/compat
    att = document.createAttribute(...xlink.slice(1, -1));
    att.value = xlink.slice(-1);

    result = jml.toJML(att);
    assert.deepEqual(result, expected, 'Non-namespaced attribute node to Jamilih');
  });
  */
  it('text node', () => {
    const expected = 'text node content';

    const result = jml.toJML(document.createTextNode(expected));
    assert.deepEqual(result, expected, 'Text node to Jamilih');
  });
  it('CDATA section', () => {
    const content = 'CDATA <>&\'" content';
    const expected = ['![', content];
    const xml = document.implementation.createDocument('', 'xml', null);
    const result = jml.toJML(xml.createCDATASection(content));
    assert.deepEqual(result, expected, 'CDATA to Jamilih');
  });
  it('Namespaced XML element', () => {
    const expected = {$document: {
      childNodes: [
        ['def', {
          xmlns: 'http://example.com'
        }, [
          ['ggg', {
            xmlns: null
          }]
        ]]
      ]
    }};
    const xml = document.implementation.createDocument('http://example.com', 'def', null);
    xml.documentElement.append(document.createElementNS(null, 'ggg'));
    const result = jml.toJML(xml);
    assert.deepEqual(result, expected, 'Namespaced XML Jamilih');
  });
  it('Prefixed namespaced XML element', () => {
    const expected = {$document: {
      childNodes: [
        ['abc:def', {
          'xmlns:abc': 'http://example.com'
        }]
      ]
    }};
    const xml = document.implementation.createDocument('http://example.com', 'abc:def', null);
    const result = jml.toJML(xml);
    assert.deepEqual(result, expected, 'Namespaced XML Jamilih');
  });
  it('Entity reference', function () {
    const expected = ['&', 'copy'];
    const result = jml.toJML({
      nodeType: 5,
      nodeName: 'copy'
    });
    assert.deepEqual(result, expected, 'CDATA to Jamilih');
  });
  it('processing instruction', () => {
    const expected = ['?', 'aTarget', 'a processing instruction'];

    const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
    assert.deepEqual(result, expected, 'Processing instruction to Jamilih');
  });
  it('comment', () => {
    const expected = ['!', 'a comment'];

    const result = jml.toJML(document.createComment('a comment'));
    assert.deepEqual(result, expected, 'Comment to Jamilih');
  });
  it('document', () => {
    const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
    const doc = document.implementation.createHTMLDocument('a title');
    const result = jml.toJML(doc);
    assert.deepEqual(result, expected, 'Document node to Jamilih');
  });
  it('document type', () => {
    const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

    const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
    assert.deepEqual(result, expected, 'Document type node to Jamilih');
  });
  it('document fragment', () => {
    const expected = {'#': [this.divJamilih]};
    const frag = document.createDocumentFragment();
    frag.append(this.divDOM.cloneNode(true));
    const result = jml.toJML(frag);
    assert.deepEqual(result, expected, 'Document fragment node to Jamilih');
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
    const badText = {
      nodeValue: '\u0000',
      nodeType: 3
    };
    try {
      jml.toJML(badText);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }
  });

  it('Bad comment', () => {
    const badComment = {
      nodeValue: '--',
      nodeType: 8
    };
    try {
      jml.toJML(badComment);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }
  });

  it('Bad document', () => {
    const badDoc = {
      childNodes: [],
      nodeType: 9
    };
    try {
      jml.toJML(badDoc);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }
  });

  it('Bad processing instructions', () => {
    let badProcInst = {
      target: 'xml',
      data: 'something',
      nodeType: 7
    };
    try {
      jml.toJML(badProcInst);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }

    badProcInst = {
      target: '?>',
      data: 'something',
      nodeType: 7
    };
    try {
      jml.toJML(badProcInst);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }

    badProcInst = {
      target: 'a:b',
      data: 'something',
      nodeType: 7
    };
    try {
      jml.toJML(badProcInst);
      assert.ok(false);
    } catch (err) {
      expect(err.name).to.equal('INVALID_STATE_ERR');
    }

    badProcInst = {
      target: 'ok',
      data: '?>',
      nodeType: 7
    };
    try {
      jml.toJML(badProcInst);
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

  it('Bad CDATA section', function () {
    const content = 'bad CDATA ]]> content';
    expect(() => {
      jml.toJML({
        nodeType: 4,
        nodeValue: content
      });
    }).to.throw(Error, 'CDATA cannot end with closing ]]>');
  });

  it('with config (`stripWhitespace`)', () => {
    let expected = '';
    let result = jml.toJML(document.createTextNode('    '), {
      stripWhitespace: true
    });
    assert.deepEqual(result, expected, 'Whitespace-stripped text node to Jamilih');

    expected = 'some text';
    result = jml.toJML(document.createTextNode(expected), {
      stripWhitespace: true
    });
    assert.deepEqual(result, expected, 'Not whitespace-only so unstripped text node to Jamilih');
  });
});
