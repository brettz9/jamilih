/* eslint-env node */
// Can remove own XMLSerializer dependency once jsdom may
//    implement: https://github.com/tmpvar/jsdom/issues/1368
import xmlser from './polyfills/XMLSerializer.js';
import jml from './jml-es6.js';
// import {JSDOM} from 'jsdom';
const {JSDOM} = require('jsdom');

const win = new JSDOM('').window;

jml.setWindow(win);
jml.setDocument(win.document);
// jml.setXMLSerializer(require('xmldom').XMLSerializer);
jml.setXMLSerializer(xmlser);

export default jml;
