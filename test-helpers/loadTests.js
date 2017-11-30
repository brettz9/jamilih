/* globals global, require */

import {runSuites} from './testLoading.js';

if (typeof module !== 'undefined') {
    global.window = new (require('jsdom').JSDOM)('');
    global.document = window.document;
    global.XMLSerializer = require('xmldom').XMLSerializer; // Can remove xmldom dependency once jsdom may implement: https://github.com/tmpvar/jsdom/issues/1368
}

runSuites(
    'test.toJML.js',
    'test.jml.js',
    'test.other-methods.js'
);
