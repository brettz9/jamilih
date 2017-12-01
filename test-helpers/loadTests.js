/* globals require, nodeunit */
import jmlTests from '../test/test.jml.js';
import otherMethodsTests from '../test/test.other-methods.js';
import toJMLTests from '../test/test.toJML.js';

if (typeof nodeunit !== 'undefined') { // Browser
    nodeunit.run({
        jmlTests,
        otherMethodsTests,
        toJMLTests
    });
} else {
    // This has problems as a regular `import` even when compiling
    //   with node-globals plugin (a `this` context issue which
    //   I could not seem to fix); if we could fix this, then our
    //   item above could be removed
    require('nodeunit').reporters.default.run({
        jmlTests,
        otherMethodsTests,
        toJMLTests
    });
}
