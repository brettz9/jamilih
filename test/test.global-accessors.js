// eslint-disable-next-line no-shadow -- Needed
import {expect} from 'chai';
import {jml, $, $$} from '../src/jml.js';

describe('Window/Document getters/setters', function () {
  /**
   * @type {import('jsdom').DOMWindow|import('../src/jml.js').HTMLWindow|undefined}
   */
  let _win;
  beforeEach(() => {
    _win = jml.getWindow();
    jml.setWindow(undefined);
  });
  afterEach(() => {
    jml.setWindow(_win);
  });

  describe('jml', function () {
    it('throws with no window object', function () {
      expect(() => {
        jml('noMatter');
      }).to.throw('No window object');
    });
  });

  describe('getWindow', function () {
    it('throws with no window set', function () {
      expect(() => {
        jml.getWindow();
      }).to.throw('No window object set');
    });
  });

  describe('$', function () {
    it('throws with no document object', function () {
      expect(() => {
        $('noMatter');
      }).to.throw('No document object');
    });
  });
  describe('$$', function () {
    it('throws with no document object', function () {
      expect(() => {
        $$('noMatter');
      }).to.throw('No document object');
    });
  });

  describe('jml.toJML', function () {
    it('throws with no window object', function () {
      expect(() => {
        jml.toJML('noMatter');
      }).to.throw('No window object set');
    });
  });

  describe('jml.toXML', function () {
    it('throws with no window object', function () {
      expect(() => {
        jml.toXML('noMatter');
      }).to.throw('No window object set');
    });
  });
});

describe('Window/Document getters/setters', function () {
  /**
   * @type {import('jsdom').DOMWindow|import('../src/jml.js').HTMLWindow|undefined}
   */
  let _win;
  beforeEach(() => {
    _win = jml.getWindow();
    jml.setWindow({
      // @ts-ignore
      document: null
    });
  });
  afterEach(() => {
    jml.setWindow(_win);
  });

  describe('jml (no document)', function () {
    it('throws with no document object', function () {
      expect(() => {
        jml('noMatter');
      }).to.throw('No document object');
    });
  });
});
