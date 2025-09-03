// ================== Jest Configuration Suggestions ==================

// This configuration is tailored for testing the CODA Evaluator Types and related functionalities.
// It includes settings for TypeScript, test environment, coverage collection, and more.

//Configuration Jest suggérée dans jest.config.js :
 
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/ai/services/learning/human/coda/codavirtuel/**/*.ts',
    '!src/ai/services/learning/human/coda/codavirtuel/**/*.test.ts',
    '!src/ai/services/learning/human/coda/codavirtuel/**/__tests__/**',
    '!src/ai/services/learning/human/coda/codavirtuel/**/types.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};