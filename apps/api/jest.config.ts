import type { Config } from 'jest';

/**
 * Jest config — Unit tests
 *
 * Scope  : test/**\/*.spec.ts  (replica la estructura de src/)
 * Runner : ts-jest en modo ESM (requerido por @faker-js/faker v10+)
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
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tsconfig.test.json' },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  // NestJS packages ship CJS — transform them so ESM vm-modules can load them
  // pnpm symlinks live under node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(@nestjs\\+common|@nestjs\\+core|reflect-metadata))',
    '/node_modules/(?!(@nestjs)/)',
  ],
  testEnvironment: 'node',
  // ─── Coverage ───────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/domain/**/*.ts',
    'src/**/application/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
    '!src/**/domain/**/*.repository.ts', // interfaces — no tienen implementación que testear
    '!src/**/domain/**/*.service.ts', // interfaces — idem
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
