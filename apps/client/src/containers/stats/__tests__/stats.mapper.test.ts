import { describe, it, expect } from 'vitest';
import { mapWeakFlashcard } from '../stats.mapper';
import type { WeakFlashcardApiModel } from '../api/stats.api-model';

describe('stats/mapWeakFlashcard', () => {
  it('maps weakest flashcard api model including expression', () => {
    const raw: WeakFlashcardApiModel = {
      flashcardId: 'fc-1',
      expression: 'gonna',
      module: 'connected_speech',
      errorCount: 6,
      lastSeenAt: '2026-02-01T10:00:00.000Z',
    };

    const vm = mapWeakFlashcard(raw);

    expect(vm.flashcardId).toBe('fc-1');
    expect(vm.expression).toBe('gonna');
    expect(vm.module).toBe('connected_speech');
    expect(vm.errorCount).toBe(6);
    expect(vm.lastAttemptAt).toBeInstanceOf(Date);
    expect(vm.lastAttemptAt.toISOString()).toBe('2026-02-01T10:00:00.000Z');
  });

  it('maps different expressions preserving value', () => {
    const raw: WeakFlashcardApiModel = {
      flashcardId: 'fc-2',
      expression: 'wanna',
      module: 'connected_speech',
      errorCount: 2,
      lastSeenAt: '2026-03-01T10:00:00.000Z',
    };

    const vm = mapWeakFlashcard(raw);

    expect(vm.expression).toBe('wanna');
  });
});
