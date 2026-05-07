module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/routes/**/*.js',
    'server/services/**/*.js',
    'server/middleware/**/*.js',
    'server/models/**/*.js',
    '!server/**/*.test.js'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true
};