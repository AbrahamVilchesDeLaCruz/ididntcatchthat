import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapMetricsSummary } from '../observability.mapper';
import type { MetricsSummaryApiModel } from './observability.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const observabilityKeys = {
  metrics: ['backoffice', 'observability', 'metrics'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useMetricsSummary = () => {
  return useQuery({
    queryKey: observabilityKeys.metrics,
    queryFn: () =>
      apiClient
        .get<MetricsSummaryApiModel>('/admin/metrics/summary')
        .then((res) => res.data),
    select: mapMetricsSummary,
    refetchInterval: 30000,
  });
};
