/* eslint-env node */
import {assert, expect} from 'chai';
import {jml, glue, nbsp, $, $$, body} from '../src/jml-jsdom.js';

global.assert = assert;
global.expect = expect;

global.window = jml.getWindow();
global.document = window.document;
global.XMLSerializer = window.XMLSerializer;

window.WeakMap = WeakMap;
window.Map = Map;

global.jml = jml;
global.glue = glue;
global.nbsp = nbsp;
global.$ = $;
global.$$ = $$;
global.body = body;
