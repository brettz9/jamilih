import * as xmlTesting from './xmlTesting.js';

describe('Jamilih - Other Methods', function () {
  beforeEach(() => {
    if ($('#mapTest')) {
      $('#mapTest').remove();
    }
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
      const [myMap, elem] = jml[mapType]({
        localVar: 'localValue',
        myMethod (el, arg1) {
          return arg1 + ' ' + this.localVar + ' ' + el.querySelector('input').value;
        }
      }, 'div', {id: 'mapTest'}, [
        ['input', {value: '100', $on: {
          input () {
            xmlTesting.matches(
              myMap.invoke(this.parentNode, 'myMethod', 'internal test'),
              'internal test localValue 1001',
              `Jamilih${mapType === 'weak' ? 'Weak' : ''}Map \`invoke\` method with arguments and \`this\``
            );
          }
        }}],
        ['div', {id: 'clickArea', $data: {
          localVariable: 8,
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
      ], body);
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
      xmlTesting.matches(
        myMap.get('#mapTest').localVar, // Test overridden `get` accepting selectors also
        'localValue',
        `Externally retrieve Jamilih${mapType === 'weak' ? 'Weak' : ''}Map-associated element by selector`
      );

      const mapInput = $('#mapTest').firstElementChild;
      mapInput.value = '1001';
      mapInput.dispatchEvent(
        new window.Event('input')
      );
      const mapDiv = $('#clickArea');
      mapDiv.dispatchEvent(new window.Event('click'));
    });
  });
  describe.skip('setWindow', function () {
    afterEach(() => {
      jml.setWindow(window);
    });
    it('setWindow', function () {
      expect(() => {
        jml.setWindow({});
      }).to.not.throw();
    });
  });
});

describe('Jamilih extras', function () {
  let div;
  beforeEach(() => {
    if (div) {
      div.remove();
    }
    div = jml('div', {id: 'extraHolder'}, body);
  });
  it('$', function () {
    body.querySelector('#extraHolder').append(jml('br'), jml('br'));
    const br = $('br');
    expect(br.localName).to.equal('br');
  });
  it('$$', function () {
    body.querySelector('#extraHolder').append(jml('br'), jml('br'));
    const brs = $$('br');
    expect(brs.length).to.equal(2);
  });
  it('nbsp', function () {
    expect(nbsp).to.equal('\u00A0');
  });
});
