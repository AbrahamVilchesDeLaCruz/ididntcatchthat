import { describe, expect, it } from 'vitest';
import {
  formatRankingScore,
  getMedalEmoji,
  isPeriodIgnored,
} from '../ranking.mapper';

describe('ranking/formatRankingScore', () => {
  it('formats accuracy as percentage', () => {
    expect(formatRankingScore('most_accurate', 0.85)).toBe('85%');
  });

  it('formats module master as level', () => {
    expect(formatRankingScore('module_master', 2)).toBe('Nv. 2');
  });

  it('formats game count as integer', () => {
    expect(formatRankingScore('most_active', 12)).toBe('12');
  });
});

describe('ranking/helpers', () => {
  it('returns medals for top 3', () => {
    expect(getMedalEmoji(1)).toBe('🥇');
    expect(getMedalEmoji(3)).toBe('🥉');
    expect(getMedalEmoji(4)).toBeNull();
  });

  it('detects period-ignored types', () => {
    expect(isPeriodIgnored('best_streak')).toBe(true);
    expect(isPeriodIgnored('most_active')).toBe(false);
  });
});
