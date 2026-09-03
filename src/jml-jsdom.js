import {JSDOM} from 'jsdom';

import {setWindow} from './jml.js';

export * from './jml.js';
// eslint-disable-next-line unicorn/no-useless-re-export -- export* carries the value but not the namespace declaration; explicit re-export needed for import('jamilih').jml type access
export {jml} from './jml.js';

// Ignore else
/* c8 ignore next */
if (typeof process !== 'undefined') {
  const win = new JSDOM('').window;

  setWindow(win);
}
