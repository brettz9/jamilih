import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default [{
    input: 'tests/jml-test.js',
    output: {
        file: 'tests/jml-test-node.js',
        format: 'umd',
        name: 'testJamilih'
    }
}, {
    input: 'test-helpers/loadTests.js',
    output: {
        file: 'test-helpers/loadTests-commonjs.js',
        format: 'cjs',
        name: 'testJamilihNodeunit'
    },
    external: ['buffer', 'fs', 'util', 'vm', 'http', 'path', 'child_process', 'events'],
    plugins: [
        json(),
        nodeResolve(),
        commonjs({
            include: [
                'node_modules/nodeunit/**',
                'node_modules/ejs/**'
            ],
            namedExports: {
                'node_modules/nodeunit/index.js': ['runModules']
            }
        })
    ]
}];
