import jsdom from 'jsdom';

// Renamed to avoid a local 'jml' binding that would block export* from re-exporting it
import _jml from './jml.js';

export * from './jml.js';

// Ignore else
/* c8 ignore next */
if (typeof process !== 'undefined') {
  const {JSDOM} = jsdom;

  const win = new JSDOM('').window;

  _jml.setWindow(win);
}

export default _jml;
