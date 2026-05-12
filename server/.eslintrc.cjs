module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // ── Production quality ──
    'no-console': 'warn',
    'no-debugger': 'error',

    // ── Variables ──
    'no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_|^next$|^req$|^res$', varsIgnorePattern: '^_' },
    ],
    'no-undef': 'warn',

    // ── Best practices ──
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-empty': 'warn',
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    'no-throw-literal': 'warn',
    'no-return-await': 'warn',
    'no-duplicate-imports': 'warn',

    // ── Style (delegated to Prettier, but these are logical) ──
    'no-trailing-spaces': 'off', // Prettier handles this
    'no-multiple-empty-lines': 'off', // Prettier handles this
  },
  ignorePatterns: [
    'node_modules/',
    'tests/',
    'coverage/',
    '*.config.js',
    'jest.config.js',
  ],
};
