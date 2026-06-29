import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { RankingProfileVM } from '@/containers/ranking/ranking.types';

type RankingProfileApiModel = {
  showInRanking: boolean;
  nickname: string;
};

export const rankingProfileKeys = {
  profile: ['ranking', 'profile'] as const,
};

export const useRankingProfile = (): UseQueryResult<RankingProfileVM> => {
  return useQuery({
    queryKey: rankingProfileKeys.profile,
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
      void queryClient.invalidateQueries({ queryKey: ['ranking'] });
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
};
