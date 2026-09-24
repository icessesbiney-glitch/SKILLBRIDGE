import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Correct module path mapping pointing into your actual web workspace app directory
    '^@/(.*)$': '<rootDir>/$1',
  },
};

// Exporting createJestConfig via modern ES module syntax to prevent compiler engine crashes
export default createJestConfig(customJestConfig);
