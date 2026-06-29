import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type {
  RankingsApiModel,
  RankingsQueryParams,
} from './ranking.api-model';
import type { RankingsVM } from '../ranking.types';

export const rankingKeys = {
  all: ['ranking'] as const,
  list: (params: RankingsQueryParams) => ['ranking', 'list', params] as const,
};

const mapRankings = (raw: RankingsApiModel): RankingsVM => ({
  entries: raw.entries,
  currentUser: raw.currentUser,
  viewer: raw.viewer,
});

export const useRankings = (
  params: RankingsQueryParams,
): UseQueryResult<RankingsVM> => {
  return useQuery({
    queryKey: rankingKeys.list(params),
    queryFn: async (): Promise<RankingsVM> => {
      const res = await apiClient.get<{ data: RankingsApiModel }>('/rankings', {
        params,
      });
      return mapRankings(res.data.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
