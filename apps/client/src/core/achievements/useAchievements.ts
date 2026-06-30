import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { achievementKeys } from './achievementKeys';
import { mapAchievement } from './achievement.mapper';
import type { AchievementApiModel, AchievementVM } from './achievement.types';

export const fetchAchievements = async (
  since?: string,
): Promise<AchievementVM[]> => {
  const params = since ? { since } : undefined;
  const res = await apiClient.get<{ data: AchievementApiModel[] }>(
    '/achievements',
    { params },
  );
  return res.data.data.map(mapAchievement);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useAchievements = (since?: string, enabled = true) => {
  return useQuery({
    queryKey: achievementKeys.list(since),
    enabled,
    queryFn: () => fetchAchievements(since),
  });
};
