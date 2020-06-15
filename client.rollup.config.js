import { terser } from 'rollup-plugin-terser';

export default {
  input: 'client/client.js',
  output: {
    dir: 'build/client',
    format: 'esm',
    sourcemap: true
  },
  plugins: [terser({})]
};