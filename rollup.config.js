import sourcemaps from 'rollup-plugin-sourcemaps';
import buble from 'rollup-plugin-buble';

export default {
  input: 'lib/simple-dom.js',
  name: 'SimpleDOM',
  plugins: [
    sourcemaps(),
    buble(),
  ],
  output: {
    file: 'dist/simple-dom.js',
    format: 'umd',
  },
  sourcemap: true,
};
