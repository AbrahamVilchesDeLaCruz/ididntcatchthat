import { describe, expect, it } from 'vitest';
import { computeStudyLevel } from '../studyLevel';

describe('computeStudyLevel', () => {
  it('returns 0 below 25% coverage', () => {
    expect(computeStudyLevel(0)).toBe(0);
    expect(computeStudyLevel(0.24)).toBe(0);
  });

  it('returns tiered levels at coverage thresholds', () => {
    expect(computeStudyLevel(0.25)).toBe(1);
    expect(computeStudyLevel(0.5)).toBe(2);
    expect(computeStudyLevel(0.75)).toBe(3);
    expect(computeStudyLevel(1)).toBe(3);
  });
});
