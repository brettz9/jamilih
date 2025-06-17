/* eslint-disable unicorn/prefer-global-this -- Easier */
/* eslint-disable sonarjs/assertions-in-tests -- Ok here */
import {assert, expect} from 'chai';

import * as xmlTesting from './xmlTesting.js';

import {jml, $, body, $$, nbsp} from '../test-helpers/loadTests.js';

describe('Jamilih - Other Methods', function () {
  beforeEach(() => {
    $('#mapTest')?.remove();
  });
  it('jml.toJMLString()', () => {
    const br = document.createElement('br');
    const expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
    const result = jml.toJMLString(br);
    assert.deepEqual(result, expected, 'Empty element with no attributes');
  });
  describe('jml.toHTML()', function () {
    it('creates empty element with no attributes', () => {
      const expected = '<br>';
      const result = jml.toHTML('br');
      assert.deepEqual(result, expected, 'Empty element with no attributes');
    });
    it('creates attribute', () => {
      const expected = 'a="b"';
      const result = jml.toHTML({$attribute: [null, 'a', 'b']});
      assert.deepEqual(result, expected, 'Attr');
    });

    it('creates text node', () => {
      const expected = 'abc';
      const result = jml.toHTML({$text: 'abc'});
      assert.deepEqual(result, expected, 'Text node');
    });

    it('creates a document', () => {
      const expected = '<html><head></head><body></body></html>';
      const result = jml.toHTML({$document: {
        childNodes: [
          // {$DOCTYPE: {name: 'html'}},
          // Todo: Support doctype and comments (needed in main position)
          // ['!', 'comment']
          ['html', [
            ['head'],
            ['body']
          ]]
        ]
      }});
      assert.deepEqual(result, expected, 'Document fragment');
    });

    it('serializes an empty document fragment', () => {
      const expected = '';
      const result = jml.toHTML({'#': []});
      assert.deepEqual(result, expected, 'Document fragment');
    });

    it('serializes a non-empty document fragment', () => {
      const expected = '<br><img>';
      const result = jml.toHTML({'#': [
        ['br'],
        ['img']
        // Todo: Support comments (needed in main position)
        // ['!', 'comment']
      ]});
      assert.deepEqual(result, expected, 'Document fragment');
    });

    it('serializes a document type', () => {
      const expected = '<!DOCTYPE html>';
      const result = jml.toHTML({$DOCTYPE: {name: 'html'}});
      assert.deepEqual(result, expected, 'Document type');
    });

    it('serializes a document type with systemId only', () => {
      const expected = '<!DOCTYPE html SYSTEM "sysID">';
      const result = jml.toHTML({$DOCTYPE: {name: 'html', systemId: 'sysID'}});
      assert.deepEqual(result, expected, 'Document type with system ID');
    });

    it('serializes a document type with publicId and systemId', () => {
      const expected = '<!DOCTYPE html PUBLIC "pubID" "sysID">';
      const result = jml.toHTML({
        $DOCTYPE: {name: 'html', publicId: 'pubID', systemId: 'sysID'}
      });
      assert.deepEqual(result, expected, 'Document type with public and system ID');
    });
  });
  it('jml.toXML()', () => {
    const expected = '<br xmlns="http://www.w3.org/1999/xhtml" />';
    const result = jml.toXML('br');
    assert.deepEqual(result, expected, 'Empty element with no attributes');
  });
  it('jml.toDOM()', () => {
    const expected = jml('br');
    const result = jml.toDOM('br');
    assert.deepEqual(expected.nodeName, result.nodeName, '`nodeName` equal');
  });
  it('jml.toXMLDOMString()', () => {
    const expected = jml.toXMLDOMString('br');
    const result = jml.toXML('br');
    assert.deepEqual(result, expected, 'Empty element with no attributes');
  });
  it('jml.toDOMString()', () => {
    const expected = jml.toDOMString('br');
    const result = jml.toHTML('br');
    assert.deepEqual(result, expected, 'Empty element with no attributes');
  });
  ['weak', 'strong'].forEach((mapType) => {
    it(`jml.${mapType}()`, () => {
      const [myMap, elem] = jml[/** @type {"weak"|"strong"} */ (mapType)]({
        localVar: 'localValue',
        /**
         * @param {Element} el
         * @param {string} arg1
         * @returns {string}
         */
        myMethod (el, arg1) {
          return arg1 + ' ' + this.localVar + ' ' + el.querySelector('input')?.value;
        }
      }, 'div', {id: 'mapTest'}, [
        ['input', {value: '100', $on: {
          input () {
            xmlTesting.matches(
              myMap.invoke(/** @type {HTMLDivElement} */ (
                this.parentNode
              ), 'myMethod', 'internal test'),
              'internal test localValue 1001',
              `Jamilih${mapType === 'weak' ? 'Weak' : ''}Map \`invoke\` method with arguments and \`this\``
            );
          }
        }}],
        ['div', {id: 'clickArea', $data: {
          localVariable: 8,
          /**
           * @param {Element} el
           * @param {string} arg1
           * @this {{[key: string]: any}}
           * @returns {void}
           */
          test (el, arg1) {
            xmlTesting.matches(
              arg1 + ' ' + el.id + this.localVariable,
              'arg1 clickArea8',
              `Attached Jamilih${mapType === 'weak' ? 'Weak' : ''}Map $data method invoked by click listener with arguments and \`this\``
            );
          }
        }, $on: {
          click () {
            myMap.invoke(this, 'test', 'arg1');
          }
        }}]
      ], /** @type {HTMLBodyElement} */ (body));
      xmlTesting.matches(
        myMap.invoke(elem, 'myMethod', 'external test'),
        'external test localValue 100',
        `Externally invoke Jamilih${mapType === 'weak' ? 'Weak' : ''}Map \`invoke\` method with arguments and \`this\``
      );
      xmlTesting.matches(
        myMap.invoke('#mapTest', 'myMethod', 'external test'),
        'external test localValue 100',
        `Externally invoke Jamilih${mapType === 'weak' ? 'Weak' : ''}Map \`invoke\` method with arguments and \`this\``
      );
      /**
       * @typedef {any} MapSelector
       */
      xmlTesting.matches(
        myMap.get(/** @type {MapSelector} */ ('#mapTest')).localVar, // Test overridden `get` accepting selectors also
        'localValue',
        `Externally retrieve Jamilih${mapType === 'weak' ? 'Weak' : ''}Map-associated element by selector`
      );

      const mapInput = /** @type {HTMLInputElement} */ ($('#mapTest')?.firstElementChild);
      mapInput.value = '1001';
      mapInput.dispatchEvent(
        new window.Event('input')
      );
      const mapDiv = $('#clickArea');
      mapDiv?.dispatchEvent(new window.Event('click'));
    });
  });
  describe('setWindow', function () {
    it('setWindow', function () {
      expect(() => {
        jml.setWindow(window);
      }).to.not.throw();
    });
  });
});

describe('Jamilih extras', function () {
  /**
   * @type {HTMLDivElement}
   */
  let div;
  beforeEach(() => {
    if (div) {
      div.remove();
    }
    div = /** @type {HTMLDivElement} */ (
      jml('div', {id: 'extraHolder'}, /** @type {HTMLBodyElement} */ (body))
    );
  });
  it('$', function () {
    /** @type {HTMLBodyElement} */ (body).querySelector('#extraHolder')?.append(jml('br'), jml('br'));
    const br = $('br');
    expect(br?.localName).to.equal('br');
  });
  it('$$', function () {
    /** @type {HTMLBodyElement} */ (body).querySelector('#extraHolder')?.append(jml('br'), jml('br'));
    const brs = $$('br');
    expect(brs.length).to.equal(2);
  });
  it('nbsp', function () {
    expect(nbsp).to.equal('\u00A0');
  });
});
