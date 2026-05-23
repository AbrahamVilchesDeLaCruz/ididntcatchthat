import { jest } from '@jest/globals';

const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class JestTimers {
  static setup(date: Date = FIXED_DATE): void {
    jest.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    jest.useRealTimers();
  }
}
