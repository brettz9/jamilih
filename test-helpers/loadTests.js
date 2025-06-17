/* eslint-env node */
/* eslint-disable unicorn/prefer-global-this -- Easier */

import {jml, $, $$, nbsp, body, glue} from '../src/jml-jsdom.js';

const win = /** @type {unknown} */ jml.getWindow();

globalThis.window = /** @type {Window & typeof globalThis} */ (win);
globalThis.document = window.document;
globalThis.XMLSerializer = window.XMLSerializer;

export {jml, $, $$, nbsp, body, glue};
