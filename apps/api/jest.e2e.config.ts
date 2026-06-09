import type { Config } from 'jest';

/**
 * Jest config — E2E tests
 *
 * Scope : test/**\/*.e2e-spec.ts
 * Runner: ts-jest
 * Use   : pnpm test:e2e | pnpm test:e2e:cov
 *
 * Note  : E2E tests require the DB to be running.
 *         Locally: make test:e2e:up  (starts docker-compose.test.yml)
 *         CI:      postgres service in .github/workflows/ci.yml
 *
 *         Env vars are loaded from .env.test via dotenv/config setupFile.
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
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  testEnvironment: 'node',
  // Load .env.test before any NestJS module is bootstrapped
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  // ─── Coverage ───────────────────────────────────────────────────────────────
  // Mide cobertura sobre src/ — nunca sobre test/
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.entity.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
};

export default config;
