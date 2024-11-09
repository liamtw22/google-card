import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/GoogleCard.js',
  output: {
    file: 'dist/google-card.js',
    format: 'es',
    sourcemap: true,
    indent: '  ',
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelHelpers: 'runtime',
      exclude: /node_modules/,
      presets: [
        ['@babel/preset-env', {
          targets: {
            esmodules: true
          },
          modules: false,
          bugfixes: true,
          loose: true
        }]
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          regenerator: true,
          corejs: 3,
          helpers: true,
          useESModules: true
        }],
        ['@babel/plugin-proposal-decorators', {
          version: "2023-05",
          decoratorsBeforeExport: true
        }],
        ['@babel/plugin-proposal-class-properties', {
          loose: true
        }],
        '@babel/plugin-transform-classes',
        '@babel/plugin-transform-async-to-generator'
      ]
    }),
    terser({
      format: {
        beautify: true,
        comments: 'all',
        indent_level: 2,
        indent_start: 0,
        quote_style: 1,
        wrap_iife: true,
        preamble: '// Google Card for Home Assistant\n// MIT License\n',
      },
      mangle: false,
      compress: {
        sequences: false,
        directives: false,
      },
      keep_classnames: true,
      keep_fnames: true
    })
  ],
  external: [
    'lit-element',
    'lit-html',
    /@babel\/runtime/
  ]
};
