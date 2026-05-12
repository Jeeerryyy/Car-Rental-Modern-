export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true, diagnostics: false }],
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  forceExit: true,
  detectOpenHandles: true,
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
};
