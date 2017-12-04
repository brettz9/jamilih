/* globals nodeunit */
import jml from '../jml-es6.js';

import jmlTests from '../test/test.jml.js';
import otherMethodsTests from '../test/test.other-methods.js';
import toJMLTests from '../test/test.toJML.js';

window.jml = jml;

const tests = {jmlTests, otherMethodsTests, toJMLTests};

// Todo:
// see loadTests-node file on problems compiling nodeunit
nodeunit.run(
    Object.entries(tests).reduce((suites, [suiteName, suite]) => {
        const tests = nodeunit.testCase(suite); // Calls `setup`
        suites[suiteName] = tests;
        return suites;
    }, {})
);
