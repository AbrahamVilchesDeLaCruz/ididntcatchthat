import type {
  AchievementCategory,
  AchievementVM,
} from '@/core/achievements/achievement.types';

export function predictStudyAchievementUnlocks(
  achievements: AchievementVM[] | undefined,
  extraStudySessions: number,
): { key: string; category: AchievementCategory }[] {
  const unlockedKeys = new Set(
    achievements?.filter((a) => a.unlockedAt !== null).map((a) => a.key) ?? [],
  );

  if (unlockedKeys.has('study_first') || extraStudySessions < 1) {
    return [];
  }

  return [{ key: 'study_first', category: 'study' }];
}

export function predictGameAchievementUnlocks(
  achievements: AchievementVM[] | undefined,
  extraGamesCompleted: number,
): { key: string; category: AchievementCategory }[] {
  const unlockedKeys = new Set(
    achievements?.filter((a) => a.unlockedAt !== null).map((a) => a.key) ?? [],
  );

  if (unlockedKeys.has('first_game') || extraGamesCompleted < 1) {
    return [];
  }

  return [{ key: 'first_game', category: 'game' }];
}
