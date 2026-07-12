import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { useAuthStore } from '@/core/store/auth.store';
import { achievementKeys } from './achievementKeys';
import { mapAchievement } from './achievement.mapper';
import type { AchievementApiModel, AchievementVM } from './achievement.types';

export const fetchAchievements = async (
  since?: string,
): Promise<AchievementVM[]> => {
  const params = since ? { since } : undefined;
  const res = await apiClient.get<ApiEnvelope<AchievementApiModel[]>>(
    '/achievements',
    { params },
  );
  return res.data.data.map(mapAchievement);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useAchievements = (since?: string, enabled = true) => {
  const userId = useAuthStore((s) => s.userId);
  return useQuery({
    queryKey: achievementKeys.list(userId ?? 'anonymous', since),
    enabled: enabled && userId !== null,
    queryFn: () => fetchAchievements(since),
  });
};
