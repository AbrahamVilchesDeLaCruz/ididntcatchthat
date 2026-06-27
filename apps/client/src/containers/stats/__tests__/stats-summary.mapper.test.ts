import { describe, expect, it } from 'vitest';
import { mapProgressSummary } from '../stats.mapper';

describe('mapProgressSummary', () => {
  it('maps API summary to view model', () => {
    const result = mapProgressSummary({
      currentStreak: 3,
      longestStreak: 7,
      accuracy7d: 0.75,
      totalAttempts: 50,
      weakCount: 4,
      masteredCount: 10,
      gamesCompleted: 6,
      lastPlayedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(result.accuracy7d).toBe(75);
    expect(result.lastPlayedAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});
