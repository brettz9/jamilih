/* eslint-env node */
import {jml} from './jml.js';

export {jml, $, $$, nbsp, body, glue} from './jml.js';

/* istanbul ignore else */
if (typeof process !== 'undefined') {
  // import {JSDOM} from 'jsdom';
  const {JSDOM} = require('jsdom'); // eslint-disable-line global-require

  const win = new JSDOM('').window;

  jml.setWindow(win);
}

export default jml;
