import { useState } from 'react';
import { useUserPageStats } from '../api';
import type { UserStatsPeriod } from '../backoffice-users.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBackofficeUsersState() {
  const [period, setPeriod] = useState<UserStatsPeriod>('7d');
  const userStats = useUserPageStats(period);

  return {
    userStats,
    period,
    setPeriod,
    isLoading: userStats.isLoading,
    isError: userStats.isError,
    dataUpdatedAt: userStats.dataUpdatedAt,
    refetch: userStats.refetch,
  };
}
