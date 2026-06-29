import { useState } from 'react';
import { useGamesStats } from '../api';
import { useDbStats } from '@/containers/backoffice/observability/api';
import type { StatPeriod } from '@/containers/backoffice/observability/observability.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBackofficeGamesState() {
  const [period, setPeriod] = useState<StatPeriod>('7d');

  const gamesStats = useGamesStats();
  const dbStats = useDbStats(period);

  return {
    gamesStats,
    dbStats,
    period,
    setPeriod,
    isLoading: gamesStats.isLoading,
    isError: gamesStats.isError,
    isDbStatsLoading: dbStats.isLoading,
    dataUpdatedAt: gamesStats.dataUpdatedAt,
    refetch: gamesStats.refetch,
  };
}
