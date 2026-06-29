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
  // @faker-js/faker v10+ is ESM-only — must be transformed too
  // pnpm symlinks live under node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(@nestjs\\+common|@nestjs\\+core|reflect-metadata|@faker-js\\+faker))',
  ],
  testEnvironment: 'node',
  // Use V8 native coverage — more accurate with TypeScript decorators.
  // Babel-based coverage generates phantom branches from emitDecoratorMetadata.
  coverageProvider: 'v8',
  // ─── Coverage ───────────────────────────────────────────────────────────────
  //
  // Filosofía: 100% sobre la capa application (use cases + domain services).
  // La capa domain se incluye SOLO para clases con lógica real que los use
  // cases ejercitan directamente. Se excluyen:
  //   - Interfaces de repositorios y servicios de dominio (no tienen impl)
  //   - VOs con validación en constructor (testeados vía E2E + ValidationPipe)
  //   - fromPrimitives / toPrimitives (responsabilidad de infrastructure)
  //   - Eventos de dominio (su rehidratación la hace el repo en infra)
  //   - Excepciones que no se lanzan desde use cases cubiertos
  //   - Primitivas de shared (ValueObject, Criteria — plumbing sin negocio)
  //
  collectCoverageFrom: [
    // ─── Application: 100% obligatorio ───────────────────────────────────────
    'src/**/application/**/*.ts',
    // Request/Response/Query son `type` aliases o interfaces puras.
    // TypeScript los borra en compilación — no hay código ejecutable.
    // Excluirlos evita falsos 0% en coverage.
    '!src/**/application/**/request-*.ts',
    '!src/**/application/**/response-*.ts',
    '!src/**/application/**/*.query.ts', // Query port — interfaz pura sin runtime
    '!src/**/application/**/*.response.ts', // Response DTO — tipos puros sin runtime
    // ─── Domain: solo clases con lógica ejercitada desde application ─────────
    // user.ts y refresh-token.ts se ejercitan vía use cases — pero fromPrimitives
    // y toPrimitives son responsabilidad de infrastructure (persistencia).
    // Se excluyen para mantener el 100% limpio.
    'src/**/domain/exceptions/invalid-credentials.exception.ts',
    'src/**/domain/exceptions/email-already-taken.exception.ts',
    'src/**/domain/exceptions/nickname-already-taken.exception.ts',
    'src/**/domain/exceptions/expired-refresh-token.exception.ts',
    'src/**/domain/exceptions/invalid-refresh-token.exception.ts',
    'src/**/domain/exceptions/user-session-compromised.exception.ts',
    'src/**/domain/exceptions/user-not-found.exception.ts',
    // ─── Shared domain base classes ───────────────────────────────────────────
    'src/shared/domain/aggregate-root.ts',
    'src/shared/domain/domain-event.ts',
    'src/shared/domain/domain-event-publisher.ts',
    'src/shared/domain/logger.ts',
    // ─── Exclusiones explícitas ───────────────────────────────────────────────
    // handler.ts: clase abstracta base para AMQP handlers — init() requiere
    // un DomainEventConsumer real (AMQP), no es testeable en unit tests.
    // domain-event-consumer.ts: interfaz sin implementación propia en este scope.
    '!src/shared/application/handler.ts',
    '!src/shared/application/subscriber.ts',
    '!src/shared/application/domain-event-consumer.ts',
  ],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
