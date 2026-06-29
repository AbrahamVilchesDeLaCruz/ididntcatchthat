import { StudyLevel } from '@/progress/domain/study-level';

describe('progress/domain StudyLevel', () => {
  it('returns level 0 below 25% coverage', () => {
    expect(StudyLevel.compute(0)).toBe(0);
    expect(StudyLevel.compute(0.24)).toBe(0);
  });

  it('returns level 1 at 25% coverage', () => {
    expect(StudyLevel.compute(0.25)).toBe(1);
  });

  it('returns level 2 at 50% coverage', () => {
    expect(StudyLevel.compute(0.5)).toBe(2);
  });

  it('returns level 3 at 75% coverage', () => {
    expect(StudyLevel.compute(0.75)).toBe(3);
  });
});
