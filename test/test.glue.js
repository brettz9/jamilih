describe('Jamilih - glue()', function () {
    it('glue()', () => {
        const expected = ['a', '\u00A0', 'b', '\u00A0', 'c'];
        const result = glue(['a', 'b', 'c'], nbsp);
        assert.deepEqual(expected, result, 'Simple glue');
    });
});
