/* globals glue, nbsp */

const testCase = {
    'glue()' (test) {
        test.expect(1);
        const expected = ['a', '\u00A0', 'b', '\u00A0', 'c'];
        const result = glue(['a', 'b', 'c'], nbsp);
        test.deepEqual(expected, result, 'Simple glue');
        test.done();
    }
};
export default testCase;
