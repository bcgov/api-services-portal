module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test.{js,jsx})'],
  collectCoverageFrom: ['services/**/*.js', 'services/**/*.ts'],
  coveragePathIgnorePatterns: ['.*/__mocks__/.*', '.*/@types/.*'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
  moduleDirectories: ['node_modules', 'nextapp/test', 'test'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@keycloak|url-template|camelize-ts|url-join|axios|axios-ntlm|soap)/)',
  ],
};
