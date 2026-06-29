import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapGamesStats } from '../backoffice-games.mapper';
import type { GamesStatsApiModel } from './backoffice-games.api-model';
import type { GameStatsPeriod } from '../backoffice-games.types';

export const backofficeGamesKeys = {
  stats: (period: GameStatsPeriod) =>
    ['backoffice', 'games', 'stats', period] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGamesStats = (period: GameStatsPeriod = '7d') => {
  return useQuery({
    queryKey: backofficeGamesKeys.stats(period),
    queryFn: () =>
      apiClient
        .get<GamesStatsApiModel>(`/admin/games/stats?period=${period}`)
        .then((res) => res.data),
    select: mapGamesStats,
  });
};
