import { type ReactElement } from 'react';
import { useBackofficeUsersState } from './hooks';
import { BackofficeUsersComponent } from './BackofficeUsersComponent';

export const BackofficeUsersContainer = (): ReactElement => {
  const {
    userStats,
    period,
    setPeriod,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useBackofficeUsersState();

  return (
    <BackofficeUsersComponent
      stats={userStats.data ?? null}
      period={period}
      onPeriodChange={setPeriod}
      isLoading={isLoading}
      isError={isError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
