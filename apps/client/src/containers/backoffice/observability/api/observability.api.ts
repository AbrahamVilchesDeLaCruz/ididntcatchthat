import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapMetricsSummary, mapUserStats } from '../observability.mapper';
import type {
  MetricsSummaryApiModel,
  UserStatsApiModel,
} from './observability.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const observabilityKeys = {
  metrics: ['backoffice', 'observability', 'metrics'] as const,
  userStats: ['backoffice', 'observability', 'user-stats'] as const,
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUserStats = () => {
  return useQuery({
    queryKey: observabilityKeys.userStats,
    queryFn: () =>
      apiClient
        .get<UserStatsApiModel>('/admin/users/stats')
        .then((res) => res.data),
    select: mapUserStats,
  });
};
