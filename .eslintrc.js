module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Disable console statements in production
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        
        // Code quality rules
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        
        // Style rules
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never']
    },
    globals: {
        // Browser globals
        'window': 'readonly',
        'document': 'readonly',
        'navigator': 'readonly',
        'console': 'readonly',
        
        // Custom globals
        'supabase': 'readonly'
    }
};
