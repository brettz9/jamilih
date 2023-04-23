/* eslint-env node */

// eslint-disable-next-line n/no-unpublished-import
import jsdom from 'jsdom';

import {jml} from './jml.js';

export {jml, $, $$, nbsp, body, glue} from './jml.js';

// Ignore else
/* c8 ignore next */
if (typeof process !== 'undefined') {
  const {JSDOM} = jsdom;

  const win = new JSDOM('').window;

  jml.setWindow(win);
}

export default jml;
