/* eslint-env node */
import jml from '../jml-es6-node.js';

import jmlTests from '../test/test.jml.js';
import otherMethodsTests from '../test/test.other-methods.js';
import toJMLTests from '../test/test.toJML.js';

global.window = jml.getWindow();
global.Event = window.Event;
global.DOMParser = window.DOMParser;
global.Node = window.Node;
global.document = jml.getDocument();
global.XMLSerializer = jml.getXMLSerializer();
global.jml = jml;

// This has problems as a regular `import` even when compiling
//   with node-globals plugin (a `this` context issue which
//   I could not seem to fix); if we could fix this, then our
//   item above could be removed
require('nodeunit').reporters.default.run({
    jmlTests,
    otherMethodsTests,
    toJMLTests
});
