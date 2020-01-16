/* eslint-env node */
import {assert, expect} from 'chai';
import {jml, glue, nbsp, $, $$, body} from '../src/jml-polyglot.js';

global.assert = assert;
global.expect = expect;

global.window = jml.getWindow();
global.Event = window.Event;
global.DOMParser = window.DOMParser;
global.Node = window.Node;
global.document = jml.getDocument();
global.XMLSerializer = jml.getXMLSerializer();
global.jml = jml;
global.glue = glue;
global.nbsp = nbsp;
global.$ = $;
global.$$ = $$;
global.body = body;
