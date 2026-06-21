import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type {
  RankingProfileApiModel,
  RankingsApiModel,
  RankingsQueryParams,
} from './ranking.api-model';
import type { RankingProfileVM, RankingsVM } from '../ranking.types';

export const rankingKeys = {
  all: ['ranking'] as const,
  list: (params: RankingsQueryParams) => ['ranking', 'list', params] as const,
  profile: ['ranking', 'profile'] as const,
};

const mapRankings = (raw: RankingsApiModel): RankingsVM => ({
  entries: raw.entries,
  currentUser: raw.currentUser,
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

export const useRankingProfile = (): UseQueryResult<RankingProfileVM> => {
  return useQuery({
    queryKey: rankingKeys.profile,
    queryFn: async (): Promise<RankingProfileVM> => {
      const res = await apiClient.get<{ data: RankingProfileApiModel }>(
        '/users/me/ranking-profile',
      );
      return res.data.data;
    },
  });
};

type UpdateProfileOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};

export const useUpdateRankingProfile = (
  options?: UpdateProfileOptions,
): UseMutationResult<RankingProfileVM, Error, RankingProfileVM> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: RankingProfileVM,
    ): Promise<RankingProfileVM> => {
      const res = await apiClient.patch<{ data: RankingProfileApiModel }>(
        '/users/me/ranking-profile',
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
};
