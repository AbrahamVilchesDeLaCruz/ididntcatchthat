import { describe, it, expect } from 'vitest';
import { mapSubcategoryProgress } from '../stats.mapper';

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
