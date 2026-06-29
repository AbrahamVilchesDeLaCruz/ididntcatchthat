import { useMetricsSummary, useUserStats } from '../api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useObservabilityState() {
  const metricsSummary = useMetricsSummary();
  const userStats = useUserStats();

  return {
    metricsSummary,
    userStats,
    isLoading: metricsSummary.isLoading,
    isError: metricsSummary.isError,
    isUserStatsLoading: userStats.isLoading,
    isUserStatsError: userStats.isError,
    dataUpdatedAt: metricsSummary.dataUpdatedAt,
    refetch: metricsSummary.refetch,
  };
}
