// ================== Jest Configuration Suggestions ==================

// This configuration is tailored for testing the CODA Evaluator Types and related functionalities.
// It includes settings for TypeScript, test environment, coverage collection, and more.

//Configuration Jest suggérée dans jest.config.js :
 
module.exports = {
preset: 'ts-jest',
testEnvironment: 'node',
roots: ['<rootDir>/src'],
testMatch: [
   '**/__tests__/**/ *.test.ts',
   ],
 collectCoverageFrom: [
 'src/ai/services/learning/human/coda/codavirtuel/evaluators/**/*.ts',
 '!src/ai/services/learning/human/coda/codavirtuel/evaluators/**/*.test.ts',
 '!src/ai/services/learning/human/coda/codavirtuel/evaluators/**/__tests__/**',
   ],
 coverageThreshold: {
 global: {
 branches: 80,
 functions: 80,
 lines: 80,
 statements: 80
     }
   },
 setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
 };