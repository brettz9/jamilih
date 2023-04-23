/* eslint-env node */

import {jml, $, $$, nbsp, body, glue} from '../src/jml-jsdom.js';

const win = /** @type {unknown} */ jml.getWindow();

globalThis.window = /** @type {Window & typeof globalThis} */ (win);
globalThis.document = window.document;
globalThis.XMLSerializer = window.XMLSerializer;

export {jml, $, $$, nbsp, body, glue};
