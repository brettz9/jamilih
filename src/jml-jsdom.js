import jsdom from 'jsdom';

import jml from './jml.js';

export * from './jml.js';

// Ignore else
/* c8 ignore next */
if (typeof process !== 'undefined') {
  const {JSDOM} = jsdom;

  const win = new JSDOM('').window;

  jml.setWindow(win);
}

export default jml;
