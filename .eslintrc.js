module.exports = {
  "extends": "ash-nazg/sauron",
  "parserOptions": {
      "sourceType": "module"
  },
  "settings": {
    "polyfills": [
        "Array.from",
        "Array.isArray",
        "console",
        "document.body",
        "document.createComment",
        "document.querySelector",
        "document.querySelectorAll",
        "document.xmlEncoding",
        "document.xmlStandalone",
        "document.xmlVersion",
        "DOMParser",
        "Error",
        "JSON",
        "Object.assign",
        "Object.entries",
        "Object.keys",
        "Symbol",
        "Symbol.for",
        "XMLSerializer",
        "WeakMap",
        "window.customElements"
    ],
    "coverage": true
  },
  overrides: [
      {
          files: ['test/test.*.js'],
          rules: {
              'import/unambiguous': 'off'
          },
          extends: [
            'plugin:chai-friendly/recommended',
            'plugin:chai-expect/recommended'
          ],
          env: {mocha: true},
          globals: {
              assert: 'readonly',
              expect: 'readonly',
              jml: 'readonly',
              glue: 'readonly',
              nbsp: 'readonly',
              $: 'readonly',
              $$: 'readonly',
              body: 'readonly'
          }
      },
      {
        files: ["*.md"],
        rules: {
          "eol-last": "off",
          "no-console": "off",
          "no-undef": "off",
          "no-unused-vars": ["warn", {varsIgnorePattern: "^(jml|body|nbsp|input|input2|div|simpleAttachToParent|firstTr|trsFragment|\\$|\\$\\$)$"}],
          "padded-blocks": "off",
          "import/unambiguous": "off",
          "import/no-unresolved": "off",
          "import/no-commonjs": "off",
          "node/no-missing-import": "off",
          "no-multi-spaces": "off",
          "no-alert": "off",
          // Disable until may fix https://github.com/gajus/eslint-plugin-jsdoc/issues/211
          "indent": "off"
        }
      },
      {
        files: ["*.html"],
        rules: {
          "import/unambiguous": 0
        }
      }
  ],
  "env": {
      "node": false,
      "browser": true
  },
  "rules": {
    // Todo: Reenable
    "max-len": 0,
    "no-loop-func": 0,
    "prefer-named-capture-group": 0
  }
};
