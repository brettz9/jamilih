/*global loadJS, nodeunit, suites*/
[
    'test.toJML.js',
    'test.jml.js',
    'test.other-methods.js'
].forEach(loadJS);
nodeunit.run(suites);
