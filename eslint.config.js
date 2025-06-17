import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: [
      'dist',
      'docs/jsdoc',
      'coverage',
      'ignore',
      'compressed-source'
    ]
  },
  ...ashNazg(['sauron', 'browser']),
  {
    files: ['test/test.*.js'],
    rules: {
      'import/unambiguous': 'off',
      'jsdoc/require-jsdoc': 'off'
    }
  },
  {
    files: ['docs/jsdoc-config.js'],
    languageOptions: {
      globals: {
        module: 'readonly'
      }
    },
    rules: {
      'import/unambiguous': 'off',
      // Not sure why not being disabled in ash-nazg
      'import/no-commonjs': 'off'
    }
  },
  {
    files: ['*.md/*.js'],
    rules: {
      'eol-last': 'off',
      'sonarjs/no-internal-api-use': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      camelcase: 'off',
      'no-unused-vars': ['warn', {
        varsIgnorePattern: String.raw`^(jml|body|nbsp|input|input2|div|simpleAttachToParent|firstTr|trsFragment|\$|\$\$)$`
      }],
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
    rules: {
      // Todo: Reenable
      '@stylistic/max-len': 0,
      '@eslint-community/eslint-comments/require-description': 0,

      'no-loop-func': 0,
      'prefer-named-capture-group': 0
    }
  }
];
