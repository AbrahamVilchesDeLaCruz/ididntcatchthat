import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import {
  mapMetricsSummary,
  mapUserStats,
  mapDbStats,
} from '../observability.mapper';
import type {
  MetricsSummaryApiModel,
  UserStatsApiModel,
} from './observability.api-model';
import type { DbStatsApiModel } from './db-stats.api-model';
import type { StatPeriod } from '../observability.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const observabilityKeys = {
  metrics: ['backoffice', 'observability', 'metrics'] as const,
  userStats: ['backoffice', 'observability', 'user-stats'] as const,
  dbStats: (period: StatPeriod) =>
    ['backoffice', 'observability', 'db-stats', period] as const,
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDbStats = (period: StatPeriod) => {
  return useQuery({
    queryKey: observabilityKeys.dbStats(period),
    queryFn: () =>
      apiClient
        .get<DbStatsApiModel>(`/admin/analytics/db-stats?period=${period}`)
        .then((res) => res.data),
    select: mapDbStats,
    staleTime: 60_000,
  });
};
