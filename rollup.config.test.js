import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import nodeGlobals from 'rollup-plugin-node-globals';

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
    },
    external: ['buffer', 'fs', 'util', 'vm', 'http', 'path', 'child_process', 'events'],
    plugins: [
        nodeGlobals(),
        json(),
        nodeResolve(),
        commonjs({
            include: [
                'node_modules/nodeunit/**',
                'node_modules/ejs/**'
            ],
            namedExports: {
                'node_modules/nodeunit/index.js': ['reporters']
            }
        })
    ]
}];
