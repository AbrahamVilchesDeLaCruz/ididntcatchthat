import { beforeEach, describe, expect, it } from 'vitest';
import type { ModuleProgressVM } from '@/containers/stats/stats.types';
import {
  mergeModuleProgressWithOptimistic,
  mergeProgressSummaryWithOptimistic,
  useProgressOptimisticStore,
} from '../progressOptimistic.store';

const baseModule = (module: string): ModuleProgressVM => ({
  module,
  totalAttempts: 0,
  correctCount: 0,
  accuracy: 0,
  masteryLevel: 0,
  studyLevel: 0,
  studyCoverage: 0.1,
});

const resetStore = (): void => {
  useProgressOptimisticStore.setState({
    sessionModule: null,
    sessionCardCount: 0,
    pendingStudyViewIds: [],
    extraStudyViews: 0,
    extraStudySessions: 0,
    extraGameAttempts: 0,
    extraGamesCompleted: 0,
  });
};

describe('progressOptimistic.store', () => {
  beforeEach(resetStore);

  it('records study views and completes sessions', () => {
    const store = useProgressOptimisticStore.getState();

    store.beginStudySession({ module: 'native_sounds', cardCount: 10 });
    store.recordStudyView('fc-1');
    store.recordStudyView('fc-2');
    store.recordStudyComplete();

    const state = useProgressOptimisticStore.getState();
    expect(state.extraStudyViews).toBe(2);
    expect(state.extraStudySessions).toBe(1);
    expect(state.pendingStudyViewIds).toEqual([]);
  });

  it('increments extraStudyViews without duplicating pending ids', () => {
    const store = useProgressOptimisticStore.getState();
    store.beginStudySession({ module: 'native_sounds', cardCount: 10 });
    store.recordStudyView('fc-1');
    store.recordStudyView('fc-1');

    const state = useProgressOptimisticStore.getState();
    expect(state.pendingStudyViewIds).toEqual(['fc-1']);
    expect(state.extraStudyViews).toBe(2);
  });

  it('skips redundant beginStudySession updates', () => {
    const store = useProgressOptimisticStore.getState();
    store.beginStudySession({ module: 'native_sounds', cardCount: 10 });
    const afterFirst = useProgressOptimisticStore.getState();

    store.beginStudySession({ module: 'native_sounds', cardCount: 10 });

    expect(useProgressOptimisticStore.getState()).toBe(afterFirst);
  });

  it('records game attempts and completions', () => {
    const store = useProgressOptimisticStore.getState();
    store.recordGameAttempt();
    store.recordGameComplete();

    const state = useProgressOptimisticStore.getState();
    expect(state.extraGameAttempts).toBe(1);
    expect(state.extraGamesCompleted).toBe(1);
  });
});

describe('mergeModuleProgressWithOptimistic', () => {
  it('boosts study coverage for the active module session', () => {
    const modules = [baseModule('native_sounds'), baseModule('real_talk')];
    const optimistic = {
      sessionModule: 'native_sounds',
      sessionCardCount: 10,
      pendingStudyViewIds: ['fc-1', 'fc-2'],
      extraStudyViews: 2,
      extraStudySessions: 0,
      extraGameAttempts: 0,
      extraGamesCompleted: 0,
    };

    const merged = mergeModuleProgressWithOptimistic(modules, optimistic);

    expect(merged[0]?.studyCoverage).toBeCloseTo(0.3);
    expect(merged[0]?.studyLevel).toBe(1);
    expect(merged[1]?.studyCoverage).toBe(0.1);
  });

  it('returns server data when there is no active study session', () => {
    const modules = [baseModule('native_sounds')];
    const optimistic = {
      sessionModule: null,
      sessionCardCount: 0,
      pendingStudyViewIds: ['fc-1'],
      extraStudyViews: 1,
      extraStudySessions: 0,
      extraGameAttempts: 0,
      extraGamesCompleted: 0,
    };

    expect(mergeModuleProgressWithOptimistic(modules, optimistic)).toEqual(
      modules,
    );
  });
});

describe('mergeProgressSummaryWithOptimistic', () => {
  it('adds pending activity to summary totals', () => {
    const summary = {
      currentStreak: 1,
      longestStreak: 1,
      accuracy7d: 0.5,
      totalAttempts: 10,
      weakCount: 0,
      masteredCount: 0,
      gamesCompleted: 2,
      lastPlayedAt: null,
    };

    const merged = mergeProgressSummaryWithOptimistic(summary, {
      sessionModule: null,
      sessionCardCount: 0,
      pendingStudyViewIds: [],
      extraStudyViews: 3,
      extraStudySessions: 0,
      extraGameAttempts: 2,
      extraGamesCompleted: 1,
    });

    expect(merged.totalAttempts).toBe(15);
    expect(merged.gamesCompleted).toBe(3);
  });

  it('returns server summary when there is no optimistic delta', () => {
    const summary = {
      currentStreak: 0,
      longestStreak: 0,
      accuracy7d: 0,
      totalAttempts: 0,
      weakCount: 0,
      masteredCount: 0,
      gamesCompleted: 0,
      lastPlayedAt: null,
    };

    expect(
      mergeProgressSummaryWithOptimistic(summary, {
        sessionModule: null,
        sessionCardCount: 0,
        pendingStudyViewIds: [],
        extraStudyViews: 0,
        extraStudySessions: 0,
        extraGameAttempts: 0,
        extraGamesCompleted: 0,
      }),
    ).toBe(summary);
  });
});
