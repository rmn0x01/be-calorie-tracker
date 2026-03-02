/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  globalSetup: '<rootDir>/src/tests/config/global-setup.js',
  globalTeardown: '<rootDir>/src/tests/config/global-teardown.js',
}
