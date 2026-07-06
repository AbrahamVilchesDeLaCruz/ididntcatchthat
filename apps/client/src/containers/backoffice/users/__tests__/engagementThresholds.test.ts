import { describe, expect, it } from 'vitest';
import {
  ENGAGEMENT_THRESHOLDS,
  engagementVariant,
} from '../engagementThresholds';

describe('engagementVariant', () => {
  it('returns success at or above the healthy threshold', () => {
    expect(engagementVariant(ENGAGEMENT_THRESHOLDS.success)).toBe('success');
    expect(engagementVariant(ENGAGEMENT_THRESHOLDS.success + 5)).toBe(
      'success',
    );
  });

  it('returns warning between warning and success thresholds', () => {
    expect(engagementVariant(ENGAGEMENT_THRESHOLDS.warning)).toBe('warning');
    expect(engagementVariant(ENGAGEMENT_THRESHOLDS.success - 1)).toBe(
      'warning',
    );
  });

  it('returns neutral below the warning threshold', () => {
    expect(engagementVariant(ENGAGEMENT_THRESHOLDS.warning - 1)).toBe(
      'neutral',
    );
  });
});
