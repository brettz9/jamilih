/* eslint-env node */
import {assert} from 'chai';
import {jml, glue, nbsp} from '../src/jml-polyglot.js';

global.assert = assert;

global.window = jml.getWindow();
global.Event = window.Event;
global.DOMParser = window.DOMParser;
global.Node = window.Node;
global.document = jml.getDocument();
global.XMLSerializer = jml.getXMLSerializer();
global.jml = jml;
global.glue = glue;
global.nbsp = nbsp;
