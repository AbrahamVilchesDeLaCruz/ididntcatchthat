import { type ReactElement } from 'react';
import { useBackofficeGamesState } from './hooks';
import { BackofficeGamesComponent } from './BackofficeGamesComponent';

export const BackofficeGamesContainer = (): ReactElement => {
  const { gamesStats, isLoading, isError, dataUpdatedAt, refetch } =
    useBackofficeGamesState();

  return (
    <BackofficeGamesComponent
      stats={gamesStats.data ?? null}
      isLoading={isLoading}
      isError={isError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
