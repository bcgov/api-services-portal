module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)+(test.{ts,tsx})'],
  collectCoverageFrom: ['nextapp/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['.*/__mocks__/.*', '.*/@types/.*'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
  moduleDirectories: ['node_modules', 'nextapp/test'],
};
