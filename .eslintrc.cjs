'use strict';

module.exports = {
  extends: 'ash-nazg/sauron-node-overrides',
  parserOptions: {
    ecmaVersion: 2022
  },
  settings: {
    jsdoc: {
      mode: 'typescript'
    },
    polyfills: [
      'Array.from',
      'Array.isArray',
      'console',
      'document.body',
      'document.createComment',
      'document.createDocumentFragment',
      'document.querySelector',
      'document.querySelectorAll',
      'document.xmlEncoding',
      'document.xmlStandalone',
      'document.xmlVersion',
      'DOMParser',
      'Error',
      'JSON',
      'Object.assign',
      'Object.entries',
      'Object.keys',
      'Symbol',
      'Symbol.for',
      'XMLSerializer',
      'WeakMap',
      'window.customElements'
    ],
    coverage: true
  },
  overrides: [
    {
      files: ['test/test.*.js'],
      rules: {
        'import/unambiguous': 'off',
        'jsdoc/require-jsdoc': 'off',
        'compat/compat': 'off'
      },
      extends: [
        'plugin:chai-friendly/recommended',
        'plugin:chai-expect/recommended'
      ]
    },
    {
      files: ['*.md/*.js'],
      rules: {
        'eol-last': 'off',
        'no-console': 'off',
        'no-undef': 'off',
        'no-unused-vars': ['warn', {varsIgnorePattern: '^(jml|body|nbsp|input|input2|div|simpleAttachToParent|firstTr|trsFragment|\\$|\\$\\$)$'}],
        'padded-blocks': 'off',
        'import/unambiguous': 'off',
        'import/no-unresolved': 'off',
        'import/no-commonjs': 'off',
        'n/no-missing-import': 'off',
        'no-multi-spaces': 'off',
        'no-alert': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    },
    {
      files: ['*.html'],
      rules: {
        'import/unambiguous': 0
      }
    },
    {
      files: ['.*.js', 'docs/jsdoc-config.js'],
      extends: ['plugin:node/recommended-script'],
      rules: {
        'import/no-commonjs': 0
      }
    },
    {
      files: ['src/jml-jsdom.js'],
      globals: {
        require: true
      }
    }
  ],
  env: {
    node: true,
    browser: true
  },
  rules: {
    // Todo: Reenable
    'max-len': 0,
    'no-loop-func': 0,
    'prefer-named-capture-group': 0,
    'eslint-comments/require-description': 0
  }
};
