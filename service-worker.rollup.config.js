import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';


export default {
  input: 'client/sw.js',
  output: {
    dir: 'build/client/',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [json(), terser({}), minifyHTML()]
};