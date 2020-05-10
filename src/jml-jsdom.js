/* eslint-env node */
import {jml} from './jml.js';

export {jml, $, $$, nbsp, body, glue} from './jml.js';

/* istanbul ignore else */
if (typeof process !== 'undefined') {
  // import {JSDOM} from 'jsdom';
  // eslint-disable-next-line node/global-require, node/no-unpublished-require
  const {JSDOM} = require('jsdom');

  const win = new JSDOM('').window;

  jml.setWindow(win);
}

export default jml;
