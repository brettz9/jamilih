export default [{
    input: 'tests/jml-test.js',
    output: {
        file: 'tests/jml-test-node.js',
        format: 'umd',
        name: 'testJamilih'
    }
    // , context: 'global'
}, {
    // We're not really using this now; keeping in case decide to retry for `nodeunit`
    input: 'test-helpers/loadTests.js',
    output: {
        file: 'test-helpers/loadTests-commonjs.js',
        format: 'cjs',
        name: 'testJamilihNodeunit'
    }
}];
