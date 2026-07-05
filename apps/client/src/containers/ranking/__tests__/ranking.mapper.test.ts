import { describe, expect, it } from 'vitest';
import { formatRankingScore, isPeriodIgnored } from '../ranking.mapper';

describe('ranking/formatRankingScore', () => {
  it('formats accuracy as percentage', () => {
    expect(formatRankingScore('most_accurate', 0.85)).toBe('85%');
  });

  it('formats module master as level in English', () => {
    expect(formatRankingScore('module_master', 2, 'en')).toBe('Lv. 2');
  });

  it('formats game count as integer', () => {
    expect(formatRankingScore('most_active', 12)).toBe('12');
  });

  it('formats streak as days', () => {
    expect(formatRankingScore('best_streak', 7.4)).toBe('7 d');
  });
});

describe('ranking/isPeriodIgnored', () => {
  it('detects period-ignored types', () => {
    expect(isPeriodIgnored('best_streak')).toBe(true);
    expect(isPeriodIgnored('module_master')).toBe(true);
    expect(isPeriodIgnored('most_active')).toBe(false);
  });
});
