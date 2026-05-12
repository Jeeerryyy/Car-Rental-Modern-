module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  rules: {
    // ── Production quality ──
    'no-console': 'warn',
    'no-debugger': 'error',

    // ── Variables ──
    'no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // ── React ──
    'react/prop-types': 'off', // Not using PropTypes with modern React
    'react/react-in-jsx-scope': 'off', // React 19 JSX transform
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-no-target-blank': 'warn',

    // ── Hooks ──
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── Accessibility (warn to avoid blocking existing code) ──
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',

    // ── Best practices ──
    'no-var': 'error',
    'prefer-const': 'warn',
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '*.config.js'],
};
