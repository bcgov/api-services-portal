module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)+(test.{ts,tsx})', 'test/**/*(test.js)'],
  collectCoverageFrom: ['nextapp/**/*.{ts,tsx}', '**/*.js'],
  coveragePathIgnorePatterns: ['.*/__mocks__/.*', '.*/@types/.*'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
  moduleDirectories: ['node_modules', 'nextapp/test', 'test'],
};
