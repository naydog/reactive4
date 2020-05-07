import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './src/reactive.js',
  external: [],
  output: {
    file: './dist/reactive.min.js',
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
    }),
    uglify()
  ]
};