module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test.{js,jsx})'],
  collectCoverageFrom: ['services/**/*.js'],
  coveragePathIgnorePatterns: ['.*/__mocks__/.*', '.*/@types/.*'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
  moduleDirectories: ['node_modules', 'nextapp/test', 'test'],
};
