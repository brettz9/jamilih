/* eslint-disable sonarjs/assertions-in-tests -- Ok here */
/*
Todos:
0. Confirm working cross-browser (all browsers); remove IE8 processing instruction hack?
0. When CDATA XML-check added, add check for CDATA section in XML
0. Fix bug with IE 10 (but not IE 8) when testing $on events (race condition)
*/

// eslint-disable-next-line no-shadow -- Necessary
import {it, describe, beforeEach} from 'mocha';

import {expect, assert} from 'chai';

import {$, jml, body} from '../test-helpers/loadTests.js';

import * as xmlTesting from './xmlTesting.js';

import getInterpolator from '../plugins/getInterpolator.js';

/**
 * @typedef {any} BadArgument
 */

describe('Jamilih - jml', function () {
  beforeEach(() => {
    if (!body) {
      throw new Error('Needs a body');
    }
    $('#mapAttributeTest')?.remove();

    let jmlTestContent = $('#jmlTestContent');
    if (!jmlTestContent) {
      jmlTestContent = document.createElement('div');
      jmlTestContent.id = 'jmlTestContent';
      body.append(jmlTestContent);
    }
    jmlTestContent.innerHTML = `
      <div style="display:none;" id="DOMChildrenMustBeInArray">test1</div>
      <div style="display:none;" id="anotherElementToAddToParent">test2</div>
      <div style="display:none;" id="yetAnotherSiblingToAddToParent">test3</div>
    `;
  });
  it('Single element with no children', () => {
    xmlTesting.matchesXMLString(
      jml('input'),
      '<input xmlns="http://www.w3.org/1999/xhtml" />',
      'Single element argument element'
    );
    xmlTesting.matchesXMLString(
      jml('input', null),
      '<input xmlns="http://www.w3.org/1999/xhtml" />',
      'Single element argument with `null` at end'
    );

    xmlTesting.matchesXMLString(
      jml('input', {type: 'password', id: 'my_pass'}),
      '<input xmlns="http://www.w3.org/1999/xhtml" type="password" id="my_pass" />',
      'Single element with two attributes'
    );
  });

  it('DOM attributes', function () {
    xmlTesting.matchesXMLString(
      jml('div', {
        innerHTML: '<span>Test</span>'
      }),
      '<div xmlns="http://www.w3.org/1999/xhtml"><span>Test</span></div>'
    );
    xmlTesting.matchesXMLString(
      jml('label', {
        htmlFor: 'someId'
      }),
      '<label xmlns="http://www.w3.org/1999/xhtml" for="someId"></label>'
    );
    xmlTesting.matchesXMLString(
      jml('label', {
        for: 'someId'
      }),
      '<label xmlns="http://www.w3.org/1999/xhtml" for="someId"></label>'
    );
    xmlTesting.matchesXMLString(
      jml('label', {
        for: null
      }),
      '<label xmlns="http://www.w3.org/1999/xhtml"></label>'
    );
    xmlTesting.matchesXMLString(
      jml('div', {
        className: 'aClass'
      }),
      '<div xmlns="http://www.w3.org/1999/xhtml" class="aClass"></div>'
    );
    xmlTesting.matchesXMLString(
      jml('div', {
        class: 'aClass'
      }),
      '<div xmlns="http://www.w3.org/1999/xhtml" class="aClass"></div>'
    );
    xmlTesting.matchesXMLString(
      jml('div', {
        class: null
      }),
      '<div xmlns="http://www.w3.org/1999/xhtml"></div>'
    );
    let input = /** @type {HTMLInputElement} */ (jml('input', {
      checked: true
    }));
    expect(input.checked).to.be.true;
    input = /** @type {HTMLInputElement} */ (jml('input', {
      readonly: true
    }));
    expect(input.readOnly).to.be.true;
    input = /** @type {HTMLInputElement} */ (jml('input', {
      readOnly: true
    }));
    expect(input.readOnly).to.be.true;
    const option = /** @type {HTMLOptionElement} */ (jml('option', {
      selected: true
    }));
    expect(option.selected).to.be.true;
    const custom = /** @type {HTMLElement} */ (jml('custom', {
      for: 'blah'
    }));
    expect(custom.getAttribute('for')).to.equal('blah');
  });

  it('DOM properties', function () {
    const a = /** @type {HTMLAnchorElement} */ (jml('a', {
      onclick () {
        // eslint-disable-next-line no-alert
        alert('boo!');
      }
    }, [
      'Test'
    ]));
    expect(a.onclick).to.be.a('function');
  });

  it('test nullish properties', function () {
    let option = /** @type {HTMLOptionElement} */ (jml('option', {
      title: 'Hello'
    }));
    expect(option.title).to.equal('Hello');

    option = /** @type {HTMLOptionElement} */ (jml('option'));
    expect(option.title).to.equal('');

    option = /** @type {HTMLOptionElement} */ (jml('option', {title: null}));
    expect(option.title).to.equal('');

    xmlTesting.matchesXMLString(
      jml('div', {
        innerHTML: null
      }),
      '<div xmlns="http://www.w3.org/1999/xhtml"></div>'
    );

    let div = /** @type {HTMLDivElement} */ (jml('div', {style: 'abc'}));
    expect(div.getAttribute('style')).to.equal('abc');
    div = /** @type {HTMLDivElement} */ (jml('div'));
    expect(div.getAttribute('style')).to.equal(null);
    div = /** @type {HTMLDivElement} */ (
      jml('div', /** @type {import('../src/jml.js').JamilihAttributes} */ ({
        style: undefined
      }))
    );
    expect(div.getAttribute('style')).to.equal(null);

    div = /** @type {HTMLDivElement} */ (jml('div'));
    expect(div.style.color).to.equal('');
    div = /** @type {HTMLDivElement} */ (jml('div', {style: {
      color: 'red'
    }}));
    expect(div.style.color).to.equal('red');
    div = /** @type {HTMLDivElement} */ (jml('div', /** @type {import('../src/jml.js').JamilihAttributes} */ ({style: {
      color: null
    }})));
    expect(div.style.color).to.equal('');
  });

  it('DOM wrapping', () => {
    const div = jml(
      'div', {style: 'position:absolute !important; left: -1000px;'}, [
        /** @type {HTMLElement} */ ($('#DOMChildrenMustBeInArray'))
      ],
      $('#anotherElementToAddToParent'),
      $('#yetAnotherSiblingToAddToParent'),
      body
    );

    xmlTesting.matchesXMLString(
      div,
      '<div xmlns="http://www.w3.org/1999/xhtml" style="position:absolute !important; left: -1000px;"><div style="display:none;" id="DOMChildrenMustBeInArray">test1</div></div>',
      // '<div xmlns="http://www.w3.org/1999/xhtml" style="position: absolute; left: -1000px;"><div id="DOMChildrenMustBeInArray" style="display:none;">test1</div></div><div id="anotherElementToAddToParent" style="display:none;">test2</div><div id="yetAnotherSiblingToAddToParent" style="display:none;">test3</div>'
      'Single element with attribute and DOM child and two DOM siblings'
    );

    jml('hr', body);
    xmlTesting.matchesXMLStringOnElement(
      body,
      '<hr xmlns="http://www.w3.org/1999/xhtml" />',
      'Single (empty) DOM element (with body parent)'
    );
  });
  it('Single element with children', () => {
    xmlTesting.matchesXMLString(
      jml('div', [
        'no attributes on the div'
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml">no attributes on the div</div>',
      'Single element with text only'
    );
    xmlTesting.matchesXMLString(
      jml('div', [
        ['p', ['no attributes on the div']]
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml"><p>no attributes on the div</p></div>',
      'Single element with single text-containing element child'
    );
    xmlTesting.matchesXMLString(
      jml('div', {class: 'myClass'}, [
        ['p', ['Some inner text']],
        ['p', ['another child paragraph']]
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass"><p>Some inner text</p><p>another child paragraph</p></div>',
      'Single element with attribute and two text-containing element children'
    );
    xmlTesting.matchesXMLString(
      jml('div', {class: 'myClass'}, [
        'text1',
        ['p', ['Some inner text']],
        'text3'
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass">text1<p>Some inner text</p>text3</div>',
      'Single element with attribute containing two next node children separated by an element child'
    );
    const table = /** @type {HTMLTableElement} */ (
      jml('table', {style: 'position:absolute; left: -1000px;'}, body)
    );
    /* const firstTr = */
    jml(
      'tr', [
        ['td', ['row 1 cell 1']],
        ['td', ['row 1 cell 2']]
      ],
      'tr', {className: 'anotherRowSibling'}, [
        ['td', ['row 2 cell 1']],
        ['td', ['row 2 cell 2']]
      ],
      table
    );

    xmlTesting.matchesXMLStringWithinElement(
      table,
      '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>',
      'Single element with attribute and body parent with separate jml call appending to it two sibling elements each containing text-containing element children (and one with attribute)'
    );
  });
  it('Single element wrapped', () => {
    xmlTesting.matches(body, jml(body), 'Wrapping single pre-existing DOM element');
  });
  it('Namespace declarations', () => {
    xmlTesting.matches(
      /** @type {HTMLElement} */ (jml('abc', {xmlns: 'def'})).namespaceURI,
      'def',
      'Single unknown element with non-HTML default namespace declaration'
    );

    xmlTesting.matchesXMLString(
      jml('abc', {
        z: 3,
        xmlns: {
          prefix3: 'zzz', prefix1: 'def', prefix2: 'ghi'
        },
        b: 7, a: 6
      }),
      '<abc xmlns="http://www.w3.org/1999/xhtml" xmlns:prefix3="zzz" xmlns:prefix1="def" xmlns:prefix2="ghi" z="3" b="7" a="6"></abc>',
      'Single element with attributes and prefixed (non-HTML) namespace declarations'
    );

    xmlTesting.matchesXMLString(
      jml('abc', {xmlns: {prefix1: 'def', prefix2: 'ghi', '': 'newdefault'}}),
      '<abc xmlns="newdefault" xmlns:prefix1="def" xmlns:prefix2="ghi"/>',
      'Single element with non-HTML default namespace declaration and prefixed declarations'
    );

    xmlTesting.matches(
      /** @type {HTMLElement} */ (
        jml('abc', {xmlns: {prefix1: 'def', prefix2: 'ghi', '': 'newdefault'}})
      ).namespaceURI,
      'newdefault',
      'Single element with non-HTML default namespace declaration and prefixed declarations (confirming namespaceURI)'
    );
    /*
    // Todo:
    // lookupNamespaceURI(prefix) is not working in Mozilla, so we test this way
    xmlTesting.matches(
      jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}}, [
        {$: {prefix2: ['prefixedElement']}}
      ]).firstChild.namespaceURI,
      '',
      'Single element with prefixed namesapce declarations and element child using one of the prefixes'
    );
    */
  });
  it('fragment', () => {
    jml('table', {style: 'position:absolute; left: -1000px;'}, body); // Rebuild
    const trsFragment = jml('tr', [
      ['td', ['row 1 cell 1']],
      ['td', ['row 1 cell 2']]
    ],
    'tr', {className: 'anotherRowSibling'}, [
      ['td', ['row 2 cell 1']],
      ['td', ['row 2 cell 2']]
    ],
    null);

    const ser = new XMLSerializer();
    xmlTesting.matches(
      ser.serializeToString(trsFragment.childNodes[0]) +
      ser.serializeToString(trsFragment.childNodes[1]),
      '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>',
      'XMLSerialized fragment children (`null` parent) are equal'
    );

    xmlTesting.matchesXMLString(
      jml('div', [
        'text0',
        {'#': ['text1', ['span', ['inner text']], 'text2']},
        'text3'
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>',
      'Single element with text children separated by fragment (of text nodes separated by element with text child)'
    );

    xmlTesting.matchesXMLString(
      jml('div', [
        'text0',
        ['', [
          'text1', ['span', ['inner text']], 'text2'
        ]],
        'text3'
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>',
      'Single element with text children separated by fragment (of text nodes separated by element with text child)'
    );

    /*
    // Todo: Allow this to work (creating a fragment at root), then update README.
    xmlTesting.matchesXMLString(
      jml('', [
        'text1', ['span', ['inner text']], 'text2'
      ]),
      'text1<span>inner text</span>text2'
    );
    */

    // Todo: Do we want this in this format?
    xmlTesting.matchesXMLString(
      jml('ul', [
        [
          'li', {style: 'color:red;'}, ['First Item'],
          'li', {
            title: 'Some hover text.',
            style: 'color:green;'
          },
          ['Second Item'],
          'li', [
            ['span', {
              class: 'Remove-Me',
              style: 'font-weight:bold;'
            }, ['Not Filtered']],
            ' Item'
          ],
          'li', [
            ['a', {
              href: '#NewWindow'
            }, ['Special Link']]
          ],
          null
        ]
      ], body),
      '<ul xmlns="http://www.w3.org/1999/xhtml"><li style="color:red;">First Item</li>' +
      '<li title="Some hover text." style="color:green;">Second Item</li>' +
      '<li><span class="Remove-Me" style="font-weight:bold;">Not Filtered</span> Item</li>' +
      '<li><a href="#NewWindow">Special Link</a></li></ul>',
      'Single element with element children containing siblings and null final argument added to body'
    );

    // Todo: Allow the following form? If so, add to README as well.
    /*
    xmlTesting.matchesXMLString(
      jml('div',
        {'#': ['text1', ['span', ['inner text']], 'text2']}
      ),
      '<div xmlns="http://www.w3.org/1999/xhtml">text1<span>inner text</span>text2</div>',
      'Single element with fragment in place of children'
    );
    */
  });
  it('text node', () => {
    const expected = document.createTextNode('abc');
    const result = jml({$text: 'abc'});
    assert.deepEqual(expected.nodeType, result.nodeType, 'Equal `nodeType`');
    assert.deepEqual(expected.nodeValue, result.nodeValue, 'Equal `nodeValue`');
  });
  it('attribute node (namespaced)', () => {
    /**
     * @type {[string, string, string]}
     */
    const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];
    const expected = document.createAttributeNS(
      'http://www.w3.org/1999/xlink', 'href'
    );
    expected.value = xlink[2];
    const result = /** @type {Attr} */ (jml({$attribute: xlink}));
    assert.deepEqual(expected.name, result.name, 'Equal `name`');
    assert.deepEqual(expected.value, result.value, 'Equal `value`');
    assert.deepEqual(expected.namespaceURI, result.namespaceURI, 'Equal `namespaceURI`');
    // assert.strictEqual(result.nodeType, window.Node.ATTRIBUTE_NODE); // Todo: Commenting out until https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822
  });
  it('attribute node (non-namespaced)', () => {
    /**
     * @type {[string, string]}
     */
    const attInfo = ['aaa', 'eeefg'];
    const expected = document.createAttribute('aaa');
    expected.value = 'eeefg';
    const result = /** @type {Attr} */ (jml({$attribute: attInfo}));
    assert.deepEqual(result.name, expected.name, 'Equal `name`');
    assert.deepEqual(result.value, expected.value, 'Equal `value`');
    assert.deepEqual(result.prefix, null, 'Equal `prefix`');
    assert.deepEqual(result.namespaceURI, null, 'Equal `namespaceURI`');
    // assert.strictEqual(result.nodeType, window.Node.ATTRIBUTE_NODE); // Todo: Commenting out until https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822
  });
  it('Comments, processing instructions, entities, character references, CDATA', () => {
    const isIE = window.navigator && window.navigator.appName === 'Microsoft Internet Explorer';
    xmlTesting.matchesXMLString(
      jml('div', [
        ['!', 'a comment'],
        ['?', 'customPI', 'a processing instruction'],
        ['?', 'customPIB', {
          att1: 'val 1',
          att2: 'val 2"'
        }],
        ['&', 'copy'],
        ['#', '1234'],
        ['#x', 'ab3'],
        ['![', '&test <CDATA> content']
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml"><!--a comment--' +
      '><' +
      // Any way to overcome the IE problem with pseudo-processing instructions?
      (isIE ? '!--' : '') +
      '?customPI a processing instruction?' +
      (isIE ? '--' : '') +
      '><' +
      (isIE ? '!--' : '') +
      '?customPIB att1="val 1" att2="val 2&quot;"?' +
      (isIE ? '--' : '') +
      '>\u00A9\u04D2\u0AB3&amp;test &lt;CDATA&gt; content</div>',
      'Single element with comment, processing instruction, entity, decimal and hex character references, and CDATA'
    );
  });
  it('Comments, processing instructions, Text, and fragment as DOM nodes', () => {
    const isIE = window.navigator && window.navigator.appName === 'Microsoft Internet Explorer';
    const frag = document.createDocumentFragment();
    frag.append('test');
    xmlTesting.matchesXMLString(
      jml('div', [
        document.createComment('a comment'),
        document.createProcessingInstruction('customPI', 'a processing instruction'),
        // document.createCDATASection('&test <CDATA> content')
        document.createTextNode('text node'),
        frag
      ]),
      '<div xmlns="http://www.w3.org/1999/xhtml"><!--a comment--' +
      '><' +
      // Any way to overcome the IE problem with pseudo-processing instructions?
      (isIE ? '!--' : '') +
      '?customPI a processing instruction?' +
      (isIE ? '--' : '') +
      '>text nodetest</div>',
      'Single element with comment, processing instruction, Text, and fragment'
    );
  });
  it('document node', function () {
    const wrappedDoc = jml(document, [
      ['!', 'a comment']
    ]);
    const comment = /** @type {Comment} */ (
      // eslint-disable-next-line unicorn/prefer-at -- No `at`
      wrappedDoc.childNodes[wrappedDoc.childNodes.length - 1]
    );
    expect(comment.data).to.equal('a comment');
    expect(comment.nodeType).to.equal(8);
  });
  it('throws when trying to add non-container Node at top level', function () {
    expect(() => {
      jml(/** @type {BadArgument} */ (document.createComment('abc')));
    }).to.throw(TypeError, 'Unexpected type: non-container node');
  });
  it('throws with malformed entity reference', function () {
    expect(() => {
      jml('div', [
        ['&', 'ab cd']
      ]);
    }).to.throw(TypeError, /Bad entity reference/u);
  });
  it('recovers with malformed processing instruction', function () {
    const div = jml('div', [
      ['?', 'ab><?', '?<>']
    ]);
    expect(/** @type {Comment} */ (div.childNodes[0]).data).to.equal('?ab><? ?<>?');
  });

  it('Bad document content', function () {
    expect(() => {
      /** @type {Document} */ (jml({$document: /** @type {BadArgument} */ (null)}));
    }).to.throw('Bad attribute value');
  });

  it('Bad doctype head content', function () {
    expect(() => {
      /** @type {Document} */ (jml({$document: {
        head: [
          'hello'
        ]
      }}));
    }).to.throw('Unexpected text string/number in the head');
  });
  it('Document and doctype', () => {
    const doc = /** @type {Document} */ (jml({$document: {
      childNodes: [
        {$DOCTYPE: {name: 'NETSCAPE-Bookmark-file-1'}},
        ['html', [
          ['head', [
            document.createElement('link'),
            // eslint-disable-next-line unicorn/text-encoding-identifier-case -- HTML
            ['meta', {charset: 'utf-8'}]
          ]],
          ['body']
        ]]
      ]
    }}));
    xmlTesting.matchesXMLString(
      doc.documentElement,
      '<html xmlns="http://www.w3.org/1999/xhtml"><head><link /><meta charset="utf-8" /></head><body></body></html>'
    );
    xmlTesting.matches(
      doc.doctype?.name,
      'NETSCAPE-Bookmark-file-1'
    );
    try {
      xmlTesting.matchesXMLString(
        doc,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<html xmlns="http://www.w3.org/1999/xhtml"><head><link /><meta charset="utf-8" /></head><body></body></html>`
      );
    } catch (err) {
      // Node's implementation omits the line break
      xmlTesting.matchesXMLString(
        doc,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1><html xmlns="http://www.w3.org/1999/xhtml"><head><link /><meta charset="utf-8" /></head><body></body></html>`
      );
    }
    const doc2 = jml({$document: {
      $DOCTYPE: {name: 'NETSCAPE-Bookmark-file-1'},
      head: [
        document.createElement('link'),
        ['meta', {name: 'webappfind'}]
      ],
      body: [
        ['p'],
        document.createElement('br')
      ]
    }});
    try {
      xmlTesting.matchesXMLString(
        doc2,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><link /><meta name="webappfind" /></head><body><p></p><br /></body></html>`
      );
    } catch (err) {
      // Node's implementation omits the line break
      xmlTesting.matchesXMLString(
        doc2,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><link /><meta name="webappfind" /></head><body><p></p><br /></body></html>`
      );
    }
    const doc3 = jml({$document: {
      childNodes: [
        ['html', {id: 'myHTML'}]
      ]
    }});
    xmlTesting.matchesXMLString(
      doc3,
      `<html xmlns="http://www.w3.org/1999/xhtml" id="myHTML"></html>`
    );
    const doc4 = jml({$document: {
      childNodes: [
        {$DOCTYPE: {name: 'somethingDifferent'}},
        ['html', {id: 'myHTML'}]
      ]
    }});
    try {
      xmlTesting.matchesXMLString(
        doc4,
        `<!DOCTYPE somethingDifferent>
<html xmlns="http://www.w3.org/1999/xhtml" id="myHTML"></html>`
      );
    } catch (err) {
      xmlTesting.matchesXMLString(
        doc4,
        `<!DOCTYPE somethingDifferent><html xmlns="http://www.w3.org/1999/xhtml" id="myHTML"></html>`
      );
    }
    const doc5 = jml({$document: {
      childNodes: [
      ]
    }});
    expect(doc5.childNodes.length).to.equal(0);

    const doc6 = jml({$document: {
      body: [
        ['p']
      ]
    }});
    try {
      xmlTesting.matchesXMLString(
        doc6,
        `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body><p></p></body></html>`
      );
    } catch (err) {
      xmlTesting.matchesXMLString(
        doc6,
        `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head></head><body><p></p></body></html>`
      );
    }

    const doc7 = jml({$document: {
      body: ['some text']
    }});
    try {
      xmlTesting.matchesXMLString(
        doc7,
        `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>some text</body></html>`
      );
    } catch (err) {
      xmlTesting.matchesXMLString(
        doc7,
        `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>some text</body></html>`
      );
    }

    const doc8 = jml({$document: {
      title: 'My title'
    }});
    try {
      xmlTesting.matchesXMLString(
        doc8,
        `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><title>My title</title></head><body></body></html>`
      );
    } catch (err) {
      xmlTesting.matchesXMLString(
        doc8,
        `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><title>My title</title></head><body></body></html>`
      );
    }

    const doc9 = jml({$document: {
      $DOCTYPE: {name: 'NETSCAPE-Bookmark-file-1'},
      head: [
        {'#': [
          ['meta', {name: 'webappfind'}]
        ]}
      ],
      body: [
        {'#': [
          ['p']
        ]}
      ]
    }});
    try {
      xmlTesting.matchesXMLString(
        doc9,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><meta name="webappfind" /></head><body><p></p></body></html>`
      );
    } catch (err) {
      // Node's implementation omits the line break
      xmlTesting.matchesXMLString(
        doc9,
        `<!DOCTYPE NETSCAPE-Bookmark-file-1><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><meta name="webappfind" /></head><body><p></p></body></html>`
      );
    }
  });
  it('throws with `null` at main level except at end', () => {
    expect(() => {
      jml('div', null, []);
    }).to.throw(TypeError, '`null` values not allowed except as final Jamilih argument');
  });
  it('throws with `undefined` child nodes', () => {
    expect(() => {
      jml('div', [
        /** @type {BadArgument} */ (undefined)
      ]);
    }).to.throw(TypeError, 'Bad children (parent array: ["div",[null]]; index 0 of child: [null])');
  });
  it('throws with `null` child nodes', () => {
    expect(() => {
      jml('div', [
        /** @type {BadArgument} */ (null)
      ]);
    }).to.throw(TypeError, 'Bad children (parent array: ["div",[null]]; index 0 of child: [null])');
  });

  it('throws with other non-object child nodes', () => {
    expect(() => {
      jml('div', [
        /** @type {BadArgument} */ (Symbol('1234567890'))
      ]);
    }).to.throw(TypeError, 'Bad children (parent array: ["div",[null]]; index 0 of child: [null])');
  });

  it('Event listeners', () => {
    let str;
    const input = /** @type {HTMLInputElement} */ (jml('input', {
      type: 'button',
      style: 'position:absolute; left: -1000px;',
      $on: {click: [function () {
        str = 'worked1';
      }, true]}
    }, body));
    input.click(); // IE won't activate unless the above element is appended to the DOM

    xmlTesting.matches(str, 'worked1', 'Single empty element with attributes and triggered click listener added to body');

    const input2 = /** @type {HTMLInputElement} */ (jml('input', {
      style: 'position:absolute; left: -1000px;',
      $on: {
        click () {
          str = 'worked3';
        },
        change: [function () {
          str = 'worked2';
        }, true]
      }
    }, body)); // For focus (or select) event to work, we need to append to the document

    const ev = new window.Event('change');
    input2.dispatchEvent(ev);

    xmlTesting.matches(str, 'worked2', 'Single element with attributes and triggered change listener (alongside click) added to body');

    input2.click();
    xmlTesting.matches(str, 'worked3', 'Single element with attributes and triggered click listener (alongside change) added to body');

    expect(() => {
      jml('input', {
        style: 'position:absolute; left: -1000px;',
        $on: /** @type {BadArgument} */ ([{
          click () { /* */ }
        }])
      }, body);
    }).to.throw(TypeError, 'Expect a function for `$on`');
  });
  it('style attribute object', () => {
    xmlTesting.matchesXMLString(
      jml('div', {
        // Squeeze in an `$on` here too for `$on` no-op coverage
        $on: null,
        style: {float: 'left', 'border-color': 'red'}
      }, ['test']),
      '<div xmlns="http://www.w3.org/1999/xhtml" style="float: left; border-color: red;">test</div>',
      'Single element with style object and text child'
    );
  });
  it('dataset', () => {
    xmlTesting.matchesXMLString(
      jml('div', {dataset: {abcDefGh: 'fff', 'jkl-mno-pq': 'ggg'}}),
      '<div xmlns="http://www.w3.org/1999/xhtml" data-abc-def-gh="fff" data-jkl-mno-pq="ggg"></div>',
      'Single element using dataset with two properties'
    );
    xmlTesting.matchesXMLString(
      jml('div', /** @type {import('../src/jml.js').JamilihAttributes} */ ({dataset: {
        'aCamel-case': {result: 'hello', result2: 'helloTwo'},
        anotherResult: 'world', aNullishToIgnore: null, aNum: 8
      }})),
      '<div xmlns="http://www.w3.org/1999/xhtml" data-a-camel-case-result="hello" ' +
      'data-a-camel-case-result2="helloTwo" data-another-result="world" data-a-num="8"></div>',
      'Single element with mixed and nested CamelCase dataset objects'
    );
  });
  it('Style element', () => {
    xmlTesting.matchesXMLString(
      jml('style', {id: 'myStyle'}, ['p.test {color:red;}'], body),
      '<style xmlns="http://www.w3.org/1999/xhtml" id="myStyle">p.test {color:red;}</style>',
      'Single style element with attribute and text content added to body'
    );
  });
  it('Script element', () => {
    xmlTesting.matchesXMLString(
      jml('script', {class: 'test'}, ['console.log("hello!");'], body),
      '<script xmlns="http://www.w3.org/1999/xhtml" class="test">console.log("hello!");</script>',
      'Single script element with attribute and text content (check console for "hello!")'
    );
  });
  it('bad `jml.command`', function () {
    expect(() => {
      jml.command('non-existing', new Map(), 'method1');
    }).to.throw('No element found');
  });
  it('`jml.command` with no value in map', function () {
    expect(() => {
      jml.command(document.createElement('div'), new Map(), 'method1');
    }).to.throw('No map found');
  });
  it('Bad WeakMap arguments', function () {
    const map1 = new jml.WeakMap();
    expect(() => {
      map1.get(/** @type {BadArgument} */ (null));
    }).to.throw("Can't find the element");

    expect(() => {
      map1.set(/** @type {BadArgument} */ ('bad-element'), 100);
    }).to.throw("Can't find the element");

    expect(() => {
      map1.invoke(/** @type {BadArgument} */ (null), 'method1');
    }).to.throw("Can't find the element");
  });
  ['Map', 'WeakMap'].forEach((mpType) => {
    const mapType = /** @type {"Map"|"WeakMap"} */ (mpType);

    it('Maps (' + mapType + ')', () => {
      // Todo: Let `$map` accept an array of map-object arrays (and add tests)
      // Todo: Add tests for array of map strings
      // @ts-expect-error Our signature usage should be compatible
      const map1 = new window[mapType]();
      const map2 = new jml[mapType](); // jml.WeakMap, jml.Map
      const testObj1 = {test: 5};
      const testObj2 = {test: 7};

      /**
       * @param {string} arg1
       * @this {Element}
       * @returns {string}
       */
      const testFunc = function (arg1) {
        return this.id + ' ok ' + arg1;
      };
      const el = jml({$map: [map1, testObj1]}, 'div', {id: 'mapAttributeTest'}, [
        ['input', {id: 'input1', $data: true}, ['Test']],
        ['input', {id: 'input2', $data: [map2, testObj2]}],
        ['input', {id: 'input3', $data: map1}],
        ['input', {id: 'input4', $data: testObj2}],
        ['input', {id: 'input5', $data: [, testObj1]}], // eslint-disable-line no-sparse-arrays
        ['input', {id: 'input6', $data: [map1]}],
        ['input', {id: 'input7', $data: [map1, testFunc]}]
      ], body);
      xmlTesting.matches(
        map1.get(el),
        testObj1,
        `Externally retrieve element with Jamilih-returned element associated with normal ${mapType} (alongside a Jamilih${mapType}); using default map and object`
      );
      xmlTesting.matches(
        map1.get($('#input1')),
        testObj1,
        `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using default map and object`
      );
      xmlTesting.matches(
        map2.get(/** @type {HTMLInputElement} */ ($('#input2'))),
        testObj2,
        `Externally retrieve element with DOM retrieved element associated with Jamilih${mapType} (alongside a normal ${mapType}); using array-based map and object`
      );
      xmlTesting.matches(
        map1.get($('#input3')),
        testObj1,
        `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using single map defaulting object`
      );
      xmlTesting.matches(
        map1.get($('#input4')),
        testObj2,
        `Externally retrieve element with DOM retrieved element associated with Jamilih${mapType} (alongside a normal ${mapType}); using single object defaulting map`
      );
      xmlTesting.matches(
        map1.get($('#input5')),
        testObj1,
        `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using array-based map attachment with empty default map and single object`
      );
      xmlTesting.matches(
        map1.get($('#input6')),
        testObj1,
        `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using single-item array map (defaulting object)`
      );
      xmlTesting.matches(
        jml.command($('#input7'), map1, 'arg1'),
        'input7 ok arg1',
        `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using array-based map and function`
      );
    });
    it(
      'Maps (with default named maps)' + (mapType === 'WeakMap'
        ? ' (WeakMap)'
        : ''),
      () => {
        // Todo: Let `$map` accept an array of map-object arrays (and add tests)
        // Todo: Add tests for array of map strings

        // @ts-expect-error Signature should be ok
        const map1 = new window[mapType]();
        const map2 = new jml[mapType]();
        const testObj1 = {test: 5};
        const testObj2 = {test: 7};
        const testObj3 = {
          name: 'test object 3',
          /**
           * @param {Element} elem
           * @param {string} arg1
           * @returns {string}
           */
          aMethod (elem, arg1) {
            return this.name + ' ' + elem.id + ' got ' + arg1;
          }
        };

        /**
         * @param {string} arg1
         * @this {Element}
         * @returns {string}
         */
        const testFunc = function (arg1) {
          return this.id + ' ok ' + arg1;
        };
        const el = jml({
          $map: {
            root: [map1, testObj1],
            map1: [map1, testObj1],
            map2: [map2, testObj2],
            map1ToFunc: [map1, testFunc],
            map1ToTestObj3: [map1, testObj3]
          }
        }, 'div', {id: 'mapAttributeTest'}, [
          ['input', {id: 'input1', $data: true}, ['Test']],
          ['input', {id: 'input2', $data: ['map2']}],
          ['input', {id: 'input3', $data: ['map1']}],
          ['input', {id: 'input4', $data: testObj2}],
          ['input', /** @type {import('../src/jml.js').JamilihAttributes} */ ({
            id: 'input5', $data: [, testObj1] // eslint-disable-line no-sparse-arrays
          })],
          ['input', {id: 'input6', $data: ['map1']}],
          ['input', {id: 'input7', $data: ['map1ToFunc']}],
          ['input', {id: 'input8', $data: ['map1ToTestObj3']}]
        ], body);

        xmlTesting.matches(
          map1.get(el),
          testObj1,
          `Externally retrieve element with Jamilih-returned element associated with normal ${mapType} (alongside a Jamilih${mapType}); using default map and object`
        );
        xmlTesting.matches(
          map1.get($('#input1')),
          testObj1,
          `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using default map and object`
        );
        xmlTesting.matches(
          map2.get(/** @type {HTMLInputElement} */ ($('#input2'))),
          testObj2,
          `Externally retrieve element with DOM retrieved element associated with Jamilih${mapType} (alongside a normal ${mapType}); using single-item string array-based map and object`
        );
        xmlTesting.matches(
          map1.get($('#input3')),
          testObj1,
          `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using single-item string array defaulting object`
        );

        xmlTesting.matches(
          map1.get($('#input4')),
          testObj2,
          `Externally retrieve element with DOM retrieved element associated with Jamilih${mapType} (alongside a normal ${mapType}); using single object defaulting map`
        );
        xmlTesting.matches(
          map1.get($('#input5')),
          testObj1,
          `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using array-based map attachment with empty default map and single object`
        );
        xmlTesting.matches(
          map1.get($('#input6')),
          testObj1,
          `Externally retrieve element with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using single-item string array map (defaulting object)`
        );
        xmlTesting.matches(
          jml.command($('#input7'), map1, 'arg1'),
          'input7 ok arg1',
          `Externally invoke on function with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using string array-based map and function`
        );
        xmlTesting.matches(
          jml.command($('#input8'), map1, 'aMethod', 'arg1'),
          'test object 3 input8 got arg1',
          `Externally invoke on method with DOM retrieved element associated with normal ${mapType} (alongside a Jamilih${mapType}); using string array-based map and function`
        );

        /**
         * @typedef {any} MapSelector
         */

        expect(map2.get(/** @type {MapSelector} */ ('#input2'))).to.equal(testObj2);
        map2.set(/** @type {MapSelector} */ ('#input2'), 'newVal');
        expect(map2.get(/** @type {MapSelector} */ ('#input2'))).to.equal('newVal');
      }
    );
  });

  it('Symbol', () => {
    const publicSym = Symbol.for('publicForSym1');
    const privateSym = Symbol('Test symbol');

    const symInput1 = /** @type {HTMLInputElement} */ (jml('input', {
      id: 'symInput1',
      $symbol: /** @type {import('../src/jml.js').SymbolArray} */ ([
        'publicForSym1',
        function (arg1) {
          xmlTesting.matches(
            this.id + ' ' + arg1,
            'symInput1 arg1',
            'Public symbol-attached function with `this` and argument'
          );
        }
      ])
    }));

    const divSymbolTest = /** @type {HTMLInputElement} */ (jml('div', {
      id: 'divSymbolTest',
      $on: {
        click () {
          // Can supply element or selector to `jml.sym` utility
          jml.sym(/** @type {HTMLInputElement} */ (this.previousElementSibling), 'publicForSym1')('arg1');
          jml.sym(/** @type {HTMLInputElement} */ ($('#symInput2')), privateSym)('arg2');
          jml.sym('#symInput3', privateSym).test('arg3');

          // Or add symbol directly:
          // @ts-expect-error Should be useable
          this.previousElementSibling[publicSym]('arg1');
          // @ts-expect-error Should be useable
          $('#symInput2')[privateSym]('arg2');
        }
      }
    }));

    jml('div', [
      symInput1,
      divSymbolTest,
      ['input', {
        id: 'symInput2',
        $symbol: /** @type {import('../src/jml.js').SymbolArray} */ ([
          privateSym,
          (arg1) => {
            // No `this` available as using arrow function, but would give element
            xmlTesting.matches(
              arg1,
              'arg2',
              'Private symbol-attached arrow function with argument'
            );
          }
        ])
      }],
      ['input', {
        id: 'symInput3',
        $symbol: /** @type {import('../src/jml.js').SymbolArray} */ ([
          privateSym,
          /**
           * @type {import('../src/jml.js').SymbolObject}
           */
          ({
            localValue: 5,
            /**
             * @param {string} arg1
             * @returns {void}
             */
            test (arg1) {
              xmlTesting.matches(
                this.localValue,
                5,
                'Private-symbol attached object method with `this`'
              );
              xmlTesting.matches(
                this.elem?.id + ' ' + arg1,
                'symInput3 arg3',
                'Private-symbol attached object method with `this.elem` and argument'
              );
            }
          })
        ])
      }],
      ['input', {
        id: 'symInput4',
        $symbol: /** @type {import('../src/jml.js').SymbolArray} */ ([
          'publicForSym1',
          /**
           * @type {import('../src/jml.js').SymbolObject}
           */
          ({
            localValue: 5,
            /**
             * @param {string} arg1
             * @returns {void}
             */
            test (arg1) {
              xmlTesting.matches(
                this.localValue,
                5,
                'Public-symbol attached object method with `this`'
              );
              xmlTesting.matches(
                this.elem?.id + ' ' + arg1,
                'symInput4 arg4',
                'Public-symbol attached object method with `this.elem` and argument'
              );
            }
          })
        ])
      }]
    ], body);

    // @ts-expect-error Symbol should be ok
    $('#symInput1')[Symbol.for('publicForSym1')]('arg1');
    jml.sym(/** @type {HTMLElement} */ ($('#symInput1')), 'publicForSym1')('arg1');
    jml.sym('#symInput1', 'publicForSym1')('arg1');

    // @ts-expect-error Symbol should be ok
    $('#symInput2')[privateSym]('arg2');

    // @ts-expect-error Symbol should be ok
    $('#symInput3')[privateSym].test('arg3');
    jml.sym('#symInput3', privateSym).test('arg3');
    /** @type {HTMLElement} */ ($('#divSymbolTest')).dispatchEvent(
      new window.Event('click')
    );
    jml.command('#symInput1', 'publicForSym1', 'arg1');
    jml.command('#symInput3', privateSym, 'test', 'arg3');
    // @ts-expect-error Symbol should be ok
    $('#symInput4')[publicSym].test('arg4');
    jml.sym('#symInput4', publicSym).test('arg4');
    jml.command('#symInput4', publicSym, 'test', 'arg4');
  });
  it('Shadow DOM', () => {
    if (!body.attachShadow) {
      xmlTesting.skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT attachShadow");
    } else {
      // Todo: Need a more precise check than this
      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem',
          $shadow: {
            open: true, // Default (can also use `closed`)
            template: [
              {id: 'myTemplate'},
              [
                ['style', [`
                  :host {color: red;}
                  ::slotted(p) {color: blue;}
                `]],
                ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
                ['h2', ['Heading level 2']],
                ['slot', ['DEFAULT CONTENT HERE']]
              ]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `open`/`template`) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem',
          $shadow: {
            open: true, // Default (can also use `closed`)
            template: [
              ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
              `]],
              ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
              ['h2', ['Heading level 2']],
              ['slot', ['DEFAULT CONTENT HERE']]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `open`/no-attribute `template`) does not throw');

      assert.doesNotThrow(function () {
        const template = /** @type {HTMLTemplateElement} */ (jml('template', [
          ['style', [`
            :host {color: red;}
            ::slotted(p) {color: blue;}
          `]],
          ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
          ['h2', ['Heading level 2']],
          ['slot', ['DEFAULT CONTENT HERE']]
        ]));
        jml('section', {
          id: 'myElem',
          $shadow: {
            open: true, // Default (can also use `closed`)
            template
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `open`/DOM `template`) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem',
          $shadow: {
            open: true, // Default (can also use `closed`)
            template: 'myTemplate'
          }
        }, [
          ['template', {id: 'myTemplate'}, [
            ['style', [`
              :host {color: red;}
              ::slotted(p) {color: blue;}
            `]],
            ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
            ['h2', ['Heading level 2']],
            ['slot', ['DEFAULT CONTENT HERE']]
          ]],
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `open`/string `template`) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem',
          $shadow: {
            closed: true,
            template: [
              {id: 'myTemplate'},
              [
                ['style', [`
                  :host {color: red;}
                  ::slotted(p) {color: blue;}
                `]],
                ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
                ['h2', ['Heading level 2']],
                ['slot', ['DEFAULT CONTENT HERE']]
              ]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `closed`/`template`) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem2',
          $shadow: {
            content: [
              ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
              `]],
              ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
              ['h2', ['Heading level 2']],
              ['slot', ['DEFAULT CONTENT HERE']]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `content`) does not throw');

      assert.doesNotThrow(function () {
        const content = /** @type {DocumentFragment} */ (jml({'#': [
          ['style', [`
            :host {color: red;}
            ::slotted(p) {color: blue;}
          `]],
          ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
          ['h2', ['Heading level 2']],
          ['slot', ['DEFAULT CONTENT HERE']]
        ]}));
        jml('section', {
          id: 'myElem2',
          $shadow: {content}
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via DOM `content`) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem2',
          $shadow: {
            open: [
              ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
              `]],
              ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
              ['h2', ['Heading level 2']],
              ['slot', ['DEFAULT CONTENT HERE']]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `open` content) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem2',
          $shadow: {
            closed: [
              ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
              `]],
              ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
              ['h2', ['Heading level 2']],
              ['slot', ['DEFAULT CONTENT HERE']]
            ]
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (via `closed` content) does not throw');

      assert.doesNotThrow(function () {
        jml('section', {
          id: 'myElem2',
          $shadow: {
            closed: true
          }
        }, [
          ['h1', {slot: 'h'}, ['Heading level 1']],
          ['p', ['Other content']]
        ], body);
      }, null, 'Adding Shadow DOM (with `closed` and no content) does not throw');
    }
  });
  it('Custom elements', () => {
    const myButton = jml('button', {
      id: 'myButton',
      is: 'fancy-button'
    }, body);
    try {
      // Node
      xmlTesting.matchesXMLString(
        myButton,
        '<button xmlns="http://www.w3.org/1999/xhtml" id="myButton"></button>'
      );
    } catch (err) {
      xmlTesting.matchesXMLString(
        myButton,
        '<button is="fancy-button" xmlns="http://www.w3.org/1999/xhtml" id="myButton"></button>'
      );
    }

    expect(() => {
      const frag = document.createDocumentFragment();
      jml(frag, {
        $define: {
          test () {
            return this.id;
          }
        }
      }, body);
    }).to.throw('Element expected for `$define`');

    if (!window.customElements) {
      xmlTesting.skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT CUSTOM ELEMENT DEFINITIONS");
    } else {
      const myEl = /** @type {HTMLElement & {test: () => string}} */ (jml('my-el', {
        id: 'myEl',
        $define: {
          test () {
            return this.id;
          }
        }
      }, body));
      xmlTesting.matches(
        myEl.test(),
        'myEl',
        'Custom element object method with `this`'
      );

      let constructorSetVar2;
      jml('my-el2', {
        id: 'myEl2',
        $define () {
          constructorSetVar2 = this.id;
        }
      }, body);
      xmlTesting.matches(
        constructorSetVar2,
        'myEl2',
        'Custom element with invoked constructor with `this`'
      );

      let constructorSetVar3;
      const win = /** @type {unknown} */ (window);
      jml('my-el3', {
        id: 'myEl3',
        $define: class extends /** @type {import('jsdom').DOMWindow} */ (
          win
        ).HTMLElement {
          constructor () {
            super();
            constructorSetVar3 = this.id;
          }
        }
      }, body);
      xmlTesting.matches(
        constructorSetVar3,
        'myEl3',
        'Custom element with class-based invoked constructor with `this`'
      );

      let constructorSetVar4;
      const myel4 = /** @type {HTMLElement & {test: (arg1: string) => void, test2: (arg1: string) => void}} */ (jml('my-el4', {
        id: 'myEl4',
        $define: /** @type {[import('../src/jml.js').DefineUserConstructor, import('../src/jml.js').DefineMixin]} */ ([function () {
          constructorSetVar4 = this.id;
        }, {
          test (arg1) {
            xmlTesting.matches(this.id + arg1, 'myEl4arg1', 'Custom element with array of constructor and object method invoked with `this` and argument');
          },
          test2 (arg1) {
            /** @type {{test: (arg1: string) => void}} */ (this).test(arg1);
          }
        }])
      }, body));
      xmlTesting.matches(
        constructorSetVar4,
        'myEl4',
        'Custom element with array of constructor and object, with constructor invoked with `this`'
      );
      myel4.test('arg1');
      myel4.test2('arg1');

      let constructorSetVar5;
      const myel5 = /** @type {HTMLElement & {test: (arg1: string) => void, test2: (arg1: string) => void}} */ (jml('my-el5', {
        id: 'myEl5',
        $define: [class extends /** @type {import('jsdom').DOMWindow} */ (
          win
        ).HTMLElement {
          constructor () {
            super();
            constructorSetVar5 = this.id;
          }
        }, {
          test (arg1) {
            xmlTesting.matches(this.id + arg1, 'myEl5arg1', 'Custom element with array of class-based constructor and object method invoked with `this` and argument');
          },
          /**
           * @param {string} arg1
           * @returns {void}
           */
          test2 (arg1) {
            // @ts-expect-error How to fix?
            this.test(arg1);
          }
        }]
      }, body));
      xmlTesting.matches(
        constructorSetVar5,
        'myEl5',
        'Custom element with array of class-based constructor and object, with constructor invoked with `this`'
      );
      myel5.test('arg1');
      myel5.test2('arg1');
    }

    if (!window.customElements) {
      xmlTesting.skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT CUSTOM ELEMENT DEFINITIONS");
    } else {
      // Todo: If customized built-in elements implemented, ensure testing
      //  `$define: [constructor, prototype, {extends: '<nativeElem>'}]`
      const myButton2 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton2',
        is: 'fancy-button2',
        $define: {
          test () {
            return this.id;
          }
        }
      }, body));
      xmlTesting.matches(
        myButton2.test(),
        'myButton2'
      );

      const myButton3 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton3',
        $define: {
          test () {
            return this.id;
          }
        },
        is: 'fancy-button2'
      }, body));
      xmlTesting.matches(
        myButton3.test(),
        'myButton3'
      );

      expect(() => {
        jml('button', {
          id: 'myButton3',
          $define: {
            test () {
              return this.id;
            }
          }
        }, body);
      }).to.throw(TypeError, 'Expected `is` with `$define` on built-in');
    }
  });
  it('Custom elements-2', function () {
    if (!window.customElements) {
      xmlTesting.skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT CUSTOM ELEMENT DEFINITIONS");
    } else {
      const myButton4 = /** @type {HTMLElement & {test: () => string}} */ (jml('x-button', {
        id: 'myButton4',
        $define: /** @type {import('../src/jml.js').DefineObjectArray} */ ([{
          test () {
            return this.id;
          }
        }, window.HTMLButtonElement])
      }, body));
      xmlTesting.matches(
        myButton4.test(),
        'myButton4'
      );

      const myButton5 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton5',
        is: 'x-buttony',
        $define: /** @type {import('../src/jml.js').DefineObjectArray} */ ([{
          test () {
            return this.id;
          }
        }, 'button'])
      }, body));
      xmlTesting.matches(
        myButton5.test(),
        'myButton5'
      );
    }
  });
  it('Custom Elements - 3', function () {
    if (!window.customElements) {
      xmlTesting.skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT CUSTOM ELEMENT DEFINITIONS");
    } else {
      const myButton6 = /** @type {HTMLElement & {test: () => string}} */ (jml('x-buttona', {
        id: 'myButton6',
        $define: [{
          test () {
            return this.id;
          }
        }]
      }, body));
      xmlTesting.matches(
        myButton6.test(),
        'myButton6'
      );

      const myButton7 = /** @type {HTMLElement & {test: () => string}} */ (jml('x-buttonb', {
        id: 'myButton7',
        $define: [{
          test () {
            return this.id;
          }
        }]
      }, body));
      xmlTesting.matches(
        myButton7.test(),
        'myButton7'
      );

      const myButton8 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton8',
        is: 'x-button2',
        $define: [{
          test () {
            return this.id;
          }
        }, {extends: 'button'}]
      }, body));
      xmlTesting.matches(
        myButton8.test(),
        'myButton8'
      );

      let constructorSetVar6;
      const myButton9 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton9',
        is: 'x-button3',
        $define: /** @type {[import('../src/jml.js').DefineConstructor|import('../src/jml.js').DefineUserConstructor, import('../src/jml.js').DefineMixin?, import('../src/jml.js').DefineOptions?]} */ ([
          function () {
            constructorSetVar6 = this.id;
          },
          {
            test () {
              return this.id;
            }
          },
          {extends: 'button'}
        ])
      }, body));
      xmlTesting.matches(
        constructorSetVar6,
        'myButton9',
        'Custom element with invoked constructor with `this`'
      );
      xmlTesting.matches(
        myButton9.test(),
        'myButton9'
      );

      let constructorSetVar7;
      const myButton10 = /** @type {HTMLButtonElement & {test: () => string}} */ (jml('button', {
        id: 'myButton10',
        is: 'x-button4',
        $define: /** @type {[import('../src/jml.js').DefineConstructor|import('../src/jml.js').DefineUserConstructor, import('../src/jml.js').DefineMixin?, import('../src/jml.js').DefineOptions?]} */ ([
          function () {
            constructorSetVar7 = this.id;
          },
          {
            test () {
              return this.id;
            }
          },
          'button'
        ])
      }, body));
      xmlTesting.matches(
        constructorSetVar7,
        'myButton10',
        'Custom element with invoked constructor with `this`'
      );
      xmlTesting.matches(
        myButton10.test(),
        'myButton10'
      );
    }
  });
  it('$custom properties', () => {
    const mySelect = /** @type {HTMLSelectElement & {test: (arg1: string) => string, test2: (arg1: string) => string}} */ (jml('select', {
      id: 'mySelect',
      $custom: {
        /**
         * @param {string} arg1
         * @returns {string}
         */
        [Symbol.for('testCustom')] (arg1) {
          return this.test(arg1);
        },
        /**
         * @param {string} arg1
         * @returns {string}
         */
        test (arg1) {
          /**
           * @typedef {any} CurrentThis
           */
          return /** @type {CurrentThis} */ (this).id + arg1;
        },
        /**
         * @param {string} arg1
         * @returns {string}
         */
        test2 (arg1) {
          return this.test(arg1);
        }
      }
    }, body));

    xmlTesting.matches(
      mySelect.test('Arg1'),
      'mySelectArg1',
      'Invoke `$custom`-attached object with regular method with argument and `this`'
    );
    xmlTesting.matches(
      mySelect.test2('Arg1'),
      'mySelectArg1',
      'Invoke `$custom`-attached object with regular method with argument and `this` (calling another regular object method)'
    );
    xmlTesting.matches(
      // @ts-expect-error Should be ok
      mySelect[Symbol.for('testCustom')]('Arg1'),
      'mySelectArg1',
      'Invoke `$custom`-attached object with symbol-attached method with argument and `this`'
    );
  });
  it('$plugins', () => {
    /**
     * @type {import('../src/jml.js').JamilihOptions}
     */
    const options = {$plugins: [
      {
        name: '$_myplugin',
        set ({element, attribute: {
          // name,
          value
        }}) {
          const val = /**
          * @type {import('../src/jml.js').JamilihAttValue & {blueAndRed: boolean}}
          */ (value);
          // console.log('vvv', value, '::', element, '::', name);
          // Add code here to modify the element
          // element.setAttribute(name, value);
          if (val?.blueAndRed) {
            /** @type {HTMLElement} */ (element).style.color = 'blue';
            /** @type {HTMLElement} */ (element).style.backgroundColor = 'red';
          }

          return '';
        }
      }
    ]};
    const div = /** @type {HTMLDivElement} */ (
      // eslint-disable-next-line camelcase -- Ok
      jml(options, 'div', {id: 'myDiv', $_myplugin: {
        blueAndRed: true
      }}, document.body)
    );
    xmlTesting.matches(
      div.style.color,
      'blue',
      'Should have text set to a blue color'
    );
    xmlTesting.matches(
      div.style.backgroundColor,
      'red',
      'Should have text set to a red background color'
    );
    xmlTesting.matches(
      div.nodeName.toLowerCase(),
      'div',
      'Should be a `div` element'
    );
    xmlTesting.matches(
      div.id,
      'myDiv',
      'Should allow other non-plugin attributes'
    );
    expect(() => {
      jml(/** @type {BadArgument} */ ({$plugins: {}}), 'div');
    }).to.throw(Error, undefined, 'should throw with non-array plugins');
    expect(() => {
      jml({$plugins: [
        /** @type {BadArgument} */ (null)
      ]}, 'div');
    }).to.throw(Error, undefined, 'should throw with non-object plugin');
    expect(() => {
      jml({$plugins: [
        /** @type {BadArgument} */ ({
          set () {
            /* */
          }
        })
      ]}, 'div');
    }).to.throw(Error, undefined, 'Should throw when no `name` on plugin');
    expect(() => {
      jml({$plugins: [
        /** @type {BadArgument} */ ({
          name: '$_myplugin'
        })
      ]}, 'div');
    }).to.throw(Error, undefined, 'Should throw when no `set` method on plugin');
    expect(() => {
      jml({$plugins: [
        /** @type {BadArgument} */ ({
          name: 'myplugin',
          set () {
            /* */
          }
        })
      ]}, 'div');
    }).to.throw(Error, undefined, 'Should throw with bad `name` on plugin');
  });
  it('getInterpolator plugin', () => {
    const {args, uuid, plugin, dynamic} = getInterpolator();
    const j = jml.bind(null, {$plugins: [plugin]});
    const div = j('div', {
      id: 'myId',
      class: dynamic('fff')
    }, [
      ['span', ['abc']],
      dynamic('ggg')
    ]);

    expect(args).to.deep.equal(['fff', 'ggg']);

    const ser = new XMLSerializer().serializeToString(div);

    expect(ser).to.match(
      /<div xmlns="http:\/\/www.w3.org\/1999\/xhtml" id="myId" class="([a-f\d-]+)"><span>abc<\/span>\1<\/div>/u
    );

    expect(
      String.raw({raw: ser.split(uuid)}, ...args)
    ).to.equal(
      '<div xmlns="http://www.w3.org/1999/xhtml" id="myId" class="fff"><span>abc</span>ggg</div>'
    );
  });
});
