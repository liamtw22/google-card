import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/GoogleCard.js',
  output: {
    dir: 'dist',
    format: 'es',
    filename: 'google-card.js'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),
    terser()
  ],
  external: [
    'lit-element',
    'lit-html'
  ]
};
