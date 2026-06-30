import { useQuery } from '@tanstack/react-query';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { apiClient } from '@/core/api/apiClient';
import {
  mapMetricsSummary,
  mapAnalyticsSummary,
} from '../observability.mapper';
import type { MetricsSummaryApiModel } from './observability.api-model';
import type { AnalyticsSummaryApiModel } from './analytics-summary.api-model';
import type { SummaryPeriod } from '../observability.types';

export const observabilityKeys = {
  metrics: ['backoffice', 'observability', 'metrics'] as const,
  analyticsSummary: (period: SummaryPeriod) =>
    ['backoffice', 'observability', 'analytics-summary', period] as const,
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
export const useAnalyticsSummary = (period: SummaryPeriod) => {
  return useQuery({
    queryKey: observabilityKeys.analyticsSummary(period),
    queryFn: () =>
      apiClient
        .get<
          ApiEnvelope<AnalyticsSummaryApiModel>
        >(`/admin/analytics/summary?period=${period}`)
        .then((res) => res.data.data),
    select: mapAnalyticsSummary,
    staleTime: 60_000,
  });
};
