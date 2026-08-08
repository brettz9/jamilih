import jsdom from 'jsdom';

import jml from './jml.js';

export * from './jml.js';
// eslint-disable-next-line unicorn/no-useless-re-export -- Explicit re-export: export* skips 'jml' because the local import binding takes precedence
export {jml} from './jml.js';

// Ignore else
/* c8 ignore next */
if (typeof process !== 'undefined') {
  const {JSDOM} = jsdom;

  const win = new JSDOM('').window;

  jml.setWindow(win);
}

export default jml;
