module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-case-declarations': 'off', // Turn off this rule to avoid issues with lexical declarations in switch statements
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
      },
    ],
  },
  overrides: [
    {
      files: ['src/editor.js'],
      rules: {
        // Allow unused imports in editor.js specifically for IMAGE_SOURCE_TYPES
        'no-unused-vars': ['error', { 'varsIgnorePattern': 'IMAGE_SOURCE_TYPES' }]
      }
    }
  ]
};
