import { type ReactElement } from 'react';
import { useBackofficeGamesState } from './hooks';
import { BackofficeGamesComponent } from './BackofficeGamesComponent';

export const BackofficeGamesContainer = (): ReactElement => {
  const {
    gamesStats,
    period,
    setPeriod,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useBackofficeGamesState();

  return (
    <BackofficeGamesComponent
      stats={gamesStats.data ?? null}
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
      isError={isError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
