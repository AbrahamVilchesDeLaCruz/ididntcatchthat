import { Inject, Injectable } from '@nestjs/common';
import { ACHIEVEMENT_CATALOG } from '@/achievement/domain/achievement-catalog';
import {
  type UserAchievementRepository,
  USER_ACHIEVEMENT_REPOSITORY,
} from '@/achievement/domain/user-achievement.repository';
import { UserId } from '@/shared/domain/user-id';
import {
  type AchievementListItemDto,
  type RequestAchievementsFinder,
} from './request-achievements-finder';

export type { RequestAchievementsFinder, AchievementListItemDto };

@Injectable()
export class AchievementsFinder {
  constructor(
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly repository: UserAchievementRepository,
  ) {}

  async execute({
    userId,
    since,
  }: RequestAchievementsFinder): Promise<AchievementListItemDto[]> {
    const unlocked = await this.repository.findByUserId(new UserId(userId));
    const unlockedMap = new Map(
      unlocked.map((a) => [a.achievementKey, a.unlockedAt.toISOString()]),
    );

    const sinceDate = since ? new Date(since) : null;

    return ACHIEVEMENT_CATALOG.filter((entry) => {
      if (!sinceDate) return true;
      const unlockedAt = unlockedMap.get(entry.key);
      if (!unlockedAt) return false;
      return new Date(unlockedAt) >= sinceDate;
    })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        key: entry.key,
        category: entry.category,
        sortOrder: entry.sortOrder,
        unlockedAt: unlockedMap.get(entry.key) ?? null,
      }));
  }
}
