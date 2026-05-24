import { type Logger } from '../../src/shared/domain/logger';

/**
 * No-op logger for E2E and integration tests.
 * Suppresses all domain-level log output so test output stays clean.
 */
export class NullLogger implements Logger {
  info(): void {}

  warn(): void {}

  error(): void {}

  debug(): void {}
}
