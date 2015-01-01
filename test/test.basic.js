/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jml = require('../jml'),
    testCase = require('nodeunit').testCase,
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer;

var xml = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html').documentElement;


module.exports = testCase({

    // ============================================================================
    'simple parent selection, return both path and value': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['div', {'class': 'test'}, ['someContent']];
        var result = jml.toJML(xml);
        test.deepEqual(expected, result);
        test.done();
    }

});

}());
