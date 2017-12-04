import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default [{
    // We're not really using this now; keeping in case decide to retry for `nodeunit`
    input: 'test-helpers/loadTests-node.js',
    output: {
        file: 'test-helpers/loadTests-commonjs.js',
        format: 'cjs',
        name: 'testJamilihNodeunit'
    },
    external: [
        // jsdom
        'path', 'fs', 'vm', 'net', 'url', 'punycode', 'util', 'crypto',
        'buffer', 'http', 'https', 'stream', 'zlib', 'dgram', 'dns',
        'querystring', 'assert', 'string_decoder', 'tls', 'events',
        'child_process', 'os'
    ],
    plugins: [
        globals(),
        builtins(),
        json(),
        resolve({
            preferBuiltins: true
        }),
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/jsdom/lib/api.js': ['JSDOM']
            }
        })
    ]
}];
