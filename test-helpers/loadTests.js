/* eslint-disable unicorn/prefer-global-this -- Easier */

import {jml, $, $$, nbsp, body, glue} from '../src/jml-jsdom.js';

const win = /** @type {unknown} */ jml.getWindow();

/* eslint-disable unicorn/no-global-object-property-assignment -- Test environment */
globalThis.window = /** @type {Window & typeof globalThis} */ (win);
globalThis.document = window.document;
globalThis.XMLSerializer = window.XMLSerializer;
/* eslint-enable unicorn/no-global-object-property-assignment -- Test environment */

export {jml, $, $$, nbsp, body, glue};
