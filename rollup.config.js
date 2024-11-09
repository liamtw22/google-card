import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/GoogleCard.js',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    indent: '  ',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  plugins: [
    resolve({
      browser: true
    }),
    json(),
    terser({
      format: {
        comments: false,
        beautify: true,
        indent_level: 2,
        max_line_len: 100,
        semicolons: true
      },
      keep_classnames: true,
      keep_fnames: true,
      mangle: false
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
