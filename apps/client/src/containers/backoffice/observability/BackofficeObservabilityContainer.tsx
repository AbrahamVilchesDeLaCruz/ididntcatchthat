import { type ReactElement } from 'react';
import { useObservabilityState } from './hooks';
import { BackofficeObservabilityComponent } from './BackofficeObservabilityComponent';

export const BackofficeObservabilityContainer = (): ReactElement => {
  const {
    metricsSummary,
    userStats,
    isLoading,
    isError,
    isUserStatsLoading,
    isUserStatsError,
    dataUpdatedAt,
    refetch,
  } = useObservabilityState();

  return (
    <BackofficeObservabilityComponent
      summary={metricsSummary.data ?? null}
      userStats={userStats.data ?? null}
      isLoading={isLoading}
      isError={isError}
      isUserStatsLoading={isUserStatsLoading}
      isUserStatsError={isUserStatsError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
