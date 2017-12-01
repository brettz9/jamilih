import babel from 'rollup-plugin-babel';

export default {
    input: 'jml-es6.js',
    output: {
        file: 'jml.js',
        format: 'umd',
        name: 'jml'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
