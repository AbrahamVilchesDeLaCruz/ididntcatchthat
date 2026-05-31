import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapGamesStats } from '../backoffice-games.mapper';
import type { GamesStatsApiModel } from './backoffice-games.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const backofficeGamesKeys = {
  stats: ['backoffice', 'games', 'stats'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGamesStats = () => {
  return useQuery({
    queryKey: backofficeGamesKeys.stats,
    queryFn: () =>
      apiClient
        .get<GamesStatsApiModel>('/admin/games/stats')
        .then((res) => res.data),
    select: mapGamesStats,
  });
};
