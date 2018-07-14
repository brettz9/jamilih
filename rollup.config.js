import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';

function noInnerHTML (format) {
    return {
        input: 'src/jml.js',
        output: {
            file: `dist/jml${format === 'es' ? '-es' : ''}-noinnerh.js`,
            format,
            name: 'jml'
        },
        plugins: [
            replace({
                defines: {
                    IS_REMOVE: false
                }
            }),
            replace({
                patterns: [
                    {
                        include: ['src/jml.js'],
                        test: 'elContainer.innerHTML',
                        replace: 'elContainer.textContent'
                    }
                ]
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    };
}

export default [{
    input: 'src/jml.js',
    output: {
        file: 'dist/jml.js',
        format: 'umd',
        name: 'jml'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}, noInnerHTML('umd'), noInnerHTML('es'), {
    input: 'src/jml.js',
    output: {
        file: 'dist/jml-es.js',
        format: 'es',
        name: 'jml'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}, {
    input: 'src/jml-node.js',
    output: {
        file: 'dist/jml-node.js',
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
