import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { useAuthStore } from '@/core/store/auth.store';
import type { RankingProfileVM } from '@/containers/ranking/ranking.types';

type RankingProfileApiModel = {
  showInRanking: boolean;
  nickname: string;
};

export const rankingProfileKeys = {
  all: ['ranking'] as const,
  // userId forma parte de la key: el endpoint /users/me/ranking-profile es
  // per-user, y sin esta scoping TanStack serviría el nickname cacheado del
  // usuario anterior al cambiar de cuenta en el mismo navegador.
  profile: (userId: string) => ['ranking', 'profile', userId] as const,
};

export const useRankingProfile = (options?: {
  enabled?: boolean;
}): UseQueryResult<RankingProfileVM> => {
  const userId = useAuthStore((s) => s.userId);
  return useQuery({
    queryKey: rankingProfileKeys.profile(userId ?? 'anonymous'),
    enabled: (options?.enabled ?? true) && userId !== null,
    queryFn: async (): Promise<RankingProfileVM> => {
      const res = await apiClient.get<ApiEnvelope<RankingProfileApiModel>>(
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
      const res = await apiClient.patch<ApiEnvelope<RankingProfileApiModel>>(
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
