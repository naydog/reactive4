import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: './src/reactive.js',
  external: [],
  sourceMap: true,
  output: {
    file: './dist/reactive.js',
    name: 'r4',
    format: 'umd',
    paths: {
      // jquery: 'jquery',
      // jointjs: 'joint',
    }
  },
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      "plugins": [
        // "external-helpers"
      ],
      include: 'src/**'
    })
  ]
};