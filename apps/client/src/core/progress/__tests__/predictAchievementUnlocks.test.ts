import { describe, expect, it } from 'vitest';
import type { AchievementVM } from '@/core/achievements/achievement.types';
import {
  predictGameAchievementUnlocks,
  predictStudyAchievementUnlocks,
} from '../predictAchievementUnlocks';

const unlocked = (
  key: string,
  category: AchievementVM['category'],
): AchievementVM => ({
  key,
  category,
  sortOrder: 1,
  unlockedAt: new Date('2026-01-01'),
});

const locked = (
  key: string,
  category: AchievementVM['category'],
): AchievementVM => ({
  key,
  category,
  sortOrder: 1,
  unlockedAt: null,
});

describe('predictStudyAchievementUnlocks', () => {
  it('predicts study_first when not yet unlocked', () => {
    expect(
      predictStudyAchievementUnlocks([locked('study_first', 'study')], 1),
    ).toEqual([{ key: 'study_first', category: 'study' }]);
  });

  it('returns empty when already unlocked or no pending sessions', () => {
    expect(predictStudyAchievementUnlocks(undefined, 1)).toEqual([
      { key: 'study_first', category: 'study' },
    ]);
    expect(
      predictStudyAchievementUnlocks([unlocked('study_first', 'study')], 1),
    ).toEqual([]);
    expect(predictStudyAchievementUnlocks([], 0)).toEqual([]);
  });
});

describe('predictGameAchievementUnlocks', () => {
  it('predicts first_game when not yet unlocked', () => {
    expect(
      predictGameAchievementUnlocks([locked('first_game', 'game')], 1),
    ).toEqual([{ key: 'first_game', category: 'game' }]);
  });

  it('returns empty when already unlocked or no pending games', () => {
    expect(
      predictGameAchievementUnlocks([unlocked('first_game', 'game')], 1),
    ).toEqual([]);
    expect(predictGameAchievementUnlocks([], 0)).toEqual([]);
  });
});
