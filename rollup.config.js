import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
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
    resolve(),
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
