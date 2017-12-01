import * as nodeunit from 'nodeunit';

import jmlTests from '../test/test.jml.js';
import otherMethodsTests from '../test/test.other-methods.js';
import toJMLTests from '../test/test.toJML.js';

nodeunit.runModules({
    jmlTests,
    otherMethodsTests,
    toJMLTests
}, {});
