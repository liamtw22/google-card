import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/GoogleCard.js',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    json(),
    minifyHTML(),
    terser({
      format: {
        comments: false
      }
    }),
    copy({
      targets: [
        { 
          src: 'package.json', 
          dest: 'dist',
          transform: (contents) => {
            const pkg = JSON.parse(contents.toString());
            pkg.private = false;
            return JSON.stringify(pkg, null, 2);
          }
        }
      ]
    })
  ]
};
