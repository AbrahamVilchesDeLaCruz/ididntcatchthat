import { describe, expect, it } from 'vitest';
import { mapAchievement } from '../achievement.mapper';

describe('mapAchievement', () => {
  it('maps API model to view model', () => {
    const result = mapAchievement({
      key: 'first_game',
      category: 'game',
      sortOrder: 1,
      unlockedAt: '2026-06-01T12:00:00.000Z',
    });

    expect(result).toEqual({
      key: 'first_game',
      category: 'game',
      sortOrder: 1,
      unlockedAt: new Date('2026-06-01T12:00:00.000Z'),
    });
  });

  it('maps null unlockedAt', () => {
    const result = mapAchievement({
      key: 'streak_7',
      category: 'streak',
      sortOrder: 10,
      unlockedAt: null,
    });

    expect(result.unlockedAt).toBeNull();
  });
});
