// eslint-disable-next-line no-shadow -- Necessary
import {assert, expect} from 'chai';

import * as xmlTesting from './xmlTesting.js';

import {jml, $, body, $$, nbsp} from '../test-helpers/loadTests-node.js';

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
  it('jml.toHTML()', () => {
    const expected = '<br>';
    const result = jml.toHTML('br');
    assert.deepEqual(result, expected, 'Empty element with no attributes');
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
          /**
           * @this {HTMLInputElement}
           */
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
