import type { Config } from 'jest';

/**
 * Jest config — Unit tests
 *
 * Scope  : test/**\/*.spec.ts  (replica la estructura de src/)
 * Runner : ts-jest (no build step)
 * Use    : pnpm test | pnpm test:watch | pnpm test:cov
 *
 * Convención: los specs NO viven junto al código fuente.
 * Estructura test/ replica src/ 1:1 — ver skill api-testing.
 *
 *   src/contexts/flashcards/application/create/flashcard-creator.ts
 *   test/contexts/flashcards/application/create/flashcard-creator.spec.ts
 */
const config: Config = {
  displayName: 'unit',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  // ─── Coverage ───────────────────────────────────────────────────────────────
  // Mide cobertura sobre src/ — nunca sobre test/
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts', // NestJS modules — pure wiring, no logic
    '!src/main.ts',
    '!src/**/*.entity.ts', // TypeORM entities — data shape, no logic
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage/unit',
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
