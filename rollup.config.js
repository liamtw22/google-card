import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/GoogleCard.js',
  output: {
    file: 'dist/google-card.js',
    format: 'es',
    sourcemap: true,
    indent: '  '
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
    })
  ]
};
