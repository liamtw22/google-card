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
    sourcemap: true,
    indent: '  ',
    // Preserve formatting
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  plugins: [
    resolve({
      browser: true
    }),
    json(),
    minifyHTML(),
    terser({
      format: {
        comments: false,
        // Preserve formatting
        beautify: true,
        indent_level: 2,
        max_line_len: 100,
        semicolons: true
      },
      keep_classnames: true,
      keep_fnames: true
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
