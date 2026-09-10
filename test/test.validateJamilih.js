// eslint-disable-next-line no-shadow -- Necessary
import {it, describe} from 'mocha';

import {expect, assert} from 'chai';

import {jml} from '../test-helpers/loadTests.js';

import {validateJamilih, isValidJamilih} from '../src/validateJamilih.js';

/**
 * @param {import('../src/validateJamilih.js').JamilihValidationResult} res
 * @returns {string[]}
 */
const codes = (res) => res.errors.map((e) => e.code);

describe('validateJamilih', function () {
  describe('structural well-formedness (Layer 1)', function () {
    it('accepts ordinary structures', () => {
      for (const struct of [
        ['br'],
        ['div', {id: 'a', class: 'b'}],
        ['div', [['span', ['text']], 'sibling text', ['b', {}, ['x']]]],
        ['div', {'#': [['span'], 'txt']}],
        ['ul', [['li', ['one']], ['li', ['two']]]],
        [{$text: 'hello'}],
        [{$attribute: [null, 'data-x', 'y']}],
        [{$DOCTYPE: {name: 'html'}}],
        ['!', 'a comment'],
        ['&', 'copy'],
        ['#', '1234'],
        ['?', 'target', 'value'],
        ['div', {$on: {}}],
        [{$document: {childNodes: [['html', [['head'], ['body']]]]}}]
      ]) {
        assert.isTrue(
          isValidJamilih(struct),
          `expected valid: ${JSON.stringify(struct)}`
        );
      }
    });

    it('rejects a non-array / empty structure', () => {
      assert.deepEqual(codes(validateJamilih('div')), ['NOT_ARRAY']);
      assert.deepEqual(codes(validateJamilih([])), ['EMPTY_ARRAY']);
    });

    it('rejects a misplaced `null`', () => {
      const res = validateJamilih(['div', null, ['span']]);
      assert.deepEqual(codes(res), ['MISPLACED_NULL']);
      assert.equal(res.errors[0].path, '/1');
      assert.isTrue(isValidJamilih(['div', ['span'], null]), 'trailing null is fine');
    });

    it('rejects a special string without its following argument', () => {
      assert.deepEqual(codes(validateJamilih(['&'])), ['BAD_SPECIAL_ARG']);
      assert.deepEqual(codes(validateJamilih(['?', 'target'])), ['BAD_PROCESSING_INSTRUCTION']);
    });

    it('rejects bad children', () => {
      assert.deepEqual(codes(validateJamilih(['div', [null]])), ['BAD_CHILD']);
      assert.deepEqual(codes(validateJamilih(['div', [() => { /* empty */ }]])), ['BAD_CHILD']);
      assert.deepEqual(codes(validateJamilih(['div', [[]]])), ['BAD_CHILD']);
      assert.deepEqual(codes(validateJamilih(['div', [[1, 2]]])), ['BAD_CHILD']);
    });
  });

  describe('`format` (Layer 2)', function () {
    it('`json` rejects live-JS constructs', () => {
      const cases = [
        [['div', {$on: {click () { /* empty */ }}}], 'NON_JSON_CONSTRUCT'],
        [['input', {$symbol: ['s', () => { /* empty */ }]}], 'NON_JSON_CONSTRUCT'],
        [['my-el', {$define: {m () { /* empty */ }}}], 'NON_JSON_CONSTRUCT'],
        [['div', {$data: true}], 'NON_JSON_CONSTRUCT'],
        [['div', {onclick () { /* empty */ }}], 'NON_JSON_CONSTRUCT'],
        [['div', {title: undefined}], 'NON_JSON_VALUE'],
        [['div', {'data-x': NaN}], 'NON_JSON_VALUE'],
        [['div', {$custom: {when: new Date()}}], 'NON_JSON_VALUE'],
        [['div', {$custom: {fn () { /* empty */ }}}], 'NON_JSON_VALUE']
      ];
      for (const [struct, code] of cases) {
        const res = validateJamilih(struct, {format: 'json'});
        assert.isFalse(res.valid, `expected invalid: ${JSON.stringify(struct)}`);
        assert.include(codes(res), code, JSON.stringify(struct));
      }
    });

    it('`json` accepts a pure structure', () => {
      assert.isTrue(isValidJamilih(
        ['section', {id: 'x', 'data-n': 3, hidden: true}, [
          ['h1', ['Title']],
          [{$text: 'loose'}],
          ['p', {}, ['body ', ['b', ['bold']]]]
        ]],
        {format: 'json'}
      ));
    });

    it('`json` forces DOM rejection and reports `OPTION_CONFLICT` when `allowDOM: true`', () => {
      const res = validateJamilih(['div', [{nodeType: 1}]], {format: 'json', allowDOM: true});
      assert.include(codes(res), 'OPTION_CONFLICT');
      assert.include(codes(res), 'DOM_NODE_NOT_ALLOWED');
    });
  });

  describe('`allowInnerHTML`', function () {
    it('rejects `innerHTML` only when false', () => {
      assert.isTrue(isValidJamilih(['div', {innerHTML: '<b>x</b>'}]));
      const res = validateJamilih(['div', {innerHTML: '<b>x</b>'}], {allowInnerHTML: false});
      assert.deepEqual(codes(res), ['INNERHTML_NOT_ALLOWED']);
      assert.equal(res.errors[0].path, '/1/innerHTML');
    });
  });

  describe('`allowDOM`', function () {
    it('rejects a fake DOM node in each position when false', () => {
      const node = {nodeType: 1};
      for (const struct of [
        [node],
        ['div', [node]],
        ['div', {$shadow: {content: node}}]
      ]) {
        assert.include(
          codes(validateJamilih(struct, {allowDOM: false})),
          'DOM_NODE_NOT_ALLOWED',
          JSON.stringify(struct)
        );
      }
      assert.isTrue(isValidJamilih(['div', [{nodeType: 1}]]), 'allowed by default');
    });
  });

  describe('`allowableOptions`', function () {
    it('defaults to the builtin option keys', () => {
      assert.isTrue(isValidJamilih([{$Map: [new Map(), {}]}, 'div']));
      assert.isTrue(isValidJamilih([{$plugins: [{name: '$_x', set () { /* empty */ }}]}, 'div']));
    });

    it('rejects an unknown `$`-key not whitelisted', () => {
      const res = validateJamilih(['div', {$if: ['x']}]);
      assert.deepEqual(codes(res), ['UNKNOWN_MAGIC_PROPERTY']);
      assert.equal(res.errors[0].path, '/1/$if');
    });

    it('accepts whitelisted keys and the `any` wildcard', () => {
      assert.isTrue(isValidJamilih(['div', {$if: ['x']}], {allowableOptions: ['$if']}));
      assert.isTrue(isValidJamilih(['div', {$whatever: 1}], {allowableOptions: ['any']}));
      assert.isTrue(isValidJamilih(['div', {$whatever: 1}], {allowableOptions: ['*']}));
    });

    it('`default` sentinel merges with extras; a bare list replaces the defaults', () => {
      assert.isTrue(isValidJamilih(
        [{$Map: [new Map(), {}]}, 'div'],
        {allowableOptions: ['default', '$if']}
      ));
      assert.isTrue(isValidJamilih([{$Map: [new Map(), {}]}, 'div'], {allowableOptions: ['default']}));
      const res = validateJamilih([{$Map: [new Map(), {}]}, 'div'], {allowableOptions: ['$if']});
      assert.deepEqual(codes(res), ['DISALLOWED_OPTION']);
    });

    it('`[]` forbids the leading options object entirely', () => {
      const res = validateJamilih([{$Map: [new Map(), {}]}, 'div'], {allowableOptions: []});
      assert.deepEqual(codes(res), ['OPTIONS_OBJECT_NOT_ALLOWED']);
    });

    it('still runs the `format` leaf check inside a whitelisted opaque value', () => {
      const res = validateJamilih(
        ['div', [[{$if: ['$c', () => { /* empty */ }]}]]],
        {format: 'json', allowableOptions: ['$if']}
      );
      assert.deepEqual(codes(res), ['NON_JSON_VALUE']);
    });
  });

  describe('reserved / misplaced', function () {
    it('flags author-supplied `$state` / `$mode` as `RESERVED_OPTION`', () => {
      assert.deepEqual(
        codes(validateJamilih([{$plugins: [], $state: 'root'}, 'div'])),
        ['RESERVED_OPTION']
      );
      assert.include(
        codes(validateJamilih(['div', {$mode: 'svg'}])),
        'RESERVED_OPTION'
      );
    });

    it('flags a root-only option on a nested array head once', () => {
      const res = validateJamilih(['div', [[{$Map: [new Map(), {}]}, 'span']]]);
      assert.deepEqual(codes(res), ['MISPLACED_OPTIONS_OBJECT']);
      assert.equal(res.errors[0].path, '/1/0/0/$Map');
    });
  });

  describe('templating fixtures', function () {
    const loggedInBranch = ['div', [
      ['h1', ['Our site']],
      [{$if: ['$param == "loggedIn"', ['span', ['Welcome back!']], ['a', {href: '/signin'}, ['Please sign in']]]}]
    ]];
    const forEachTpl = ['select', {$forEach: ['$..car', ['option', ['$']]]}];

    it('validate clean with the right whitelist or `any`', () => {
      assert.isTrue(isValidJamilih(loggedInBranch, {allowableOptions: ['$if']}));
      assert.isTrue(isValidJamilih(loggedInBranch, {allowableOptions: ['any']}));
      assert.isTrue(isValidJamilih(forEachTpl, {allowableOptions: ['$forEach']}));
    });

    it('report `UNKNOWN_MAGIC_PROPERTY` without the whitelist', () => {
      assert.deepEqual(codes(validateJamilih(loggedInBranch)), ['UNKNOWN_MAGIC_PROPERTY']);
      assert.equal(validateJamilih(loggedInBranch).errors[0].path, '/1/1/0/$if');
      assert.deepEqual(codes(validateJamilih(forEachTpl)), ['UNKNOWN_MAGIC_PROPERTY']);
      assert.equal(validateJamilih(forEachTpl).errors[0].path, '/1/$forEach');
    });
  });

  describe('`failFast`', function () {
    it('collects all errors by default, one with `failFast: true`', () => {
      const struct = ['div', {$a: 1, $b: 2}, [() => { /* empty */ }]];
      assert.isAbove(validateJamilih(struct).errors.length, 1);
      assert.lengthOf(validateJamilih(struct, {failFast: true}).errors, 1);
    });
  });

  describe('option validation', function () {
    it('throws on an unknown `format`', () => {
      // @ts-expect-error deliberate bad option
      expect(() => validateJamilih(['div'], {format: 'lite'})).to.throw(TypeError, 'Unknown `format`');
    });
    it('throws when `allowableOptions` is not an array', () => {
      // @ts-expect-error deliberate bad option
      expect(() => validateJamilih(['div'], {allowableOptions: '$if'})).to.throw(TypeError);
    });
  });

  describe('cross-check against `jml()`', function () {
    it('structures reported valid do not throw in `jml()`', () => {
      for (const struct of /** @type {import('../src/jml.js').JamilihArray[]} */ ([
        ['div', {id: 'x', class: 'y'}, [['span', ['hi']], ' and ', ['b', ['bold']]]],
        ['ul', [['li', ['a']], ['li', ['b']]]],
        ['div', {'#': [['span'], 'txt']}],
        ['div', {$if: ['ignored']}], // unrecognized `$`-key: jml() no-ops it
        ['section', {hidden: true, 'data-n': 3}, [['p', ['body']]]]
      ])) {
        assert.isTrue(isValidJamilih(struct, {allowableOptions: ['any']}), JSON.stringify(struct));
        expect(() => jml(...struct)).to.not.throw();
      }
    });
  });

  describe('exhaustive branch coverage', function () {
    const noop = () => { /* empty */ };
    const protoObj = JSON.parse('{"__proto__":{"compromised":true}}');
    const protoFn = () => { /* empty */ };
    Object.defineProperty(protoFn, '__proto__', {
      value: {compromised: true}, enumerable: true, configurable: true, writable: true
    });

    /* eslint-disable camelcase -- `$_`-prefixed plugin keys are intentional */
    /** @type {[string, unknown, import('../src/validateJamilih.js').ValidateJamilihOptions, string|null][]} */
    const cases = [
      // --- special first-argument strings ---
      ['#x reference', ['#x', 'a1'], {}, null],
      ['CDATA', ['![', 'escaped <&>'], {}, null],
      ['#x without arg', ['#x'], {}, 'BAD_SPECIAL_ARG'],
      ['CDATA without arg', ['!['], {}, 'BAD_SPECIAL_ARG'],
      ['entity followed by non-string', ['&', {}], {}, 'BAD_SPECIAL_ARG'],

      // --- argument sequence ---
      ['number in arg position', [42], {}, 'UNKNOWN_TYPE'],
      ['undefined in arg position', [undefined], {}, 'BAD_FIRST_ARG'],
      ['Map in arg position', [new Map()], {}, 'DOM_NODE_NOT_ALLOWED'],
      ['class instance in arg position', [new Date()], {}, 'UNKNOWN_TYPE'],
      ['DOM node arg allowed by default', [{nodeType: 1}], {}, null],

      // --- leading object ---
      ['genuine attribute before an element', [{id: 'x'}, 'div'], {}, 'ATTRIBUTES_BEFORE_ELEMENT'],
      ['attribute-only leading object', [{class: 'x', id: 'y'}], {}, 'ATTRIBUTES_BEFORE_ELEMENT'],
      ['dialect-only leading object is skipped', [{$if: [1]}, 'div'], {}, null],
      ['empty leading object is skipped', [{}, 'div'], {}, null],
      ['`$state` on a leading (non-options) object', [{$state: 'x'}, 'div'], {}, 'RESERVED_OPTION'],
      ['`$mode` on a leading (non-options) object', [{$mode: 'x'}, 'div'], {}, 'RESERVED_OPTION'],
      ['genuine attribute mixed onto an options object', [{$Map: [new Map(), {}], id: 'x'}, 'div'], {}, 'ATTRIBUTES_BEFORE_ELEMENT'],
      ['dialect `$`-key mixed onto an options object (whitelisted)', [{$Map: [new Map(), {}], $if: 1}, 'div'], {allowableOptions: ['default', '$if']}, null],
      ['`$text` node as leading object', [{$text: 'hi'}], {}, null],

      // --- children ---
      ['`#` fragment child (valid)', ['div', [{'#': [['span'], 'txt']}]], {}, null],
      ['`#` fragment child not an array', ['div', [{'#': 'x'}]], {}, 'BAD_CHILD'],
      ['NaN text child in json', ['div', [NaN]], {format: 'json'}, 'NON_JSON_VALUE'],
      ['plain-object child (no `#`, not `$`)', ['div', [{foo: 1}]], {}, 'BAD_CHILD'],
      ['Map child', ['div', [new Map()]], {}, 'BAD_CHILD'],
      ['class-instance child', ['div', [new Date()]], {}, 'BAD_CHILD'],
      ['`$state` on a bare object child', ['div', [{$state: 'x'}]], {}, 'MISPLACED_OPTIONS_OBJECT'],
      ['`$Map` on a bare object child', ['div', [{$Map: 1}]], {}, 'MISPLACED_OPTIONS_OBJECT'],
      ['bare `$text` object child', ['div', [{$text: 'x'}]], {}, 'BAD_CHILD'],
      ['unknown `$`-key bare object child', ['div', [{$foo: 1}]], {}, 'UNKNOWN_MAGIC_PROPERTY'],
      ['unknown `$`-key bare object in array child', ['div', [[{$foo: 1}]]], {}, 'UNKNOWN_MAGIC_PROPERTY'],
      ['whitelisted `$`-key bare object in array child', ['div', [[{$foo: 1}]]], {allowableOptions: ['$foo']}, null],
      ['whitelisted `$`-key bare object child', ['div', [{$foo: 1}]], {allowableOptions: ['$foo']}, null],
      ['json leaf-check inside bare `$`-key child', ['div', [{$foo: noop}]], {format: 'json', allowableOptions: ['$foo']}, 'NON_JSON_VALUE'],
      ['child array headed by a number', ['div', [[7]]], {}, 'BAD_CHILD'],

      // --- deep `checkJSONValue` ---
      ['deep DOM node in json', ['div', {'data-x': {n: {nodeType: 1}}}], {format: 'json'}, 'NON_JSON_VALUE'],
      ['deep Map in json', ['div', {'data-x': {m: new Map()}}], {format: 'json'}, 'NON_JSON_VALUE'],
      ['array recursion in json', ['div', {'data-x': [1, 2, () => 3]}], {format: 'json'}, 'NON_JSON_VALUE'],
      ['nested plain object in json is fine', ['div', {'data-x': {ok: 'y', deep: {n: 1}}}], {format: 'json'}, null],

      // --- attributes object magic keys ---
      ['null attribute value in json', ['div', {title: null}], {format: 'json'}, null],
      ['non-string `innerHTML` value', ['div', {innerHTML: 5}], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['option key in a plain attributes object', ['div', {$Map: 1}], {}, 'MISPLACED_OPTIONS_OBJECT'],
      ['`#` not an array in attributes', ['div', {'#': 'x'}], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$text` not a string', ['div', {$text: 5}], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$attribute` too short', [{$attribute: ['solo']}], {}, 'BAD_ATTRIBUTE_NODE'],
      ['`$attribute` too long', [{$attribute: [null, 'n', 'v', 'x']}], {}, 'BAD_ATTRIBUTE_NODE'],
      ['`$attribute` non-string value', [{$attribute: [null, 'n', 5]}], {}, 'BAD_ATTRIBUTE_NODE'],
      ['`$DOCTYPE` missing name', [{$DOCTYPE: {}}], {}, 'BAD_DOCTYPE'],
      ['`$DOCTYPE` not an object', [{$DOCTYPE: 5}], {}, 'BAD_DOCTYPE'],
      ['`$document` not an object', [{$document: 5}], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$document` head/body arrays', [{$document: {head: [['title', ['t']]], body: [['p', ['x']]]}}], {}, null],
      ['`$on` not an object', ['div', {$on: 5}], {}, 'BAD_ON_HANDLER'],
      ['`$on` bad handler value', ['div', {$on: {click: 5}}], {}, 'BAD_ON_HANDLER'],
      ['`$on` `[fn, capturing]` form', ['div', {$on: {click: [noop, true]}}], {}, null],
      ['`$symbol` wrong length (js)', ['input', {$symbol: ['s']}], {}, 'BAD_SYMBOL'],
      ['`$symbol` bad name type (js)', ['input', {$symbol: [5, noop]}], {}, 'BAD_SYMBOL'],
      ['`$symbol` bad value type (js)', ['input', {$symbol: ['s', 5]}], {}, 'BAD_SYMBOL'],
      ['`$symbol` valid (js)', ['input', {$symbol: ['s', noop]}], {}, null],
      ['`$symbol` object value (js)', ['input', {$symbol: ['s', {elem: 1}]}], {}, null],
      ['`$define` wrong type (js)', ['my-el', {$define: 5}], {}, 'BAD_DEFINE'],
      ['`$define` function (js)', ['my-el', {$define () { /* empty */ }}], {}, null],
      ['`$define` array (js)', ['my-el', {$define: [function () { /* empty */ }]}], {}, null],
      ['`$data` wrong type (js)', ['div', {$data: 5}], {}, 'BAD_DATA'],
      ['`$data` true (js)', ['div', {$data: true}], {}, null],
      ['`$data` data object (js)', ['div', {$data: {k: 1}}], {}, null],
      ['`$data` Map (js)', ['div', {$data: new Map()}], {}, null],
      ['`$custom` object defining `__proto__`', ['div', {$custom: protoObj}], {}, 'BAD_CUSTOM_PROTO'],
      ['`$custom` function defining `__proto__`', ['div', {$custom: protoFn}], {}, 'BAD_CUSTOM_PROTO'],
      ['`$custom` null value', ['div', {$custom: null}], {}, null],
      ['`$custom` JSON values (json)', ['div', {$custom: {a: 1}}], {format: 'json'}, null],
      ['`$shadow` not an object', ['div', {$shadow: 5}], {}, 'BAD_SHADOW'],
      ['`$shadow` bad slot type', ['div', {$shadow: {template: 5}}], {}, 'BAD_SHADOW'],
      ['`$shadow` string/boolean slots', ['div', {$shadow: {template: '#tpl', content: true}}], {}, null],
      ['`$shadow` array slot', ['div', {$shadow: {content: [['span']]}}], {}, null],
      ['plugin key non-JSON value (json)', ['div', {$_myplugin: () => 1}], {format: 'json'}, 'NON_JSON_VALUE'],
      ['plugin key JSON value', ['div', {$_myplugin: {a: 1}}], {}, null],
      ['`on*` string value', ['div', {onclick: 'code'}], {}, null],
      ['`on*` function value (json)', ['div', {onclick: noop}], {format: 'json'}, 'NON_JSON_CONSTRUCT'],
      ['`on*` function value (js)', ['div', {onclick: noop}], {}, null],

      // --- options object ---
      ['unknown `$`-key on options object', [{$Map: [new Map(), {}], $foo: 1}, 'div'], {}, 'UNKNOWN_MAGIC_PROPERTY'],
      ['unknown `$`-key on options object, whitelisted', [{$Map: [new Map(), {}], $foo: 1}, 'div'], {allowableOptions: ['default', '$foo']}, null],
      ['`$plugins` not an array', [{$plugins: 5}, 'div'], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$plugins` entry not an object', [{$plugins: [5]}, 'div'], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$plugins` bad name', [{$plugins: [{name: 'x', set () { /* empty */ }}]}, 'div'], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$plugins` `set` not a function', [{$plugins: [{name: '$_x', set: 5}]}, 'div'], {}, 'BAD_ATTRIBUTES_OBJECT'],
      ['`$plugins` under json', [{$plugins: [{name: '$_x', set () { /* empty */ }}]}, 'div'], {format: 'json', allowableOptions: ['default']}, 'NON_JSON_CONSTRUCT'],
      ['`$Map` bad shape', [{$Map: 5}, 'div'], {}, 'BAD_DATA'],
      ['`$Map` under json', [{$Map: [new Map(), {}]}, 'div'], {format: 'json', allowableOptions: ['default']}, 'NON_JSON_CONSTRUCT'],
      ['`$Map` `{root}` form', [{$Map: {root: [new Map(), {}]}}, 'div'], {}, null],
      ['`$Map` `[undefined, value]` form', [{$Map: [undefined, {}]}, 'div'], {}, null]
    ];
    /* eslint-enable camelcase -- restore */

    for (const [label, struct, opts, expected] of cases) {
      it(label, () => {
        const res = validateJamilih(struct, opts);
        if (expected === null) {
          assert.deepEqual(res.errors, [], `expected valid: ${label}`);
        } else {
          assert.include(codes(res), expected, `expected ${expected}: ${label}`);
        }
      });
    }
  });
});
