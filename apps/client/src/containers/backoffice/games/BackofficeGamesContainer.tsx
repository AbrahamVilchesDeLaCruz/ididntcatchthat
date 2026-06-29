import { type ReactElement } from 'react';
import { useBackofficeGamesState } from './hooks';
import { BackofficeGamesComponent } from './BackofficeGamesComponent';

export const BackofficeGamesContainer = (): ReactElement => {
  const {
    gamesStats,
    dbStats,
    period,
    setPeriod,
    isLoading,
    isError,
    isDbStatsLoading,
    dataUpdatedAt,
    refetch,
  } = useBackofficeGamesState();

  return (
    <BackofficeGamesComponent
      stats={gamesStats.data ?? null}
      dbStats={dbStats.data ?? null}
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
      isDbStatsLoading={isDbStatsLoading}
      isError={isError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
