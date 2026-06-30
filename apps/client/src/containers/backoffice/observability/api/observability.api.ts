import { useQuery } from '@tanstack/react-query';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { apiClient } from '@/core/api/apiClient';
import { mapMetricsSummary, mapDbStats } from '../observability.mapper';
import type { MetricsSummaryApiModel } from './observability.api-model';
import type { DbStatsApiModel } from './db-stats.api-model';
import type { StatPeriod } from '../observability.types';

export const observabilityKeys = {
  metrics: ['backoffice', 'observability', 'metrics'] as const,
  dbStats: (period: StatPeriod) =>
    ['backoffice', 'observability', 'db-stats', period] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useMetricsSummary = () => {
  return useQuery({
    queryKey: observabilityKeys.metrics,
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<MetricsSummaryApiModel>>('/admin/metrics/summary')
        .then((res) => res.data.data),
    select: mapMetricsSummary,
    refetchInterval: 30000,
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDbStats = (period: StatPeriod) => {
  return useQuery({
    queryKey: observabilityKeys.dbStats(period),
    queryFn: () =>
      apiClient
        .get<
          ApiEnvelope<DbStatsApiModel>
        >(`/admin/analytics/db-stats?period=${period}`)
        .then((res) => res.data.data),
    select: mapDbStats,
    staleTime: 60_000,
  });
};
