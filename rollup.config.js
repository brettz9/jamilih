import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default [{
    input: 'jml-es6.js',
    output: {
        file: 'jml.js',
        format: 'umd',
        name: 'jml'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}, {
    input: 'jml-es6-node.js',
    output: {
        file: 'jml-node.js',
        format: 'cjs',
        name: 'jml'
    },
    external: [
        // jsdom
        'path', 'fs', 'vm', 'net', 'url', 'punycode', 'util', 'crypto',
        'buffer', 'http', 'https', 'stream', 'zlib', 'dgram', 'dns',
        'querystring', 'assert', 'string_decoder', 'tls', 'events',
        'child_process', 'os'
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        json(),
        resolve({
            preferBuiltins: true
        }),
        commonjs()
    ]
}];
