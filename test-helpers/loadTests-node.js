/* eslint-env node */
import {assert, expect} from 'chai';
import {
  Document as Doc
} from 'dominum';
import {$, $$, jml, glue, nbsp, body} from '../src/jml-dominum.js';

// import {$, $$} from '../src/jml-jsdom.js';

// eslint-disable-next-line import/no-commonjs
const {JSDOM} = require('jsdom');

const win = new JSDOM('').window;
const {document: doc} = win;

global.assert = assert;
global.expect = expect;

global.window = jml.getWindow();
global.document = window.document;

Doc.prototype.querySelector = doc.querySelector.bind(doc);
// Elem.prototype.querySelector = win.Element.prototype.querySelector;

body.querySelector = doc.querySelector.bind(doc);

global.XMLSerializer = window.XMLSerializer;

window.WeakMap = WeakMap;
window.Map = Map;

global.jml = jml;
global.glue = glue;
global.nbsp = nbsp;
global.$ = $;
global.$$ = $$;
global.body = body;
