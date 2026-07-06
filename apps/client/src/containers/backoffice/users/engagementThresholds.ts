import type { InsightVariant } from '@/containers/backoffice/observability/components/InsightCard';

/** Active-user engagement thresholds used in the backoffice users dashboard. */
export const ENGAGEMENT_THRESHOLDS = {
  /** Healthy engagement — green indicator */
  success: 30,
  /** Moderate engagement — amber indicator */
  warning: 10,
} as const;

export function engagementVariant(rate: number): InsightVariant {
  if (rate >= ENGAGEMENT_THRESHOLDS.success) return 'success';
  if (rate >= ENGAGEMENT_THRESHOLDS.warning) return 'warning';
  return 'neutral';
}
