import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/GoogleCard.js',
  output: {
    file: 'dist/google-card.js',
    format: 'es',
    sourcemap: true,
    indent: '  ',
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
    terser({
      format: {
        beautify: true,      // Makes output readable
        comments: 'all',     // Preserves comments
        indent_level: 2,     // Indentation level
        indent_start: 0,     // Starting indentation level
        quote_style: 1,      // Use single quotes
        wrap_iife: true,     // Wrap IIFEs
        preamble: '// Google Card for Home Assistant\n// MIT License\n', // Optional header
      },
      mangle: false,         // Don't mangle variable names
      compress: {
        sequences: false,    // Don't combine consecutive statements with comma
        directives: false,   // Don't remove directives
      },
    })
  ],
  external: [
    'lit-element',
    'lit-html'
  ]
};
