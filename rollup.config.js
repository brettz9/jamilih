import {babel} from '@rollup/plugin-babel';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from 'rollup-plugin-re';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {"es"|"umd"} format Rollup format
 * @returns {RollupConfig}
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
        babelHelpers: 'bundled',
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
    name: 'jml',
    exports: 'named'
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}, noInnerHTML('umd'), noInnerHTML('es'), {
  input: 'src/jml.js',
  output: {
    file: 'dist/jml-es.js',
    format: 'es',
    exports: 'named'
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}, {
  input: 'src/jml-jsdom.js',
  output: {
    file: 'dist/jml-jsdom.cjs',
    format: 'cjs',
    exports: 'named'
  },
  external: [
    // jsdom
    'path', 'fs', 'vm', 'net', 'url', 'punycode', 'util', 'crypto',
    'buffer', 'http', 'https', 'stream', 'zlib', 'dgram', 'dns',
    'querystring', 'assert', 'string_decoder', 'tls', 'events',
    'child_process', 'os', 'canvas'
  ],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    json(),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs()
  ]
}, {
  input: 'plugins/getInterpolator.js',
  output: {
    file: 'dist/getInterpolator.js',
    format: 'umd',
    name: 'Interpolator',
    exports: 'named'
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}];
