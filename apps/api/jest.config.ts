import type { Config } from 'jest';

/**
 * Jest config — Unit tests
 *
 * Scope : src/**\/*.spec.ts
 * Runner: ts-jest (no build step)
 * Use   : pnpm test:unit | pnpm test:watch | pnpm test:cov
 */
const config: Config = {
  displayName: 'unit',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'node',
  // ─── Coverage ───────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.module.ts', // NestJS modules — pure wiring, no logic
    '!**/main.ts',
    '!**/*.entity.ts', // TypeORM entities — data shape, no logic
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
