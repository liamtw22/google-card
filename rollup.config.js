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
      compress: false,        // Disable compression entirely
      mangle: false,          // Don't rename variables
      format: {
        comments: 'all',      // Keep all comments
        beautify: true,       // Make output readable
        indent_level: 2,      // Set indentation level
        max_line_len: 120,    // Allow longer lines
        semicolons: true,     // Keep semicolons
        preserve_line: true,  // Preserve line breaks
        keep_quoted_props: true, // Don't transform property names
        braces: true          // Keep braces
      },
      keep_classnames: true,  // Don't modify class names
      keep_fnames: true       // Don't modify function names
    })
  ]
};
