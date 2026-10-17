const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './apps/web',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/apps/web/.next/'],
};

module.exports = createJestConfig(customJestConfig);
