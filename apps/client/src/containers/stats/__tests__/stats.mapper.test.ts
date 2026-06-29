import { describe, it, expect } from 'vitest';
import {
  mapModuleProgress,
  mapSubcategoryProgress,
  mapWeakFlashcard,
} from '../stats.mapper';
import type { WeakFlashcardApiModel } from '../api/stats.api-model';
import type { ModuleProgressApiModel } from '../api/stats.api-model';

describe('stats/mapModuleProgress', () => {
  it('maps accuracy from 0–1 API scale to 0–100 display scale', () => {
    const raw: ModuleProgressApiModel = {
      userId: 'user-1',
      module: 'connected_speech',
      totalAttempts: 20,
      correctCount: 15,
      accuracy: 0.75,
      masteryLevel: 2,
      studyLevel: 1,
      studyCoverage: 0.4,
    };

    const vm = mapModuleProgress(raw);

    expect(vm.accuracy).toBe(75);
    expect(vm.masteryLevel).toBe(2);
    expect(vm.studyLevel).toBe(1);
    expect(vm.studyCoverage).toBe(0.4);
  });
});

describe('mapSubcategoryProgress', () => {
  it('converts accuracy from 0-1 to percentage', () => {
    const result = mapSubcategoryProgress({
      category: 'native_sounds',
      subcategory: 'b_ball',
      totalAttempts: 20,
      correctCount: 15,
      accuracy: 0.75,
    });

    expect(result.accuracy).toBe(75);
    expect(result.category).toBe('native_sounds');
    expect(result.subcategory).toBe('b_ball');
  });
});

describe('stats/mapWeakFlashcard', () => {
  it('maps weakest flashcard api model including expression', () => {
    const raw: WeakFlashcardApiModel = {
      flashcardId: 'fc-1',
      expression: 'gonna',
      module: 'connected_speech',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
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
      category: 'connected_speech',
      subcategory: 'informal_want_to',
      errorCount: 2,
      lastSeenAt: '2026-03-01T10:00:00.000Z',
    };

    const vm = mapWeakFlashcard(raw);

    expect(vm.expression).toBe('wanna');
  });

  it('falls back to module when category is missing', () => {
    const raw = {
      flashcardId: 'fc-3',
      expression: 'kinda',
      module: 'real_talk',
      subcategory: 'informal_kind_of',
      errorCount: 4,
      lastSeenAt: '2026-04-01T10:00:00.000Z',
    } as WeakFlashcardApiModel;

    const vm = mapWeakFlashcard(raw);

    expect(vm.module).toBe('real_talk');
    expect(vm.category).toBe('real_talk');
  });
});
