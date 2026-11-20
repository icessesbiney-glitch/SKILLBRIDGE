const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: __dirname });

module.exports = createJestConfig({
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
});
