import { useState } from 'react';
import { useGamesStats } from '../api';
import type { GameStatsPeriod } from '../backoffice-games.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBackofficeGamesState() {
  const [period, setPeriod] = useState<GameStatsPeriod>('7d');
  const gamesStats = useGamesStats(period);

  return {
    gamesStats,
    period,
    setPeriod,
    isLoading: gamesStats.isLoading,
    isError: gamesStats.isError,
    dataUpdatedAt: gamesStats.dataUpdatedAt,
    refetch: gamesStats.refetch,
  };
}
