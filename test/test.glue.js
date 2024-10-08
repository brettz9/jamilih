// eslint-disable-next-line no-shadow -- Necessary
import {describe, it} from 'mocha';

import {assert} from 'chai';

import {glue, nbsp} from '../test-helpers/loadTests.js';

describe('Jamilih - glue()', function () {
  it('glue()', () => {
    const expected = ['a', '\u00A0', 'b', '\u00A0', 'c'];
    const result = glue(['a', 'b', 'c'], nbsp);
    assert.deepEqual(result, expected, 'Simple glue');
  });
});
