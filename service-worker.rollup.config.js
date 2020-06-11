import json from '@rollup/plugin-json';

export default {
  input: 'client/sw.js',
  output: {
    dir: 'build/client/',
    format: 'cjs'
  },
  plugins: [json()]
};