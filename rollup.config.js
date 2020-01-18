import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from 'rollup-plugin-re';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {"es"|"umd"} format Rollup format
 * @returns {external:RollupConfig}
 */
function noInnerHTML (format) {
  return {
    input: 'src/jml.js',
    output: {
      file: `dist/jml${format === 'es' ? '-es' : ''}-noinnerh.js`,
      format,
      name: 'jml',
      exports: 'named'
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

// eslint-disable-next-line import/no-anonymous-default-export
export default [{
  input: 'src/jml.js',
  output: {
    file: 'dist/jml.js',
    format: 'umd',
    name: 'jml',
    exports: 'named'
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
    name: 'jml',
    exports: 'named'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}, {
  input: 'src/jml-jsdom.js',
  output: {
    file: 'dist/jml-jsdom.js',
    format: 'cjs',
    name: 'jml',
    exports: 'named'
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
}, {
  input: 'src/jml-dominum.js',
  output: {
    file: 'dist/jml-dominum.js',
    format: 'cjs',
    name: 'jml',
    exports: 'named'
  },
  plugins: [
    babel(),
    resolve(),
    commonjs()
  ]
}];
