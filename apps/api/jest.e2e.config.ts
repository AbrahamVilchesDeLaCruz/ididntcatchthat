import type { Config } from 'jest';

/**
 * Jest config — E2E tests
 *
 * Scope : test/**\/*.e2e-spec.ts
 * Runner: ts-jest
 * Use   : pnpm test:e2e | pnpm test:e2e:cov
 *
 * Note  : E2E tests require the DB to be running.
 *         Use `make up` or start via docker-compose before running.
 */
const config: Config = {
  displayName: 'e2e',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: './test/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  // ─── Coverage ───────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.entity.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
