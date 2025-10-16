module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-undef': 'warn',
    'no-unreachable': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'warn',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-regex-spaces': 'error',
    'no-sparse-arrays': 'error',
    'no-unexpected-multiline': 'error',
    'valid-typeof': 'error'
  },
  overrides: [
    {
      files: ['api/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ],
  globals: {
    'Chart': 'readonly',
    'Supabase': 'readonly',
    'google': 'readonly',
    'gtag': 'readonly',
    'dataLayer': 'readonly',
    'GeminiAITools': 'readonly'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.min.js',
    'build.js',
    'analyze-project.js',
    'optimize-photos.js',
    'performance-optimizer.js',
    'seo-optimizer.js'
  ]
};